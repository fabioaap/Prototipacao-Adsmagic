/**
 * Dashboard V2 Store
 *
 * Manages Dashboard V2 state including:
 * - Global filters (period, compare, origin, view mode)
 * - Filter persistence (localStorage)
 * - Dashboard summary data (north star KPIs, insights)
 * - Drill-down state
 *
 * @module stores/dashboardV2
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { dashboardV2Service } from '@/services/api/dashboardV2'
import { getI18n } from '@/i18n'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import { useSettingsStore } from '@/stores/settings'
import { resolveTimezone, toISODateInTimezone } from '@/utils/dateTimezone'
import type {
  DashboardV2Filters,
  DashboardV2Summary,
  NorthStarConfig,
  NorthStarCustomMetricValue,
  FunnelStageStats,
  PipelineStageStats,
  OriginBreakdown,
  TimeSeriesPoint,
  DrillDownEntity,
  OriginPerformance
} from '@/types'

// Local storage key for filter persistence
const FILTERS_STORAGE_KEY = 'adsmagic_dashboard_v2_filters'

/**
 * Map rejection reason to user-friendly message (Etapa 6)
 */
function getFriendlyMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message
  const obj = reason as { response?: { status?: number; data?: { message?: string } } } | null
  if (obj?.response) {
    const status = obj.response?.status
    const msg = obj.response?.data?.message
    if (status === 404) return 'Recurso não encontrado.'
    if (status === 401) return 'Sessão expirada. Faça login novamente.'
    if (status === 403) return 'Sem permissão para acessar estes dados.'
    if (typeof status === 'number' && status >= 500) return 'Erro no servidor. Tente novamente em instantes.'
    if (msg && typeof msg === 'string') return msg
  }
  return 'Erro ao carregar dados. Tente novamente.'
}

/**
 * Load filters from localStorage
 */
function loadFiltersFromStorage(): Partial<DashboardV2Filters> {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<DashboardV2Filters>

      // Normaliza valores antigos/salvos com labels em vez de slugs
      if ((parsed as any).origins === 'Todas Origens') {
        parsed.origin = null
      }
      if (parsed.origin === 'Todas Origens') {
        parsed.origin = null
      }
      return parsed
    }
  } catch (error) {
    console.warn('[Dashboard V2 Store] Failed to load filters from storage:', error)
  }
  return {}
}

/**
 * Save filters to localStorage
 */
function saveFiltersToStorage(filters: DashboardV2Filters): void {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.warn('[Dashboard V2 Store] Failed to save filters to storage:', error)
  }
}

