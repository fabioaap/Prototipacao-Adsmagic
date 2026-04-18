<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Settings2 } from 'lucide-vue-next'
import { useDashboardV2Store } from '@/stores/dashboardV2'
import { useContactsStore } from '@/stores/contacts'
import { useSalesStore } from '@/stores/sales'
import { useOriginsStore } from '@/stores/origins'
import { useSettingsStore } from '@/stores/settings'
import { useProjectsStore } from '@/stores/projects'
import { useStagesStore } from '@/stores/stages'
import { useToast } from '@/components/ui/toast/use-toast'
import { downloadBlob, generateFilename } from '@/utils/download'
import {
  isoDateToDateInTimezone,
  resolveTimezone,
  toISODateInTimezone,
  todayISOInTimezone
} from '@/utils/dateTimezone'

import AppShell from '@/components/layout/AppShell.vue'
import ChannelDonutChart from '@/components/dashboardV2/ChannelDonutChart.vue'
import ConversionFunnelChart from '@/components/dashboardV2/ConversionFunnelChart.vue'
import TimelineChart from '@/components/dashboardV2/TimelineChart.vue'
import RevenueGoalCard from '@/components/dashboardV2/RevenueGoalCard.vue'
import DashboardFiltersBarNew from '@/components/dashboardV2/DashboardFiltersBarNew.vue'
import OriginsPerformanceTable from '@/components/dashboard/OriginsPerformanceTable.vue'
import NorthStarConfigDrawer from '@/components/dashboardV2/NorthStarConfigDrawer.vue'
import EntityListDrawer from '@/components/dashboardV2/EntityListDrawer.vue'
import ContactDetailsDrawer from '@/components/contacts/ContactDetailsDrawer.vue'
import SaleDetailsDrawer from '@/components/sales/SaleDetailsDrawer.vue'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/Badge.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

import { dashboardV2Service } from '@/services/api/dashboardV2'
import type { ChannelData } from '@/components/dashboardV2/ChannelDonutChart.vue'
import type { DrillDownEntity, NorthStarCustomMetricDefinition } from '@/types'
import type { Contact, Sale } from '@/types/models'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const dashboardStore = useDashboardV2Store()
const contactsStore = useContactsStore()
const salesStore = useSalesStore()
const originsStore = useOriginsStore()
const settingsStore = useSettingsStore()
const projectsStore = useProjectsStore()
const stagesStore = useStagesStore()
const { toast } = useToast()

// Revenue goal from settings store (persisted in database)
const revenueGoalValue = computed(() => {
  return settingsStore.generalSettings?.revenueGoal ?? null
})
const isExporting = ref(false)
const showDetailedKpis = ref(false)

const projectId = computed(() => route.params.projectId as string | undefined)

const currentProject = computed(() => {
  if (!projectId.value) return null
  if (projectsStore.currentProject?.id === projectId.value) {
    return projectsStore.currentProject
  }
  return projectsStore.projects.find((project) => project.id === projectId.value) || null
})

const assistantData = computed(() => {
  const wizardProgress = currentProject.value?.wizard_progress
  if (!wizardProgress || typeof wizardProgress !== 'object') {
    return {}
  }

  const progressData = wizardProgress.data
  if (!progressData || typeof progressData !== 'object') {
    return {}
  }

  return progressData as Record<string, unknown>
})

const hasPendingOnboardingActions = computed(() => {
  const project = currentProject.value
  if (!project) return false

  const hasMissingSegment = String(assistantData.value.segment || '').trim().length === 0
  const hasNoConnectedChannels =
    !project.meta_ads_connected &&
    !project.google_ads_connected &&
    !project.whatsapp_connected

  return hasMissingSegment || hasNoConnectedChannels
})

// Estado para drill-down (G5.5)
const drilldownOpen = ref(false)
const drilldownTitle = ref('')
const drilldownEntities = ref<DrillDownEntity[]>([])
const drilldownLoading = ref(false)

// Estado para drawers de detalhes (navegação de drill-down)
const showContactDetails = ref(false)
const selectedContactForDetails = ref<Contact | null>(null)
const showSaleDetails = ref(false)
const selectedSaleForDetails = ref<Sale | null>(null)

