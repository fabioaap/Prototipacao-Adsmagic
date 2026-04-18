import type { CampaignMetrics, AdsetMetrics, AdMetrics } from '@/services/api/adInsights'
import type { CampaignsPerformanceRow } from '@/types/campaigns'

function extractCustomMetrics(item: Record<string, unknown>): Record<string, number> | undefined {
  const customMetrics: Record<string, number> = {}
  let hasCustom = false
  for (const key of Object.keys(item)) {
    if (key.startsWith('custom:') && typeof item[key] === 'number') {
      customMetrics[key] = item[key] as number
      hasCustom = true
    }
  }
  return hasCustom ? customMetrics : undefined
}

export function mapCampaignRows(campaigns: CampaignMetrics[]): CampaignsPerformanceRow[] {
  return campaigns.map((item) => ({
    id: item.campaignId,
    name: item.campaignName,
    spend: item.spend,
    impressions: item.impressions,
    clicks: item.clicks,
    ctr: item.ctr,
    contacts: item.contacts,
    sales: item.sales,
    cpc: item.cpc,
    cpm: item.cpm,
    revenue: item.revenue,
    roas: item.roas,
    results: item.results,
    resultType: item.resultType,
    costPerResult: item.costPerResult,
    costPerResultLabel: item.costPerResultLabel,
    customMetrics: extractCustomMetrics(item as unknown as Record<string, unknown>),
  }))
}

export function mapAdsetRows(adsets: AdsetMetrics[]): CampaignsPerformanceRow[] {
  return adsets.map((item) => ({
    id: item.adsetId,
    name: item.adsetName,
    spend: item.spend,
    impressions: item.impressions,
    clicks: item.clicks,
    ctr: item.ctr,
    contacts: item.contacts,
    sales: item.sales,
    cpc: item.cpc,
    cpm: item.cpm,
    revenue: item.revenue,
    roas: item.roas,
    results: item.results,
    resultType: item.resultType,
    costPerResult: item.costPerResult,
    costPerResultLabel: item.costPerResultLabel,
    customMetrics: extractCustomMetrics(item as unknown as Record<string, unknown>),
  }))
}

export function mapAdRows(ads: AdMetrics[]): CampaignsPerformanceRow[] {
  return ads.map((item) => ({
    id: item.adId,
    name: item.adName,
    spend: item.spend,
    impressions: item.impressions,
    clicks: item.clicks,
    ctr: item.ctr,
    contacts: item.contacts,
    sales: item.sales,
    cpc: item.cpc,
    cpm: item.cpm,
    revenue: item.revenue,
    roas: item.roas,
    results: item.results,
    resultType: item.resultType,
    costPerResult: item.costPerResult,
    costPerResultLabel: item.costPerResultLabel,
    thumbnailUrl: item.thumbnailUrl,
    customMetrics: extractCustomMetrics(item as unknown as Record<string, unknown>),
  }))
}
