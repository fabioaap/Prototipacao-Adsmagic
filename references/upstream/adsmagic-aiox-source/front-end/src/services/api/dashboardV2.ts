/**
 * Dashboard V2 API Service
 *
 * Handles all Dashboard V2 API operations including:
 * - Summary data (North Star KPIs + insights)
 * - Funnel statistics
 * - Pipeline statistics
 * - Origin breakdown
 * - Time series data
 *
 * Uses Edge Function GET /dashboard/summary para summary real.
 * Mock ativo apenas quando VITE_USE_MOCK_DASHBOARD === 'true'.
 *
 * @module services/api/dashboardV2
 */

import { apiClient } from './client'
import {
  mapBackendSummaryToDashboardV2Summary,
  mapBackendTimeSeriesToTimeSeriesPoints,
  mapBackendOriginPerformanceToOriginPerformance,
  mapBackendFunnelStatsToFunnelStageStats,
  mapBackendPipelineStatsToPipelineStageStats,
  mapBackendDrillDownToEntities
} from './adapters/dashboardV2Adapter'
import type { BackendDrillDownResponse } from './adapters/dashboardV2Adapter'
import type {
  BackendSummaryResponse,
  BackendTimeSeriesDay,
  BackendOriginPerformanceRow,
  BackendFunnelStatsResponse,
  BackendPipelineStatsResponse
} from './adapters/dashboardV2Adapter'
import type {
  DashboardV2Summary,
  DashboardV2Filters,
  NorthStarConfig,
  NorthStarCustomMetricDefinition,
  FunnelStageStats,
  PipelineStageStats,
  OriginBreakdown,
  TimeSeriesPoint,
  DrillDownEntity,
  OriginPerformance
} from '@/types'

/** Mock ativo apenas quando explícito; produção usa API por padrão */
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DASHBOARD === 'true'
const DEFAULT_MOCK_NORTH_STAR_CONFIG: NorthStarConfig = {
  primaryMetricIds: ['spend', 'revenue', 'sales', 'salesRate'],
  detailedMetricOrder: [
    'spend',
    'revenue',
    'avgTicket',
    'roi',
    'cac',
    'contacts',
    'sales',
    'salesRate',
    'impressions',
    'clicks',
    'cpc',
    'ctr',
    'avgCycleDays',
    'activeCustomers'
  ],
  customMetrics: []
}

let mockNorthStarConfigState: NorthStarConfig = {
  primaryMetricIds: [...DEFAULT_MOCK_NORTH_STAR_CONFIG.primaryMetricIds],
  detailedMetricOrder: [...DEFAULT_MOCK_NORTH_STAR_CONFIG.detailedMetricOrder],
  customMetrics: [...DEFAULT_MOCK_NORTH_STAR_CONFIG.customMetrics]
}

/**
 * Build query params from dashboard filters (Etapa 6).
 * Backend que ainda não aceita start_date/end_date: recebe params; suporte opcional em etapa posterior.
 */
function buildDashboardParams(filters: Partial<DashboardV2Filters> & { period?: DashboardV2Filters['period'] }): Record<string, string> {
  const period = filters.period === 'custom' ? '30d' : (filters.period ?? '30d')
  const params: Record<string, string> = { period }
  if (filters.startDate) params.start_date = filters.startDate
  if (filters.endDate) params.end_date = filters.endDate
  if (filters.origin != null && filters.origin !== '') params.origin = filters.origin
  if (filters.compare) params.compare = 'true'
  return params
}

function normalizeSequentialFunnelStages(
  stages: FunnelStageStats[],
  totalContacts: number
): { stages: FunnelStageStats[]; overallConversionRate: number } {
  if (stages.length === 0) {
    return {
      stages: [],
      overallConversionRate: 0
    }
  }

  const hasIncreaseBetweenStages = stages.some((stage, index) => {
    if (index === 0) return false
    return stage.count > (stages[index - 1]?.count ?? 0)
  })

  const normalizedCounts = hasIncreaseBetweenStages
    ? stages.map((_stage, index) =>
        stages.slice(index).reduce((sum, currentStage) => sum + Math.max(currentStage.count, 0), 0)
      )
    : stages.map((stage) => Math.max(stage.count, 0))

  let previousCount = totalContacts > 0 ? totalContacts : Math.max(normalizedCounts[0] ?? 0, 1)

  const normalizedStages = stages.map((stage, index) => {
    const count = normalizedCounts[index] ?? 0
    const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0

    previousCount = count

    return {
      ...stage,
      count,
      conversionRate
    }
  })

  const lastStageCount = normalizedStages[normalizedStages.length - 1]?.count ?? 0

  return {
    stages: normalizedStages,
    overallConversionRate: totalContacts > 0 ? (lastStageCount / totalContacts) * 100 : 0
  }
}