const selectedPeriod = computed(() => dashboardStore.periodLabel)
const selectedOrigins = computed(() => dashboardStore.filters.origin || 'all')
const compareEnabled = computed(() => dashboardStore.filters.compare)
const dashboardTimezone = computed(() =>
  resolveTimezone(settingsStore.currentTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
)

function handleCompareToggle() {
  dashboardStore.toggleCompare()
}

const customStartDate = computed(() => {
  if (dashboardStore.filters.startDate) {
    return isoDateToDateInTimezone(dashboardStore.filters.startDate, dashboardTimezone.value)
  }
  return undefined
})

const customEndDate = computed(() => {
  if (dashboardStore.filters.endDate) {
    return isoDateToDateInTimezone(dashboardStore.filters.endDate, dashboardTimezone.value)
  }
  return undefined
})

const periodDescription = computed(() => {
  const period = dashboardStore.periodLabel.toLowerCase()

  if (compareEnabled.value) {
    return t('dashboard.v2.periodDescriptionCompare', { period })
  }

  return t('dashboard.v2.periodDescription', { period })
})

interface KpiCard {
  id: string
  label: string
  value: string
  caption: string
  badgeValue?: string
  badgeType?: 'positive' | 'negative'
}

const northStarConfigOpen = ref(false)
const northStarConfigSaving = ref(false)

const DEFAULT_PRIMARY_METRIC_IDS = ['spend', 'revenue', 'sales', 'salesRate']

const formatDelta = (delta: number | null | undefined) => {
  if (!compareEnabled.value) return undefined
  if (delta === null || delta === undefined) return undefined
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}%`
}

const formatBadgeType = (delta: number | null | undefined): KpiCard['badgeType'] => {
  if (!compareEnabled.value) return undefined
  if (delta === null || delta === undefined) return undefined
  return delta < 0 ? 'negative' : 'positive'
}

const derivedContacts = computed(() => {
  const sales = dashboardStore.summary?.northStar?.sales?.value
  const salesRate = dashboardStore.summary?.northStar?.salesRate?.value
  if (!sales || !salesRate) return null
  const contacts = salesRate === 0 ? null : Math.round(sales / salesRate)
  return contacts && contacts > 0 ? contacts : null
})

const baseKpiCards = computed((): KpiCard[] => {
  const ns = dashboardStore.summary?.northStar
  return [
    {
      id: 'spend',
      label: t('dashboard.v2.kpiAdSpend'),
      value: ns?.spend?.displayValue ?? 'R$ 784,21',
      caption: t('dashboard.v2.kpiAdSpendCaption'),
      badgeValue: formatDelta(ns?.spend?.delta),
      badgeType: formatBadgeType(ns?.spend?.delta)
    },
    {
      id: 'revenue',
      label: t('dashboard.v2.kpiRevenue'),
      value: ns?.revenue?.displayValue ?? 'R$ 6.060,00',
      caption: t('dashboard.v2.kpiRevenueCaption'),
      badgeValue: formatDelta(ns?.revenue?.delta),
      badgeType: formatBadgeType(ns?.revenue?.delta)
    },
    {
      id: 'avgTicket',
      label: t('dashboard.v2.kpiAvgTicket'),
      value: ns?.avgTicket?.displayValue ?? 'R$ 757,50',
      caption: t('dashboard.v2.kpiAvgTicketCaption'),
      badgeValue: formatDelta(ns?.avgTicket?.delta),
      badgeType: formatBadgeType(ns?.avgTicket?.delta)
    },
    {
      id: 'roi',
      label: t('dashboard.v2.kpiRoi'),
      value: ns?.roi?.displayValue ?? '7,7x',
      caption: t('dashboard.v2.kpiRoiCaption'),
      badgeValue: formatDelta(ns?.roi?.delta),
      badgeType: formatBadgeType(ns?.roi?.delta)
    },
    {
      id: 'cac',
      label: t('dashboard.v2.kpiCostPerSale'),
      value: ns?.cac?.displayValue ?? 'R$ 98,00',
      caption: t('dashboard.v2.kpiCostPerSaleCaption'),
      badgeValue: formatDelta(ns?.cac?.delta),
      badgeType: formatBadgeType(ns?.cac?.delta)
    },
    {
      id: 'contacts',
      label: t('dashboard.v2.kpiContacts'),
      value:
        ns?.contacts?.displayValue ??
        (typeof ns?.contacts?.value === 'number' ? ns.contacts.value.toLocaleString('pt-BR') : null) ??
        (derivedContacts.value != null ? derivedContacts.value.toLocaleString('pt-BR') : null) ??
        '—',
      caption: t('dashboard.v2.kpiContactsCaption'),
      badgeValue: formatDelta(ns?.contacts?.delta),
      badgeType: formatBadgeType(ns?.contacts?.delta)
    },
    {
      id: 'sales',
      label: t('dashboard.v2.kpiSales'),
      value: ns?.sales?.displayValue ?? '8',
      caption: t('dashboard.v2.kpiSalesCaption'),
      badgeValue: formatDelta(ns?.sales?.delta),
      badgeType: formatBadgeType(ns?.sales?.delta)
    },
    {
      id: 'salesRate',
      label: t('dashboard.v2.kpiSalesRate'),
      value: ns?.salesRate?.displayValue ?? '11,76%',
      caption: t('dashboard.v2.kpiSalesRateCaption'),
      badgeValue: formatDelta(ns?.salesRate?.delta),
      badgeType: formatBadgeType(ns?.salesRate?.delta)
    },
    {
      id: 'impressions',
      label: t('dashboard.v2.kpiImpressions'),
      value: ns?.impressions?.displayValue ?? '6.020',
      caption: t('dashboard.v2.kpiImpressionsCaption'),
      badgeValue: formatDelta(ns?.impressions?.delta),
      badgeType: formatBadgeType(ns?.impressions?.delta)
    },
    {
      id: 'clicks',
      label: t('dashboard.v2.kpiClicks'),
      value: ns?.clicks?.displayValue ?? '245',
      caption: t('dashboard.v2.kpiClicksCaption'),
      badgeValue: formatDelta(ns?.clicks?.delta),
      badgeType: formatBadgeType(ns?.clicks?.delta)
    },
    {
      id: 'cpc',
      label: t('dashboard.v2.kpiCpc'),
      value: ns?.cpc?.displayValue ?? 'R$ 3,20',
      caption: t('dashboard.v2.kpiCpcCaption'),
      badgeValue: formatDelta(ns?.cpc?.delta),
      badgeType: formatBadgeType(ns?.cpc?.delta)
    },
    {
      id: 'ctr',
      label: t('dashboard.v2.kpiCtr'),
      value: ns?.ctr?.displayValue ?? '4,07%',
      caption: t('dashboard.v2.kpiCtrCaption'),
      badgeValue: formatDelta(ns?.ctr?.delta),
      badgeType: formatBadgeType(ns?.ctr?.delta)
    },
    {
      id: 'avgCycleDays',
      label: t('dashboard.v2.kpiCycleDays'),
      value: ns?.avgCycleDays?.displayValue ?? '26 dias',
      caption: t('dashboard.v2.kpiCycleDaysCaption'),
      badgeValue: formatDelta(ns?.avgCycleDays?.delta),
      badgeType: formatBadgeType(ns?.avgCycleDays?.delta)
    },
    {
      id: 'activeCustomers',
      label: t('dashboard.v2.kpiActiveCustomers'),
      value: ns?.activeCustomers?.displayValue ?? '206',
      caption: t('dashboard.v2.kpiActiveCustomersCaption'),
      badgeValue: formatDelta(ns?.activeCustomers?.delta),
      badgeType: formatBadgeType(ns?.activeCustomers?.delta)
    }
  ]
})

function formatCustomMetricValue(metric: { value: number; format: 'number' | 'percent' | 'currency' }): string {
  if (metric.format === 'currency') {
    return metric.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
  }
  if (metric.format === 'percent') {
    return `${metric.value.toFixed(1).replace('.', ',')}%`
  }
  return Math.round(metric.value).toLocaleString('pt-BR')
}

const customKpiCards = computed((): KpiCard[] => {
  return (dashboardStore.customMetrics ?? []).map((metric) => ({
    id: metric.id,
    label: metric.name,
    value: formatCustomMetricValue(metric),
    caption: 'Métrica personalizada',
    badgeValue: formatDelta(metric.delta),
    badgeType: formatBadgeType(metric.delta)
  }))
})

const kpiCards = computed((): KpiCard[] => ([
  ...baseKpiCards.value,
  ...customKpiCards.value
]))

const kpiCardById = computed(() => new Map(kpiCards.value.map((card) => [card.id, card])))

const metricOrder = computed(() => {
  const allIds = kpiCards.value.map((card) => card.id)
  const configured = dashboardStore.northStarConfig?.detailedMetricOrder ?? []
  const ordered = configured.filter((id) => allIds.includes(id))
  for (const id of allIds) {
    if (!ordered.includes(id)) ordered.push(id)
  }
  return ordered
})

const primaryMetricIds = computed(() => {
  const allIds = metricOrder.value
  const configured = dashboardStore.northStarConfig?.primaryMetricIds ?? DEFAULT_PRIMARY_METRIC_IDS
  const primary = configured.filter((id) => allIds.includes(id)).slice(0, 4)
  if (primary.length > 0) return primary
  return DEFAULT_PRIMARY_METRIC_IDS.filter((id) => allIds.includes(id)).slice(0, 4)
})

const primaryKpiCards = computed(() =>
  primaryMetricIds.value
    .map((id) => kpiCardById.value.get(id))
    .filter((card): card is KpiCard => Boolean(card))
)

const detailedKpiCards = computed(() =>
  metricOrder.value
    .filter((id) => !primaryMetricIds.value.includes(id))
    .map((id) => kpiCardById.value.get(id))
    .filter((card): card is KpiCard => Boolean(card))
)

const baseMetricOptions = computed(() =>
  baseKpiCards.value.map((card) => ({
    id: card.id,
    label: card.label,
    caption: card.caption
  }))
)

const stageOptions = computed(() =>
  stagesStore.activeStages
    .filter((stage) => stage.isActive)
    .map((stage) => ({ id: stage.id, name: stage.name }))
)

async function handleSaveNorthStarConfig(payload: {
  primaryMetricIds: string[]
  detailedMetricOrder: string[]
  customMetrics: NorthStarCustomMetricDefinition[]
}) {
  if (northStarConfigSaving.value) return

  northStarConfigSaving.value = true
  try {
    await dashboardV2Service.updateNorthStarConfig(payload)
    await dashboardStore.loadDashboardData(dashboardTimezone.value)
    northStarConfigOpen.value = false
    toast({
      title: 'North Star atualizada',
      description: 'A configuração de métricas foi salva com sucesso.',
    })
  } catch (error) {
    console.error('[Dashboard] Error saving North Star config:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível salvar a configuração da North Star.',
      variant: 'destructive',
    })
  } finally {
    northStarConfigSaving.value = false
  }
}

const isKpiLoading = computed(() => dashboardStore.isLoading)

/** Vendas por origem (donut) – derivado de originsPerformance (dados reais). */
const salesByChannel = computed((): ChannelData[] => {
  const list = dashboardStore.originsPerformance ?? []
  const total = list.reduce((acc, o) => acc + o.sales, 0)
  if (total === 0) return []
  return list
    .filter(o => o.sales > 0)
    .map(o => ({
      name: o.name ?? o.origin,
      value: o.sales,
      percentage: (o.sales / total) * 100,
      color: o.color ?? '#6B7280'
    }))
})

/** Receita por origem (donut) – derivado de originsPerformance (dados reais). */
const revenueByChannel = computed((): ChannelData[] => {
  const list = dashboardStore.originsPerformance ?? []
  const total = list.reduce((acc, o) => acc + o.revenue, 0)
  if (total === 0) return []
  return list
    .filter(o => o.revenue > 0)
    .map(o => ({
      name: o.name ?? o.origin,
      value: o.revenue,
      percentage: (o.revenue / total) * 100,
      color: o.color ?? '#6B7280'
    }))
})

/** Total de vendas (para rótulo do donut). */
const totalSalesForDonut = computed(() => {
  const total = (dashboardStore.originsPerformance ?? []).reduce((acc, o) => acc + o.sales, 0)
  return total.toLocaleString('pt-BR')
})

/** Total de receita (para rótulo do donut). */
const totalRevenueForDonut = computed(() => {
  const total = (dashboardStore.originsPerformance ?? []).reduce((acc, o) => acc + o.revenue, 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
})

const timelineData = computed(() => {
  if (dashboardStore.timeSeries && dashboardStore.timeSeries.length > 0) {
    return dashboardStore.timeSeries.map(point => {
      const date = new Date(point.date + 'T12:00:00')
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const formattedDate = `${day}/${month}/${year}`

      return {
        week: formattedDate,
        contacts: point.value,
        sales: point.compareValue ?? 0
      }
    })
  }

  const endDate = customEndDate.value || new Date()
  const startDate = customStartDate.value || (() => {
    const d = new Date(endDate)
    d.setDate(d.getDate() - 29)
    return d
  })()
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const mockData: { week: string; contacts: number; sales: number }[] = []

  for (let i = 0; i <= diffDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const formattedDate = `${day}/${month}/${date.getFullYear()}`

    const baseContacts = 20
    const amplitude = 5
    const noise = (Math.random() - 0.5) * 3
    const contacts = Math.round(baseContacts + amplitude * Math.sin(i * 0.3) + noise)
    const baseSales = 3
    const salesNoise = (Math.random() - 0.5) * 0.8
    const sales = Math.max(1, Math.round(baseSales + salesNoise))

    mockData.push({ week: formattedDate, contacts, sales })
  }

  return mockData
})

// Funil de conversão (dados reais: dashboardStore.funnelStats)
const funnelStatsForView = computed(() => dashboardStore.funnelStats ?? [])

const funnelTotalFormatted = computed(() => {
  const total = dashboardStore.funnelTotalContacts ?? 0
  return total.toLocaleString('pt-BR') + ' leads'
})

const funnelEntradaFormatted = computed(() => {
  const stages = funnelStatsForView.value
  const firstCount = stages.length > 0 ? (stages[0]?.count ?? 0) : 0
  return firstCount.toLocaleString('pt-BR') + ' novos contatos'
})

const funnelAvancoMedioFormatted = computed(() => {
  const stages = funnelStatsForView.value
  if (stages.length === 0) return '—'
  const rates = stages.map(s => s.conversionRate).filter((r): r is number => typeof r === 'number' && r > 0)
  if (rates.length === 0) return '—'
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length
  return avg.toFixed(1).replace('.', ',') + '% por etapa'
})

const funnelConversaoFinalFormatted = computed(() => {
  const stages = funnelStatsForView.value
  const rate = dashboardStore.funnelOverallConversionRate ?? 0
  const lastStage = stages.length > 0 ? stages[stages.length - 1] : undefined
  const lastCount = lastStage?.count ?? 0
  const rateStr = rate.toFixed(1).replace('.', ',')
  return lastCount.toLocaleString('pt-BR') + ' vendas (' + rateStr + '%)'
})

const goalPercentageValue = computed(() => {
  const raw = dashboardStore.summary?.northStar?.goalPercentage?.value
  if (typeof raw === 'number') return Math.round(raw * 1000) / 10
  return 75
})

const goalDeltaValue = computed(() => {
  const raw = dashboardStore.summary?.northStar?.goalPercentage?.delta
  if (typeof raw === 'number') return raw
  return 0
})

// Verifica se há meta de receita configurada
const hasRevenueGoal = computed(() => {
  return !!(revenueGoalValue.value && revenueGoalValue.value > 0)
})

// Calcula receita atual do período a partir do dashboardStore
const currentRevenue = computed(() => {
  const revenueValue = dashboardStore.summary?.northStar?.revenue?.value
  return typeof revenueValue === 'number' && revenueValue > 0 ? revenueValue : 0
})

// Dados mock removidos - usar dados reais do store quando disponíveis

type DashboardPeriod = 'today' | '7d' | '30d' | '90d' | 'custom'

function handlePeriodChange(period: string) {
  const canonicalPeriods = new Set<DashboardPeriod>(['today', '7d', '30d', '90d', 'custom'])
  if (canonicalPeriods.has(period as DashboardPeriod)) {
    dashboardStore.updateFilter('period', period as DashboardPeriod)
    return
  }

  const periodMap: Record<string, DashboardPeriod> = {
    'Hoje': 'today',
    'Últimos 7 dias': '7d',
    'Últimos 30 dias': '30d',
    'Últimos 90 dias': '90d',
    'Período personalizado': 'custom'
  }
  const periodValue = periodMap[period]
  if (periodValue) {
    dashboardStore.updateFilter('period', periodValue)
  }
}

function handleStartDateUpdate(date: Date | undefined) {
  if (date) {
    const isoDate = toISODateInTimezone(date, dashboardTimezone.value)
    dashboardStore.updateFilter('startDate', isoDate)
    dashboardStore.updateFilter('period', 'custom')
  }
}

function handleEndDateUpdate(date: Date | undefined) {
  if (date) {
    const isoDate = toISODateInTimezone(date, dashboardTimezone.value)
    dashboardStore.updateFilter('endDate', isoDate)
  }
}

function parseIsoToUtcDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
}

function detectPeriodForRange(start: Date, end: Date): DashboardPeriod {
  const startIso = toISODateInTimezone(start, dashboardTimezone.value)
  const endIso = toISODateInTimezone(end, dashboardTimezone.value)
  const todayIso = todayISOInTimezone(dashboardTimezone.value)

  const startDate = parseIsoToUtcDate(startIso)
  const endDate = parseIsoToUtcDate(endIso)
  const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  if (startIso === todayIso && endIso === todayIso) return 'today'
  if (endIso === todayIso && diffDays === 7) return '7d'
  if (endIso === todayIso && diffDays === 30) return '30d'
  if (endIso === todayIso && diffDays === 90) return '90d'
  return 'custom'
}

/** Um unico load ao selecionar range na barra de filtros (evita race). */
function handleDateRangeChangeFromBar(start: Date, end: Date) {
  const isoStart = toISODateInTimezone(start, dashboardTimezone.value)
  const isoEnd = toISODateInTimezone(end, dashboardTimezone.value)
  const period = detectPeriodForRange(start, end)
  dashboardStore.setDateRange(isoStart, isoEnd, period)
}

/** Mudanca de intervalo no grafico: atualiza filtros e recarrega uma vez. */
function handleChartDateRangeChange(startDate: Date | undefined, endDate: Date | undefined) {
  if (startDate && endDate) {
    const isoStart = toISODateInTimezone(startDate, dashboardTimezone.value)
    const isoEnd = toISODateInTimezone(endDate, dashboardTimezone.value)
    const period = detectPeriodForRange(startDate, endDate)
    dashboardStore.setDateRange(isoStart, isoEnd, period)
  }
}

function handleOriginsChange(origin: string) {
  const originValue = origin === 'all' ? null : origin
  dashboardStore.updateFilter('origin', originValue)
}

function goToIntegrationsSetup() {
  if (!projectId.value) return
  const locale = (route.params.locale as string) || 'pt'
  router.push({
    name: 'integrations',
    params: {
      locale,
      projectId: projectId.value,
    },
    query: {
      tab: 'channels',
    },
  })
}

function continueWithAssistant() {
  if (!projectId.value) return
  const locale = (route.params.locale as string) || 'pt'
  router.push({
    name: 'project-wizard',
    params: { locale },
    query: {
      projectId: projectId.value,
    },
  })
}

async function handleExport() {
  if (isExporting.value) return
  
  isExporting.value = true
  try {
    const summary = dashboardStore.summary
    const origins = dashboardStore.originsPerformance
    
    // Extrair valores do northStar
    const ns = summary?.northStar
    const totalContacts = ns?.contacts?.value ?? derivedContacts.value ?? 0
    const contactsChange = ns?.contacts?.delta ?? 0
    const totalSales = ns?.sales?.value ?? 0
    const salesChange = ns?.sales?.delta ?? 0
    const totalRevenue = ns?.revenue?.value ?? 0
    const revenueChange = ns?.revenue?.delta ?? 0
    const conversionRate = ns?.salesRate?.value ?? 0
    const conversionChange = ns?.salesRate?.delta ?? 0
    
    // Gerar CSV com dados do dashboard
    const lines: string[] = []
    
    // Header com informações do período
    lines.push('# Relatório Dashboard')
    lines.push(`# Período: ${periodDescription.value}`)
    lines.push(`# Exportado em: ${new Date().toLocaleString('pt-BR')}`)
    lines.push('')
    
    // Resumo geral
    lines.push('## Métricas Resumo')
    lines.push('Métrica,Valor,Variação')
    lines.push(`Contatos,"${totalContacts}","${contactsChange}%"`)
    lines.push(`Vendas,"${totalSales}","${salesChange}%"`)
    lines.push(`Receita,"R$ ${totalRevenue.toLocaleString('pt-BR')}","${revenueChange}%"`)
    lines.push(`Taxa de Conversão,"${conversionRate.toFixed(1)}%","${conversionChange}%"`)
    lines.push('')
    
    // Origens
    lines.push('## Performance por Origem')
    lines.push('Origem,Contatos,Vendas,Receita,Conversão')
    origins.forEach((origin: { origin: string; contacts: number; sales: number; revenue: number; conversionRate: number }) => {
      lines.push(`"${origin.origin}","${origin.contacts}","${origin.sales}","${origin.revenue}","${origin.conversionRate.toFixed(1)}%"`)
    })
    
    const csvContent = lines.join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, generateFilename('dashboard-relatorio', 'csv'))
    
    toast({
      title: 'Exportação concluída',
      description: 'O relatório foi baixado com sucesso.',
    })
  } catch (error) {
    console.error('Erro ao exportar dashboard:', error)
    toast({
      title: 'Erro na exportação',
      description: 'Não foi possível exportar o relatório.',
      variant: 'destructive',
    })
  } finally {
    isExporting.value = false
  }
}

