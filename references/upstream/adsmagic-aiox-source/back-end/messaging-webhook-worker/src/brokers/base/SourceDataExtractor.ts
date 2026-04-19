/**
 * Source data extractor base — ported from Deno Edge Function
 */
import type { StandardizedSourceData, ClickIds, UtmParams, CampaignIds, OriginMetadata } from '../../types/contact-origin-types.js'
import type { NormalizedMessage } from '../../types/messaging.js'

export interface ISourceDataExtractor {
  extract(message: NormalizedMessage): StandardizedSourceData | null
}

export abstract class BaseSourceDataExtractor implements ISourceDataExtractor {
  extract(message: NormalizedMessage): StandardizedSourceData | null {
    const clickIds = this.extractClickIds(message)
    const utm = this.extractUtmParams(message)
    const campaign = this.extractCampaignIds(message)
    const metadata = this.extractMetadata(message)

    if (!this.hasValidData({ clickIds, utm, campaign, metadata })) return null

    return {
      clickIds: clickIds && Object.keys(clickIds).length > 0 ? clickIds : undefined,
      utm: utm && Object.keys(utm).length > 0 ? utm : undefined,
      campaign: campaign && Object.keys(campaign).length > 0 ? campaign : undefined,
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    }
  }

  protected extractClickIds(message: NormalizedMessage): ClickIds | null {
    const metadata = message.context?.metadata || {}
    const clickIds: ClickIds = {}
    if (metadata.gclid) clickIds.gclid = String(metadata.gclid)
    if (metadata.wbraid) clickIds.wbraid = String(metadata.wbraid)
    if (metadata.gbraid) clickIds.gbraid = String(metadata.gbraid)
    if (metadata.fbclid) clickIds.fbclid = String(metadata.fbclid)
    if (metadata.ctwaClid) clickIds.ctwaClid = String(metadata.ctwaClid)
    if (metadata.ttclid) clickIds.ttclid = String(metadata.ttclid)
    const additional = this.extractAdditionalClickIds(message)
    if (additional) Object.assign(clickIds, additional)
    return Object.keys(clickIds).length > 0 ? clickIds : null
  }

  protected extractUtmParams(message: NormalizedMessage): UtmParams | null {
    const metadata = message.context?.metadata || {}
    const utm: UtmParams = {}
    if (metadata.utm_source) utm.utm_source = String(metadata.utm_source)
    if (metadata.utm_medium) utm.utm_medium = String(metadata.utm_medium)
    if (metadata.utm_campaign) utm.utm_campaign = String(metadata.utm_campaign)
    if (metadata.utm_content) utm.utm_content = String(metadata.utm_content)
    if (metadata.utm_term) utm.utm_term = String(metadata.utm_term)
    const additional = this.extractAdditionalUtmParams(message)
    if (additional) Object.assign(utm, additional)
    return Object.keys(utm).length > 0 ? utm : null
  }

  protected abstract extractCampaignIds(message: NormalizedMessage): CampaignIds | null
  protected abstract extractMetadata(message: NormalizedMessage): OriginMetadata | null

  protected extractAdditionalClickIds(_message: NormalizedMessage): ClickIds | null { return null }
  protected extractAdditionalUtmParams(_message: NormalizedMessage): UtmParams | null { return null }

  protected hasValidData(data: { clickIds: ClickIds | null; utm: UtmParams | null; campaign: CampaignIds | null; metadata: OriginMetadata | null }): boolean {
    return !!(data.clickIds || data.utm || data.campaign || data.metadata)
  }

  protected detectSourceAppFromUtmSource(utmSource?: string): OriginMetadata['source_app'] {
    if (!utmSource) return undefined
    const lower = utmSource.toLowerCase()
    if (lower.includes('google')) return 'google'
    if (lower.includes('facebook') || lower.includes('fb')) return 'facebook'
    if (lower.includes('instagram') || lower.includes('ig')) return 'instagram'
    if (lower.includes('tiktok')) return 'tiktok'
    return 'other'
  }

  protected detectSourceTypeFromUtmMedium(utmMedium?: string): OriginMetadata['source_type'] {
    if (!utmMedium) return undefined
    const lower = utmMedium.toLowerCase()
    if (lower === 'cpc' || lower === 'paid_social' || lower.includes('paid')) return 'ad'
    if (lower === 'organic' || lower === 'search') return 'organic'
    if (lower === 'referral') return 'referral'
    return 'other'
  }
}