/**
 * Get dashboard summary (North Star KPIs + insights)
 *
 * GET /dashboard/summary (Edge Function). Header x-project-id via interceptor.
 * Período custom não suportado pelo backend ainda; envia 30d como fallback.
 */
async function getSummary(filters: DashboardV2Filters): Promise<DashboardV2Summary> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))

    // Ajusta valores conforme o período para refletir mudança nos cards
    const period = filters.period || '30d'
    const periodMultiplier: Record<string, number> = {
      '7d': 0.32,
      '30d': 1,
      '90d': 2.7
    }
    const originMultiplier: Record<string, number> = {
      all: 1,
      meta_ads: 1.05,
      google_ads: 0.95,
      tiktok_ads: 0.9,
      youtube: 0.85,
      whatsapp: 0.8,
      organic: 0.75,
      referral: 0.7,
      undefined: 1,
      null: 1
    }

    const mPeriod = periodMultiplier[period] ?? 1
    const originKey = (filters.origin ?? 'all') as keyof typeof originMultiplier
    const mOrigin = originMultiplier[originKey] ?? 1
    // Compare ON não deve alterar os big numbers, apenas as tags/deltas
    const m = mPeriod * mOrigin
    const deltaEnabled = Boolean(filters.compare)

    const fmtCurrency = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
    const fmtNumber = (value: number) => value.toLocaleString('pt-BR')
    const fmtPercent = (value: number) => `${value.toFixed(1).replace('.', ',')}%`
    const fmtRatio = (value: number) => `${value.toFixed(1).replace('.', ',')}x`

    const spendValue = 15000 * m
    const revenueValue = 45000 * m
    const salesValue = Math.round(89 * m)
    const impressionsValue = Math.round(250000 * m)
    const clicksValue = Math.round(12500 * m)
    const cpcValue = spendValue / Math.max(clicksValue, 1)
    const ctrValue = clicksValue / Math.max(impressionsValue, 1)
    const salesRateValue = salesValue / 280 // baseline contatos fictício para simular %
    const roiValue = revenueValue / Math.max(spendValue, 1)

    const baseDelta = deltaEnabled ? 28.57 : null
    const mockCustomMetrics = mockNorthStarConfigState.customMetrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      type: metric.type,
      value: 0,
      delta: deltaEnabled ? 0 : null,
      format: metric.type === 'divide_stages'
        ? 'percent' as const
        : metric.type === 'cost_per_stage'
          ? 'currency' as const
          : 'number' as const
    }))

    return {
      northStar: {
        revenue: {
          value: revenueValue,
          delta: baseDelta,
          displayValue: fmtCurrency(revenueValue),
          tooltip: 'Receita total = Soma de todas as vendas realizadas no período'
        },
        sales: {
          value: salesValue,
          delta: deltaEnabled ? 27.14 : null,
          displayValue: fmtNumber(salesValue),
          tooltip: 'Vendas = Total de negócios ganhos (status = won)'
        },
        contacts: {
          value: Math.round(280 * m),
          delta: deltaEnabled ? 14.2 : null,
          displayValue: fmtNumber(Math.round(280 * m)),
          tooltip: 'Contatos = Total de contatos criados no período'
        },
        spend: {
          value: spendValue,
          delta: deltaEnabled ? 12.5 : null,
          displayValue: fmtCurrency(spendValue),
          tooltip: 'Gastos = Soma de investimento em anúncios (Meta + Google + TikTok)'
        },
        roi: {
          value: roiValue,
          delta: deltaEnabled ? 15.38 : null,
          displayValue: fmtRatio(roiValue),
          tooltip: 'ROI = Receita / Gastos (quanto retorna para cada R$ 1 investido)'
        },
        cac: {
          value: spendValue / Math.max(salesValue, 1),
          delta: deltaEnabled ? -12.31 : null,
          displayValue: fmtCurrency(spendValue / Math.max(salesValue, 1)),
          tooltip: 'CAC = Gastos / Vendas (custo para adquirir cada cliente)'
        },
        avgTicket: {
          value: revenueValue / Math.max(salesValue, 1),
          delta: deltaEnabled ? 1.05 : null,
          displayValue: fmtCurrency(revenueValue / Math.max(salesValue, 1)),
          tooltip: 'Ticket médio = Receita / Vendas (valor médio por venda)'
        },
        impressions: {
          value: impressionsValue,
          delta: deltaEnabled ? 18.5 : null,
          displayValue: fmtNumber(impressionsValue),
          tooltip: 'Impressões = Total de vezes que anúncios foram exibidos'
        },
        clicks: {
          value: clicksValue,
          delta: deltaEnabled ? 22.0 : null,
          displayValue: fmtNumber(clicksValue),
          tooltip: 'Cliques = Total de cliques em anúncios'
        },
        ctr: {
          value: ctrValue * 100,
          delta: deltaEnabled ? 2.97 : null,
          displayValue: fmtPercent(ctrValue * 100),
          tooltip: 'CTR = (Cliques / Impressões) × 100 (taxa de cliques)'
        },
        cpc: {
          value: cpcValue,
          delta: deltaEnabled ? -8.71 : null,
          displayValue: fmtCurrency(cpcValue),
          tooltip: 'CPC = Gastos / Cliques (custo por clique)'
        },
        salesRate: {
          value: salesRateValue,
          delta: deltaEnabled ? 6.67 : null,
          displayValue: fmtPercent(salesRateValue * 100),
          tooltip: 'Taxa de vendas = (Vendas / Contatos) × 100 (conversão final)'
        },
        avgCycleDays: {
          value: 5.8,
          delta: deltaEnabled ? -15.94 : null,
          displayValue: '5,8 dias',
          tooltip: 'Ciclo médio = Tempo médio entre contato e venda'
        },
        activeCustomers: {
          value: Math.round(178 * m),
          delta: deltaEnabled ? 12.66 : null,
          displayValue: fmtNumber(Math.round(178 * m)),
          tooltip: 'Clientes ativos = Total de clientes com atividade no período'
        },
        goalPercentage: {
          value: Math.min(1, roiValue / 3),
          delta: baseDelta,
          displayValue: fmtPercent(Math.min(1, roiValue / 3) * 100),
          tooltip: '% Meta atingida = (Receita atual / Meta do período) × 100'
        }
      },
      insights: [
        {
          id: 'insight-1',
          severity: 'warn',
          title: 'ROI caiu 12% em Meta Ads nos últimos 7 dias',
          cta: {
            type: 'open_tab',
            payload: { tab: 'origens', filter: 'meta' }
          }
        },
        {
          id: 'insight-2',
          severity: 'crit',
          title: 'Maior queda: etapa Cliques → Contatos (-15%)',
          cta: {
            type: 'focus_block',
            payload: { block: 'funnel' }
          }
        },
        {
          id: 'insight-3',
          severity: 'info',
          title: 'Etapa "Proposta enviada" com maior tempo médio (3,5 dias)',
          cta: {
            type: 'open_drawer',
            payload: { stage: 'proposta_enviada' }
          }
        }
      ],
      northStarConfig: {
        primaryMetricIds: [...mockNorthStarConfigState.primaryMetricIds],
        detailedMetricOrder: [...mockNorthStarConfigState.detailedMetricOrder],
        customMetrics: [...mockNorthStarConfigState.customMetrics]
      },
      customMetrics: mockCustomMetrics
    }
  }

  // GET /dashboard/summary (Edge Function). x-project-id enviado pelo interceptor.
  const response = await apiClient.get<BackendSummaryResponse>('/dashboard/summary', {
    params: buildDashboardParams(filters)
  })

  return mapBackendSummaryToDashboardV2Summary(response.data)
}

