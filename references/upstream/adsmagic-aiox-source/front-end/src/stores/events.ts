/**
 * Events Store
 *
 * Gerencia eventos de rastreamento e conversão.
 * Eventos são disparados quando contatos avançam nas etapas do funil
 * e são enviados para plataformas de ads (Google Ads, Meta Ads, etc.).
 *
 * Funcionalidades:
 * - Lista de eventos disparados
 * - Filtragem por tipo, status, plataforma
 * - Reprocessamento de eventos falhados
 * - Estatísticas de eventos (total, sucesso, falhas)
 * - Integração com etapas (cada evento está vinculado a uma mudança de etapa)
 *
 * @module stores/events
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { Event, EventFilters } from '@/types'
import { eventsService } from '@/services/api/events'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useEventsStore = defineStore('events', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de eventos (página atual)
   */
  const events = ref<Event[]>([])

  /**
   * Evento selecionado para visualização/detalhes
   */
  const selectedEvent = ref<Event | null>(null)

  /**
   * Indica se está carregando dados
   */
  const isLoading = ref(false)

  /**
   * Mensagem de erro, se houver
   */
  const error = ref<string | null>(null)

  /**
   * Filtros aplicados
   */
  const filters = ref<EventFilters>({
    page: 1,
    pageSize: 10
  })

  /**
   * Informações de paginação
   */
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // ========================================================================
  // MULTI-TENANCY: Watch for project changes
  // ========================================================================

  // Obter ref reativo do projeto atual
  const { currentProjectId } = useCurrentProjectId()

  /**
   * Watch for project changes to clear data and reload
   * This ensures data isolation between projects
   */
  watch(
    currentProjectId,
    (newProjectId, oldProjectId) => {
      // Only clear if project actually changed
      if (newProjectId !== oldProjectId) {

        // Clear all data
        events.value = []
        selectedEvent.value = null
        error.value = null

        // Reset pagination
        pagination.value = {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0
        }

        // Reset filters
        filters.value = {
          page: 1,
          pageSize: 10
        }

        // Data will be fetched on demand when the view mounts
      }
    },
    { immediate: false }
  )

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Retorna apenas eventos com sucesso
   */
  const successfulEvents = computed(() => {
    return events.value.filter((event) => event.status === 'sent')
  })

  /**
   * Retorna apenas eventos falhados
   */
  const failedEvents = computed(() => {
    return events.value.filter((event) => event.status === 'failed' || event.status === 'cancelled')
  })

  /**
   * Retorna apenas eventos pendentes
   */
  const pendingEvents = computed(() => {
    return events.value.filter((event) => event.status === 'pending')
  })

  /**
   * Retorna eventos agrupados por plataforma
   * Formato: { [platform]: Event[] }
   */
  const eventsByPlatform = computed(() => {
    const grouped: Record<string, Event[]> = {
      google_ads: [],
      meta_ads: [],
      tiktok_ads: [],
      linkedin_ads: [],
      webhook: []
    }

    events.value.forEach((event) => {
      const platform = event.platform
      if (platform && grouped[platform]) {
        grouped[platform].push(event)
      }
    })

    return grouped
  })

  /**
   * Retorna eventos agrupados por tipo
   * Formato: { [eventName]: Event[] }
   */
  const eventsByType = computed(() => {
    const grouped: Record<string, Event[]> = {}

    events.value.forEach((event) => {
      const eventName = event.eventName
      if (eventName) {
        if (!grouped[eventName]) {
          grouped[eventName] = []
        }
        grouped[eventName].push(event)
      }
    })

    return grouped
  })

  /**
   * Retorna o total de eventos (considerando filtros)
   */
  const totalEvents = computed(() => pagination.value.total)

  /**
   * Retorna taxa de sucesso (%)
   */
  const successRate = computed(() => {
    if (events.value.length === 0) return 0
    return (successfulEvents.value.length / events.value.length) * 100
  })

  /**
   * Retorna taxa de falha (%)
   */
  const failureRate = computed(() => {
    if (events.value.length === 0) return 0
    return (failedEvents.value.length / events.value.length) * 100
  })

  /**
   * Retorna contagem de eventos por status
   */
  const eventCountByStatus = computed(() => {
    return {
      success: successfulEvents.value.length,
      failed: failedEvents.value.length,
      pending: pendingEvents.value.length
    }
  })

  /**
   * Retorna contagem de eventos por plataforma
   */
  const eventCountByPlatform = computed(() => {
    const counts: Record<string, number> = {
      google_ads: 0,
      meta_ads: 0,
      tiktok_ads: 0,
      linkedin_ads: 0,
      webhook: 0
    }

    events.value.forEach((event) => {
      const platform = event.platform
      if (platform && counts[platform] !== undefined) {
        counts[platform]++
      }
    })

    return counts
  })

  /**
   * Verifica se há filtros aplicados
   */
  const hasFilters = computed(() => {
    return !!(
      (filters.value.platforms && filters.value.platforms.length > 0) ||
      (filters.value.statuses && filters.value.statuses.length > 0) ||
      filters.value.eventName ||
      filters.value.contactId ||
      filters.value.dateFrom ||
      filters.value.dateTo
    )
  })

  /**
   * Retorna a página atual
   */
  const currentPage = computed(() => pagination.value.page)

  /**
   * Retorna o número total de páginas
   */
  const totalPages = computed(() => pagination.value.totalPages)

  /**
   * Verifica se há página anterior
   */
  const hasPreviousPage = computed(() => pagination.value.page > 1)

  /**
   * Verifica se há próxima página
   */
  const hasNextPage = computed(() => pagination.value.page < pagination.value.totalPages)

  // ========================================================================
  // ALERTAS DE FALHAS (G8.6)
  // ========================================================================

  /**
   * Threshold para considerar taxa de falha como warning (%)
   */
  const FAILURE_WARNING_THRESHOLD = 10

  /**
   * Threshold para considerar taxa de falha como crítica (%)
   */
  const FAILURE_CRITICAL_THRESHOLD = 30

  /**
   * Mínimo de eventos para considerar alerta válido
   */
  const MIN_EVENTS_FOR_ALERT = 5

  /**
   * Retorna plataformas com falhas
   */
  const failedPlatforms = computed(() => {
    const platforms = new Set<string>()
    failedEvents.value.forEach(event => {
      if (event.platform) {
        platforms.add(event.platform)
      }
    })
    return Array.from(platforms)
  })

  /**
   * Retorna a data/hora da última falha
   */
  const lastFailureTime = computed(() => {
    if (failedEvents.value.length === 0) return null

    // Ordena por data mais recente
    const sorted = [...failedEvents.value].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return sorted[0]?.createdAt ? new Date(sorted[0].createdAt) : null
  })

  /**
   * Detecta se há alerta de falhas em massa
   * Retorna null se não há alerta, ou objeto com detalhes do alerta
   */
  const failureAlert = computed<{
    severity: 'warning' | 'critical'
    failedCount: number
    totalCount: number
    failureRate: number
    affectedPlatforms: string[]
    lastFailureTime: Date | null
    trend: 'increasing' | 'stable' | 'decreasing'
  } | null>(() => {
    const total = events.value.length
    const failed = failedEvents.value.length

    // Não mostra alerta se não há eventos suficientes
    if (total < MIN_EVENTS_FOR_ALERT) return null

    const rate = (failed / total) * 100

    // Não mostra alerta se taxa está abaixo do threshold
    if (rate < FAILURE_WARNING_THRESHOLD) return null

    // Determina severidade
    const severity: 'warning' | 'critical' = rate >= FAILURE_CRITICAL_THRESHOLD ? 'critical' : 'warning'

    // Determina tendência (mock - em produção seria baseado em histórico)
    // Por enquanto, assume estável
    const trend: 'increasing' | 'stable' | 'decreasing' = rate >= FAILURE_CRITICAL_THRESHOLD ? 'increasing' : 'stable'

    return {
      severity,
      failedCount: failed,
      totalCount: total,
      failureRate: rate,
      affectedPlatforms: failedPlatforms.value,
      lastFailureTime: lastFailureTime.value,
      trend
    }
  })

  /**
   * Verifica se há alerta ativo
   */
  const hasFailureAlert = computed(() => failureAlert.value !== null)

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Busca eventos com filtros e paginação
   *
   * @param newFilters - Filtros opcionais (usa state.filters se não informado)
   */
  const fetchEvents = async (newFilters?: EventFilters): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Atualiza filtros se fornecido
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      // Inclui project_id nos filtros para garantir isolamento multi-tenant
      const filtersWithProject = {
        ...filters.value,
        ...(currentProjectId.value ? { project_id: currentProjectId.value } : {})
      }

      // Chama o serviço de eventos (que pode usar mocks ou API real)
      // O serviço garante que sempre retorna estrutura válida (SRP: validação no serviço)
      const result = await eventsService.getAll(filtersWithProject)

      // Store apenas gerencia estado, não valida dados (SRP)
      events.value = result.data
      pagination.value = result.pagination

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos'
      error.value = errorMessage
      console.error('[Events Store] Error fetching events:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Busca e seleciona um evento por ID
   *
   * @param id - ID do evento
   */
  const selectEvent = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock: busca na lista local
      // API real: const result = await getEventById(id)
      const event = events.value.find((e) => e.id === id)

      selectedEvent.value = event || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar evento'
      error.value = errorMessage
      console.error('[Events Store] Error selecting event:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reenvia um evento falhado para a plataforma
   *
   * @param id - ID do evento
   * @returns O evento atualizado
   */
  const retryEvent = async (id: string): Promise<Event> => {
    isLoading.value = true
    error.value = null

    try {
      const index = events.value.findIndex((e) => e.id === id)

      if (index === -1) {
        throw new Error('Evento não encontrado')
      }

      const event = events.value[index]
      if (!event) {
        throw new Error('Evento não encontrado')
      }

      if (event.status !== 'failed' && event.status !== 'cancelled') {
        throw new Error('Apenas eventos falhados ou cancelados podem ser reenviados')
      }

      const updated = await eventsService.retry(id)

      events.value[index] = updated

      // Atualiza evento selecionado se for o mesmo
      if (selectedEvent.value?.id === id) {
        selectedEvent.value = updated
      }

      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reenviar evento'
      error.value = errorMessage
      console.error('[Events Store] Error retrying event:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reenvia todos os eventos falhados
   *
   * @returns Array de eventos atualizados
   */
  const retryAllFailed = async (): Promise<Event[]> => {
    isLoading.value = true
    error.value = null

    try {
      const failedIds = failedEvents.value.map((e) => e.id)

      if (failedIds.length === 0) {
        return []
      }

      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 800))

      const updated: Event[] = []

      for (const id of failedIds) {
        try {
          const result = await retryEvent(id)
          updated.push(result)
        } catch (err) {
          console.error('[Events Store] Error retrying event', id, err)
        }
      }

      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reenviar eventos'
      error.value = errorMessage
      console.error('[Events Store] Error retrying all failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Define filtros e busca eventos
   *
   * @param newFilters - Novos filtros a aplicar
   */
  const setFilters = async (newFilters: EventFilters): Promise<void> => {
    // Reset para primeira página ao mudar filtros
    filters.value = {
      ...newFilters,
      page: 1
    }

    await fetchEvents()
  }

  /**
   * Limpa todos os filtros e busca eventos
   */
  const clearFilters = async (): Promise<void> => {
    filters.value = {
      page: 1,
      pageSize: filters.value.pageSize || 10
    }

    await fetchEvents()
  }

  /**
   * Define o evento selecionado (sem fetch)
   *
   * @param event - Evento a selecionar (ou null para limpar)
   */
  const setSelectedEvent = (event: Event | null): void => {
    selectedEvent.value = event
  }

  /**
   * Vai para a próxima página
   */
  const nextPage = async (): Promise<void> => {
    filters.value.page = (filters.value.page || 1) + 1
    await fetchEvents()
  }

  /**
   * Vai para a página anterior
   */
  const previousPage = async (): Promise<void> => {
    filters.value.page = Math.max((filters.value.page || 1) - 1, 1)
    await fetchEvents()
  }

  /**
   * Vai para uma página específica
   *
   * @param page - Número da página (1-indexed)
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page >= 1) {
      filters.value.page = page
      await fetchEvents()
    }
  }

  /**
   * Limpa o estado de erro
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Recarrega a página atual de eventos
   */
  const refresh = async (): Promise<void> => {
    await fetchEvents()
  }

  // ========================================================================
  // RETURN (API pública da store)
  // ========================================================================

  return {
    // State (readonly para prevenir mutações diretas)
    events: readonly(events),
    selectedEvent: readonly(selectedEvent),
    isLoading: readonly(isLoading),
    error: readonly(error),
    filters: readonly(filters),
    pagination: readonly(pagination),

    // Getters
    successfulEvents,
    failedEvents,
    pendingEvents,
    eventsByPlatform,
    eventsByType,
    totalEvents,
    successRate,
    failureRate,
    eventCountByStatus,
    eventCountByPlatform,
    hasFilters,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    // Alertas de falhas (G8.6)
    failureAlert,
    hasFailureAlert,
    failedPlatforms,
    lastFailureTime,

    // Actions - Consultas
    fetchEvents,
    selectEvent,

    // Actions - Reenvio
    retryEvent,
    retryAllFailed,

    // Actions - Filtros e navegação
    setFilters,
    clearFilters,
    setSelectedEvent,
    nextPage,
    previousPage,
    goToPage,

    // Actions - Utilitários
    clearError,
    refresh
  }
})
