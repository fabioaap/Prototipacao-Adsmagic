import type { StandardizedSourceData } from '../types/contact-origin-types.js'

export interface CriticalFields {
  campaignId: string | null
  adId: string | null
  adgroupId: string | null
  sourceApp: string | null
}

export function extractCriticalFields(sourceData: StandardizedSourceData | null | undefined): CriticalFields {
  if (!sourceData) return { campaignId: null, adId: null, adgroupId: null, sourceApp: null }
  return {
    campaignId: sourceData.campaign?.campaign_id || null,
    adId: sourceData.campaign?.ad_id || null,
    adgroupId: sourceData.campaign?.adgroup_id || null,
    sourceApp: sourceData.metadata?.source_app || null,
  }
}