interface NorthStarConfigUpdatePayload {
  primaryMetricIds: string[]
  detailedMetricOrder: string[]
  customMetrics: NorthStarCustomMetricDefinition[]
}

interface NorthStarConfigResponse extends NorthStarConfig {
  projectId: string
  updatedAt: string
}

async function updateNorthStarConfig(payload: NorthStarConfigUpdatePayload): Promise<NorthStarConfigResponse> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))

    const dedupe = (ids: string[]) => Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim().length > 0)))
    const customMetricIds = payload.customMetrics.map((metric) => metric.id)
    const allowedIds = new Set([...DEFAULT_MOCK_NORTH_STAR_CONFIG.detailedMetricOrder, ...customMetricIds])

    const primaryMetricIds = dedupe(payload.primaryMetricIds).filter((id) => allowedIds.has(id)).slice(0, 4)
    const detailedMetricOrder = dedupe(payload.detailedMetricOrder).filter((id) => allowedIds.has(id))
    for (const id of [...DEFAULT_MOCK_NORTH_STAR_CONFIG.detailedMetricOrder, ...customMetricIds]) {
      if (!detailedMetricOrder.includes(id)) detailedMetricOrder.push(id)
    }

    mockNorthStarConfigState = {
      primaryMetricIds: primaryMetricIds.length > 0
        ? primaryMetricIds
        : [...DEFAULT_MOCK_NORTH_STAR_CONFIG.primaryMetricIds],
      detailedMetricOrder,
      customMetrics: [...payload.customMetrics]
    }

    return {
      projectId: localStorage.getItem('current_project_id') || 'mock-project',
      updatedAt: new Date().toISOString(),
      ...mockNorthStarConfigState
    }
  }

  const response = await apiClient.patch<NorthStarConfigResponse>(
    '/dashboard/north-star-config',
    {
      primaryMetricIds: payload.primaryMetricIds,
      detailedMetricOrder: payload.detailedMetricOrder,
      customMetrics: payload.customMetrics,
    }
  )

  return response.data
}

