/**
 * Handler para lista de campanhas (GET /ad-insights/campaigns)
 *
 * Query params:
 *   - platform: meta | google | tiktok (obrigatorio)
 *   - period: 7d, 30d, 90d (default: 30d)
 *   - start_date, end_date: YYYY-MM-DD (opcional)
 *
 * Retorna lista de campanhas com metricas + dados internos (vendas, contatos)
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getAdInsightsCache, setAdInsightsCache } from '../utils/cache.ts'
import { getCampaignsWithInsights as getMetaCampaigns } from '../services/meta-insights.ts'
import { getCampaignsWithInsights as getGoogleCampaigns } from '../services/google-insights.ts'
import { getCampaignAttributionMetrics } from '../repositories/attribution.ts'
import type { CampaignMetrics, AdPlatform } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import { getAdAccount, getDateRange } from './shared.ts'

type SupabaseClient = SupabaseDbClient

function normalizeEntityId(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function handleCampaigns(
  req: Request,
  supabaseClient: SupabaseClient
) {
  try {
    const url = new URL(req.url)
    const platform = url.searchParams.get('platform') as AdPlatform | null
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

    // Verificar cache
    const cacheParams: Record<string, string> = { platform, period }
    if (startDate && endDate) {
      cacheParams.start_date = startDate
      cacheParams.end_date = endDate
    }

    const cachedData = (await getAdInsightsCache(
      supabaseClient,
      projectId,
      'campaigns',
      cacheParams
    )) as CampaignMetrics[] | null

    if (cachedData) {
      console.log('[Ad Insights Campaigns] Cache hit', { projectId, platform, period })
      return successResponse(cachedData)
    }

    console.log('[Ad Insights Campaigns] Cache miss, fetching from API', {
      projectId,
      platform,
      period,
      dateRange,
    })

    // Buscar conta da plataforma
    const account = await getAdAccount(supabaseClient, projectId, platform)

    if (!account) {
      return successResponse([]) // Sem conta conectada
    }

    // Buscar campanhas da API
    let campaigns: Omit<CampaignMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]

    switch (platform) {
      case 'meta':
        campaigns = await getMetaCampaigns(
          account.externalAccountId.replace('act_', ''),
          account.accessToken,
          dateRange
        )
        break
      case 'google':
        campaigns = await getGoogleCampaigns(
          account.externalAccountId,
          account.accessToken,
          dateRange
        )
        break
      case 'tiktok':
        // TODO: Implementar TikTok
        return errorResponse('TikTok not implemented yet', 501)
      default:
        return errorResponse('Invalid platform', 400)
    }

    // Enriquecer com dados internos (vendas e contatos) usando IDs de contact_origins.
    const attributionMaps = await getCampaignAttributionMetrics(
      supabaseClient,
      projectId,
      platform,
      dateRange
    )

    const enrichedCampaigns: CampaignMetrics[] = campaigns.map((campaign) => {
      const campaignId = normalizeEntityId(campaign.campaignId)
      const contacts = campaignId
        ? attributionMaps.contactsByEntityId[campaignId] ?? 0
        : 0
      const salesData = campaignId
        ? attributionMaps.salesByEntityId[campaignId] ?? { count: 0, revenue: 0 }
        : { count: 0, revenue: 0 }
      const roas = campaign.spend > 0 ? salesData.revenue / campaign.spend : 0

      return {
        ...campaign,
        contacts,
        sales: salesData.count,
        revenue: salesData.revenue,
        roas,
      }
    })

    // Exibir somente campanhas ativas e ordenar por investimento.
    const activeCampaigns = enrichedCampaigns
      .filter((campaign) => campaign.status === 'ACTIVE')
      .sort((a, b) => b.spend - a.spend)

    // Salvar no cache (TTL: 15 minutos)
    await setAdInsightsCache(
      supabaseClient,
      projectId,
      'campaigns',
      cacheParams,
      activeCampaigns,
      15
    )

    console.log('[Ad Insights Campaigns] Fetched successfully', {
      projectId,
      platform,
      count: activeCampaigns.length,
    })

    return successResponse(activeCampaigns)
  } catch (error) {
    console.error('[Ad Insights Campaigns Error]', error)
    return errorResponse('Failed to fetch campaigns', 500)
  }
}
