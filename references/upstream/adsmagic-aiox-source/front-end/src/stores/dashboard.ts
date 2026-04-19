/**
 * Dashboard Store
 *
 * Gerencia métricas agregadas e estatísticas do dashboard.
 * Consolida dados de contatos, vendas, origens e etapas para
 * fornecer insights de conversão e performance.
 *
 * Funcionalidades:
 * - Métricas principais (total de contatos, vendas, receita)
 * - Taxa de conversão por origem
 * - Distribuição de contatos por etapa
 * - Histórico de performance (diário, semanal, mensal)
 * - Comparação de períodos
 *
 * @module stores/dashboard
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { DashboardMetrics, TimeSeriesData, OriginPerformance, StageFunnelMetrics } from '@/types'
import { dashboardService } from '@/services/api/dashboard'
import { MOCK_CONTACTS } from '@/mocks/contacts'
import { MOCK_ORIGINS } from '@/mocks/origins'
import { MOCK_STAGES } from '@/mocks/stages'

export const useDashboardStore = defineStore('dashboard', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Métricas do dashboard
   */
  const metrics = ref<DashboardMetrics | null>(null)

  /**
   * Indica se está carregando dados
   */
  const isLoading = ref(false)

  /**
   * Mensagem de erro, se houver
   */
  const error = ref<string | null>(null)

  /**
   * Período selecionado para análise
   * Valores: '7d' | '30d' | '90d' | 'all'
   */
  const selectedPeriod = ref<'7d' | '30d' | '90d' | 'all'>('30d')

  /**
   * Dados da série temporal (evolução ao longo do tempo)
   */
  const timeSeriesData = ref<TimeSeriesData[]>([])

  /**
   * Performance por origem
   */
  const originPerformanceData = ref<OriginPerformance[]>([])

  // ========================================================================
  // MULTI-TENANCY: Watch for project changes
  // ========================================================================

  /**
   * Watch for project changes to clear data and reload
   * This ensures data isolation between projects
   */
  watch(
    () => {
      // Get current project ID from localStorage (set by projects store)
      return localStorage.getItem('current_project_id')
    },
    (newProjectId, oldProjectId) => {
      // Only clear if project actually changed
      if (newProjectId !== oldProjectId) {
        
        // Clear all data
        metrics.value = null
        timeSeriesData.value = []
        originPerformanceData.value = []
        error.value = null
        
        // Reset period
        selectedPeriod.value = '30d'
        
        // Reload data for new project if project exists
        if (newProjectId) {
          fetchMetrics()
        }
      }
    },
    { immediate: false }
  )

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Retorna o total de contatos
   */
  const totalContacts = computed(() => metrics.value?.totalContacts || 0)

  /**
   * Retorna o total de vendas confirmadas
   */
  const totalSales = computed(() => metrics.value?.totalSales || 0)

  /**
   * Retorna a receita total
   */
  const totalRevenue = computed(() => metrics.value?.totalRevenue || 0)

  /**
   * Retorna a taxa de conversão geral (%)
   */
  const conversionRate = computed(() => metrics.value?.conversionRate || 0)

  /**
   * Retorna o ticket médio
   */
  const averageTicket = computed(() => metrics.value?.averageTicket || 0)

  /**
   * Retorna a origem com melhor performance (maior taxa de conversão)
   */
  const bestOrigin = computed(() => {
    if (originPerformanceData.value.length === 0) return null

    return originPerformanceData.value.reduce((best, current) => {
      return current.conversionRate > best.conversionRate ? current : best
    })
  })

  /**
   * Retorna a origem com pior performance (menor taxa de conversão)
   */
  const worstOrigin = computed(() => {
    if (originPerformanceData.value.length === 0) return null

    return originPerformanceData.value.reduce((worst, current) => {
      return current.conversionRate < worst.conversionRate ? current : worst
    })
  })

  /**
   * Retorna distribuição de contatos por etapa
   */
  const contactsByStage = computed(() => {
    if (!metrics.value) return []

    return MOCK_STAGES.map((stage) => {
      const count = MOCK_CONTACTS.filter((c) => c.stage === stage.id).length
      return {
        stageId: stage.id,
        stageName: stage.name,
        count,
        percentage: totalContacts.value > 0 ? (count / totalContacts.value) * 100 : 0
      }
    })
  })

  /**
   * Retorna métricas do funil de conversão por etapas
   * Calcula contagem, percentuais e taxas de conversão entre etapas
   */
  const stageFunnelMetrics = computed((): StageFunnelMetrics[] => {
    if (!metrics.value || MOCK_CONTACTS.length === 0) return []

    // Pega apenas stages do Kanban (exclui "lost")
    const kanbanStages = MOCK_STAGES
      .filter(stage => stage.type !== 'lost' && stage.isActive)
      .sort((a, b) => a.order - b.order)

    let previousCount = 0
    
    return kanbanStages.map((stage, index) => {
      const count = MOCK_CONTACTS.filter(c => c.stage === stage.id).length
      const percentage = totalContacts.value > 0 
        ? (count / totalContacts.value) * 100 
        : 0
      
      // Taxa de conversão: quantos % da etapa anterior chegaram aqui
      const conversionRate = index === 0 
        ? 100 // Primeira etapa = 100%
        : previousCount > 0 
          ? (count / previousCount) * 100 
          : 0
      
      const dropOffRate = 100 - conversionRate
      
      previousCount = count
      
      return {
        stageId: stage.id,
        stageName: stage.name,
        count,
        percentage,
        conversionRate,
        dropOffRate
      }
    })
  })

  /**
   * Retorna o crescimento de contatos (comparado ao período anterior)
   */
  const contactsGrowth = computed(() => metrics.value?.contactsGrowth || 0)

  /**
   * Retorna o crescimento de vendas (comparado ao período anterior)
   */
  const salesGrowth = computed(() => metrics.value?.salesGrowth || 0)

  /**
   * Retorna o crescimento de receita (comparado ao período anterior)
   */
  const revenueGrowth = computed(() => metrics.value?.revenueGrowth || 0)

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Busca métricas do dashboard
   *
   * @param period - Período de análise (7d, 30d, 90d, all)
   */
  const fetchMetrics = async (period?: '7d' | '30d' | '90d' | 'all'): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Atualiza período selecionado
      if (period) {
        selectedPeriod.value = period
      }

      // Usar dashboardService que já filtra por projectId automaticamente
      const [metricsData, timeSeriesResult, originPerformanceResult] = await Promise.all([
        dashboardService.getMetrics(selectedPeriod.value),
        dashboardService.getTimeSeries(selectedPeriod.value),
        dashboardService.getOriginPerformance(selectedPeriod.value),
      ])

      metrics.value = metricsData
      timeSeriesData.value = timeSeriesResult
      originPerformanceData.value = originPerformanceResult

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar métricas'
      error.value = errorMessage
      console.error('[Dashboard Store] Error fetching metrics:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Busca dados de série temporal (evolução ao longo do tempo)
   *
   * Retorna contatos e vendas agrupados por dia/semana/mês
   */
  const fetchTimeSeriesData = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Mock: gera série temporal fictícia
      // API real: const result = await getTimeSeriesData(selectedPeriod.value)

      const mockTimeSeries: TimeSeriesData[] = []
      const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : 90

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const dateStr = date.toISOString().split('T')[0] ?? date.toISOString().substring(0, 10)
        mockTimeSeries.push({
          date: dateStr,
          contacts: Math.floor(Math.random() * 20) + 5,
          sales: Math.floor(Math.random() * 5),
          revenue: Math.floor(Math.random() * 10000) + 2000
        })
      }

      timeSeriesData.value = mockTimeSeries

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar série temporal'
      error.value = errorMessage
      console.error('[Dashboard Store] Error fetching time series:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Busca performance por origem
   *
   * Retorna métricas de cada origem (contatos, vendas, taxa de conversão)
   */
  const fetchOriginPerformance = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Mock: calcula performance por origem
      // API real: const result = await getOriginPerformance(selectedPeriod.value)

      const performance: OriginPerformance[] = MOCK_ORIGINS.filter((o) => o.isActive).map(
        (origin) => {
          const originContacts = MOCK_CONTACTS.filter((c) => c.origin === origin.id)
          const originSales = originContacts.filter((c) => c.stage === 'stage-sale')

          const contacts = originContacts.length
          const sales = originSales.length
          const conversionRate = contacts > 0 ? (sales / contacts) * 100 : 0
          const revenue = sales * 1500 // Mock
          const investment = contacts * 10 // Mock investment
          const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0
          const costPerSale = sales > 0 ? investment / sales : 0
          const costPerContact = contacts > 0 ? investment / contacts : 0

          return {
            origin: origin.name,
            investment,
            contacts,
            sales,
            revenue,
            conversionRate,
            roi,
            costPerSale,
            costPerContact
          }
        }
      )

      // Ordena por taxa de conversão (melhor primeiro)
      performance.sort((a, b) => b.conversionRate - a.conversionRate)

      originPerformanceData.value = performance

    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao buscar performance por origem'
      error.value = errorMessage
      console.error('[Dashboard Store] Error fetching origin performance:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza o período selecionado e recarrega dados
   *
   * @param period - Novo período
   */
  const setPeriod = async (period: '7d' | '30d' | '90d' | 'all'): Promise<void> => {
    selectedPeriod.value = period
    await Promise.all([fetchMetrics(), fetchTimeSeriesData(), fetchOriginPerformance()])
  }

  /**
   * Recarrega todos os dados do dashboard
   */
  const refresh = async (): Promise<void> => {
    await Promise.all([fetchMetrics(), fetchTimeSeriesData(), fetchOriginPerformance()])
  }

  /**
   * Limpa o estado de erro
   */
  const clearError = (): void => {
    error.value = null
  }

  // ========================================================================
  // RETURN (API pública da store)
  // ========================================================================

  return {
    // State (readonly para prevenir mutações diretas)
    metrics: readonly(metrics),
    isLoading: readonly(isLoading),
    error: readonly(error),
    selectedPeriod: readonly(selectedPeriod),
    timeSeriesData: readonly(timeSeriesData),
    originPerformanceData: readonly(originPerformanceData),

    // Getters
    totalContacts,
    totalSales,
    totalRevenue,
    conversionRate,
    averageTicket,
    bestOrigin,
    worstOrigin,
    contactsByStage,
    stageFunnelMetrics,
    contactsGrowth,
    salesGrowth,
    revenueGrowth,

    // Actions
    fetchMetrics,
    fetchTimeSeriesData,
    fetchOriginPerformance,
    setPeriod,
    refresh,
    clearError
  }
})
