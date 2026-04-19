/**
 * Origin classifier — ported from Deno Edge Function (pure logic, no DB)
 */
import type { StandardizedSourceData } from '../types/contact-origin-types.js'

export type ClassifiedSourceApp = 'google' | 'facebook' | 'instagram' | 'tiktok' | 'other'
export type ClassifiedSourceType = 'ad' | 'organic' | 'referral' | 'direct' | 'other'

export interface OriginClassification {
  sourceApp: ClassifiedSourceApp
  sourceType: ClassifiedSourceType
  originName: string
}

interface ClassificationSignals {
  gclid?: string | null; gbraid?: string | null; wbraid?: string | null
  fbclid?: string | null; ttclid?: string | null
  campaignId?: string | null; adgroupId?: string | null; adId?: string | null
  utmSource?: string | null; utmMedium?: string | null; referrer?: string | null
}

function normalize(value: string | null | undefined): string { return (value || '').trim().toLowerCase() }
function hasValue(value: string | null | undefined): boolean { return Boolean(value && value.trim().length > 0) }

export class OriginClassifier {
  static classify(signals: ClassificationSignals): OriginClassification {
    if (hasValue(signals.gclid) || hasValue(signals.gbraid) || hasValue(signals.wbraid))
      return { sourceApp: 'google', sourceType: 'ad', originName: 'Google Ads' }
    if (hasValue(signals.fbclid))
      return { sourceApp: 'facebook', sourceType: 'ad', originName: 'Meta Ads' }
    if (hasValue(signals.ttclid))
      return { sourceApp: 'tiktok', sourceType: 'ad', originName: 'TikTok Ads' }

    const utmSource = normalize(signals.utmSource)
    const utmMedium = normalize(signals.utmMedium)
    const referrer = normalize(signals.referrer)
    const hasCampaignSignals = hasValue(signals.campaignId) || hasValue(signals.adgroupId) || hasValue(signals.adId)

    if (utmSource.includes('google') || utmSource.includes('adwords')) {
      const isPaid = hasCampaignSignals || utmMedium.includes('cpc') || utmMedium.includes('paid')
      return { sourceApp: 'google', sourceType: isPaid ? 'ad' : 'organic', originName: isPaid ? 'Google Ads' : 'Organic' }
    }
    if (utmSource.includes('facebook') || utmSource === 'fb') {
      const isPaid = hasCampaignSignals || utmMedium.includes('paid') || utmMedium.includes('cpc')
      return { sourceApp: 'facebook', sourceType: isPaid ? 'ad' : 'referral', originName: isPaid ? 'Meta Ads' : 'Indicacao' }
    }
    if (utmSource.includes('instagram') || utmSource === 'ig') {
      const isPaid = hasCampaignSignals || utmMedium.includes('paid') || utmMedium.includes('cpc')
      return { sourceApp: 'instagram', sourceType: isPaid ? 'ad' : 'referral', originName: isPaid ? 'Meta Ads' : 'Instagram' }
    }
    if (utmSource.includes('tiktok')) {
      const isPaid = hasCampaignSignals || utmMedium.includes('paid') || utmMedium.includes('cpc')
      return { sourceApp: 'tiktok', sourceType: isPaid ? 'ad' : 'referral', originName: isPaid ? 'TikTok Ads' : 'Indicacao' }
    }
    if (!utmSource && !utmMedium && !referrer) return { sourceApp: 'other', sourceType: 'direct', originName: 'Direct' }
    return { sourceApp: 'other', sourceType: 'other', originName: 'Outros' }
  }

  static classifyFromSourceData(sourceData: StandardizedSourceData | null | undefined): OriginClassification {
    return this.classify({
      gclid: sourceData?.clickIds?.gclid || null, gbraid: sourceData?.clickIds?.gbraid || null,
      wbraid: sourceData?.clickIds?.wbraid || null, fbclid: sourceData?.clickIds?.fbclid || null,
      ttclid: sourceData?.clickIds?.ttclid || null,
      campaignId: sourceData?.campaign?.campaign_id || null, adgroupId: sourceData?.campaign?.adgroup_id || null,
      adId: sourceData?.campaign?.ad_id || null, utmSource: sourceData?.utm?.utm_source || null,
      utmMedium: sourceData?.utm?.utm_medium || null, referrer: sourceData?.metadata?.source_url || null,
    })
  }
}