// Handler para drill-down em gráficos (G5.5)
async function handleDrilldown(date: string, metric: 'contacts' | 'sales' | 'revenue' | 'spend', value: number) {
  console.log(`[Dashboard] Drilldown clicked: ${metric} on ${date} (value: ${value})`)
  
  drilldownLoading.value = true
  drilldownOpen.value = true
  drilldownEntities.value = []
  
  // Define título baseado na métrica
  const metricLabels = {
    contacts: 'Contatos',
    sales: 'Vendas',
    revenue: 'Receita',
    spend: 'Gastos'
  }
  
  drilldownTitle.value = `${metricLabels[metric]} em ${new Date(date).toLocaleDateString('pt-BR')}`
  
  try {
    const entities: DrillDownEntity[] = []
    
    if (metric === 'contacts') {
      // Buscar contatos reais da store
      const contacts = await contactsStore.getContactsByDate(date)
      
      entities.push(...contacts.map(contact => ({
        id: contact.id,
        type: 'contact' as const,
        name: contact.name || 'Sem nome',
        stage: contactsStore.getStageNameById(contact.stage),
        origin: contactsStore.getOriginNameById(contact.origin),
        createdAt: contact.createdAt
      })))
    } else if (metric === 'sales' || metric === 'revenue') {
      // Buscar vendas reais da store
      const sales = await salesStore.getSalesByDate(date)
      
      entities.push(...sales.map(sale => ({
        id: sale.id,
        type: 'sale' as const,
        name: salesStore.getContactNameById(sale.contactId),
        stage: sale.status === 'completed' ? 'Fechada' : 'Perdida',
        origin: salesStore.getOriginNameById(sale.origin),
        value: sale.value,
        createdAt: sale.date
      })))
    }
    
    drilldownEntities.value = entities
    
    if (entities.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Nenhum registro encontrado para este período.',
      })
    }
  } catch (error) {
    console.error('Erro ao buscar dados de drilldown:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os detalhes.',
      variant: 'destructive'
    })
  } finally {
    drilldownLoading.value = false
  }
}

