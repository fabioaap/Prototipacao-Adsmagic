/**
 * Adapter: resposta flat do GET /dashboard/summary → DashboardV2Summary
 * e GET /dashboard/time-series → TimeSeriesPoint[].
 *
 * O backend (Edge Function dashboard) retorna métricas "flat" com value e delta.
 * Este adapter monta northStar com displayValue e tooltip para cada métrica
 * e retorna insights vazios até o backend enviar insights.
 *
 * @module services/api/adapters/dashboardV2Adapter
 */

import type {
  DashboardV2Summary,
  NorthStarKPI,
  NorthStarConfig,
  NorthStarCustomMetricDefinition,
  NorthStarCustomMetricValue,
  TimeSeriesPoint,
  OriginPerformance,
  FunnelStageStats,
  PipelineStageStats,
  DrillDownEntity
} from '@/types'

/** Métrica flat retornada pelo backend (value + delta, delta pode ser null quando compare desabilitado) */
interface BackendMetric {
  value: number
  delta: number | null
}

/** Resposta do GET /dashboard/summary (contrato do backend) */
export interface BackendSummaryResponse {
  revenue: BackendMetric
  sales: BackendMetric
  contacts: BackendMetric
  spend: BackendMetric
  roi: BackendMetric
  cac: BackendMetric
  avgTicket: BackendMetric
  impressions: BackendMetric
  clicks: BackendMetric
  ctr: BackendMetric
  cpc: BackendMetric
  salesRate: BackendMetric
  avgCycleDays: BackendMetric
  activeCustomers: BackendMetric
  goalPercentage: BackendMetric
  northStarConfig?: NorthStarConfig
  customMetrics?: NorthStarCustomMetricValue[]
}

function normalizeNorthStarConfig(config: NorthStarConfig | undefined): NorthStarConfig | undefined {
  if (!config || typeof config !== 'object') return undefined
  const primaryMetricIds = Array.isArray(config.primaryMetricIds) ? config.primaryMetricIds : []
  const detailedMetricOrder = Array.isArray(config.detailedMetricOrder) ? config.detailedMetricOrder : []
  const customMetrics = Array.isArray(config.customMetrics)
    ? config.customMetrics.filter((metric): metric is NorthStarCustomMetricDefinition => (
      Boolean(metric) &&
      typeof metric.id === 'string' &&
      typeof metric.name === 'string' &&
      typeof metric.type === 'string'
    ))
    : []

  return { primaryMetricIds, detailedMetricOrder, customMetrics }
}

const fmtCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

const fmtNumber = (value: number): string => value.toLocaleString('pt-BR')

const fmtPercent = (value: number): string => `${value.toFixed(1).replace('.', ',')}%`

const fmtRatio = (value: number): string => `${value.toFixed(1).replace('.', ',')}x`

/** Converte delta em null quando não há comparação (evita exibir 0%) */
function deltaOrNull(delta: number | null): number | null {
  if (delta === null || delta === 0) return null
  return delta
}

/** Monta um NorthStarKPI a partir da métrica do backend e formatação/tooltip */
function toNorthStarKPI(
  metric: BackendMetric,
  displayValue: string,
  tooltip: string
): NorthStarKPI {
  return {
    value: metric.value,
    delta: deltaOrNull(metric.delta),
    displayValue,
    tooltip
  }
}

/**
 * Mapeia a resposta flat do GET /dashboard/summary para DashboardV2Summary.
 *
 * @param raw - Resposta bruta do backend (métricas flat com value/delta)
 * @returns DashboardV2Summary com northStar (displayValue, tooltip) e insights vazios
 */
