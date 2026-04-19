/**
 * WhatsApp Protocol Attribution Service — REST client version
 *
 * Handles attribution when a WhatsApp message contains an invisible protocol
 * that links back to a trackable link click (link_accesses).
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { ClickIds, StandardizedSourceData } from '../types/contact-origin-types.js'
import { ContactOriginAttributionWriter } from './attribution-writer.service.js'
import { findCustomOriginByUtmSourceMatch } from './custom-origin-utm-matcher.js'
import { OriginClassifier } from './origin-classifier.js'

interface LinkAccessAttributionRow {
  id: string
  project_id: string
  link_id: string
  contact_id: string | null
  whatsapp_protocol: string | null
  created_at: string
  device: string | null
  campaign_id: string | null
  adgroup_id: string | null
  ad_id: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  fbclid: string | null
  gclid: string | null
  msclkid: string | null
  gbraid: string | null
  wbraid: string | null
  yclid: string | null
  ttclid: string | null
  referrer: string | null
  landing_page: string | null
}

interface TrackableLinkRow {
  id: string
  origin_id: string | null
}

interface AttributionResult {
  status: 'attributed' | 'already_attributed' | 'not_found' | 'project_mismatch' | 'conflict' | 'error'
  linkAccessId?: string
  originId?: string
  message?: string
}

type SupportedLinkClickId = 'fbclid' | 'gclid' | 'msclkid' | 'gbraid' | 'wbraid' | 'yclid' | 'ttclid'
const SUPPORTED_LINK_CLICK_IDS: SupportedLinkClickId[] = [
  'fbclid', 'gclid', 'msclkid', 'gbraid', 'wbraid', 'yclid', 'ttclid',
]

export type LinkAccessClickSignals = Pick<LinkAccessAttributionRow, 'landing_page' | SupportedLinkClickId>
export type EffectiveClickIdStrategy =
  | 'landing_page_click_ids'
  | 'fallback_no_landing_page'
  | 'fallback_invalid_landing_page'
  | 'fallback_no_click_ids_in_landing_page'

interface EffectiveClickIdResolution {
  clickIds: ClickIds
  strategy: EffectiveClickIdStrategy
}

interface LinkSourceDataBuildResult {
  sourceData: StandardizedSourceData
  rawClickIds: ClickIds
  effectiveClickIds: ClickIds
  clickIdStrategy: EffectiveClickIdStrategy
}

interface CampaignParamsFromLandingPage {
  campaignId?: string
  adgroupId?: string
  adId?: string
}

function compactObject(value: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, current] of Object.entries(value)) {
    if (current === null || current === undefined || current === '') continue
    output[key] = current
  }
  return output
}

function toNonEmptyString(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function extractRawClickIds(access: LinkAccessClickSignals): ClickIds {
  return compactObject({
    fbclid: toNonEmptyString(access.fbclid),
    gclid: toNonEmptyString(access.gclid),
    msclkid: toNonEmptyString(access.msclkid),
    gbraid: toNonEmptyString(access.gbraid),
    wbraid: toNonEmptyString(access.wbraid),
    yclid: toNonEmptyString(access.yclid),
    ttclid: toNonEmptyString(access.ttclid),
  }) as ClickIds
}

function extractLandingPageClickIds(landingPage: string): ClickIds | null {
  try {
    const trimmedLandingPage = landingPage.trim()
    if (!trimmedLandingPage) return null

    const hasValidSchemePrefix = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedLandingPage)
    const hasAnySchemeMarker = trimmedLandingPage.includes('://')

    let parsedUrl: URL
    if (hasValidSchemePrefix) {
      parsedUrl = new URL(trimmedLandingPage)
    } else if (trimmedLandingPage.startsWith('/') || trimmedLandingPage.startsWith('?')) {
      parsedUrl = new URL(trimmedLandingPage, 'https://attribution.local')
    } else if (hasAnySchemeMarker) {
      return null
    } else {
      parsedUrl = new URL(`https://${trimmedLandingPage}`)
    }

    const lowerCaseParams = new Map<string, string>()
    for (const [key, value] of parsedUrl.searchParams.entries()) {
      const normalizedKey = key.trim().toLowerCase()
      const normalizedValue = value.trim()
      if (!normalizedKey || !normalizedValue || lowerCaseParams.has(normalizedKey)) continue
      lowerCaseParams.set(normalizedKey, normalizedValue)
    }

    const clickIds: ClickIds = {}
    for (const key of SUPPORTED_LINK_CLICK_IDS) {
      const value = lowerCaseParams.get(key)
      if (value) clickIds[key] = value
    }

    return clickIds
  } catch (_error) {
    return null
  }
}

function extractLandingPageCampaignParams(
  landingPage: string | null | undefined
): CampaignParamsFromLandingPage {
  const normalizedLandingPage = toNonEmptyString(landingPage)
  if (!normalizedLandingPage) return {}

  try {
    const hasValidSchemePrefix = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(normalizedLandingPage)
    const hasAnySchemeMarker = normalizedLandingPage.includes('://')

    let parsedUrl: URL
    if (hasValidSchemePrefix) {
      parsedUrl = new URL(normalizedLandingPage)
    } else if (normalizedLandingPage.startsWith('/') || normalizedLandingPage.startsWith('?')) {
      parsedUrl = new URL(normalizedLandingPage, 'https://attribution.local')
    } else if (hasAnySchemeMarker) {
      return {}
    } else {
      parsedUrl = new URL(`https://${normalizedLandingPage}`)
    }

    const lowerCaseParams = new Map<string, string>()
    for (const [key, value] of parsedUrl.searchParams.entries()) {
      const normalizedKey = key.trim().toLowerCase()
      const normalizedValue = value.trim()
      if (!normalizedKey || !normalizedValue || lowerCaseParams.has(normalizedKey)) continue
      lowerCaseParams.set(normalizedKey, normalizedValue)
    }

    return {
      campaignId: lowerCaseParams.get('campaign_id'),
      adgroupId: lowerCaseParams.get('adgroup_id'),
      adId: lowerCaseParams.get('ad_id'),
    }
  } catch (_error) {
    return {}
  }
}

export function resolveEffectiveClickIds(access: LinkAccessClickSignals): EffectiveClickIdResolution {
  const rawClickIds = extractRawClickIds(access)
  const landingPage = toNonEmptyString(access.landing_page)

  if (!landingPage) {
    return { clickIds: rawClickIds, strategy: 'fallback_no_landing_page' }
  }

  const landingPageClickIds = extractLandingPageClickIds(landingPage)
  if (!landingPageClickIds) {
    return { clickIds: rawClickIds, strategy: 'fallback_invalid_landing_page' }
  }

  if (Object.keys(landingPageClickIds).length === 0) {
    return { clickIds: rawClickIds, strategy: 'fallback_no_click_ids_in_landing_page' }
  }

  return { clickIds: landingPageClickIds, strategy: 'landing_page_click_ids' }
}

function mergeSourceData(
  primary: StandardizedSourceData,
  secondary: StandardizedSourceData | null
): StandardizedSourceData {
  if (!secondary) return primary
  return {
    clickIds: { ...(secondary.clickIds || {}), ...(primary.clickIds || {}) },
    utm: { ...(secondary.utm || {}), ...(primary.utm || {}) },
    campaign: { ...(secondary.campaign || {}), ...(primary.campaign || {}) },
    metadata: { ...(secondary.metadata || {}), ...(primary.metadata || {}) },
  }
}

export function buildSourceDataFromLink(access: LinkAccessAttributionRow): LinkSourceDataBuildResult {
  const rawClickIds = extractRawClickIds(access)
  const { clickIds: effectiveClickIds, strategy: clickIdStrategy } = resolveEffectiveClickIds(access)
  const campaignParamsFromLandingPage = extractLandingPageCampaignParams(access.landing_page)
  const campaignId = toNonEmptyString(access.campaign_id) ??
    campaignParamsFromLandingPage.campaignId ??
    toNonEmptyString(access.utm_campaign)
  const adgroupId = toNonEmptyString(access.adgroup_id) ?? campaignParamsFromLandingPage.adgroupId
  const adId = toNonEmptyString(access.ad_id) ?? campaignParamsFromLandingPage.adId

  const classification = OriginClassifier.classify({
    gclid: effectiveClickIds.gclid ?? null,
    gbraid: effectiveClickIds.gbraid ?? null,
    wbraid: effectiveClickIds.wbraid ?? null,
    fbclid: effectiveClickIds.fbclid ?? null,
    ttclid: effectiveClickIds.ttclid ?? null,
    campaignId: campaignId ?? null,
    adgroupId: adgroupId ?? null,
    adId: adId ?? null,
    utmSource: access.utm_source,
    utmMedium: access.utm_medium,
    referrer: access.referrer,
  })

  return {
    rawClickIds,
    effectiveClickIds,
    clickIdStrategy,
    sourceData: {
      clickIds: effectiveClickIds,
      utm: {
        utm_source: access.utm_source ?? undefined,
        utm_medium: access.utm_medium ?? undefined,
        utm_campaign: access.utm_campaign ?? undefined,
        utm_content: access.utm_content ?? undefined,
        utm_term: access.utm_term ?? undefined,
      },
      campaign: {
        campaign_id: campaignId,
        adgroup_id: adgroupId,
        ad_id: adId,
      },
      metadata: {
        source_type: classification.sourceType,
        source_app: classification.sourceApp,
        source_id: `whatsapp_protocol:${access.whatsapp_protocol ?? ''}`,
        source_url: access.referrer ?? access.landing_page ?? undefined,
        device: (access.device as 'mobile' | 'desktop' | 'tablet' | undefined) ?? undefined,
        first_interaction_at: access.created_at,
        last_interaction_at: access.created_at,
      },
    },
  }
}

function buildAttributionSnapshot(
  access: LinkAccessAttributionRow,
  protocol: string,
  sourceData: StandardizedSourceData
): Record<string, unknown> {
  return compactObject({
    attribution_source: 'whatsapp_protocol',
    whatsapp_protocol: protocol,
    link_access_id: access.id,
    link_id: access.link_id,
    campaign_id: sourceData.campaign?.campaign_id || access.campaign_id || access.utm_campaign,
    adgroup_id: sourceData.campaign?.adgroup_id || toNonEmptyString(access.adgroup_id),
    ad_id: sourceData.campaign?.ad_id || toNonEmptyString(access.ad_id),
    utm_source: sourceData.utm?.utm_source || access.utm_source,
    utm_medium: sourceData.utm?.utm_medium || access.utm_medium,
    utm_campaign: sourceData.utm?.utm_campaign || access.utm_campaign,
    utm_content: sourceData.utm?.utm_content || access.utm_content,
    utm_term: sourceData.utm?.utm_term || access.utm_term,
    fbclid: sourceData.clickIds?.fbclid,
    gclid: sourceData.clickIds?.gclid,
    msclkid: sourceData.clickIds?.msclkid,
    gbraid: sourceData.clickIds?.gbraid,
    wbraid: sourceData.clickIds?.wbraid,
    yclid: sourceData.clickIds?.yclid,
    ttclid: sourceData.clickIds?.ttclid,
    referrer: access.referrer,
    landing_page: access.landing_page,
    clicked_at: access.created_at,
    attributed_at: new Date().toISOString(),
  })
}

const LINK_ACCESS_SELECT = 'id,project_id,link_id,contact_id,whatsapp_protocol,created_at,device,campaign_id,adgroup_id,ad_id,utm_source,utm_medium,utm_campaign,utm_content,utm_term,fbclid,gclid,msclkid,gbraid,wbraid,yclid,ttclid,referrer,landing_page'

export class WhatsAppProtocolAttributionService {
  private readonly writer: ContactOriginAttributionWriter

  constructor(private readonly supabase: SupabaseRestClient) {
    this.writer = new ContactOriginAttributionWriter(supabase)
  }

  async attributeByProtocol(params: {
    protocol: string
    projectId: string
    contactId: string
    nativeSourceData?: StandardizedSourceData | null
  }): Promise<AttributionResult> {
    const { protocol, projectId, contactId, nativeSourceData = null } = params

    // 1. Find link_access by whatsapp_protocol
    let access: LinkAccessAttributionRow | null
    try {
      const row = await this.supabase.selectOne('link_accesses', {
        'whatsapp_protocol': `eq.${protocol}`,
      }, LINK_ACCESS_SELECT)
      access = row as LinkAccessAttributionRow | null
    } catch (error) {
      console.error('[webhook.attribution_failed]', { protocol, error })
      return { status: 'error', message: error instanceof Error ? error.message : String(error) }
    }

    if (!access) return { status: 'not_found' }

    // 2. Validate project
    if (access.project_id !== projectId) {
      return {
        status: 'project_mismatch',
        linkAccessId: access.id,
        message: 'Protocol belongs to another project',
      }
    }

    // 3. Check existing attribution
    if (access.contact_id && access.contact_id !== contactId) {
      return {
        status: 'conflict',
        linkAccessId: access.id,
        message: 'Protocol already attributed to another contact',
      }
    }

    // 4. Optimistic concurrency: set contact_id on link_access
    let finalStatus: AttributionResult['status'] = 'already_attributed'
    if (!access.contact_id) {
      try {
        const updatedRows = await this.supabase.update('link_accesses', {
          contact_id: contactId,
          converted_at: new Date().toISOString(),
        }, {
          'id': `eq.${access.id}`,
          'contact_id': `is.null`,
        })

        if (!updatedRows || updatedRows.length === 0) {
          // Concurrent update — check who won
          const refreshed = await this.supabase.selectOne('link_accesses', {
            'id': `eq.${access.id}`,
          }, 'contact_id')

          const refreshedContactId = refreshed?.contact_id as string | null
          if (refreshedContactId && refreshedContactId !== contactId) {
            return {
              status: 'conflict',
              linkAccessId: access.id,
              message: 'Protocol was concurrently attributed to another contact',
            }
          }
        } else {
          finalStatus = 'attributed'
        }
      } catch (error) {
        console.error('[webhook.attribution_failed]', {
          protocol, linkAccessId: access.id, error,
        })
        return {
          status: 'error',
          linkAccessId: access.id,
          message: error instanceof Error ? error.message : String(error),
        }
      }
    }

    // 5. Get trackable link for origin_id
    let linkData: TrackableLinkRow | null = null
    try {
      const row = await this.supabase.selectOne('trackable_links', {
        'id': `eq.${access.link_id}`,
      }, 'id,origin_id')
      linkData = row as TrackableLinkRow | null
    } catch (error) {
      return {
        status: 'error',
        linkAccessId: access.id,
        message: error instanceof Error ? error.message : String(error),
      }
    }

    // 6. Build source data from link access
    const linkSourceData = buildSourceDataFromLink(access)
    const mergedSourceData = mergeSourceData(linkSourceData.sourceData, nativeSourceData)
    const classification = OriginClassifier.classifyFromSourceData(mergedSourceData)
    const attributionSnapshot = buildAttributionSnapshot(access, protocol, mergedSourceData)
    const utmSourceForCustomMatch = mergedSourceData.utm?.utm_source || access.utm_source || null

    // 7. Custom origin matching
    const customOriginMatch = classification.sourceApp === 'other'
      ? await findCustomOriginByUtmSourceMatch({
          supabase: this.supabase,
          projectId,
          utmSource: utmSourceForCustomMatch,
        })
      : null

    const resolvedOriginId = customOriginMatch?.originId
      ?? (classification.sourceApp === 'other'
        ? (linkData?.origin_id ?? null)
        : null)

    console.info('[webhook.protocol_attribution.classification]', {
      protocol, projectId, contactId,
      linkAccessId: access.id,
      clickIdStrategy: linkSourceData.clickIdStrategy,
      classifiedSourceApp: classification.sourceApp,
      classifiedOriginName: classification.originName,
      customMatchedOriginId: customOriginMatch?.originId ?? null,
    })

    // 8. Update contact metadata
    const contactRow = await this.supabase.selectOne('contacts', {
      'id': `eq.${contactId}`,
      'project_id': `eq.${projectId}`,
    }, 'id,metadata')

    if (!contactRow) {
      return {
        status: 'error',
        linkAccessId: access.id,
        message: 'Contact not found for attribution',
      }
    }

    const metadata = (contactRow.metadata && typeof contactRow.metadata === 'object')
      ? (contactRow.metadata as Record<string, unknown>)
      : {}

    const nextMetadata: Record<string, unknown> = {
      ...metadata,
      ...compactObject({
        utm_source: mergedSourceData.utm?.utm_source,
        utm_medium: mergedSourceData.utm?.utm_medium,
        utm_campaign: mergedSourceData.utm?.utm_campaign,
        utm_content: mergedSourceData.utm?.utm_content,
        utm_term: mergedSourceData.utm?.utm_term,
        campaign_id: mergedSourceData.campaign?.campaign_id,
        adgroup_id: mergedSourceData.campaign?.adgroup_id,
        ad_id: mergedSourceData.campaign?.ad_id,
        fbclid: mergedSourceData.clickIds?.fbclid,
        gclid: mergedSourceData.clickIds?.gclid,
        msclkid: mergedSourceData.clickIds?.msclkid,
        gbraid: mergedSourceData.clickIds?.gbraid,
        wbraid: mergedSourceData.clickIds?.wbraid,
        yclid: mergedSourceData.clickIds?.yclid,
        ttclid: mergedSourceData.clickIds?.ttclid,
      }),
      adsmagic_tracking: attributionSnapshot,
    }

    try {
      await this.supabase.update('contacts', {
        metadata: nextMetadata,
        updated_at: new Date().toISOString(),
      }, {
        'id': `eq.${contactId}`,
        'project_id': `eq.${projectId}`,
      })
    } catch (error) {
      return {
        status: 'error',
        linkAccessId: access.id,
        message: error instanceof Error ? error.message : String(error),
      }
    }

    // 9. Write attribution via writer
    try {
      const writeResult = await this.writer.write({
        contactId,
        projectId,
        originName: classification.originName,
        originId: resolvedOriginId,
        sourceData: mergedSourceData,
        linkAccessId: access.id,
        attributionSource: 'whatsapp_protocol',
        attributionPriority: 10,
        acquiredAt: access.created_at,
      })

      return {
        status: finalStatus,
        linkAccessId: access.id,
        originId: writeResult.originId,
      }
    } catch (error) {
      return {
        status: 'error',
        linkAccessId: access.id,
        message: error instanceof Error ? error.message : 'Failed to persist contact origin attribution',
      }
    }
  }
}