/** Resultado de getFunnelStats: estágios + totais para a view */
export interface FunnelStatsResult {
  stages: FunnelStageStats[]
  totalContacts: number
  overallConversionRate: number
}

/**
 * Get funnel statistics (conversion funnel stages).
 *
 * GET /dashboard/funnel-stats (Edge Function). Query: period.
 * Header x-project-id via interceptor.
 */
async function getFunnelStats(filters: DashboardV2Filters): Promise<FunnelStatsResult> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))

    const stages: FunnelStageStats[] = [
      {
        stageId: 'stage-1',
        stageName: 'Impressões',
        count: 250000,
        conversionRate: 100,
        avgTimeInStage: 0
      },
      {
        stageId: 'stage-2',
        stageName: 'Cliques',
        count: 12500,
        conversionRate: 5.0,
        avgTimeInStage: 0
      },
      {
        stageId: 'stage-3',
        stageName: 'Contatos',
        count: 1250,
        conversionRate: 10.0,
        avgTimeInStage: 2.5
      },
      {
        stageId: 'stage-4',
        stageName: 'Vendas',
        count: 89,
        conversionRate: 7.12,
        avgTimeInStage: 5.2
      }
    ]
    return {
      stages,
      totalContacts: 1250,
      overallConversionRate: 7.12
    }
  }

  const response = await apiClient.get<BackendFunnelStatsResponse>('/dashboard/funnel-stats', {
    params: buildDashboardParams(filters)
  })

  const totalContacts = response.data.totalContacts ?? 0
  const mappedStages = mapBackendFunnelStatsToFunnelStageStats(response.data)
  const normalizedFunnel = normalizeSequentialFunnelStages(mappedStages, totalContacts)

  return {
    stages: normalizedFunnel.stages,
    totalContacts,
    overallConversionRate: normalizedFunnel.overallConversionRate
  }
}

/**
 * Get pipeline (sales funnel) statistics
 *
 * GET /dashboard/pipeline-stats (Edge Function). Header x-project-id via interceptor.
 * Período custom envia 30d como fallback.
 */
async function getPipelineStats(filters: DashboardV2Filters): Promise<PipelineStageStats[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))

    return [
      {
        stageId: 'stage-contact',
        stageName: 'Contato iniciado',
        count: 450,
        value: 0,
        avgTime: 1.2,
        conversionRate: 65.5
      },
      {
        stageId: 'stage-qualification',
        stageName: 'Qualificação',
        count: 295,
        value: 0,
        avgTime: 2.1,
        conversionRate: 55.9
      },
      {
        stageId: 'stage-proposal',
        stageName: 'Proposta enviada',
        count: 165,
        value: 82500,
        avgTime: 3.5,
        conversionRate: 48.5
      },
      {
        stageId: 'stage-negotiation',
        stageName: 'Negociação',
        count: 80,
        value: 40000,
        avgTime: 4.2,
        conversionRate: 55.6
      },
      {
        stageId: 'stage-sale',
        stageName: 'Venda realizada',
        count: 89,
        value: 45000,
        avgTime: 0,
        conversionRate: 100
      }
    ]
  }

  const response = await apiClient.get<BackendPipelineStatsResponse>(
    '/dashboard/pipeline-stats',
    { params: buildDashboardParams(filters) }
  )

  return mapBackendPipelineStatsToPipelineStageStats(response.data)
}

