/**
 * Handler para North Star KPIs do dashboard (GET /dashboard/summary)
 *
 * Query params: period (ex: 7d, 30d, 90d); opcionalmente start_date e end_date (YYYY-MM-DD).
 * Se start_date e end_date forem fornecidos, o resumo usa esse intervalo; caso contrário, usa period (últimos N dias).
 * Retorna 400 se start_date/end_date forem inválidos (formato ou start > end).
 *
 * Retorna 14 métricas principais (KPIs) com deltas comparando período atual vs anterior:
 * - Métricas de Receita: revenue, sales, avgTicket
 * - Métricas de Investimento: spend, roi, cac
 * - Métricas de Tráfego: impressions, clicks, ctr, cpc
 * - Métricas de Conversão: salesRate, avgCycleDays, activeCustomers, goalPercentage
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getDashboardCache, setDashboardCache } from '../utils/cache.ts'
import { getDateRangeFromRequest, toEndOfDay } from '../utils/dateRange.ts'
import { getAdMetricsForDashboard, getAdMetricsPerPlatform } from '../services/ad-metrics.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface SummaryMetrics {
  revenue: {
    value: number
    delta: number | null
  }
  sales: {
    value: number
    delta: number | null
  }
  contacts: {
    value: number
    delta: number | null
  }
  spend: {
    value: number
    delta: number | null
  }
  roi: {
    value: number
    delta: number | null
  }
  cac: {
    value: number
    delta: number | null
  }
  avgTicket: {
    value: number
    delta: number | null
  }
  impressions: {
    value: number
    delta: number | null
  }
  clicks: {
    value: number
    delta: number | null
  }
  ctr: {
    value: number
    delta: number | null
  }
  cpc: {
    value: number
    delta: number | null
  }
  salesRate: {
    value: number
    delta: number | null
  }
  avgCycleDays: {
    value: number
    delta: number | null
  }
  activeCustomers: {
    value: number
    delta: number | null
  }
  goalPercentage: {
    value: number
    delta: number | null
  }
}

const BASE_METRIC_IDS = [
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
  'activeCustomers',
]

const DEFAULT_PRIMARY_METRIC_IDS = ['spend', 'revenue', 'sales', 'salesRate']
const CUSTOM_METRIC_TYPES = ['stage_count', 'sum_stages', 'divide_stages', 'cost_per_stage'] as const
type CustomMetricType = (typeof CUSTOM_METRIC_TYPES)[number]

interface NorthStarCustomMetricDefinition {
  id: string
  name: string
  type: CustomMetricType
  stageId?: string
  stageIds?: string[]
  numeratorStageIds?: string[]
  denominatorStageIds?: string[]
}

interface NorthStarConfigResponse {
  primaryMetricIds: string[]
  detailedMetricOrder: string[]
  customMetrics: NorthStarCustomMetricDefinition[]
}

interface CustomMetricValue {
  id: string
  name: string
  type: CustomMetricType
  value: number
  delta: number | null
  format: 'number' | 'percent' | 'currency'
}

interface SummaryResponse extends SummaryMetrics {
  northStarConfig: NorthStarConfigResponse
  customMetrics: CustomMetricValue[]
}

function uniqueStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return []
  const out: string[] = []
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (!trimmed || out.includes(trimmed)) continue
    out.push(trimmed)
  }
  return out
}

function normalizeCustomMetricDefinition(
  raw: Record<string, unknown>
): NorthStarCustomMetricDefinition | null {
  const type = typeof raw.type === 'string' ? raw.type : ''
  if (!CUSTOM_METRIC_TYPES.includes(type as CustomMetricType)) return null

  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const id = typeof raw.id === 'string' ? raw.id.trim() : ''
  if (!name || !id) return null

  const metric: NorthStarCustomMetricDefinition = {
    id,
    name,
    type: type as CustomMetricType,
  }

  const stageId = typeof raw.stageId === 'string' ? raw.stageId.trim() : ''
  const stageIds = uniqueStringArray(raw.stageIds)
  const numeratorStageIds = uniqueStringArray(raw.numeratorStageIds)
  const denominatorStageIds = uniqueStringArray(raw.denominatorStageIds)

  if (metric.type === 'stage_count' || metric.type === 'cost_per_stage') {
    if (!stageId) return null
    metric.stageId = stageId
    return metric
  }

  if (metric.type === 'sum_stages') {
    if (stageIds.length === 0) return null
    metric.stageIds = stageIds
    return metric
  }

  if (numeratorStageIds.length === 0 || denominatorStageIds.length === 0) return null
  metric.numeratorStageIds = numeratorStageIds
  metric.denominatorStageIds = denominatorStageIds
  return metric
}

async function getNorthStarConfig(
  supabaseClient: SupabaseDbClient,
  projectId: string
): Promise<NorthStarConfigResponse> {
  const { data, error } = await supabaseClient
    .from('project_dashboard_north_star_config')
    .select('primary_metric_ids, detailed_metric_order, custom_metrics')
    .eq('project_id', projectId)
    .maybeSingle()

  if (error) {
    console.error('[Summary] Error fetching north star config:', error)
  }

  const customMetrics = Array.isArray(data?.custom_metrics)
    ? data.custom_metrics
      .map((item) => (item && typeof item === 'object'
        ? normalizeCustomMetricDefinition(item as Record<string, unknown>)
        : null))
      .filter((item): item is NorthStarCustomMetricDefinition => item !== null)
    : []

  const customIds = customMetrics.map((metric) => metric.id)
  const allowed = new Set([...BASE_METRIC_IDS, ...customIds])

  const primaryMetricIds = uniqueStringArray(data?.primary_metric_ids)
    .filter((id) => allowed.has(id))
    .slice(0, 4)
  const detailedMetricOrder = uniqueStringArray(data?.detailed_metric_order).filter((id) => allowed.has(id))

  const fullOrder = detailedMetricOrder.length > 0 ? [...detailedMetricOrder] : [...BASE_METRIC_IDS, ...customIds]
  for (const id of [...BASE_METRIC_IDS, ...customIds]) {
    if (!fullOrder.includes(id)) fullOrder.push(id)
  }

  return {
    primaryMetricIds: primaryMetricIds.length > 0 ? primaryMetricIds : [...DEFAULT_PRIMARY_METRIC_IDS],
    detailedMetricOrder: fullOrder,
    customMetrics,
  }
}

function collectCustomMetricStageIds(metrics: NorthStarCustomMetricDefinition[]): string[] {
  const ids = new Set<string>()
  for (const metric of metrics) {
    if (metric.stageId) ids.add(metric.stageId)
    for (const id of metric.stageIds ?? []) ids.add(id)
    for (const id of metric.numeratorStageIds ?? []) ids.add(id)
    for (const id of metric.denominatorStageIds ?? []) ids.add(id)
  }
  return Array.from(ids)
}

type StageReachMap = Map<string, Set<string>>

function emptyStageReachMap(): StageReachMap {
  return new Map<string, Set<string>>()
}

async function buildStageReachMap(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  stageIds: string[],
  startDate: Date,
  endDate: Date,
  originId: string | null = null
): Promise<StageReachMap> {
  if (stageIds.length === 0) return emptyStageReachMap()

  const filterByOrigin = originId && originId !== 'all'

  let query = supabaseClient
    .from('contact_stage_history')
    .select(`
      contact_id,
      stage_id,
      contacts!inner(project_id, main_origin_id)
    `)
    .eq('contacts.project_id', projectId)
    .in('stage_id', stageIds)
    .gte('moved_at', startDate.toISOString())
    .lte('moved_at', endDate.toISOString())

  if (filterByOrigin) {
    query = query.eq('contacts.main_origin_id', originId!)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Summary] Error fetching stage history for custom metrics:', error)
    return emptyStageReachMap()
  }

  const stageMap: StageReachMap = new Map()
  for (const row of (data ?? []) as Array<{ contact_id?: string | null; stage_id?: string | null }>) {
    const stageId = typeof row.stage_id === 'string' ? row.stage_id : null
    const contactId = typeof row.contact_id === 'string' ? row.contact_id : null
    if (!stageId || !contactId) continue
    if (!stageMap.has(stageId)) stageMap.set(stageId, new Set<string>())
    stageMap.get(stageId)?.add(contactId)
  }
  return stageMap
}

function countReachedUnion(stageMap: StageReachMap, stageIds: string[]): number {
  if (stageIds.length === 0) return 0
  const uniqueContacts = new Set<string>()
  for (const stageId of stageIds) {
    const contacts = stageMap.get(stageId)
    if (!contacts) continue
    for (const contactId of contacts) uniqueContacts.add(contactId)
  }
  return uniqueContacts.size
}

function countReachedSummed(stageMap: StageReachMap, stageIds: string[]): number {
  if (stageIds.length === 0) return 0
  let total = 0
  for (const stageId of stageIds) {
    total += stageMap.get(stageId)?.size ?? 0
  }
  return total
}

/**
 * Calcula métricas do período atual (intervalo [startDate, endDate]).
 */