export function mapBackendSummaryToDashboardV2Summary(raw: BackendSummaryResponse): DashboardV2Summary {
  return {
    northStar: {
      revenue: toNorthStarKPI(
        raw.revenue,
        fmtCurrency(raw.revenue.value),
        'Receita total = Soma de todas as vendas realizadas no período'
      ),
      sales: toNorthStarKPI(
        raw.sales,
        fmtNumber(raw.sales.value),
        'Vendas = Total de negócios ganhos (status = won)'
      ),
      contacts: toNorthStarKPI(
        raw.contacts,
        fmtNumber(raw.contacts.value),
        'Contatos = Total de contatos criados no período'
      ),
      spend: toNorthStarKPI(
        raw.spend,
        fmtCurrency(raw.spend.value),
        'Gastos = Soma de investimento em anúncios (Meta + Google + TikTok)'
      ),
      roi: toNorthStarKPI(
        raw.roi,
        fmtRatio(raw.roi.value),
        'ROI = Receita / Gastos (quanto retorna para cada R$ 1 investido)'
      ),
      cac: toNorthStarKPI(
        raw.cac,
        fmtCurrency(raw.cac.value),
        'CAC = Gastos / Vendas (custo para adquirir cada cliente)'
      ),
      avgTicket: toNorthStarKPI(
        raw.avgTicket,
        fmtCurrency(raw.avgTicket.value),
        'Ticket médio = Receita / Vendas (valor médio por venda)'
      ),
      impressions: toNorthStarKPI(
        raw.impressions,
        fmtNumber(raw.impressions.value),
        'Impressões = Total de vezes que anúncios foram exibidos'
      ),
      clicks: toNorthStarKPI(
        raw.clicks,
        fmtNumber(raw.clicks.value),
        'Cliques = Total de cliques em anúncios'
      ),
      ctr: toNorthStarKPI(
        raw.ctr,
        fmtPercent(raw.ctr.value),
        'CTR = (Cliques / Impressões) × 100 (taxa de cliques)'
      ),
      cpc: toNorthStarKPI(
        raw.cpc,
        raw.clicks.value > 0 ? fmtCurrency(raw.cpc.value) : 'R$ 0,00',
        'CPC = Gastos / Cliques (custo por clique)'
      ),
      salesRate: toNorthStarKPI(
        raw.salesRate,
        fmtPercent(raw.salesRate.value),
        'Taxa de vendas = (Vendas / Contatos) × 100 (conversão final)'
      ),
      avgCycleDays: toNorthStarKPI(
        raw.avgCycleDays,
        `${raw.avgCycleDays.value.toFixed(1).replace('.', ',')} dias`,
        'Ciclo médio = Tempo médio entre contato e venda'
      ),
      activeCustomers: toNorthStarKPI(
        raw.activeCustomers,
        fmtNumber(raw.activeCustomers.value),
        'Clientes ativos = Total de clientes com atividade no período'
      ),
      goalPercentage: {
        ...toNorthStarKPI(
          raw.goalPercentage,
          fmtPercent(raw.goalPercentage.value),
          '% Meta atingida = (Receita atual / Meta do período) × 100'
        ),
        value: raw.goalPercentage.value / 100
      }
    },
    insights: [],
    northStarConfig: normalizeNorthStarConfig(raw.northStarConfig),
    customMetrics: Array.isArray(raw.customMetrics) ? raw.customMetrics : []
  }
}

// ============================================================================
// TIME SERIES
// ============================================================================

/** Ponto diário retornado pelo GET /dashboard/time-series */
export interface BackendTimeSeriesDay {
  date: string
  contacts: number
  sales: number
  revenue: number
}

/**
 * Mapeia a resposta do GET /dashboard/time-series para TimeSeriesPoint[].
 * value = contacts, compareValue = sales ( TimelineChart exibe ambas as séries).
 *
 * @param raw - Array de { date, contacts, sales, revenue } do backend
 * @returns TimeSeriesPoint[] com date, value (contacts) e compareValue (sales)
 */
export function mapBackendTimeSeriesToTimeSeriesPoints(
  raw: BackendTimeSeriesDay[]
): TimeSeriesPoint[] {
  return raw.map((day) => ({
    date: day.date,
    value: day.contacts,
    compareValue: day.sales
  }))
}

