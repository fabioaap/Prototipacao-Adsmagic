/**
 * Handler para lista de anúncios (GET /ad-insights/ads).
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getAdInsightsCache, setAdInsightsCache } from '../utils/cache.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import { getAdAccount, getDateRange } from './shared.ts'
import {
  parseAdsQueryParams,
  buildAdsCacheParams,
  fetchRawAdsByPlatform,
  normalizeAdsWithCampaignFallback,
  dedupeAds,
  enrichAdsWithAttribution,
  filterAndSortAds,
} from './ads.helpers.ts'

type SupabaseClient = SupabaseDbClient

export async function handleAds(req: Request, supabaseClient: SupabaseClient) {
  try {
    const params = parseAdsQueryParams(req)
    const projectId = req.headers.get('x-project-id')

    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    if (!params.platform) {
      return errorResponse('Platform is required (meta, google, tiktok)', 400)
    }

    if (params.platform === 'tiktok') {
      return errorResponse('TikTok not implemented yet', 501)
    }

    const dateRange = getDateRange(params.period, params.startDate, params.endDate)
    const cacheParams = buildAdsCacheParams(params)

    const cachedData = await getAdInsightsCache(
      supabaseClient,
      projectId,
      'ads',
      cacheParams
    )

    if (cachedData) {
      console.log('[Ad Insights Ads] Cache hit', {
        projectId,
        platform: params.platform,
        period: params.period,
        campaignId: params.campaignId,
        adsetId: params.adsetId,
      })
      return successResponse(cachedData)
    }

    const account = await getAdAccount(supabaseClient, projectId, params.platform)
    if (!account) {
      return successResponse([])
    }

    let rawAdsResult
    try {
      rawAdsResult = await fetchRawAdsByPlatform(
        account,
        params.platform,
        dateRange,
        params.campaignId,
        params.adsetId
      )
    } catch (apiError) {
      console.error(`[Ad Insights Ads] ${params.platform} API error:`, apiError)
      return successResponse([])
    }

    const normalizedAds = normalizeAdsWithCampaignFallback(
      rawAdsResult,
      params.campaignId
    )
    const dedupedAds = dedupeAds(normalizedAds)
    const enrichedAds = await enrichAdsWithAttribution(
      supabaseClient,
      projectId,
      params.platform,
      dateRange,
      dedupedAds
    )
    const responseData = filterAndSortAds(
      enrichedAds,
      params.campaignId,
      params.adsetId
    )

    await setAdInsightsCache(
      supabaseClient,
      projectId,
      'ads',
      cacheParams,
      responseData,
      15
    )

    return successResponse(responseData)
  } catch (error) {
    console.error('[Ad Insights Ads Error]', error)
    return errorResponse('Failed to fetch ads', 500)
  }
}