function handleEntityClick(entity: DrillDownEntity) {
  console.log('[Dashboard] Entity clicked:', entity)
  
  if (entity.type === 'contact') {
    // Buscar contato completo na store
    const contact = contactsStore.contacts.find(c => c.id === entity.id)
    if (contact) {
      selectedContactForDetails.value = contact
      showContactDetails.value = true
      console.log('[Dashboard] Opening ContactDetailsDrawer for:', contact.name)
    } else {
      toast({
        title: 'Erro',
        description: 'Contato não encontrado.',
        variant: 'destructive'
      })
    }
  } else if (entity.type === 'sale') {
    // Buscar venda completa na store
    const sale = salesStore.sales.find(s => s.id === entity.id)
    if (sale) {
      selectedSaleForDetails.value = sale
      showSaleDetails.value = true
      console.log('[Dashboard] Opening SaleDetailsDrawer for:', sale.id)
    } else {
      toast({
        title: 'Erro',
        description: 'Venda não encontrada.',
        variant: 'destructive'
      })
    }
  }
}

// Handler para clique em canal/origem (drill-down por origem)
function handleChannelClick(channel: ChannelData) {
  console.log('[Dashboard] Channel clicked:', channel.name)
  
  drilldownLoading.value = true
  drilldownOpen.value = true
  drilldownEntities.value = []
  drilldownTitle.value = `Contatos e Vendas - ${channel.name}`
  
  try {
    const entities: DrillDownEntity[] = []
    
    // Buscar ID da origem pelo nome
    const originId = originsStore.getOriginIdByName(channel.name)
    console.log('[Dashboard] Origin ID for', channel.name, ':', originId)
    
    // Buscar contatos filtrados por origem (comparar com ID ou nome)
    const filteredContacts = contactsStore.contacts.filter(c => 
      c.origin === originId || 
      c.origin === channel.name || 
      c.origin?.toLowerCase().includes(channel.name.toLowerCase())
    )
    console.log('[Dashboard] Filtered contacts:', filteredContacts.length)
    
    entities.push(...filteredContacts.map(contact => ({
      id: contact.id,
      type: 'contact' as const,
      name: contact.name || 'Sem nome',
      stage: contactsStore.getStageNameById(contact.stage),
      origin: contactsStore.getOriginNameById(contact.origin) || channel.name,
      createdAt: contact.createdAt
    })))
    
    // Buscar vendas filtradas por origem (comparar com ID ou nome)
    const filteredSales = salesStore.sales.filter(s => 
      s.origin === originId || 
      s.origin === channel.name || 
      s.origin?.toLowerCase().includes(channel.name.toLowerCase())
    )
    console.log('[Dashboard] Filtered sales:', filteredSales.length)
    
    entities.push(...filteredSales.map(sale => ({
      id: sale.id,
      type: 'sale' as const,
      name: salesStore.getContactNameById(sale.contactId),
      stage: sale.status === 'completed' ? 'Fechada' : 'Perdida',
      origin: salesStore.getOriginNameById(sale.origin) || channel.name,
      value: sale.value,
      createdAt: sale.date
    })))
    
    console.log('[Dashboard] Total entities:', entities.length)
    drilldownEntities.value = entities
  } catch (error) {
    console.error('Erro ao buscar dados do canal:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os dados do canal.',
      variant: 'destructive'
    })
  } finally {
    drilldownLoading.value = false
  }
}