// ============================================================================
// ORIGIN PERFORMANCE (Etapa 3)
// ============================================================================

/** Linha retornada pelo GET /dashboard/origin-performance (contrato do backend) */
export interface BackendOriginPerformanceRow {
  originId: string
  originName: string
  originType: string
  spend: number
  contacts: number
  sales: number
  revenue: number
  conversionRate: number
  cac: number
  roi: number
}

const ORIGIN_COLORS: Record<string, string> = {
  google_ads: '#4285f4',
  meta_ads: '#1877f2',
  tiktok_ads: '#000000',
  organic: '#10b981',
  direct: '#6b7280',
  referral: '#8b5cf6',
  whatsapp: '#25d366',
  custom: '#6366f1'
}

const DEFAULT_COLORS = [
  '#4F46E5',
  '#F97316',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#6B7280'
]

function colorForOrigin(originId: string, originType: string, index: number): string {
  const key = originId?.toLowerCase().replace(/\s+/g, '_') || originType?.toLowerCase() || ''
  return ORIGIN_COLORS[key] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length] ?? '#6366f1'
}

/**
 * Mapeia a resposta do GET /dashboard/origin-performance para OriginPerformance[].
 *
 * @param raw - Array de linhas do backend (originId, originName, spend, contacts, sales, etc.)
 * @returns OriginPerformance[] com id, origin, name, color, costPerSale, costPerContact
 */
export function mapBackendOriginPerformanceToOriginPerformance(
  raw: BackendOriginPerformanceRow[]
): OriginPerformance[] {
  return raw.map((row, index) => {
    const costPerSale = row.sales > 0 ? row.spend / row.sales : 0
    const costPerContact = row.contacts > 0 ? row.spend / row.contacts : row.cac
    return {
      id: row.originId,
      origin: row.originId,
      name: row.originName,
      color: colorForOrigin(row.originId, row.originType, index),
      spent: row.spend,
      investment: row.spend,
      contacts: row.contacts,
      sales: row.sales,
      revenue: row.revenue,
      conversionRate: row.conversionRate,
      roi: row.spend > 0 ? row.roi : null,
      costPerSale,
      costPerContact
    }
  })
}

// ============================================================================
// FUNNEL STATS (Etapa 4)
// ============================================================================

/** Estágio retornado pelo GET /dashboard/funnel-stats (contrato do backend) */
export interface BackendFunnelStage {
  stageId: string
  stageName: string
  displayOrder: number
  count: number
  conversionRate: number
  avgDays: number
}

/** Resposta do GET /dashboard/funnel-stats */
export interface BackendFunnelStatsResponse {
  stages: BackendFunnelStage[]
  totalContacts: number
  overallConversionRate: number
}

/**
 * Mapeia a resposta do GET /dashboard/funnel-stats para FunnelStageStats[].
 * avgDays → avgTimeInStage.
 *
 * @param raw - Resposta do backend (stages, totalContacts, overallConversionRate)
 * @returns stages mapeados para FunnelStageStats[]
 */
export function mapBackendFunnelStatsToFunnelStageStats(
  raw: BackendFunnelStatsResponse
): FunnelStageStats[] {
  return (raw.stages ?? []).map((stage) => ({
    stageId: stage.stageId,
    stageName: stage.stageName,
    count: stage.count,
    conversionRate: stage.conversionRate,
    avgTimeInStage: stage.avgDays
  }))
}

// ============================================================================
// PIPELINE STATS (Etapa 5)
// ============================================================================

/** Estágio retornado pelo GET /dashboard/pipeline-stats (contrato do backend) */
export interface BackendPipelineStage {
  stageId: string
  stageName: string
  displayOrder: number
  dealsCount: number
  totalValue: number
  avgValue: number
  avgDays: number
}

