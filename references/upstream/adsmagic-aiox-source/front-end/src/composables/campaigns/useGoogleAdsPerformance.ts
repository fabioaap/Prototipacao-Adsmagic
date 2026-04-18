import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import type { AdsTableColumn } from '@/components/campaigns/AdsMetricsTable.vue'
import {
  adInsightsService,
  type DashboardFilters,
  type AdTableConfig,
} from '@/services/api/adInsights'
import type {
  CampaignsColumnId,
  CampaignsFilterState,
  CampaignsHierarchySelection,
  CampaignsLevelSortState,
  CampaignsLevelTableConfigState,
  CampaignsPerformanceRow,
  CampaignsPeriod,
  CampaignsTableLevel,
} from '@/types/campaigns'
import type { NorthStarCustomMetricDefinition } from '@/types'
import {
  COLUMN_DEFINITIONS,
  DEFAULT_COLUMNS_BY_LEVEL,
  getDefaultColumns,
} from '@/views/campaigns/config/tableColumns'
import {
  mapAdRows,
  mapAdsetRows,
  mapCampaignRows,
} from '@/views/campaigns/mappers/performanceRows'
import { useStagesStore } from '@/stores/stages'

const DEFAULT_SORT_STATE: CampaignsLevelSortState = {
  sortBy: 'spend',
  sortDirection: 'desc',
}

const AVAILABLE_COLUMN_IDS = new Set<CampaignsColumnId>(
  Object.keys(COLUMN_DEFINITIONS) as CampaignsColumnId[]
)

function createRowsByLevelState(): Record<CampaignsTableLevel, CampaignsPerformanceRow[]> {
  return {
    campaign: [],
    adset: [],
    ad: [],
  }
}

function createLoadedByLevelState(): Record<CampaignsTableLevel, boolean> {
  return {
    campaign: false,
    adset: false,
    ad: false,
  }
}

function createSortStateByLevel(): Record<CampaignsTableLevel, CampaignsLevelSortState> {
  return {
    campaign: { ...DEFAULT_SORT_STATE },
    adset: { ...DEFAULT_SORT_STATE },
    ad: { ...DEFAULT_SORT_STATE },
  }
}

function createTableConfigByLevelState(): Record<CampaignsTableLevel, CampaignsLevelTableConfigState> {
  return {
    campaign: {
      selectedColumnIds: getDefaultColumns('campaign'),
      columnOrder: getDefaultColumns('campaign'),
      loaded: false,
    },
    adset: {
      selectedColumnIds: getDefaultColumns('adset'),
      columnOrder: getDefaultColumns('adset'),
      loaded: false,
    },
    ad: {
      selectedColumnIds: getDefaultColumns('ad'),
      columnOrder: getDefaultColumns('ad'),
      loaded: false,
    },
  }
}

function sanitizeColumnIds(ids: string[]): string[] {
  const result: string[] = []
  for (const id of ids) {
    // Accept standard column IDs and custom metric IDs
    if (!AVAILABLE_COLUMN_IDS.has(id as CampaignsColumnId) && !id.startsWith('custom:')) continue
    if (!result.includes(id)) {
      result.push(id)
    }
  }
  return result
}

function mergeColumnOrder(
  selectedColumnIds: string[],
  columnOrder: string[]
): string[] {
  const order = columnOrder.filter((columnId) => selectedColumnIds.includes(columnId))
  for (const columnId of selectedColumnIds) {
    if (!order.includes(columnId)) {
      order.push(columnId)
    }
  }
  return order
}

function resolveConfig(
  level: CampaignsTableLevel,
  config: Pick<AdTableConfig, 'selectedColumnIds' | 'columnOrder'>
): CampaignsLevelTableConfigState {
  const defaultColumns = DEFAULT_COLUMNS_BY_LEVEL[level]
  const selectedColumnIds = sanitizeColumnIds(config.selectedColumnIds)
  const resolvedSelected = selectedColumnIds.length > 0
    ? selectedColumnIds
    : [...defaultColumns]
  const columnOrder = sanitizeColumnIds(config.columnOrder)
  const resolvedOrder = mergeColumnOrder(
    resolvedSelected,
    columnOrder.length > 0 ? columnOrder : resolvedSelected
  )

  return {
    selectedColumnIds: resolvedSelected as CampaignsColumnId[],
    columnOrder: resolvedOrder as CampaignsColumnId[],
    loaded: true,
  }
}

function getCustomMetricFormat(type: string): AdsTableColumn['format'] {
  if (type === 'divide_stages') return 'percent'
  if (type === 'cost_per_stage') return 'currency'
  return 'number'
}

