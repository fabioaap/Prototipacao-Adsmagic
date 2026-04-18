/**
 * Handler para metricas agregadas de ads (GET /ad-insights/summary)
 *
 * Query params: period (7d, 30d, 90d) ou start_date/end_date (YYYY-MM-DD)
 * Retorna metricas agregadas de todas as contas de ads conectadas
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'
import { getAdInsightsCache, setAdInsightsCache } from '../utils/cache.ts'
import { decryptToken } from '../utils/encryption.ts'
import { getAccountInsights as getMetaAccountInsights } from '../services/meta-insights.ts'
import { getAccountInsights as getGoogleAccountInsights } from '../services/google-insights.ts'
import { getSalesByPlatform } from '../repositories/attribution.ts'
import type { AdInsightsSummary, DateRange, AdPlatform } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type SupabaseClient = SupabaseDbClient

interface IntegrationRelation {
  platform: string
  platform_type: string
  status: string
  project_id: string
}

function getIntegrationRelation(
  relation: IntegrationRelation | IntegrationRelation[] | null | undefined
): IntegrationRelation | null {
  if (!relation) {
    return null
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation
}

/**
 * Calcula range de datas baseado no periodo
 */
function getDateRange(period: string, startDate?: string, endDate?: string): DateRange {
  if (startDate && endDate) {
    return { start: startDate, end: endDate }
  }

  const end = new Date()
  const start = new Date()

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
    default:
      start.setDate(start.getDate() - 30)
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

/**
 * Busca contas de integracao ativas de advertising
 */
async function getActiveAdAccounts(
  supabaseClient: SupabaseClient,
  projectId: string
): Promise<
  Array<{
    id: string
    externalAccountId: string
    accessToken: string
    platform: AdPlatform
    integrationId: string
  }>
> {
  // Precisamos usar service role para descriptografar tokens
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabaseClient
    .from('integration_accounts')
    .select(
      `
      id,
      external_account_id,
      access_token,
      integration_id,
      integrations!inner(platform, platform_type, status, project_id)
    `
    )
    .eq('status', 'active')
    .not('access_token', 'is', null)

  if (error) {
    console.error('[Ad Insights Summary] Error fetching accounts:', error)
    return []
  }

  // Filtrar apenas contas de advertising conectadas do projeto
  const advertisingAccounts = (data || []).filter((account) => {
    const integration = getIntegrationRelation(
      account.integrations as IntegrationRelation | IntegrationRelation[] | null
    )
    if (!integration) {
      return false
    }

    return (
      integration.platform_type === 'advertising' &&
      integration.status === 'connected' &&
      integration.project_id === projectId
    )
  })

  // Descriptografar tokens
  const encryptionKey =
    Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
  const accountsWithTokens = []

  for (const account of advertisingAccounts) {
    try {
      const decryptedToken = await decryptToken(
        serviceClient,
        account.access_token,
        encryptionKey
      )

      const integration = getIntegrationRelation(
        account.integrations as IntegrationRelation | IntegrationRelation[] | null
      )
      if (!integration) {
        continue
      }

      accountsWithTokens.push({
        id: account.id,
        externalAccountId: account.external_account_id,
        accessToken: decryptedToken,
        platform: integration.platform as AdPlatform,
        integrationId: account.integration_id,
      })
    } catch (error) {
      console.error('[Ad Insights Summary] Error decrypting token for account:', account.id, error)
    }
  }

  return accountsWithTokens
}

export async function handleSummary(
  req: Request,
  supabaseClient: SupabaseClient
) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '30d'
    const startDate = url.searchParams.get('start_date') || undefined
    const endDate = url.searchParams.get('end_date') || undefined

    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const dateRange = getDateRange(period, startDate, endDate)

    // Verificar cache
    const cacheParams: Record<string, string> = { period }
    if (startDate && endDate) {
      cacheParams.start_date = startDate
      cacheParams.end_date = endDate
    }

    const cachedData = (await getAdInsightsCache(
      supabaseClient,
      projectId,
      'summary',
      cacheParams
    )) as AdInsightsSummary | null

    if (cachedData) {
      console.log('[Ad Insights Summary] Cache hit', { projectId, period })
      return successResponse(cachedData)
    }

    console.log('[Ad Insights Summary] Cache miss, fetching from APIs', {
      projectId,
      period,
      dateRange,
    })

    // Buscar contas ativas
    const accounts = await getActiveAdAccounts(supabaseClient, projectId)

    if (accounts.length === 0) {
      // Sem contas conectadas - retornar zeros
      const emptyResponse: AdInsightsSummary = {
        spend: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        spendDelta: 0,
        impressionsDelta: 0,
        clicksDelta: 0,
        byPlatform: [],
      }
      return successResponse(emptyResponse)
    }

    // Agregar metricas de todas as contas
    let totalSpend = 0
    let totalImpressions = 0
    let totalReach = 0
    let totalClicks = 0
    const byPlatform: AdInsightsSummary['byPlatform'] = []

    // Agrupar por plataforma
    const platformMetrics: Record<
      AdPlatform,
      { spend: number; impressions: number; clicks: number }
    > = {
      meta: { spend: 0, impressions: 0, clicks: 0 },
      google: { spend: 0, impressions: 0, clicks: 0 },
      tiktok: { spend: 0, impressions: 0, clicks: 0 },
    }

    for (const account of accounts) {
      try {
        let metrics

        switch (account.platform) {
          case 'meta':
            metrics = await getMetaAccountInsights(
              account.externalAccountId.replace('act_', ''),
              account.accessToken,
              dateRange
            )
            break
          case 'google':
            metrics = await getGoogleAccountInsights(
              account.externalAccountId,
              account.accessToken,
              dateRange
            )
            break
          case 'tiktok':
            // TODO: Implementar TikTok
            console.log('[Ad Insights Summary] TikTok not implemented yet')
            continue
          default:
            continue
        }

        totalSpend += metrics.spend
        totalImpressions += metrics.impressions
        totalReach += metrics.reach
        totalClicks += metrics.clicks

        platformMetrics[account.platform].spend += metrics.spend
        platformMetrics[account.platform].impressions += metrics.impressions
        platformMetrics[account.platform].clicks += metrics.clicks
      } catch (error) {
        console.error(
          '[Ad Insights Summary] Error fetching metrics for account:',
          account.id,
          error
        )
      }
    }

    // Montar byPlatform array
    for (const [platform, metrics] of Object.entries(platformMetrics)) {
      if (metrics.spend > 0 || metrics.impressions > 0) {
        byPlatform.push({
          platform: platform as AdPlatform,
          ...metrics,
        })
      }
    }

    // Calcular metricas derivadas
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0

    // TODO: Calcular deltas comparando com periodo anterior
    // Por enquanto, retornamos 0
    const spendDelta = 0
    const impressionsDelta = 0
    const clicksDelta = 0

    const summary: AdInsightsSummary = {
      spend: totalSpend,
      impressions: totalImpressions,
      reach: totalReach,
      clicks: totalClicks,
      ctr,
      cpc,
      cpm,
      spendDelta,
      impressionsDelta,
      clicksDelta,
      byPlatform,
    }

    // Salvar no cache (TTL: 15 minutos)
    await setAdInsightsCache(supabaseClient, projectId, 'summary', cacheParams, summary, 15)

    console.log('[Ad Insights Summary] Fetched successfully', {
      projectId,
      spend: totalSpend,
      impressions: totalImpressions,
      accounts: accounts.length,
    })

    return successResponse(summary)
  } catch (error) {
    console.error('[Ad Insights Summary Error]', error)
    return errorResponse('Failed to fetch ad insights summary', 500)
  }
}