onMounted(async () => {
  if (projectId.value) {
    if (projectsStore.currentProject?.id !== projectId.value) {
      await projectsStore.loadProject(projectId.value)
    }

    // Load settings first so timezone-sensitive date filters use company timezone.
    if (!settingsStore.settings) {
      await settingsStore.fetchSettings(projectId.value)
    }

    await dashboardStore.loadDashboardData(dashboardTimezone.value)
    await stagesStore.fetchStages()
  }
})

const getDeltaBadgeColor = (badgeType?: 'positive' | 'negative') => {
  return badgeType === 'negative' ? 'destructive' : 'success'
}
</script>

<template>
  <AppShell container-size="2xl">
    <div class="page-header">
        <PageHeader
          :title="t('dashboard.v2.overview')"
          :description="periodDescription"
        />
      </div>

      <DashboardFiltersBarNew
        :period="selectedPeriod"
        :origins="selectedOrigins"
        :compare="compareEnabled"
        :start-date="customStartDate"
        :end-date="customEndDate"
        :timezone="dashboardTimezone"
        :loading="dashboardStore.isLoading"
        :exporting="isExporting"
        @period-change="handlePeriodChange"
        @date-range-change="handleDateRangeChangeFromBar"
        @origins-change="handleOriginsChange"
        @compare-toggle="handleCompareToggle"
        @update:start-date="handleStartDateUpdate"
        @update:end-date="handleEndDateUpdate"
        @export="handleExport"
        class="mb-6"
      />
      <section
        v-if="hasPendingOnboardingActions"
        class="mb-6 rounded-2xl border border-border bg-card dashboard-card"
        aria-labelledby="dashboard-onboarding-title"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="dashboard-onboarding-title" class="text-base font-semibold text-foreground">
              Próximos passos do projeto
            </h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Você pode integrar agora ou continuar o assistente para revisar o que já está preenchido.
            </p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              @click="goToIntegrationsSetup"
            >
              Ir para integrações
            </Button>
            <Button
              type="button"
              @click="continueWithAssistant"
            >
              Continuar com assistente
            </Button>
          </div>
        </div>
      </section>

      <!-- Banner de erro global (Etapa 6): CTA "Tentar novamente" recarrega todo o dashboard -->
      <section
        v-if="dashboardStore.error && !dashboardStore.isLoading"
        class="mb-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        role="alert"
        aria-live="polite"
      >
        <p class="text-sm text-destructive font-medium">
          {{ dashboardStore.error }}
        </p>
        <Button
          type="button"
          variant="ghost"
          class="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          @click="dashboardStore.clearError(); dashboardStore.loadDashboardData(dashboardTimezone)"
        >
          {{ t('common.tryAgain') }}
        </Button>
      </section>

      <section class="mb-6 rounded-2xl border border-border bg-card dashboard-card" aria-labelledby="north-star-title">
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="north-star-title" class="text-lg font-semibold text-foreground">North Star</h2>
            <p class="text-sm text-muted-foreground">Métricas prioritárias para tomada de decisão</p>
          </div>
          <div class="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Configurar métricas North Star"
              @click="northStarConfigOpen = true"
            >
              <Settings2 class="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              :aria-expanded="showDetailedKpis"
              @click="showDetailedKpis = !showDetailedKpis"
            >
              {{ showDetailedKpis ? 'Ocultar métricas detalhadas' : 'Ver métricas detalhadas' }}
            </Button>
          </div>
        </div>

        <div class="summary-grid summary-grid--primary">
          <template v-if="isKpiLoading">
            <article
              v-for="i in 4"
              :key="'primary-skeleton-' + i"
              class="summary-card card-shadow rounded-2xl border border-slate-200 bg-white p-4 animate-pulse"
              aria-busy="true"
              :aria-label="'Carregando métrica principal ' + i"
            >
              <div class="h-4 w-24 bg-slate-200 rounded mb-3" />
              <div class="h-8 w-32 bg-slate-200 rounded mb-2" />
              <div class="h-3 w-full max-w-[140px] bg-slate-100 rounded" />
            </article>
          </template>
          <template v-else>
            <article
              v-for="card in primaryKpiCards"
              :key="card.id"
              class="summary-card card-shadow"
            >
              <header class="summary-card-header">
                <p class="summary-card-label">{{ card.label }}</p>
                <Badge
                  v-if="card.badgeValue"
                  variant="soft"
                  :color="getDeltaBadgeColor(card.badgeType)"
                  class="summary-card-badge"
                >
                  {{ card.badgeValue }}
                </Badge>
              </header>
              <p class="summary-card-value">{{ card.value }}</p>
              <p class="summary-card-caption">{{ card.caption }}</p>
            </article>
          </template>
        </div>

        <div v-if="showDetailedKpis" class="mt-4 border-t border-border pt-4">
          <template v-if="isKpiLoading">
            <div class="summary-grid">
              <article
                v-for="i in Math.max(detailedKpiCards.length, 4)"
                :key="'detailed-skeleton-' + i"
                class="summary-card card-shadow rounded-2xl border border-slate-200 bg-white p-4 animate-pulse"
                aria-busy="true"
                :aria-label="'Carregando métrica detalhada ' + i"
              >
                <div class="h-4 w-24 bg-slate-200 rounded mb-3" />
                <div class="h-8 w-32 bg-slate-200 rounded mb-2" />
                <div class="h-3 w-full max-w-[140px] bg-slate-100 rounded" />
              </article>
            </div>
          </template>
          <template v-else>
            <div class="summary-grid">
              <article
                v-for="card in detailedKpiCards"
                :key="card.id"
                class="summary-card card-shadow"
              >
                <header class="summary-card-header">
                  <p class="summary-card-label">{{ card.label }}</p>
                  <Badge
                    v-if="card.badgeValue"
                    variant="soft"
                    :color="getDeltaBadgeColor(card.badgeType)"
                    class="summary-card-badge"
                  >
                    {{ card.badgeValue }}
                  </Badge>
                </header>
                <p class="summary-card-value">{{ card.value }}</p>
                <p class="summary-card-caption">{{ card.caption }}</p>
              </article>
            </div>
          </template>
        </div>
      </section>

      <!-- Timeline + meta: loading quando isLoading e sem timeSeries (Etapa 6) -->
      <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] mb-6">
        <template v-if="dashboardStore.isLoading && dashboardStore.timeSeries.length === 0">
          <div
            class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px] animate-pulse"
            aria-busy="true"
            aria-label="Carregando gráfico de evolução"
          >
            <div class="h-4 w-40 bg-slate-200 rounded mb-4" />
            <div class="h-48 w-full max-w-md bg-slate-100 rounded-xl" />
          </div>
        </template>
        <template v-else-if="dashboardStore.timeSeriesError">
          <div
            class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px] border-destructive/30 bg-destructive/5"
            role="alert"
          >
            <p class="text-sm text-destructive mb-3">{{ dashboardStore.timeSeriesError }}</p>
            <Button
              type="button"
              variant="ghost"
              class="text-destructive hover:bg-destructive/10 hover:text-destructive"
              @click="dashboardStore.loadDashboardData(dashboardTimezone)"
            >
              {{ t('common.tryAgain') }}
            </Button>
          </div>
        </template>
        <template v-else>
          <TimelineChart
            :data="timelineData"
            :start-date="customStartDate"
            :end-date="customEndDate"
            :timezone="dashboardTimezone"
            @date-range-change="handleChartDateRangeChange"
            @drilldown="handleDrilldown"
          />
        </template>
        <RevenueGoalCard
          :contacts-count="dashboardStore.summary?.northStar?.contacts?.value ?? derivedContacts ?? 0"
          :sales-count="dashboardStore.summary?.northStar?.sales?.value || 0"
          :goal-percentage="goalPercentageValue"
          :delta-percentage="goalDeltaValue"
          :has-goal="hasRevenueGoal"
          :revenue-goal="revenueGoalValue || 0"
          :current-revenue="currentRevenue"
        />
      </section>

      <!-- Funil de conversão (dados reais: GET /dashboard/funnel-stats) -->
      <section class="flex flex-col gap-4 mb-6" aria-labelledby="funnel-heading">
        <div class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card overflow-hidden">
          <h2 id="funnel-heading" class="text-lg font-semibold text-slate-900">{{ t('dashboard.v2.funnelTitle') }}</h2>
          <p class="text-xs text-slate-500 mt-0.5">{{ t('dashboard.v2.funnelSubtitle') }}</p>

          <template v-if="dashboardStore.isLoading && funnelStatsForView.length === 0">
            <div class="mt-6 grid gap-3 text-xs text-slate-500 sm:grid-cols-3 sm:gap-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 animate-pulse">
                <div class="h-4 w-24 bg-slate-200 rounded" />
                <div class="h-6 w-32 bg-slate-200 rounded mt-2" />
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 animate-pulse">
                <div class="h-4 w-24 bg-slate-200 rounded" />
                <div class="h-6 w-32 bg-slate-200 rounded mt-2" />
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 animate-pulse sm:text-right">
                <div class="h-4 w-24 bg-slate-200 rounded ml-auto" />
                <div class="h-6 w-32 bg-slate-200 rounded mt-2 ml-auto" />
              </div>
            </div>
            <div class="funnel-chart mt-6 space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          </template>

          <template v-else-if="dashboardStore.funnelError">
            <div
              class="mt-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] rounded-2xl border border-destructive/30 bg-destructive/5"
              role="alert"
            >
              <p class="text-sm text-destructive text-center px-4">{{ dashboardStore.funnelError }}</p>
              <Button
                type="button"
                variant="ghost"
                class="mt-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                @click="dashboardStore.loadDashboardData(dashboardTimezone)"
            >
                {{ t('common.tryAgain') }}
              </Button>
            </div>
          </template>
          <template v-else-if="funnelStatsForView.length === 0">
            <div
              class="mt-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] rounded-2xl border border-slate-200 bg-slate-50/50"
              role="status"
              aria-label="Funil de conversão – sem dados"
            >
              <p class="text-sm text-slate-500 text-center px-4">
                {{ t('dashboard.v2.noFunnelData') }}
              </p>
              <p class="text-xs text-slate-400 text-center mt-1 px-4">
                {{ t('dashboard.v2.noFunnelDataHint') }}
              </p>
            </div>
          </template>

          <template v-else>
            <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="text-xs text-slate-500">
                <p class="font-semibold text-slate-900">{{ t('dashboard.v2.funnelTitle') }}</p>
                <p>{{ t('dashboard.v2.funnelSubtitle') }}</p>
              </div>
              <div class="text-right text-xs text-slate-500">
                <p class="font-semibold text-slate-900">{{ t('dashboard.v2.totalAnalyzed') }}</p>
                <p>{{ funnelTotalFormatted }}</p>
              </div>
            </div>
            <div class="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-3 sm:gap-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p class="font-semibold uppercase tracking-[0.08em] text-slate-400">{{ t('dashboard.v2.funnelEntry') }}</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ funnelEntradaFormatted }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p class="font-semibold uppercase tracking-[0.08em] text-slate-400">{{ t('dashboard.v2.avgAdvance') }}</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ funnelAvancoMedioFormatted }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-1 sm:text-right">
                <p class="font-semibold uppercase tracking-[0.08em] text-slate-400">{{ t('dashboard.v2.finalConversion') }}</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ funnelConversaoFinalFormatted }}</p>
              </div>
            </div>
            <ConversionFunnelChart
              :stages="funnelStatsForView"
              :total-contacts="dashboardStore.funnelTotalContacts || 0"
            />
          </template>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2 mb-6">
        <template v-if="dashboardStore.originsPerformanceLoading">
          <div
            class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]"
            aria-busy="true"
            aria-label="Carregando vendas por origem"
          >
            <p class="text-sm text-slate-500">{{ t('common.loading') }}</p>
          </div>
          <div
            class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]"
            aria-busy="true"
            aria-label="Carregando receita por origem"
          >
            <p class="text-sm text-slate-500">{{ t('common.loading') }}</p>
          </div>
        </template>
        <template v-else>
          <ChannelDonutChart
            v-if="salesByChannel.length > 0"
            :title="t('dashboard.v2.salesByOriginTitle')"
            :subtitle="t('dashboard.v2.salesByOriginSubtitle')"
            :total-label="t('dashboard.v2.totalSales')"
            :total-value="totalSalesForDonut"
            :channels="salesByChannel"
            @channel-click="handleChannelClick"
          />
          <div
            v-else
            class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card flex flex-col items-center justify-center min-h-[200px]"
            aria-label="Vendas por origem – sem dados"
          >
            <p class="text-sm text-slate-500 text-center">
              {{ t('dashboard.v2.noOriginData') }}
            </p>
            <p class="text-xs text-slate-400 text-center mt-1">
              {{ t('dashboard.v2.noOriginDataSalesHint') }}
            </p>
          </div>
          <ChannelDonutChart
            v-if="revenueByChannel.length > 0"
            :title="t('dashboard.v2.revenueByOriginTitle')"
            :subtitle="t('dashboard.v2.revenueByOriginSubtitle')"
            :total-label="t('dashboard.v2.totalRevenue')"
            :total-value="totalRevenueForDonut"
            :channels="revenueByChannel"
            @channel-click="handleChannelClick"
          />
          <div
            v-else
            class="card-shadow rounded-3xl border border-slate-200 bg-white dashboard-card flex flex-col items-center justify-center min-h-[200px]"
            aria-label="Receita por origem – sem dados"
          >
            <p class="text-sm text-slate-500 text-center">
              {{ t('dashboard.v2.noOriginData') }}
            </p>
            <p class="text-xs text-slate-400 text-center mt-1">
              {{ t('dashboard.v2.noOriginDataRevenueHint') }}
            </p>
          </div>
        </template>
      </section>

      <!-- Origins Performance Table -->
      <section class="mb-6">
        <OriginsPerformanceTable />
      </section>

    <!-- Drill-down Drawer (G5.5) -->
    <NorthStarConfigDrawer
      :open="northStarConfigOpen"
      :base-metrics="baseMetricOptions"
      :current-config="dashboardStore.northStarConfig"
      :stages="stageOptions"
      :saving="northStarConfigSaving"
      @update:open="northStarConfigOpen = $event"
      @save="handleSaveNorthStarConfig"
    />

    <EntityListDrawer
      :open="drilldownOpen"
      :title="drilldownTitle"
      :entities="drilldownEntities"
      :loading="drilldownLoading"
      @update:open="drilldownOpen = $event"
      @entity-click="handleEntityClick"
    />

    <!-- Contact Details Drawer (navegação drill-down) -->
    <ContactDetailsDrawer
      :open="showContactDetails"
      :contact="selectedContactForDetails"
      @update:open="showContactDetails = $event"
    />

    <!-- Sale Details Drawer (navegação drill-down) -->
    <SaleDetailsDrawer
      :open="showSaleDetails"
      :sale="selectedSaleForDetails"
      @update:open="showSaleDetails = $event"
    />
  </AppShell>