/** Resposta do GET /dashboard/pipeline-stats */
export interface BackendPipelineStatsResponse {
  stages: BackendPipelineStage[]
  totalDeals: number
  totalValue: number
}

/**
 * Mapeia a resposta do GET /dashboard/pipeline-stats para PipelineStageStats[].
 * dealsCount → count, totalValue → value, avgDays → avgTime.
 *
 * @param raw - Resposta do backend (stages, totalDeals, totalValue)
 * @returns PipelineStageStats[] para o painel de pipeline
 */
export function mapBackendPipelineStatsToPipelineStageStats(
  raw: BackendPipelineStatsResponse
): PipelineStageStats[] {
  return (raw.stages ?? []).map((stage) => ({
    stageId: stage.stageId,
    stageName: stage.stageName,
    count: stage.dealsCount,
    value: stage.totalValue,
    avgTime: stage.avgDays,
    conversionRate: undefined
  }))
}

// ============================================================================
// DRILL-DOWN (Etapa 5.5)
// ============================================================================

/** Resposta do GET /dashboard/drill-down (backend retorna { data, meta }) */
export interface BackendDrillDownResponse {
  data: BackendDrillDownRow[]
  meta: { total: number; limit: number; offset: number; hasMore: boolean }
}

/** Linha bruta: contact ou sale (Supabase) */
export type BackendDrillDownRow = BackendDrillDownContact | BackendDrillDownSale

interface BackendDrillDownContact {
  id: string
  name: string | null
  phone?: string | null
  email?: string | null
  current_stage_id?: string | null
  main_origin_id?: string | null
  created_at: string
  origins?: { name?: string | null } | null
  stages?: { name?: string | null } | null
}

interface BackendDrillDownSale {
  id: string
  value?: number | null
  date?: string | null
  contact_id?: string | null
  contacts?: {
    name?: string | null
    origins?: { name?: string | null } | null
    stages?: { name?: string | null } | null
  } | null
  origins?: { name?: string | null } | null
}

function getStageName(row: BackendDrillDownRow): string {
  if ('stages' in row && row.stages) {
    const s = row.stages
    return (Array.isArray(s) ? s[0]?.name : (s as { name?: string }).name) ?? '—'
  }
  if ('contacts' in row && row.contacts?.stages) {
    const s = row.contacts.stages
    return (Array.isArray(s) ? s[0]?.name : (s as { name?: string }).name) ?? '—'
  }
  return '—'
}

function getOriginName(row: BackendDrillDownRow): string {
  if ('origins' in row && row.origins) {
    const o = row.origins
    return (Array.isArray(o) ? o[0]?.name : (o as { name?: string }).name) ?? '—'
  }
  if ('main_origin_id' in row && row.origins) {
    const o = row.origins
    return (Array.isArray(o) ? o[0]?.name : (o as { name?: string }).name) ?? '—'
  }
  if ('contacts' in row && row.contacts?.origins) {
    const o = row.contacts.origins
    return (Array.isArray(o) ? o[0]?.name : (o as { name?: string }).name) ?? '—'
  }
  return '—'
}

/**
 * Mapeia resposta do GET /dashboard/drill-down para DrillDownEntity[].
 */
export function mapBackendDrillDownToEntities(rows: BackendDrillDownRow[]): DrillDownEntity[] {
  return (rows ?? []).map((row) => {
    const isSale = 'value' in row && 'contacts' in row
    const createdAt = 'created_at' in row ? (row as BackendDrillDownContact).created_at : (row as BackendDrillDownSale).date ?? ''
    const name = isSale
      ? ((row as BackendDrillDownSale).contacts?.name ?? `Venda ${row.id.slice(0, 8)}`)
      : ((row as BackendDrillDownContact).name ?? 'Sem nome')
    return {
      id: row.id,
      type: isSale ? 'sale' : 'contact',
      name,
      stage: getStageName(row),
      origin: getOriginName(row),
      value: isSale ? (row.value ?? undefined) : undefined,
      createdAt
    }
  })
}