/**
 * Get origin performance breakdown
 *
 * Calls RPC: get_origin_breakdown
 */
async function getOriginBreakdown(filters: DashboardV2Filters): Promise<OriginBreakdown[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))

    return [
      {
        originId: 'google',
        originName: 'Google Ads',
        spend: 8000,
        contacts: 600,
        sales: 48,
        conversionRate: 8.0,
        cac: 166.67,
        roi: 3.5,
        revenue: 28000
      },
      {
        originId: 'meta',
        originName: 'Meta Ads',
        spend: 5500,
        contacts: 450,
        sales: 28,
        conversionRate: 6.22,
        cac: 196.43,
        roi: 2.36,
        revenue: 13000
      },
      {
        originId: 'tiktok',
        originName: 'TikTok Ads',
        spend: 1500,
        contacts: 200,
        sales: 13,
        conversionRate: 6.5,
        cac: 115.38,
        roi: 2.67,
        revenue: 4000
      }
    ]
  }

  const response = await apiClient.post<OriginBreakdown[]>('/rpc/get_origin_breakdown', {
    start_date: filters.startDate,
    end_date: filters.endDate,
    source: filters.origin,
    team_id: filters.teamId
  })

  return response.data
}

/**
 * Get time series data for charts (contacts + sales per day)
 *
 * GET /dashboard/time-series com period (e opcionalmente start_date, end_date).
 * Resposta mapeada via adapter para TimeSeriesPoint[] (value = contacts, compareValue = sales).
 */
async function getTimeSeries(
  filters: DashboardV2Filters,
  _metric?: 'contacts' | 'sales' | 'revenue' | 'spend'
): Promise<TimeSeriesPoint[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))

    const days = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : 90
    const data: TimeSeriesPoint[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]!

      const contacts = Math.floor(Math.random() * 30) + 20
      const sales = Math.floor(Math.random() * 5) + 1

      data.push({
        date: dateStr,
        value: contacts,
        compareValue: sales
      })
    }

    return data
  }

  const response = await apiClient.get<BackendTimeSeriesDay[]>('/dashboard/time-series', {
    params: buildDashboardParams(filters)
  })

  return mapBackendTimeSeriesToTimeSeriesPoints(response.data)
}

/**
 * Get entities for drill-down (contacts or sales filtered by stage/origin).
 * Backend: GET /dashboard/drill-down (not /v2/) with entityType, stageId/originId, period.
 */
async function getDrillDownEntities(
  type: 'funnel' | 'pipeline' | 'origin',
  filterId: string,
  period: string = '30d'
): Promise<DrillDownEntity[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))

    // Mock entities
    return [
      {
        id: '1',
        type: 'contact',
        name: 'João Silva',
        stage: 'Qualificação',
        origin: 'Google Ads',
        createdAt: '2025-12-10T10:00:00Z'
      },
      {
        id: '2',
        type: 'deal',
        name: 'Proposta Empresa XYZ',
        stage: 'Proposta enviada',
        origin: 'Meta Ads',
        value: 5000,
        createdAt: '2025-12-09T14:30:00Z'
      },
      {
        id: '3',
        type: 'sale',
        name: 'Venda Concluída - ABC Corp',
        stage: 'Venda realizada',
        origin: 'TikTok Ads',
        value: 3500,
        createdAt: '2025-12-08T09:15:00Z'
      }
    ]
  }

  const params: Record<string, string> = { period }
  if (type === 'pipeline') {
    params.entityType = 'sales'
    params.stageId = filterId
  } else if (type === 'funnel') {
    params.entityType = 'contacts'
    params.stageId = filterId
  } else {
    params.entityType = 'contacts'
    params.originId = filterId
  }

  const response = await apiClient.get<BackendDrillDownResponse>('/dashboard/drill-down', {
    params
  })

  const body = response.data as BackendDrillDownResponse
  const rows = body?.data ?? []
  return mapBackendDrillDownToEntities(rows)
}

