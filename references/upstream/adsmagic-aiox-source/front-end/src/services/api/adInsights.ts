/**
 * Ad Insights API Service
 *
 * Gerencia operacoes de metricas de anuncios das plataformas conectadas.
 * Busca dados em tempo real das APIs (Meta, Google, TikTok).
 *
 * @module services/api/adInsights
 */

import { apiClient } from './client'
import type { CampaignsTableLevel } from '@/types/campaigns'
import type { NorthStarCustomMetricDefinition } from '@/types'

// Tipos
export type AdPlatform = 'meta' | 'google' | 'tiktok'
export type AdTableLevel = CampaignsTableLevel

export interface AdInsightsSummary {
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  spendDelta: number
  impressionsDelta: number
  clicksDelta: number
  byPlatform: {
    platform: AdPlatform
    spend: number
    impressions: number
    clicks: number
  }[]
}

export interface CampaignMetrics {
  campaignId: string
  campaignName: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED'
  objective?: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  results?: number
  resultType?: string
  costPerResult?: number
  costPerResultLabel?: string
  contacts: number
  sales: number
  revenue: number
  roas: number
}

export interface AdsetMetrics extends CampaignMetrics {
  adsetId: string
  adsetName: string
}

export interface AdMetrics extends AdsetMetrics {
  adId: string
  adName: string
  creativeId?: string
  thumbnailUrl?: string
}

export interface DashboardFilters {
  period?: 'today' | '7d' | '30d' | '90d' | 'custom'
  startDate?: string
  endDate?: string
  platform?: AdPlatform
  compare?: boolean
}

export interface AdTableConfig {
  projectId: string
  platform: AdPlatform
  level: AdTableLevel
  selectedColumnIds: string[]
  columnOrder: string[]
  customMetrics?: NorthStarCustomMetricDefinition[]
  updatedAt: string | null
}

export interface AdTableConfigUpdatePayload {
  selectedColumnIds: string[]
  columnOrder: string[]
  customMetrics?: NorthStarCustomMetricDefinition[]
}

// Flag para mock mode
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Mock data
const MOCK_SUMMARY: AdInsightsSummary = {
  spend: 15420.50,
  impressions: 2450000,
  reach: 1820000,
  clicks: 48500,
  ctr: 1.98,
  cpc: 0.32,
  cpm: 6.29,
  spendDelta: 12.5,
  impressionsDelta: 8.3,
  clicksDelta: 15.2,
  byPlatform: [
    { platform: 'meta', spend: 10250.00, impressions: 1650000, clicks: 32000 },
    { platform: 'google', spend: 5170.50, impressions: 800000, clicks: 16500 },
  ],
}

const MOCK_CAMPAIGNS: CampaignMetrics[] = [
  {
    campaignId: 'camp_001',
    campaignName: 'Lancamento Produto X',
    status: 'ACTIVE',
    objective: 'CONVERSIONS',
    spend: 5200.00,
    impressions: 850000,
    reach: 620000,
    clicks: 17000,
    ctr: 2.0,
    cpc: 0.31,
    cpm: 6.12,
    contacts: 340,
    sales: 45,
    revenue: 22500.00,
    roas: 4.33,
  },
  {
    campaignId: 'camp_002',
    campaignName: 'Retargeting Carrinho',
    status: 'ACTIVE',
    objective: 'CONVERSIONS',
    spend: 3100.00,
    impressions: 520000,
    reach: 380000,
    clicks: 10400,
    ctr: 2.0,
    cpc: 0.30,
    cpm: 5.96,
    contacts: 180,
    sales: 28,
    revenue: 14000.00,
    roas: 4.52,
  },
  {
    campaignId: 'camp_003',
    campaignName: 'Awareness Marca',
    status: 'PAUSED',
    objective: 'REACH',
    spend: 1950.00,
    impressions: 450000,
    reach: 420000,
    clicks: 4500,
    ctr: 1.0,
    cpc: 0.43,
    cpm: 4.33,
    contacts: 65,
    sales: 8,
    revenue: 4000.00,
    roas: 2.05,
  },
]

interface QueryParamsOptions {
  filters?: DashboardFilters
  extraParams?: Record<string, string | undefined>
}