export function useGoogleAdsPerformance() {
  const { toast } = useToast()
  const stagesStore = useStagesStore()

  const activeTab = ref<CampaignsTableLevel>('campaign')
  const isConfigDrawerOpen = ref(false)
  const isConfigSaving = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // Filter state (replaces selectedPeriod)
  const filterState = reactive<CampaignsFilterState>({
    period: '30d',
    startDate: null,
    endDate: null,
    compare: false,
  })

  // Filter date objects for PeriodSelector component binding
  const filterStartDate = ref<Date | undefined>(undefined)
  const filterEndDate = ref<Date | undefined>(undefined)

  // Hierarchy navigation state
  const hierarchySelection = reactive<CampaignsHierarchySelection>({
    campaignId: null,
    campaignName: null,
    adsetId: null,
    adsetName: null,
  })

  // Custom metrics definitions (loaded from table config)
  const customMetricDefinitions = ref<NorthStarCustomMetricDefinition[]>([])

  const rowsByLevel = reactive<Record<CampaignsTableLevel, CampaignsPerformanceRow[]>>(
    createRowsByLevelState()
  )
  const loadedByLevel = reactive<Record<CampaignsTableLevel, boolean>>(
    createLoadedByLevelState()
  )
  const sortStateByLevel = reactive<Record<CampaignsTableLevel, CampaignsLevelSortState>>(
    createSortStateByLevel()
  )
  const tableConfigByLevel = reactive<Record<CampaignsTableLevel, CampaignsLevelTableConfigState>>(
    createTableConfigByLevelState()
  )

  const currentConfigState = computed(() => tableConfigByLevel[activeTab.value])

  const stageOptions = computed(() =>
    stagesStore.activeStages.map((s) => ({ id: s.id, name: s.name }))
  )

  function getColumnsForLevel(level: CampaignsTableLevel): AdsTableColumn[] {
    const config = tableConfigByLevel[level]
    const selected = config.selectedColumnIds.length > 0
      ? config.selectedColumnIds
      : getDefaultColumns(level)
    const order = config.columnOrder.length > 0
      ? config.columnOrder
      : selected
    const mergedOrder = mergeColumnOrder(selected, order)

    return mergedOrder
      .map((columnId) => {
        // Standard columns
        if (COLUMN_DEFINITIONS[columnId as CampaignsColumnId]) {
          return COLUMN_DEFINITIONS[columnId as CampaignsColumnId]
        }
        // Custom metric columns
        if (columnId.startsWith('custom:')) {
          const def = customMetricDefinitions.value.find((m) => m.id === columnId)
          if (def) {
            return {
              id: columnId,
              label: def.name,
              format: getCustomMetricFormat(def.type),
              align: 'right' as const,
            }
          }
        }
        return undefined
      })
      .filter((column): column is AdsTableColumn => Boolean(column))
  }

  function getRequestFilters(): DashboardFilters {
    const filters: DashboardFilters = {
      period: filterState.period,
    }
    if (filterState.startDate) filters.startDate = filterState.startDate
    if (filterState.endDate) filters.endDate = filterState.endDate
    if (filterState.compare) filters.compare = true
    return filters
  }

  async function loadTableConfig(level: CampaignsTableLevel) {
    try {
      const config = await adInsightsService.getTableConfig('google', level)
      tableConfigByLevel[level] = resolveConfig(level, config)
      if (config.customMetrics && config.customMetrics.length > 0) {
        customMetricDefinitions.value = config.customMetrics
      }
    } catch (error) {
      console.error('[Google Ads Performance] Erro ao carregar configuração:', error)
      tableConfigByLevel[level] = {
        selectedColumnIds: getDefaultColumns(level),
        columnOrder: getDefaultColumns(level),
        loaded: true,
      }
    }
  }

  async function loadLevelData(level: CampaignsTableLevel) {
    isLoading.value = true
    errorMessage.value = null

    try {
      const filters = getRequestFilters()

      if (level === 'campaign') {
        const campaigns = await adInsightsService.getCampaigns('google', filters)
        rowsByLevel.campaign = mapCampaignRows(campaigns)
      } else if (level === 'adset') {
        const adsets = await adInsightsService.getAdsets({
          platform: 'google',
          campaignId: hierarchySelection.campaignId ?? undefined,
          filters,
        })
        rowsByLevel.adset = mapAdsetRows(adsets)
      } else {
        const ads = await adInsightsService.getAds({
          platform: 'google',
          campaignId: hierarchySelection.campaignId ?? undefined,
          adsetId: hierarchySelection.adsetId ?? undefined,
          filters,
        })
        rowsByLevel.ad = mapAdRows(ads)
      }

      loadedByLevel[level] = true
    } catch (error) {
      console.error('[Google Ads Performance] Erro ao carregar dados:', error)
      errorMessage.value = 'Não foi possível carregar os dados de campanhas. Tente novamente.'
      toast({
        title: 'Erro ao carregar campanhas',
        description: 'Falha ao buscar dados do Google Ads.',
        variant: 'destructive',
      })
    } finally {
      isLoading.value = false
    }
  }

  async function ensureLevelReady(level: CampaignsTableLevel) {
    if (!tableConfigByLevel[level].loaded) {
      await loadTableConfig(level)
    }

    if (!loadedByLevel[level]) {
      await loadLevelData(level)
    }
  }

  async function refreshActiveLevel() {
    loadedByLevel[activeTab.value] = false
    await loadLevelData(activeTab.value)
  }

  function handleSort(level: CampaignsTableLevel, columnId: string) {
    // Accept standard columns and custom metric IDs
    if (!AVAILABLE_COLUMN_IDS.has(columnId as CampaignsColumnId) && !columnId.startsWith('custom:')) {
      return
    }

    const state = sortStateByLevel[level]
    if (state.sortBy === columnId) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
      return
    }

    state.sortBy = columnId as CampaignsColumnId
    state.sortDirection = 'desc'
  }

  async function saveTableConfig(payload: {
    selectedColumnIds: string[]
    columnOrder: string[]
    customMetrics: NorthStarCustomMetricDefinition[]
  }) {
    isConfigSaving.value = true
    try {
      const selectedColumnIds = sanitizeColumnIds(payload.selectedColumnIds)
      const columnOrder = sanitizeColumnIds(payload.columnOrder)
      const updated = await adInsightsService.updateTableConfig('google', activeTab.value, {
        selectedColumnIds,
        columnOrder,
        customMetrics: payload.customMetrics,
      })

      tableConfigByLevel[activeTab.value] = resolveConfig(activeTab.value, updated)
      if (updated.customMetrics) {
        customMetricDefinitions.value = updated.customMetrics
      }
      isConfigDrawerOpen.value = false
      toast({
        title: 'Configuração salva',
        description: 'Os indicadores da tabela foram atualizados.',
      })
    } catch (error) {
      console.error('[Google Ads Performance] Erro ao salvar configuração:', error)
      toast({
        title: 'Erro ao salvar configuração',
        description: 'Não foi possível salvar os indicadores da tabela.',
        variant: 'destructive',
      })
    } finally {
      isConfigSaving.value = false
    }
  }

  // --- Hierarchy navigation ---

  function selectCampaign(id: string, name: string) {
    hierarchySelection.campaignId = id
    hierarchySelection.campaignName = name
    hierarchySelection.adsetId = null
    hierarchySelection.adsetName = null
    activeTab.value = 'adset'
    loadedByLevel.adset = false
    loadedByLevel.ad = false
    void ensureLevelReady('adset')
  }

  function selectAdset(id: string, name: string) {
    hierarchySelection.adsetId = id
    hierarchySelection.adsetName = name
    activeTab.value = 'ad'
    loadedByLevel.ad = false
    void ensureLevelReady('ad')
  }

  function clearHierarchyFilter() {
    hierarchySelection.campaignId = null
    hierarchySelection.campaignName = null
    hierarchySelection.adsetId = null
    hierarchySelection.adsetName = null
    Object.assign(loadedByLevel, createLoadedByLevelState())
    activeTab.value = 'campaign'
    void loadLevelData('campaign')
  }

  function navigateBackToLevel(level: CampaignsTableLevel) {
    if (level === 'campaign') {
      clearHierarchyFilter()
      return
    }
    if (level === 'adset') {
      hierarchySelection.adsetId = null
      hierarchySelection.adsetName = null
      activeTab.value = 'adset'
      loadedByLevel.adset = false
      loadedByLevel.ad = false
      void ensureLevelReady('adset')
    }
  }

  // --- Filter handlers ---

  function handlePeriodChange(period: string) {
    filterState.period = period as CampaignsPeriod
  }

  function handleDateRangeChange(start: Date, end: Date) {
    filterState.startDate = start.toISOString().split('T')[0]!
    filterState.endDate = end.toISOString().split('T')[0]!
    if (filterState.period !== 'today' && filterState.period !== '7d' && filterState.period !== '30d' && filterState.period !== '90d') {
      filterState.period = 'custom'
    }
  }

  function handleCompareToggle(value: boolean) {
    filterState.compare = value
  }

  function handleFilterStartDateUpdate(date: Date | undefined) {
    filterStartDate.value = date
  }

  function handleFilterEndDateUpdate(date: Date | undefined) {
    filterEndDate.value = date
  }

  // Watch filter state changes to reload data
  watch(
    () => [filterState.period, filterState.startDate, filterState.endDate, filterState.compare],
    () => {
      // Reset hierarchy when filters change
      hierarchySelection.campaignId = null
      hierarchySelection.campaignName = null
      hierarchySelection.adsetId = null
      hierarchySelection.adsetName = null

      Object.assign(loadedByLevel, createLoadedByLevelState())
      activeTab.value = 'campaign'
      void loadLevelData('campaign')
    }
  )

  watch(activeTab, (level) => {
    void ensureLevelReady(level)
  })

  onMounted(() => {
    void stagesStore.fetchStages()
    void ensureLevelReady(activeTab.value)
  })

  return {
    activeTab,
    filterState,
    filterStartDate,
    filterEndDate,
    hierarchySelection,
    isConfigDrawerOpen,
    isConfigSaving,
    isLoading,
    errorMessage,
    rowsByLevel,
    sortStateByLevel,
    currentConfigState,
    customMetricDefinitions,
    stageOptions,
    getColumnsForLevel,
    refreshActiveLevel,
    handleSort,
    saveTableConfig,
    selectCampaign,
    selectAdset,
    clearHierarchyFilter,
    navigateBackToLevel,
    handlePeriodChange,
    handleDateRangeChange,
    handleCompareToggle,
    handleFilterStartDateUpdate,
    handleFilterEndDateUpdate,
  }
}