</template>

<style scoped>
/* Token-based card styling */
.dashboard-card {
  padding: var(--sym-space-4) !important;
}

@media (min-width: 640px) {
  .dashboard-card {
    padding: var(--sym-space-6) !important;
  }
}
/* Seção de comparação de períodos */
.comparison-section {
  margin-top: 0.5rem;
}

/* Força o main do dashboard a ocupar toda largura disponível */
main.dashboard-wide {
  max-width: none !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important; /* Evita scrollbar horizontal por arredondamentos */
}

@media (min-width: 640px) {
  main.dashboard-wide {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
}

@media (min-width: 1024px) {
  main.dashboard-wide {
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }
}

/* 
  ╔═══════════════════════════════════════════════════════════════════════╗
  ║  ALGORITMO FLEXBOX RESPONSIVO SEM BURACOS                             ║
  ║  Cards sempre preenchem 100% da largura, mesmo na última linha        ║
  ╚═══════════════════════════════════════════════════════════════════════╝
  
  Problema resolvido: Com CSS Grid + auto-fit, a última linha deixa espaço
  vazio quando o número de cards não fecha as colunas perfeitamente.
  
  Solução: Flexbox com wrap + flex-grow. Os cards se esticam para preencher
  toda a largura disponível, eliminando completamente os "buracos".
  
  Comportamento:
  - Cards têm largura base (flex-basis) que varia por breakpoint
  - flex-grow: 1 permite que cresçam para ocupar espaço restante
  - flex-shrink: 1 permite encolher se necessário
  - Última linha sempre preenche 100% da largura
  - Funciona com 1..N cards sem ajustes no CSS
*/

.summary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.summary-grid--primary .summary-card {
  flex: 1 1 240px;
}

/* Regra base: Mobile – 1 card por linha (280px mínimo, cresce até 100%) */
.summary-card {
  flex: 1 1 100%;
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 136px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.625rem;
}

/* ─── Breakpoints Flexbox Responsivo ─────────────────────────────────────── */

/* 640px+: tablets – 2-3 cards por linha (280px base → ~2 em 768px) */
@media (min-width: 640px) {
  .summary-grid {
    gap: 1.25rem;
  }

  .summary-card {
    flex: 1 1 280px;
    padding: 1.5rem 1.5rem;
    min-height: 160px;
  }
}

/* 768px+: tablets grandes – 3-4 cards por linha (240px base → ~3 em 1024px) */
@media (min-width: 768px) {
  .summary-card {
    flex: 1 1 240px;
  }
}

/* 1024px+: desktop pequeno – ~4 cards por linha (230px base → ~4 em 1280px) */
@media (min-width: 1024px) {
  .summary-card {
    flex: 1 1 230px;
    padding: 2rem 2rem;
    min-height: 170px;
  }
}

/* 1280px+: desktop médio/grande – 4-5 cards por linha (240px base → 4-5 em 1440px, ~5 em 1920px) */
@media (min-width: 1280px) {
  .summary-card {
    flex: 1 1 240px;
  }
}

/* 
  ℹ️  Como funciona:
  - flex-basis define a largura "preferida" do card
  - flex-grow: 1 permite crescer para preencher espaço sobrando
  - flex-shrink: 1 permite encolher se necessário
  - Resultado: última linha SEMPRE preenche 100%, sem buracos
  - Com 14 cards em 1920px (viewport real ~1400px):
    * 5 cards/linha → linhas 1-2: 5 cards (~260px cada)
    * linha 3: 4 cards (~350px cada, esticados para preencher)
*/

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.summary-card:active {
  transform: translateY(0);
}

.card-shadow {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.summary-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.summary-card-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.4;
  max-width: none;
}

@media (min-width: 640px) {
  .summary-card-label {
    font-size: 0.9375rem;
  }
}

@media (min-width: 1024px) {
  .summary-card-label {
    font-size: 1rem;
  }
}

.summary-card-badge {
  font-size: 0.6875rem;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .summary-card-badge {
    font-size: 0.75rem;
  }
}

.summary-card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  margin: 0.5rem 0;
}

@media (min-width: 640px) {
  .summary-card-value {
    font-size: 1.875rem;
    margin: 0.625rem 0;
  }
}

@media (min-width: 1024px) {
  .summary-card-value {
    font-size: 2rem;
    margin: 0.75rem 0;
  }
}

.summary-card-caption {
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.5;
}

@media (min-width: 640px) {
  .summary-card-caption {
    font-size: 0.8125rem;
  }
}

@media (min-width: 1024px) {
  .summary-card-caption {
    font-size: 0.875rem;
  }
}

</style>