async function calculateCurrentPeriod(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  startDate: Date,
  endDate: Date,
  originId: string | null = null
): Promise<{
  revenue: number
  sales: number
  contacts: number
  avgCycleDays: number
}> {
  const startISO = startDate.toISOString()
  const endISO = endDate.toISOString()
  const filterByOrigin = originId && originId !== 'all'

  // When filtering by origin, pre-fetch contact IDs for that origin
  // so we can filter sales at DB level instead of in memory
  let originContactIds: string[] | null = null
  if (filterByOrigin) {
    const { data: originContacts } = await supabaseClient
      .from('contacts')
      .select('id')
      .eq('project_id', projectId)
      .eq('main_origin_id', originId!)
    originContactIds = (originContacts ?? []).map(c => c.id)
  }

  // Revenue/Sales + Contacts + Cycle data — fetch in parallel
  const salesQueryBuilder = supabaseClient
    .from('sales')
    .select('value, date, origin_id, contact_id')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .gte('date', startISO)
    .lte('date', endISO)

  // Apply origin filter at DB level when possible
  if (filterByOrigin && originContactIds) {
    salesQueryBuilder.or(`origin_id.eq.${originId},contact_id.in.(${originContactIds.join(',')})`)
  }

  let contactsQueryBuilder = supabaseClient
    .from('contacts')
    .select('id, created_at')
    .eq('project_id', projectId)
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  if (filterByOrigin) {
    contactsQueryBuilder = contactsQueryBuilder.eq('main_origin_id', originId!)
  }

  const cycleQueryBuilder = supabaseClient
    .from('sales')
    .select(`
      id,
      date,
      contact_id,
      origin_id,
      contacts!inner(created_at, main_origin_id)
    `)
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .gte('date', startISO)
    .lte('date', endISO)

  if (filterByOrigin && originContactIds) {
    cycleQueryBuilder.or(`origin_id.eq.${originId},contact_id.in.(${originContactIds.join(',')})`)
  }

  // Execute all 3 queries in parallel
  const [salesResult, contactsResult, cycleResult] = await Promise.all([
    salesQueryBuilder,
    contactsQueryBuilder,
    cycleQueryBuilder,
  ])

  if (salesResult.error) {
    console.error('[Summary] Error fetching sales:', salesResult.error)
    throw salesResult.error
  }

  if (contactsResult.error) {
    console.error('[Summary] Error fetching contacts:', contactsResult.error)
    throw contactsResult.error
  }

  const filteredSales = salesResult.data ?? []
  const revenue = filteredSales.reduce((sum, sale) => sum + Number(sale.value || 0), 0)
  const sales = filteredSales.length
  const avgTicket = sales > 0 ? revenue / sales : 0

  const contacts = contactsResult.data?.length || 0

  // Cycle days calculation
  if (cycleResult.error) {
    console.error('[Summary] Error calculating cycle days:', cycleResult.error)
  }

  let totalCycleDays = 0
  let cycleCount = 0

  if (cycleResult.data) {
    for (const sale of cycleResult.data) {
      const contact = Array.isArray(sale.contacts) ? sale.contacts[0] : sale.contacts

      if (contact?.created_at && sale.date) {
        const contactDate = new Date(contact.created_at)
        const saleDate = new Date(sale.date)
        const days = Math.max(0, (saleDate.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24))
        totalCycleDays += days
        cycleCount++
      }
    }
  }

  const avgCycleDays = cycleCount > 0 ? totalCycleDays / cycleCount : 0

  return {
    revenue,
    sales,
    contacts,
    avgCycleDays
  }
}

