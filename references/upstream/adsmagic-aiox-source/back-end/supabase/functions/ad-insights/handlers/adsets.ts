/**
 * Handler para lista de grupos de anúncio (GET /ad-insights/adsets)
 *
 * Query params:
 *   - platform: meta | google | tiktok (obrigatorio)
 *   - campaign_id: id da campanha (opcional; quando ausente lista todos)
 *   - period: 7d, 30d, 90d (default: 30d)
 *   - start_date, end_date: YYYY-MM-DD (opcional)
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getAdInsightsCache, setAdInsightsCache } from '../utils/cache.ts'
import { getCampaignsWithInsights as getMetaCampaigns, getAdsetsWithInsights as getMetaAdsets } from '../services/meta-insights.ts'
import { getCampaignsWithInsights as getGoogleCampaigns, getAdGroupsWithInsights as getGoogleAdgroups } from '../services/google-insights.ts'
import { getAdgroupAttributionMetrics } from '../repositories/attribution.ts'
import type { AdPlatform, AdsetMetrics } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import { getAdAccount, getDateRange } from './shared.ts'

type SupabaseClient = SupabaseDbClient

function normalizeEntityId(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

function dedupeAdsets(
  adsets: Omit<AdsetMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]
): Omit<AdsetMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[] {
  const deduped = new Map<string, Omit<AdsetMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>>()
  for (const adset of adsets) {
    const id = normalizeEntityId(adset.adsetId)
    if (!id) continue

    const existing = deduped.get(id)
    if (!existing) {
      deduped.set(id, adset)
      continue
    }

    const spend = existing.spend + adset.spend
    const impressions = existing.impressions + adset.impressions
    const clicks = existing.clicks + adset.clicks
    const results = (existing.results ?? 0) + (adset.results ?? 0)

    deduped.set(id, {
      ...existing,
      spend,
      impressions,
      clicks,
      reach: existing.reach + adset.reach,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      results,
      costPerResult: results > 0 ? spend / results : 0,
    })
  }

  return Array.from(deduped.values())
}

export async function handleAdsets(
  req: Request,
  supabaseClient: SupabaseClient
) {
  try {
    const url = new URL(req.url)
    const platform = url.searchParams.get('platform') as AdPlatform | null
    const campaignId = normalizeEntityId(url.searchParams.get('campaign_id'))
    const period = url.searchParams.get('period') || '30d'
    const startDate = url.searchParams.get('start_date') || undefined
    const endDate = url.searchParams.get('end_date') || undefined

    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    if (!platform || !['meta', 'google', 'tiktok'].includes(platform)) {
      return errorResponse('Platform is required (meta, google, tiktok)', 400)
    }

    const dateRange = getDateRange(period, startDate, endDate)

    const cacheParams: Record<string, string> = { platform, period }
    if (campaignId) cacheParams.campaign_id = campaignId
    if (startDate && endDate) {
      cacheParams.start_date = startDate
      cacheParams.end_date = endDate
    }

    const cachedData = (await getAdInsightsCache(
      supabaseClient,
      projectId,
      'adsets',
      cacheParams
    )) as AdsetMetrics[] | null

    if (cachedData) {
      console.log('[Ad Insights Adsets] Cache hit', { projectId, platform, period, campaignId })
      return successResponse(cachedData)
    }

    const account = await getAdAccount(supabaseClient, projectId, platform)
    if (!account) {
      return successResponse([])
    }

    let adsets: Omit<AdsetMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[] = []

    if (platform === 'meta') {
      if (campaignId) {
        adsets = await getMetaAdsets(campaignId, account.accessToken, dateRange)
      } else {
        const campaigns = await getMetaCampaigns(
          account.externalAccountId.replace('act_', ''),
          account.accessToken,
          dateRange
        )

        const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'ACTIVE')
        const batches = await Promise.all(
          activeCampaigns.map((campaign) =>
            getMetaAdsets(campaign.campaignId, account.accessToken, dateRange)
          )
        )
        adsets = batches.flat()
      }
    } else if (platform === 'google') {
      if (campaignId) {
        adsets = await getGoogleAdgroups(
          account.externalAccountId,
          campaignId,
          account.accessToken,
          dateRange
        )
      } else {
        const campaigns = await getGoogleCampaigns(
          account.externalAccountId,
          account.accessToken,
          dateRange
        )
        const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'ACTIVE')

        const batches = await Promise.all(
          activeCampaigns.map((campaign) =>
            getGoogleAdgroups(
              account.externalAccountId,
              campaign.campaignId,
              account.accessToken,
              dateRange
            )
          )
        )
        adsets = batches.flat()
      }
    } else {
      return errorResponse('TikTok not implemented yet', 501)
    }

    const deduped = dedupeAdsets(adsets)
    const attributionMaps = await getAdgroupAttributionMetrics(
      supabaseClient,
      projectId,
      platform,
      dateRange
    )

    const enriched: AdsetMetrics[] = deduped
      .map((adset) => {
        const adsetId = normalizeEntityId(adset.adsetId)
        const contacts = adsetId
          ? attributionMaps.contactsByEntityId[adsetId] ?? 0
          : 0
        const salesData = adsetId
          ? attributionMaps.salesByEntityId[adsetId] ?? { count: 0, revenue: 0 }
          : { count: 0, revenue: 0 }
        const roas = adset.spend > 0 ? salesData.revenue / adset.spend : 0

        return {
          ...adset,
          contacts,
          sales: salesData.count,
          revenue: salesData.revenue,
          roas,
        }
      })
      .filter((adset) => adset.status === 'ACTIVE')
      .sort((a, b) => b.spend - a.spend)

    await setAdInsightsCache(
      supabaseClient,
      projectId,
      'adsets',
      cacheParams,
      enriched,
      15
    )

    return successResponse(enriched)
  } catch (error) {
    console.error('[Ad Insights Adsets Error]', error)
    return errorResponse('Failed to fetch adsets', 500)
  }
}
