import {
  getCampaignsWithInsights as getMetaCampaigns,
  getAdsetsWithInsights as getMetaAdsets,
  getAdsWithInsights as getMetaAds,
} from '../services/meta-insights.ts'
import {
  getCampaignsWithInsights as getGoogleCampaigns,
  getAdGroupsWithInsights as getGoogleAdgroups,
  getAdsWithInsights as getGoogleAds,
} from '../services/google-insights.ts'
import { getAdAttributionMetrics } from '../repositories/attribution.ts'
import type { AdMetrics, AdPlatform, DateRange } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { AdAccountCredentials } from './shared.ts'

type SupabaseClient = SupabaseDbClient
type RawAdMetrics = Omit<AdMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>

export interface ParsedAdsQueryParams {
  platform: AdPlatform | null
  campaignId: string
  adsetId: string
  period: string
  startDate?: string
  endDate?: string
}

export interface RawAdsResult {
  ads: RawAdMetrics[]
  campaignIdByAdsetId: Map<string, string>
}

export function normalizeEntityId(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function parseAdsQueryParams(req: Request): ParsedAdsQueryParams {
  const url = new URL(req.url)
  const platformParam = url.searchParams.get('platform')
  const platform = platformParam && ['meta', 'google', 'tiktok'].includes(platformParam)
    ? (platformParam as AdPlatform)
    : null

  return {
    platform,
    campaignId: normalizeEntityId(url.searchParams.get('campaign_id')),
    adsetId: normalizeEntityId(url.searchParams.get('adset_id')),
    period: url.searchParams.get('period') || '30d',
    startDate: url.searchParams.get('start_date') || undefined,
    endDate: url.searchParams.get('end_date') || undefined,
  }
}

export function buildAdsCacheParams(
  params: Pick<ParsedAdsQueryParams, 'platform' | 'period' | 'campaignId' | 'adsetId' | 'startDate' | 'endDate'>
): Record<string, string> {
  const cacheParams: Record<string, string> = {
    platform: params.platform ?? '',
    period: params.period,
  }

  if (params.campaignId) cacheParams.campaign_id = params.campaignId
  if (params.adsetId) cacheParams.adset_id = params.adsetId
  if (params.startDate && params.endDate) {
    cacheParams.start_date = params.startDate
    cacheParams.end_date = params.endDate
  }

  return cacheParams
}

function addCampaignByAdset(
  campaignIdByAdsetId: Map<string, string>,
  adsetId: string | null | undefined,
  campaignId: string | null | undefined
) {
  const normalizedAdsetId = normalizeEntityId(adsetId)
  const normalizedCampaignId = normalizeEntityId(campaignId)
  if (!normalizedAdsetId || !normalizedCampaignId) return
  campaignIdByAdsetId.set(normalizedAdsetId, normalizedCampaignId)
}

async function fetchMetaAdsTree(
  account: AdAccountCredentials,
  dateRange: DateRange,
  campaignId: string,
  adsetId: string
): Promise<RawAdsResult> {
  const campaignIdByAdsetId = new Map<string, string>()
  let ads: RawAdMetrics[] = []

  if (adsetId) {
    ads = await getMetaAds(adsetId, account.accessToken, dateRange)
    if (campaignId) {
      campaignIdByAdsetId.set(adsetId, campaignId)
    }
    return { ads, campaignIdByAdsetId }
  }

  if (campaignId) {
    const adsets = await getMetaAdsets(campaignId, account.accessToken, dateRange)
    const activeAdsets = adsets.filter((adset) => adset.status === 'ACTIVE')

    activeAdsets.forEach((adset) => {
      addCampaignByAdset(campaignIdByAdsetId, adset.adsetId, adset.campaignId)
    })

    const batches = await Promise.all(
      activeAdsets.map((adset) =>
        getMetaAds(adset.adsetId, account.accessToken, dateRange)
      )
    )
    ads = batches.flat()
    return { ads, campaignIdByAdsetId }
  }

  const campaigns = await getMetaCampaigns(
    account.externalAccountId.replace('act_', ''),
    account.accessToken,
    dateRange
  )
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'ACTIVE')

  const adsetBatches = await Promise.all(
    activeCampaigns.map((campaign) =>
      getMetaAdsets(campaign.campaignId, account.accessToken, dateRange)
    )
  )
  const activeAdsets = adsetBatches.flat().filter((adset) => adset.status === 'ACTIVE')

  activeAdsets.forEach((adset) => {
    addCampaignByAdset(campaignIdByAdsetId, adset.adsetId, adset.campaignId)
  })

  const adBatches = await Promise.all(
    activeAdsets.map((adset) =>
      getMetaAds(adset.adsetId, account.accessToken, dateRange)
    )
  )
  ads = adBatches.flat()

  return { ads, campaignIdByAdsetId }
}