/**
 * Calcula métricas do período anterior (para delta), dado intervalo [periodStart, periodEnd].
 */
async function calculatePreviousPeriod(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  periodStart: Date,
  periodEnd: Date,
  originId: string | null = null
): Promise<{
  revenue: number
  sales: number
  contacts: number
}> {
  const startISO = periodStart.toISOString()
  const endISO = periodEnd.toISOString()
  const filterByOrigin = originId && originId !== 'all'

  const { data: salesData, error: salesError } = await supabaseClient
    .from('sales')
    .select('value, origin_id, contact_id, contacts(main_origin_id)')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .gte('date', startISO)
    .lte('date', endISO)

  if (salesError) {
    console.error('[Summary] Error fetching previous period sales:', salesError)
  }

  const filteredSales = filterByOrigin
    ? (salesData ?? []).filter((sale) => {
        const contact = Array.isArray(sale.contacts) ? sale.contacts[0] : sale.contacts
        const saleOriginId = contact?.main_origin_id || sale.origin_id
        return saleOriginId === originId
      })
    : (salesData ?? [])

  const revenue = filteredSales.reduce((sum, sale) => sum + Number(sale.value || 0), 0)
  const sales = filteredSales.length

  let contactsQuery = supabaseClient
    .from('contacts')
    .select('id')
    .eq('project_id', projectId)
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  if (filterByOrigin) {
    contactsQuery = contactsQuery.eq('main_origin_id', originId!)
  }

  const { data: contactsData, error: contactsError } = await contactsQuery

  if (contactsError) {
    console.error('[Summary] Error fetching previous period contacts:', contactsError)
  }

  const contacts = contactsData?.length || 0

  return {
    revenue,
    sales,
    contacts
  }
}