function buildQueryParams(options?: QueryParamsOptions): string {
  const filters = options?.filters
  const extraParams = options?.extraParams
  const params = new URLSearchParams()

  if (filters?.period === 'today') {
    const todayStr = new Date().toISOString().split('T')[0]!
    params.set('start_date', todayStr)
    params.set('end_date', todayStr)
  } else if (filters?.period && filters.period !== 'custom') {
    params.set('period', filters.period)
  }

  if (filters?.startDate) {
    params.set('start_date', filters.startDate)
  }
  if (filters?.endDate) {
    params.set('end_date', filters.endDate)
  }

  if (filters?.compare) {
    params.set('compare', 'true')
  }

  if (filters?.platform) {
    params.set('platform', filters.platform)
  }

  if (extraParams && Object.keys(extraParams).length > 0) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value && value.trim().length > 0) {
        params.set(key, value)
      }
    })
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export const adInsightsService = {
  /**
   * Buscar metricas agregadas de todas as contas
   */
  async getSummary(filters?: DashboardFilters): Promise<AdInsightsSummary> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { ...MOCK_SUMMARY }
    }

    const queryString = buildQueryParams({ filters })
    const response = await apiClient.get<AdInsightsSummary>(
      `/ad-insights/summary${queryString}`
    )
    return response.data
  },

  /**
   * Buscar campanhas com metricas
   */
  async getCampaigns(
    platform: AdPlatform,
    filters?: DashboardFilters
  ): Promise<CampaignMetrics[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      return [...MOCK_CAMPAIGNS]
    }

    const queryString = buildQueryParams({ filters: { ...filters, platform } })
    const response = await apiClient.get<CampaignMetrics[]>(
      `/ad-insights/campaigns${queryString}`
    )
    return response.data
  },

  /**
   * Buscar adsets/grupos de anuncios
   */
  async getAdsets(params: {
    platform: AdPlatform
    campaignId?: string
    filters?: DashboardFilters
  }): Promise<AdsetMetrics[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return [] // TODO: Mock data para adsets
    }

    const queryString = buildQueryParams({
      filters: params.filters,
      extraParams: {
        platform: params.platform,
        campaign_id: params.campaignId,
      },
    })
    const response = await apiClient.get<AdsetMetrics[]>(
      `/ad-insights/adsets${queryString}`
    )
    return response.data
  },

  /**
   * Buscar anuncios
   */
  async getAds(params: {
    platform: AdPlatform
    campaignId?: string
    adsetId?: string
    filters?: DashboardFilters
  }): Promise<AdMetrics[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return [] // TODO: Mock data para ads
    }

    const queryString = buildQueryParams({
      filters: params.filters,
      extraParams: {
        platform: params.platform,
        campaign_id: params.campaignId,
        adset_id: params.adsetId,
      },
    })
    const response = await apiClient.get<AdMetrics[]>(
      `/ad-insights/ads${queryString}`
    )
    return response.data
  },

  async getTableConfig(
    platform: AdPlatform,
    level: AdTableLevel
  ): Promise<AdTableConfig> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return {
        projectId: localStorage.getItem('current_project_id') || 'mock-project',
        platform,
        level,
        selectedColumnIds: ['name', 'spend', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
        columnOrder: ['name', 'spend', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
        updatedAt: new Date().toISOString(),
      }
    }

    const response = await apiClient.get<AdTableConfig>(
      `/ad-insights/table-config?platform=${platform}&level=${level}`
    )
    return response.data
  },

  async updateTableConfig(
    platform: AdPlatform,
    level: AdTableLevel,
    payload: AdTableConfigUpdatePayload
  ): Promise<AdTableConfig> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return {
        projectId: localStorage.getItem('current_project_id') || 'mock-project',
        platform,
        level,
        selectedColumnIds: payload.selectedColumnIds,
        columnOrder: payload.columnOrder,
        updatedAt: new Date().toISOString(),
      }
    }

    const response = await apiClient.patch<AdTableConfig>(
      `/ad-insights/table-config?platform=${platform}&level=${level}`,
      payload
    )
    return response.data
  },

  /**
   * Buscar performance detalhada (com funil)
   */
  async getPerformance(
    level: 'campaign' | 'adset' | 'ad',
    id: string,
    filters?: DashboardFilters
  ): Promise<CampaignMetrics & { funnelData: unknown[]; dailyMetrics: unknown[] }> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 700))
      const campaign = MOCK_CAMPAIGNS[0]!
      return {
        ...campaign,
        funnelData: [],
        dailyMetrics: [],
      }
    }

    const queryString = buildQueryParams({
      filters,
      extraParams: {
        level,
        id,
      },
    })
    const response = await apiClient.get<
      CampaignMetrics & { funnelData: unknown[]; dailyMetrics: unknown[] }
    >(`/ad-insights/performance${queryString}`)
    return response.data
  },

  /**
   * Forcar atualizacao do cache
   */
  async refresh(): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return
    }

    await apiClient.post('/ad-insights/refresh')
  },

  /**
   * Buscar metricas de uma plataforma especifica (para card de integracao)
   */
  async getPlatformMetrics(
    platform: AdPlatform,
    filters?: DashboardFilters
  ): Promise<{
    spend: number
    impressions: number
    clicks: number
    ctr: number
    cpc: number
  }> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400))

      const mockMetrics: Record<
        AdPlatform,
        { spend: number; impressions: number; clicks: number; ctr: number; cpc: number }
      > = {
        meta: { spend: 10250.0, impressions: 1650000, clicks: 32000, ctr: 1.94, cpc: 0.32 },
        google: { spend: 5170.5, impressions: 800000, clicks: 16500, ctr: 2.06, cpc: 0.31 },
        tiktok: { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0 },
      }

      return mockMetrics[platform]
    }

    // Buscar do summary e filtrar por plataforma
    const summary = await this.getSummary(filters)
    const platformData = summary.byPlatform.find((p) => p.platform === platform)

    if (!platformData) {
      return { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0 }
    }

    const ctr =
      platformData.impressions > 0
        ? (platformData.clicks / platformData.impressions) * 100
        : 0
    const cpc = platformData.clicks > 0 ? platformData.spend / platformData.clicks : 0

    return {
      spend: platformData.spend,
      impressions: platformData.impressions,
      clicks: platformData.clicks,
      ctr,
      cpc,
    }
  },
}