async function fetchGoogleAdsTree(
  account: AdAccountCredentials,
  dateRange: DateRange,
  campaignId: string,
  adsetId: string
): Promise<RawAdsResult> {
  const campaignIdByAdsetId = new Map<string, string>()
  let ads: RawAdMetrics[] = []
  const loginId = account.loginCustomerId

  if (adsetId) {
    ads = await getGoogleAds(
      account.externalAccountId,
      adsetId,
      account.accessToken,
      dateRange,
      loginId
    )

    if (campaignId) {
      campaignIdByAdsetId.set(adsetId, campaignId)
    }
    return { ads, campaignIdByAdsetId }
  }

  if (campaignId) {
    const adgroups = await getGoogleAdgroups(
      account.externalAccountId,
      campaignId,
      account.accessToken,
      dateRange,
      loginId
    )
    const activeAdgroups = adgroups.filter((adgroup) => adgroup.status === 'ACTIVE')

    activeAdgroups.forEach((adgroup) => {
      addCampaignByAdset(campaignIdByAdsetId, adgroup.adsetId, adgroup.campaignId)
    })

    const batches = await Promise.all(
      activeAdgroups.map((adgroup) =>
        getGoogleAds(
          account.externalAccountId,
          adgroup.adsetId,
          account.accessToken,
          dateRange,
          loginId
        )
      )
    )
    ads = batches.flat()
    return { ads, campaignIdByAdsetId }
  }

  const campaigns = await getGoogleCampaigns(
    account.externalAccountId,
    account.accessToken,
    dateRange,
    loginId
  )
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'ACTIVE')

  const adgroupBatches = await Promise.all(
    activeCampaigns.map((campaign) =>
      getGoogleAdgroups(
        account.externalAccountId,
        campaign.campaignId,
        account.accessToken,
        dateRange,
        loginId
      )
    )
  )
  const activeAdgroups = adgroupBatches
    .flat()
    .filter((adgroup) => adgroup.status === 'ACTIVE')

  activeAdgroups.forEach((adgroup) => {
    addCampaignByAdset(campaignIdByAdsetId, adgroup.adsetId, adgroup.campaignId)
  })

  const adBatches = await Promise.all(
    activeAdgroups.map((adgroup) =>
      getGoogleAds(
        account.externalAccountId,
        adgroup.adsetId,
        account.accessToken,
        dateRange,
        loginId
      )
    )
  )
  ads = adBatches.flat()

  return { ads, campaignIdByAdsetId }
}

export async function fetchRawAdsByPlatform(
  account: AdAccountCredentials,
  platform: AdPlatform,
  dateRange: DateRange,
  campaignId: string,
  adsetId: string
): Promise<RawAdsResult> {
  if (platform === 'meta') {
    return fetchMetaAdsTree(account, dateRange, campaignId, adsetId)
  }

  if (platform === 'google') {
    return fetchGoogleAdsTree(account, dateRange, campaignId, adsetId)
  }

  return { ads: [], campaignIdByAdsetId: new Map<string, string>() }
}

export function normalizeAdsWithCampaignFallback(
  rawResult: RawAdsResult,
  fallbackCampaignId: string
): RawAdMetrics[] {
  return rawResult.ads.map((ad) => {
    const normalizedAdsetId = normalizeEntityId(ad.adsetId)
    const normalizedCampaignId =
      normalizeEntityId(ad.campaignId) ||
      (normalizedAdsetId
        ? rawResult.campaignIdByAdsetId.get(normalizedAdsetId) ?? ''
        : '') ||
      fallbackCampaignId

    return {
      ...ad,
      adsetId: normalizedAdsetId,
      campaignId: normalizedCampaignId,
    }
  })
}

export function dedupeAds(ads: RawAdMetrics[]): RawAdMetrics[] {
  const deduped = new Map<string, RawAdMetrics>()

  for (const ad of ads) {
    const adId = normalizeEntityId(ad.adId)
    if (!adId) continue

    const existing = deduped.get(adId)
    if (!existing) {
      deduped.set(adId, ad)
      continue
    }

    const spend = existing.spend + ad.spend
    const impressions = existing.impressions + ad.impressions
    const clicks = existing.clicks + ad.clicks
    const reach = existing.reach + ad.reach

    const results = (existing.results ?? 0) + (ad.results ?? 0)

    deduped.set(adId, {
      ...existing,
      campaignId: normalizeEntityId(existing.campaignId) || normalizeEntityId(ad.campaignId),
      adsetId: normalizeEntityId(existing.adsetId) || normalizeEntityId(ad.adsetId),
      status: existing.status === 'ACTIVE' || ad.status === 'ACTIVE' ? 'ACTIVE' : existing.status,
      spend,
      impressions,
      clicks,
      reach,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      results,
      costPerResult: results > 0 ? spend / results : 0,
    })
  }

  return Array.from(deduped.values())
}

export async function enrichAdsWithAttribution(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AdPlatform,
  dateRange: DateRange,
  ads: RawAdMetrics[]
): Promise<AdMetrics[]> {
  const attributionMaps = await getAdAttributionMetrics(
    supabaseClient,
    projectId,
    platform,
    dateRange
  )

  return ads.map((ad) => {
    const normalizedAdId = normalizeEntityId(ad.adId)
    const contacts = normalizedAdId
      ? attributionMaps.contactsByEntityId[normalizedAdId] ?? 0
      : 0
    const salesData = normalizedAdId
      ? attributionMaps.salesByEntityId[normalizedAdId] ?? { count: 0, revenue: 0 }
      : { count: 0, revenue: 0 }
    const roas = ad.spend > 0 ? salesData.revenue / ad.spend : 0

    return {
      ...ad,
      contacts,
      sales: salesData.count,
      revenue: salesData.revenue,
      roas,
    }
  })
}

export function filterAndSortAds(
  ads: AdMetrics[],
  campaignId: string,
  adsetId: string
): AdMetrics[] {
  return ads
    .filter((ad) => ad.status === 'ACTIVE')
    .filter((ad) => !campaignId || normalizeEntityId(ad.campaignId) === campaignId)
    .filter((ad) => !adsetId || normalizeEntityId(ad.adsetId) === adsetId)
    .sort((a, b) => b.spend - a.spend)
}