/**
 * Calcula delta percentual entre valores atual e anterior.
 * Retorna null quando não há dados no período anterior (previous === 0).
 */
function calculateDelta(current: number, previous: number): number | null {
  if (previous === 0) {
    return null
  }
  return ((current - previous) / previous) * 100
}

async function calculateCustomMetrics(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  config: NorthStarConfigResponse,
  currentRange: { start: Date; end: Date },
  previousRange: { start: Date; end: Date },
  compareEnabled: boolean,
  spendCurrent: number,
  spendPrevious: number,
  originId: string | null = null
): Promise<CustomMetricValue[]> {
  const metrics = config.customMetrics ?? []
  if (metrics.length === 0) return []

  const stageIds = collectCustomMetricStageIds(metrics)
  const [currentStageMap, previousStageMap] = await Promise.all([
    buildStageReachMap(supabaseClient, projectId, stageIds, currentRange.start, currentRange.end, originId),
    compareEnabled
      ? buildStageReachMap(supabaseClient, projectId, stageIds, previousRange.start, previousRange.end, originId)
      : Promise.resolve(emptyStageReachMap()),
  ])

  const deltaFn = compareEnabled ? calculateDelta : () => null as number | null

  return metrics.map((metric): CustomMetricValue => {
    if (metric.type === 'stage_count') {
      const current = countReachedUnion(currentStageMap, metric.stageId ? [metric.stageId] : [])
      const previous = countReachedUnion(previousStageMap, metric.stageId ? [metric.stageId] : [])
      return {
        id: metric.id,
        name: metric.name,
        type: metric.type,
        value: current,
        delta: deltaFn(current, previous),
        format: 'number',
      }
    }

    if (metric.type === 'sum_stages') {
      const current = countReachedSummed(currentStageMap, metric.stageIds ?? [])
      const previous = countReachedSummed(previousStageMap, metric.stageIds ?? [])
      return {
        id: metric.id,
        name: metric.name,
        type: metric.type,
        value: current,
        delta: deltaFn(current, previous),
        format: 'number',
      }
    }

    if (metric.type === 'divide_stages') {
      const currentNumerator = countReachedUnion(currentStageMap, metric.numeratorStageIds ?? [])
      const currentDenominator = countReachedUnion(currentStageMap, metric.denominatorStageIds ?? [])
      const currentValue = currentDenominator > 0 ? (currentNumerator / currentDenominator) * 100 : 0

      const previousNumerator = countReachedUnion(previousStageMap, metric.numeratorStageIds ?? [])
      const previousDenominator = countReachedUnion(previousStageMap, metric.denominatorStageIds ?? [])
      const previousValue = previousDenominator > 0 ? (previousNumerator / previousDenominator) * 100 : 0

      return {
        id: metric.id,
        name: metric.name,
        type: metric.type,
        value: currentValue,
        delta: deltaFn(currentValue, previousValue),
        format: 'percent',
      }
    }

    const currentCount = countReachedUnion(currentStageMap, metric.stageId ? [metric.stageId] : [])
    const previousCount = countReachedUnion(previousStageMap, metric.stageId ? [metric.stageId] : [])
    const currentValue = currentCount > 0 ? spendCurrent / currentCount : 0
    const previousValue = previousCount > 0 ? spendPrevious / previousCount : 0
    return {
      id: metric.id,
      name: metric.name,
      type: metric.type,
      value: currentValue,
      delta: deltaFn(currentValue, previousValue),
      format: 'currency',
    }
  })
}

