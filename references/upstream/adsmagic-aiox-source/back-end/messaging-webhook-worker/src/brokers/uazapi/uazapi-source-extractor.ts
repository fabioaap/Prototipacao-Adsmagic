/**
 * UAZAPI source data extractor — ported from Deno Edge Function
 */
import { BaseSourceDataExtractor } from '../base/SourceDataExtractor.js'
import type { CampaignIds, OriginMetadata, ClickIds, UtmParams } from '../../types/contact-origin-types.js'
import type { NormalizedMessage } from '../../types/messaging.js'

export class UazapiSourceExtractor extends BaseSourceDataExtractor {
  protected override extractAdditionalClickIds(message: NormalizedMessage): ClickIds | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    if (!externalAdReply) return null
    const clickIds: ClickIds = {}
    if (externalAdReply.ctwaClid) clickIds.ctwaClid = String(externalAdReply.ctwaClid)
    if (externalAdReply.fbclid) clickIds.fbclid = String(externalAdReply.fbclid)
    return Object.keys(clickIds).length > 0 ? clickIds : null
  }

  protected override extractAdditionalUtmParams(message: NormalizedMessage): UtmParams | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    if (!externalAdReply) return null
    const utm: UtmParams = {}
    if (externalAdReply.sourceApp) utm.utm_source = String(externalAdReply.sourceApp)
    if (externalAdReply.sourceType === 'ad') utm.utm_medium = 'paid_social'
    if (externalAdReply.sourceID) {
      utm.utm_campaign = String(externalAdReply.sourceID)
      utm.utm_content = String(externalAdReply.sourceID)
    }
    return Object.keys(utm).length > 0 ? utm : null
  }

  protected extractCampaignIds(message: NormalizedMessage): CampaignIds | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    if (!externalAdReply) return null
    const campaign: CampaignIds = {}
    if (externalAdReply.sourceID) {
      campaign.campaign_id = String(externalAdReply.sourceID)
      campaign.ad_id = String(externalAdReply.sourceID)
    }
    if (externalAdReply.title) campaign.campaign_name = String(externalAdReply.title)
    return Object.keys(campaign).length > 0 ? campaign : null
  }

  protected extractMetadata(message: NormalizedMessage): OriginMetadata | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    if (!externalAdReply) return null
    let sourceApp: OriginMetadata['source_app'] = 'other'
    if (metadata.utm_source) {
      const detected = this.detectSourceAppFromUtmSource(String(metadata.utm_source))
      if (detected) sourceApp = detected
    } else if (externalAdReply.sourceApp) {
      sourceApp = this.detectSourceAppFromUtmSource(String(externalAdReply.sourceApp)) || 'facebook'
    }
    const originMetadata: OriginMetadata = {
      source_type: externalAdReply.sourceType === 'ad' ? 'ad' : 'other',
      source_app: sourceApp,
      source_id: externalAdReply.sourceID ? String(externalAdReply.sourceID) : undefined,
      source_url: externalAdReply.sourceURL ? String(externalAdReply.sourceURL) : undefined,
      first_interaction_at: message.timestamp.toISOString(),
    }
    if (metadata.utm_medium) {
      const detected = this.detectSourceTypeFromUtmMedium(String(metadata.utm_medium))
      if (detected) originMetadata.source_type = detected
    }
    return originMetadata
  }
}