/**
 * Export dashboard data
 */
async function exportData(
  filters: DashboardV2Filters,
  format: 'csv' | 'xlsx' | 'pdf'
): Promise<Blob> {
  const response = await apiClient.post(
    '/dashboard/v2/export',
    {
      filters,
      format
    },
    {
      responseType: 'blob'
    }
  )

  return response.data
}

/**
 * Get origins performance data (Origins Performance Table)
 *
 * Returns aggregated metrics for each traffic origin:
 * - Google Ads, Meta Ads, TikTok, Organic, Direct, Others
 * - Metrics: spent, contacts, sales, conversion rate, ROI
 *
 * @param projectId - Project ID to filter data
 * @param filters - Optional filters (period, compare)
 */
async function getOriginsPerformance(
  _projectId: string,
  filters?: Partial<DashboardV2Filters>
): Promise<OriginPerformance[]> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock data para 6 origens padrão
    const mockData: OriginPerformance[] = [
      {
        id: 'google-ads',
        origin: 'google-ads',
        name: 'Google Ads',
        color: '#4285f4', // Google blue
        spent: 4500.00,
        investment: 4500.00,
        contacts: 180,
        sales: 45,
        revenue: 14400,
        conversionRate: 25.0,
        costPerSale: 100,
        costPerContact: 25,
        roi: 3.2
      },
      {
        id: 'meta-ads',
        origin: 'meta-ads',
        name: 'Meta Ads',
        color: '#1877f2', // Meta blue
        spent: 5200.50,
        investment: 5200.50,
        contacts: 220,
        sales: 48,
        revenue: 14560,
        conversionRate: 21.8,
        costPerSale: 108.34,
        costPerContact: 23.64,
        roi: 2.8
      },
      {
        id: 'tiktok-ads',
        origin: 'tiktok-ads',
        name: 'TikTok Ads',
        color: '#000000', // TikTok black
        spent: 3100.25,
        investment: 3100.25,
        contacts: 150,
        sales: 22,
        revenue: 5890.48,
        conversionRate: 14.7,
        costPerSale: 140.92,
        costPerContact: 20.67,
        roi: 1.9
      },
      {
        id: 'organic',
        origin: 'organic',
        name: 'Orgânico',
        color: '#10b981', // Green
        spent: 0,
        investment: 0,
        contacts: 95,
        sales: 17,
        revenue: 4250,
        conversionRate: 17.9,
        costPerSale: 0,
        costPerContact: 0,
        roi: null // Sem gastos = N/A
      },
      {
        id: 'direct',
        origin: 'direct',
        name: 'Direto',
        color: '#6b7280', // Gray
        spent: 0,
        investment: 0,
        contacts: 68,
        sales: 9,
        revenue: 2250,
        conversionRate: 13.2,
        costPerSale: 0,
        costPerContact: 0,
        roi: null
      },
      {
        id: 'others',
        origin: 'others',
        name: 'Outros',
        color: '#9ca3af', // Light gray
        spent: 1850.75,
        investment: 1850.75,
        contacts: 42,
        sales: 6,
        revenue: 1480.60,
        conversionRate: 14.3,
        costPerSale: 308.46,
        costPerContact: 44.07,
        roi: 0.8 // ROI < 1x (prejuízo)
      }
    ]

    return mockData
  }

  const params = filters ? buildDashboardParams(filters) : { period: '30d' }

  const response = await apiClient.get<BackendOriginPerformanceRow[] | { data: BackendOriginPerformanceRow[] }>(
    '/dashboard/origin-performance',
    { params }
  )

  // Backend retorna array direto; tolerar envelope { data } se existir
  const raw =
    Array.isArray(response.data)
      ? response.data
      : (response.data as { data?: BackendOriginPerformanceRow[] })?.data ?? []

  return mapBackendOriginPerformanceToOriginPerformance(raw)
}

export const dashboardV2Service = {
  getSummary,
  updateNorthStarConfig,
  getFunnelStats,
  getPipelineStats,
  getOriginBreakdown,
  getTimeSeries,
  getDrillDownEntities,
  exportData,
  getOriginsPerformance
}