export async function handleSummary(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    const url = new URL(req.url)
    const periodParam = url.searchParams.get('period') || '30d'

    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const dateRangeResult = getDateRangeFromRequest(url, periodParam)
    if (!dateRangeResult.ok) {
      return errorResponse(dateRangeResult.message, 400)
    }
    const { start, end } = dateRangeResult

    const durationMs = end.getTime() - start.getTime()
    const prevEndDay = new Date(start)
    prevEndDay.setDate(prevEndDay.getDate() - 1)
    const previousEnd = toEndOfDay(prevEndDay)
    const previousStart = new Date(previousEnd.getTime() - durationMs)

    const compareEnabled = url.searchParams.get('compare') === 'true'
    const originId = url.searchParams.get('origin') || null

    const cacheParams: Record<string, string> = { period: periodParam }
    const startDateParam = url.searchParams.get('start_date')
    const endDateParam = url.searchParams.get('end_date')
    if (startDateParam && endDateParam) {
      cacheParams.start_date = startDateParam
      cacheParams.end_date = endDateParam
    }
    if (compareEnabled) cacheParams.compare = 'true'
    if (originId && originId !== 'all') cacheParams.origin = originId

    const cachedData = await getDashboardCache(
      supabaseClient,
      projectId,
      'summary',
      cacheParams
    ) as SummaryResponse | null

    if (cachedData && typeof cachedData.contacts?.value === 'number') {
      console.log('[Dashboard Summary] Cache hit', { projectId, period: periodParam, contacts: cachedData.contacts.value })
      return successResponse(cachedData, 200)
    }
    if (cachedData) {
      console.log('[Dashboard Summary] Cache miss (payload antigo sem contacts), recalculando...', { projectId, period: periodParam })
    }

    console.log('[Dashboard Summary] Cache miss, calculating...', { projectId, period: periodParam })

    // Paralelizar: current period + previous period + north star config (independentes)
    const [current, previous, northStarConfig] = await Promise.all([
      calculateCurrentPeriod(supabaseClient, projectId, start, end, originId),
      compareEnabled
        ? calculatePreviousPeriod(supabaseClient, projectId, previousStart, previousEnd, originId)
        : Promise.resolve({ revenue: 0, sales: 0, contacts: 0, avgCycleDays: 0 }),
      getNorthStarConfig(supabaseClient, projectId),
    ])

    // Cálculo de métricas derivadas
    const avgTicket = current.sales > 0 ? current.revenue / current.sales : 0
    const avgTicketPrevious = previous.sales > 0 ? previous.revenue / previous.sales : 0

    // Sales Rate (taxa de conversão de contatos em vendas)
    const salesRate = current.contacts > 0 ? (current.sales / current.contacts) * 100 : 0
    const salesRatePrevious = previous.contacts > 0 ? (previous.sales / previous.contacts) * 100 : 0

    // Iniciar activeCustomers query em paralelo (será await'ada depois)
    const activeCustomersPromise = supabaseClient
      .from('sales')
      .select('contact_id, origin_id, contacts(main_origin_id)', { count: 'exact', head: false })
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())

    // Buscar metricas de ads em paralelo com activeCustomers
    let adMetrics = { spend: 0, impressions: 0, clicks: 0 }
    let previousAdMetrics = { spend: 0, impressions: 0, clicks: 0 }

    if (originId && originId !== 'all') {
      const { data: originData, error: originError } = await supabaseClient
        .from('origins')
        .select('name')
        .eq('id', originId)
        .or(`project_id.is.null,project_id.eq.${projectId}`)
        .maybeSingle()

      if (originError) {
        console.error('[Summary] Error fetching origin name:', originError)
      }

      const originName = originData?.name || ''

      console.log('[Summary] Origin filter for ad metrics:', {
        originId,
        originName: originName || '(empty - origin not found)',
        startISO: start.toISOString(),
        endISO: end.toISOString()
      })

      if (originName) {
        try {
          // Paralelizar current + previous ad metrics por plataforma
          const [adMetricsByPlatform, prevAdMetricsByPlatform] = await Promise.all([
            getAdMetricsPerPlatform(supabaseClient, projectId, start, end),
            compareEnabled
              ? getAdMetricsPerPlatform(supabaseClient, projectId, previousStart, previousEnd)
              : Promise.resolve({} as Record<string, { spend: number; impressions: number; clicks: number }>),
          ])

          console.log('[Summary] Ad metrics by platform:', JSON.stringify(
            Object.fromEntries(
              Object.entries(adMetricsByPlatform).map(([k, v]) => [k, { spend: v.spend, impressions: v.impressions, clicks: v.clicks }])
            )
          ))

          adMetrics = adMetricsByPlatform[originName] || { spend: 0, impressions: 0, clicks: 0 }
          previousAdMetrics = prevAdMetricsByPlatform[originName] || { spend: 0, impressions: 0, clicks: 0 }
        } catch (adError) {
          console.error('[Summary] Error in getAdMetricsPerPlatform, falling back to aggregated:', adError)
          const [currentAd, prevAd] = await Promise.all([
            getAdMetricsForDashboard(supabaseClient, projectId, start, end),
            compareEnabled
              ? getAdMetricsForDashboard(supabaseClient, projectId, previousStart, previousEnd)
              : Promise.resolve({ spend: 0, impressions: 0, clicks: 0 }),
          ])
          adMetrics = currentAd
          previousAdMetrics = prevAd
        }
      } else {
        console.warn('[Summary] Origin name not found for ID:', originId, '— using aggregated ad metrics')
        const [currentAd, prevAd] = await Promise.all([
          getAdMetricsForDashboard(supabaseClient, projectId, start, end),
          compareEnabled
            ? getAdMetricsForDashboard(supabaseClient, projectId, previousStart, previousEnd)
            : Promise.resolve({ spend: 0, impressions: 0, clicks: 0 }),
        ])
        adMetrics = currentAd
        previousAdMetrics = prevAd
      }
    } else {
      const [currentAd, prevAd] = await Promise.all([
        getAdMetricsForDashboard(supabaseClient, projectId, start, end),
        compareEnabled
          ? getAdMetricsForDashboard(supabaseClient, projectId, previousStart, previousEnd)
          : Promise.resolve({ spend: 0, impressions: 0, clicks: 0 }),
      ])
      adMetrics = currentAd
      previousAdMetrics = prevAd
    }

    // Aguardar activeCustomers (já estava rodando em paralelo)
    const { data: activeCustomersData, error: activeCustomersError } = await activeCustomersPromise

    if (activeCustomersError) {
      console.error('[Summary] Error fetching active customers:', activeCustomersError)
    }

    const filterByOrigin = originId && originId !== 'all'
    const filteredActiveCustomers = filterByOrigin
      ? (activeCustomersData ?? []).filter((sale) => {
          const contact = Array.isArray(sale.contacts) ? sale.contacts[0] : sale.contacts
          const saleOriginId = contact?.main_origin_id || sale.origin_id
          return saleOriginId === originId
        })
      : (activeCustomersData ?? [])
    const activeCustomers = filteredActiveCustomers.length

    const { spend, impressions, clicks } = adMetrics

    // Metricas derivadas de ads
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spend / clicks : 0
    const cac = current.sales > 0 ? spend / current.sales : 0
    const roi = spend > 0 ? current.revenue / spend : 0

    // Metricas derivadas de ads do período anterior
    const previousCtr = previousAdMetrics.impressions > 0
      ? (previousAdMetrics.clicks / previousAdMetrics.impressions) * 100 : 0
    const previousCpc = previousAdMetrics.clicks > 0
      ? previousAdMetrics.spend / previousAdMetrics.clicks : 0
    const previousCac = previous.sales > 0
      ? previousAdMetrics.spend / previous.sales : 0
    const previousRoi = previousAdMetrics.spend > 0
      ? previous.revenue / previousAdMetrics.spend : 0

    // Goal Percentage (assumir meta de 100% = 1000 vendas ou 100k de receita)
    // TODO: Implementar sistema de metas por projeto
    const goalValue = 100000 // Meta padrão: R$ 100k
    const goalPercentage = (current.revenue / goalValue) * 100

    // Montar resposta com deltas (null quando compare desabilitado)
    const delta = compareEnabled ? calculateDelta : () => null as number | null
    const summaryBase: SummaryMetrics = {
      revenue: {
        value: current.revenue,
        delta: delta(current.revenue, previous.revenue)
      },
      sales: {
        value: current.sales,
        delta: delta(current.sales, previous.sales)
      },
      contacts: {
        value: current.contacts,
        delta: delta(current.contacts, previous.contacts)
      },
      spend: {
        value: spend,
        delta: delta(spend, previousAdMetrics.spend)
      },
      roi: {
        value: roi,
        delta: delta(roi, previousRoi)
      },
      cac: {
        value: cac,
        delta: delta(cac, previousCac)
      },
      avgTicket: {
        value: avgTicket,
        delta: delta(avgTicket, avgTicketPrevious)
      },
      impressions: {
        value: impressions,
        delta: delta(impressions, previousAdMetrics.impressions)
      },
      clicks: {
        value: clicks,
        delta: delta(clicks, previousAdMetrics.clicks)
      },
      ctr: {
        value: ctr,
        delta: delta(ctr, previousCtr)
      },
      cpc: {
        value: cpc,
        delta: delta(cpc, previousCpc)
      },
      salesRate: {
        value: salesRate,
        delta: delta(salesRate, salesRatePrevious)
      },
      avgCycleDays: {
        value: current.avgCycleDays,
        delta: null // Não calculamos para período anterior (muito custoso)
      },
      activeCustomers: {
        value: activeCustomers,
        delta: null
      },
      goalPercentage: {
        value: goalPercentage,
        delta: null
      }
    }

    // northStarConfig já foi buscado em paralelo acima
    const customMetrics = await calculateCustomMetrics(
      supabaseClient,
      projectId,
      northStarConfig,
      { start, end },
      { start: previousStart, end: previousEnd },
      compareEnabled,
      spend,
      previousAdMetrics.spend,
      originId
    )

    const summary: SummaryResponse = {
      ...summaryBase,
      northStarConfig,
      customMetrics,
    }

    console.log('[Dashboard Summary]', {
      projectId,
      period: periodParam,
      metrics: {
        revenue: summary.revenue.value,
        sales: summary.sales.value,
        contacts: summary.contacts.value,
        customMetrics: summary.customMetrics.length
      }
    })

    // Salvar no cache (TTL: 5 minutos)
    await setDashboardCache(
      supabaseClient,
      projectId,
      'summary',
      cacheParams,
      summary,
      5
    )

    return successResponse(summary, 200)
  } catch (error) {
    console.error('[Dashboard Summary Error]', error)
    return errorResponse('Failed to fetch summary metrics', 500)
  }
}