export const useDashboardV2Store = defineStore('dashboardV2', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Global dashboard filters
   */
  const filters = ref<DashboardV2Filters>({
    period: '30d',
    compare: false,
    origin: null,
    viewMode: 'completo',
    ...loadFiltersFromStorage()
  })

  /**
   * Dashboard summary data
   */
  const summary = ref<DashboardV2Summary | null>(null)
  const northStarConfig = ref<NorthStarConfig | null>(null)
  const customMetrics = ref<NorthStarCustomMetricValue[]>([])

  /**
   * Funnel statistics (stages from GET /dashboard/funnel-stats)
   */
  const funnelStats = ref<FunnelStageStats[]>([])

  /**
   * Total contacts in funnel period (from funnel-stats response)
   */
  const funnelTotalContacts = ref<number>(0)

  /**
   * Overall conversion rate contatos → vendas (from funnel-stats response)
   */
  const funnelOverallConversionRate = ref<number>(0)

  /**
   * Pipeline statistics
   */
  const pipelineStats = ref<PipelineStageStats[]>([])

  /**
   * Origin breakdown data
   */
  const originBreakdown = ref<OriginBreakdown[]>([])

  /**
   * Comparison periods for multi-period analysis (G5.7)
   */
  interface ComparisonPeriodData {
    id: string
    label: string
    startDate: Date
    endDate: Date
    color: string
    summary: DashboardV2Summary | null
    isLoading: boolean
  }

  const comparisonPeriods = ref<ComparisonPeriodData[]>([])

  /**
   * Time series data for charts
   */
  const timeSeries = ref<TimeSeriesPoint[]>([])

  /**
   * Origins performance data (Origins Performance Table)
   */
  const originsPerformance = ref<OriginPerformance[]>([])

  /**
   * Loading state for origins performance
   */
  const originsPerformanceLoading = ref(false)

  /**
   * Drill-down drawer state
   */
  const drillDownDrawer = ref<{
    open: boolean
    type: 'funnel' | 'pipeline' | 'origin' | null
    title: string
    entities: DrillDownEntity[]
  }>({
    open: false,
    type: null,
    title: '',
    entities: []
  })

  /**
   * Loading state
   */
  const isLoading = ref(false)

  /**
   * Error state (summary / principal)
   */
  const error = ref<string | null>(null)

  /**
   * Per-block errors (Etapa 6: um erro não impede exibição dos outros blocos)
   */
  const timeSeriesError = ref<string | null>(null)
  const originsError = ref<string | null>(null)
  const funnelError = ref<string | null>(null)
  const pipelineError = ref<string | null>(null)
  const activeTimezone = ref<string>(resolveTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone))
  const settingsStore = useSettingsStore()

  // ========================================================================
  // WATCHERS
  // ========================================================================

  /**
   * Watch filters and persist to localStorage
   */
  watch(
    filters,
    (newFilters) => {
      saveFiltersToStorage(newFilters)
    },
    { deep: true }
  )

  // Obter ref reativo do projeto atual
  const { currentProjectId } = useCurrentProjectId()

  /**
   * Watch for project changes and reload data
   */
  watch(
    currentProjectId,
    (newProjectId, oldProjectId) => {
      if (newProjectId !== oldProjectId && newProjectId) {
        console.log('[Dashboard V2 Store] Project changed, reloading data:', newProjectId)
        // Clear existing data
        summary.value = null
        northStarConfig.value = null
        customMetrics.value = []
        funnelStats.value = []
        funnelTotalContacts.value = 0
        funnelOverallConversionRate.value = 0
        pipelineStats.value = []
        originBreakdown.value = []
        timeSeries.value = []
        error.value = null
        timeSeriesError.value = null
        originsError.value = null
        funnelError.value = null
        pipelineError.value = null

        // Reload with new project
        loadDashboardData()
      }
    }
  )

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Get formatted period label
   */
  const periodLabel = computed(() => {
    const { t } = getI18n()
    const labels: Record<string, string> = {
      'today': t('dashboard.period.today'),
      '7d': t('dashboard.period.last7Days'),
      '30d': t('dashboard.period.last30Days'),
      '90d': t('dashboard.period.last90Days'),
      'custom': t('dashboard.period.custom')
    }
    return labels[filters.value.period] || t('dashboard.period.custom')
  })

  /**
   * Check if data is available
   */
  const hasData = computed(() => {
    return summary.value !== null
  })

  /**
   * Get insights sorted by severity
   */
  const sortedInsights = computed(() => {
    if (!summary.value?.insights) return []

    const severityOrder = { crit: 0, warn: 1, info: 2 }
    return [...summary.value.insights].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    )
  })

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Update filter value
   */
  function updateFilter<K extends keyof DashboardV2Filters>(
    key: K,
    value: DashboardV2Filters[K]
  ): void {
    filters.value[key] = value

    // Reload data when filters change
    loadDashboardData()
  }

  /**
   * Toggle compare mode
   */
  function toggleCompare(): void {
    filters.value.compare = !filters.value.compare
    loadDashboardData()
  }

  /**
   * Change view mode
   */
  function setViewMode(mode: DashboardV2Filters['viewMode']): void {
    filters.value.viewMode = mode
  }

  /**
   * Reset filters to defaults
   */
  function resetFilters(): void {
    filters.value = {
      period: '30d',
      compare: false,
      origin: null,
      viewMode: 'completo'
    }
    loadDashboardData()
  }

  /**
   * Set custom date range in one shot and reload once.
   * Use when the user selects a range in the date picker to avoid multiple loads.
   */
  function setDateRange(
    startDate: string,
    endDate: string,
    period: DashboardV2Filters['period'] = 'custom'
  ): void {
    filters.value.startDate = startDate
    filters.value.endDate = endDate
    filters.value.period = period
    loadDashboardData()
  }

  /**
   * Load all dashboard data (summary + time series + origins + funnel + pipeline).
   * Chama todas as APIs em paralelo. Erro em uma requisição não impede as outras (Etapa 6).
   * Limpa dados no início para evitar flash de dados antigos.
   */
  async function loadDashboardData(timezone?: string): Promise<void> {
    const resolvedTimezone = await resolveActiveTimezone(timezone)
    activeTimezone.value = resolvedTimezone

    isLoading.value = true
    error.value = null
    timeSeriesError.value = null
    originsError.value = null
    funnelError.value = null
    pipelineError.value = null
    summary.value = null
    northStarConfig.value = null
    customMetrics.value = []
    timeSeries.value = []
    originsPerformance.value = []
    funnelStats.value = []
    funnelTotalContacts.value = 0
    funnelOverallConversionRate.value = 0
    pipelineStats.value = []

    const { startDate, endDate } = resolveDateRange(filters.value, resolvedTimezone)
    const requestFilters = { ...filters.value, startDate, endDate }

    const [summaryResult, timeSeriesResult, originsResult, funnelResult, pipelineResult] =
      await Promise.allSettled([
        dashboardV2Service.getSummary(requestFilters),
        dashboardV2Service.getTimeSeries(requestFilters),
        fetchOriginsPerformance(requestFilters),
        dashboardV2Service.getFunnelStats(requestFilters),
        dashboardV2Service.getPipelineStats(requestFilters)
      ])

    if (summaryResult.status === 'fulfilled') {
      summary.value = summaryResult.value
      northStarConfig.value = summaryResult.value.northStarConfig ?? null
      customMetrics.value = summaryResult.value.customMetrics ?? []
    } else {
      error.value = getFriendlyMessage(summaryResult.reason)
      console.error('[Dashboard V2 Store] Error loading summary:', summaryResult.reason)
    }

    if (timeSeriesResult.status === 'fulfilled') {
      timeSeries.value = timeSeriesResult.value
    } else {
      timeSeriesError.value = getFriendlyMessage(timeSeriesResult.reason)
      console.warn('[Dashboard V2 Store] Time series failed:', timeSeriesResult.reason)
    }

    if (originsResult.status === 'fulfilled') {
      originsPerformance.value = originsResult.value
    } else {
      originsError.value = getFriendlyMessage(originsResult.reason)
      console.warn('[Dashboard V2 Store] Origins performance failed:', originsResult.reason)
    }

    if (funnelResult.status === 'fulfilled') {
      funnelStats.value = funnelResult.value.stages
      funnelTotalContacts.value = funnelResult.value.totalContacts
      funnelOverallConversionRate.value = funnelResult.value.overallConversionRate
    } else {
      funnelError.value = getFriendlyMessage(funnelResult.reason)
      console.warn('[Dashboard V2 Store] Funnel stats failed:', funnelResult.reason)
    }

    if (pipelineResult.status === 'fulfilled') {
      pipelineStats.value = pipelineResult.value
    } else {
      pipelineError.value = getFriendlyMessage(pipelineResult.reason)
      console.warn('[Dashboard V2 Store] Pipeline stats failed:', pipelineResult.reason)
    }

    if (summaryResult.status === 'fulfilled') {
      console.log('[Dashboard V2 Store] Data loaded successfully')
    }
    isLoading.value = false
  }

  /**
   * Map period to date range (inclusive).
   * Custom: uses startDate/endDate when both set; if only one is set, uses a fallback to avoid 0-day range.
   */
  function resolveDateRange(
    currentFilters: DashboardV2Filters,
    timezone: string
  ): { startDate?: string; endDate?: string } {
    if (currentFilters.period === 'custom') {
      if (currentFilters.startDate && currentFilters.endDate) {
        return { startDate: currentFilters.startDate, endDate: currentFilters.endDate }
      }
      const today = toISODate(new Date(), timezone)
      if (currentFilters.startDate && !currentFilters.endDate) {
        return { startDate: currentFilters.startDate, endDate: today }
      }
      if (currentFilters.endDate && !currentFilters.startDate) {
        return {
          startDate: shiftISODateByDays(currentFilters.endDate, -29),
          endDate: currentFilters.endDate
        }
      }
    }

    const end = new Date()
    const endDay = toISODate(end, timezone)

    const start = new Date(end)
    const offsets: Record<DashboardV2Filters['period'], number> = {
      today: 0,
      '7d': 6,
      '30d': 29,
      '90d': 89,
      custom: 0
    }
    const offset = offsets[currentFilters.period] ?? 29
    start.setDate(start.getDate() - offset)
    const startDay = toISODate(start, timezone)

    return { startDate: startDay, endDate: endDay }
  }

  function toISODate(date: Date, timezone: string): string {
    return toISODateInTimezone(date, timezone)
  }

  async function resolveActiveTimezone(explicitTimezone?: string): Promise<string> {
    if (explicitTimezone) {
      return resolveTimezone(explicitTimezone)
    }

    const projectId = currentProjectId.value
    if (projectId) {
      const settingsProjectId = settingsStore.settings?.general?.projectId
      if (settingsProjectId !== projectId) {
        try {
          await settingsStore.fetchSettings(projectId)
        } catch (error) {
          console.warn('[Dashboard V2 Store] Failed to load settings for timezone resolution:', error)
        }
      }
    }

    const settingsTimezone = settingsStore.settings?.currency?.timezone
    return resolveTimezone(settingsTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  }

  function shiftISODateByDays(isoDate: string, days: number): string {
    const [year, month, day] = isoDate.split('-').map(Number)
    const utcDate = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
    utcDate.setUTCDate(utcDate.getUTCDate() + days)

    const y = utcDate.getUTCFullYear()
    const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
    const d = String(utcDate.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  /**
   * Open drill-down drawer
   */
  function openDrillDown(
    type: 'funnel' | 'pipeline' | 'origin',
    title: string,
    entities: DrillDownEntity[]
  ): void {
    drillDownDrawer.value = {
      open: true,
      type,
      title,
      entities
    }
  }

  /**
   * Close drill-down drawer
   */
  function closeDrillDown(): void {
    drillDownDrawer.value.open = false
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null
  }

  // ========================================================================
  /**
   * Fetch origins performance data.
   * Usa requestFilters quando passado (ex.: loadDashboardData); senão usa filters atuais (ex.: retry da tabela).
   */
  async function fetchOriginsPerformance(
    requestFilters?: DashboardV2Filters
  ): Promise<OriginPerformance[]> {
    const projectId = localStorage.getItem('current_project_id')
    if (!projectId) {
      console.warn('[Dashboard V2 Store] No project ID available for origins performance')
      return []
    }

    const resolved =
      requestFilters ?? { ...filters.value, ...resolveDateRange(filters.value, activeTimezone.value) }

    try {
      originsPerformanceLoading.value = true
      originsError.value = null

      const data = await dashboardV2Service.getOriginsPerformance(projectId, resolved)
      originsPerformance.value = data
      console.log('[Dashboard V2 Store] Origins performance loaded:', data.length, 'origins')
      return data
    } catch (err) {
      console.error('[Dashboard V2 Store] Failed to load origins performance:', err)
      originsError.value = getFriendlyMessage(err)
      originsPerformance.value = []
      throw err
    } finally {
      originsPerformanceLoading.value = false
    }
  }

  // ========================================================================
  // COMPARISON PERIODS (G5.7)
  // ========================================================================

  /**
   * Add a comparison period
   */
  async function addComparisonPeriod(period: {
    label: string
    startDate: Date
    endDate: Date
    color: string
  }): Promise<void> {
    const id = `comparison_${Date.now()}`

    // Adiciona o período com loading
    comparisonPeriods.value.push({
      id,
      label: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
      color: period.color,
      summary: null,
      isLoading: true
    })

    // Carrega os dados do período
    try {
      const data = await dashboardV2Service.getSummary({
        ...filters.value,
        startDate: toISODate(period.startDate, activeTimezone.value),
        endDate: toISODate(period.endDate, activeTimezone.value)
      })

      // Atualiza o período com os dados
      const periodIndex = comparisonPeriods.value.findIndex(p => p.id === id)
      if (periodIndex >= 0 && comparisonPeriods.value[periodIndex]) {
        const period = comparisonPeriods.value[periodIndex]
        period.summary = data
        period.isLoading = false
      }

      console.log('[Dashboard V2 Store] Comparison period loaded:', period.label)
    } catch (err) {
      console.error('[Dashboard V2 Store] Error loading comparison period:', err)
      // Remove o período em caso de erro
      comparisonPeriods.value = comparisonPeriods.value.filter(p => p.id !== id)
    }
  }

  /**
   * Remove a comparison period
   */
  function removeComparisonPeriod(periodId: string): void {
    comparisonPeriods.value = comparisonPeriods.value.filter(p => p.id !== periodId)
    console.log('[Dashboard V2 Store] Comparison period removed:', periodId)
  }

  /**
   * Clear all comparison periods
   */
  function clearComparisonPeriods(): void {
    comparisonPeriods.value = []
    console.log('[Dashboard V2 Store] All comparison periods cleared')
  }

  /**
   * Check if multi-period comparison is active
   */
  const hasComparisonPeriods = computed(() => comparisonPeriods.value.length > 0)

  /**
   * Get comparison data for a specific metric
   */
  const getComparisonMetrics = computed(() => {
    return (metricKey: string) => {
      return comparisonPeriods.value.map(period => ({
        id: period.id,
        label: period.label,
        color: period.color,
        value: period.summary?.northStar?.[metricKey as keyof typeof period.summary.northStar]?.value ?? null,
        displayValue: period.summary?.northStar?.[metricKey as keyof typeof period.summary.northStar]?.displayValue ?? '-',
        isLoading: period.isLoading
      }))
    }
  })

  // ========================================================================
  // RETURN (Public API)
  // ========================================================================

  return {
    // State
    filters,
    summary,
    northStarConfig,
    customMetrics,
    funnelStats,
    funnelTotalContacts,
    funnelOverallConversionRate,
    pipelineStats,
    originBreakdown,
    timeSeries,
    originsPerformance,
    originsPerformanceLoading,
    drillDownDrawer,
    isLoading,
    error,
    timeSeriesError,
    originsError,
    funnelError,
    pipelineError,
    comparisonPeriods,

    // Getters
    periodLabel,
    hasData,
    sortedInsights,
    hasComparisonPeriods,
    getComparisonMetrics,

    // Actions
    updateFilter,
    setDateRange,
    toggleCompare,
    setViewMode,
    resetFilters,
    loadDashboardData,
    fetchOriginsPerformance,
    openDrillDown,
    closeDrillDown,
    clearError,
    addComparisonPeriod,
    removeComparisonPeriod,
    clearComparisonPeriods
  }
})
