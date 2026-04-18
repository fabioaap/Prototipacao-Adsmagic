/**
 * Sales Store
 *
 * Gerencia o estado das vendas e conversões.
 * Trabalha em conjunto com o store de contatos.
 *
 * Funcionalidades:
 * - Lista de vendas com filtros
 * - Criação de vendas (conversão de contatos)
 * - Marcação de vendas como perdidas
 * - Métricas de vendas (total, taxa de conversão)
 * - Agrupamento por origem para análise
 *
 * @module stores/sales
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { Sale, CreateSaleDTO, MarkSaleLostDTO, SaleFilters } from '@/types'

// Importa service para buscar vendas
import { salesService } from '@/services/api/sales'
import { useOriginsStore } from './origins'
import { useContactsStore } from './contacts'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useSalesStore = defineStore('sales', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de vendas (página atual)
   */
  const sales = ref<Sale[]>([])

  /**
   * Venda selecionada para visualização/edição
   */
  const selectedSale = ref<Sale | null>(null)

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
  const filters = ref<SaleFilters>({
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
  const contactsStoreForMetrics = useContactsStore()

  /**
   * Watch for project changes to clear data and reload
   * This ensures data isolation between projects
   */
  watch(
    currentProjectId,
    (newProjectId, oldProjectId) => {
      // Only clear if project actually changed
      if (newProjectId !== oldProjectId) {
        console.log('[Sales Store] Project changed, clearing data:', { oldProjectId, newProjectId })

        // Clear all data
        sales.value = []
        selectedSale.value = null
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

        // Reload data for new project if project exists
        if (newProjectId) {
          console.log('[Sales Store] Loading data for new project:', newProjectId)
          fetchSales()
        }
      }
    },
    { immediate: false }
  )

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Retorna apenas vendas confirmadas (não perdidas)
   */
  const confirmedSales = computed(() => {
    return sales.value.filter((sale) => sale.status === 'completed')
  })

  /**
   * Retorna apenas vendas perdidas
   */
  const lostSales = computed(() => {
    return sales.value.filter((sale) => sale.status === 'lost')
  })

  /**
   * Retorna vendas agrupadas por origem
   * Formato: { [originId]: Sale[] }
   */
  const salesByOrigin = computed(() => {
    const grouped: Record<string, Sale[]> = {}

    sales.value.forEach((sale) => {
      // Use origin field from sale (not contactOrigin which doesn't exist)
      const origin = sale.origin || 'unknown'
      if (!grouped[origin]) {
        grouped[origin] = []
      }
      grouped[origin].push(sale)
    })

    return grouped
  })

  /**
   * Retorna o valor total de vendas confirmadas
   */
  const totalRevenue = computed(() => {
    return confirmedSales.value.reduce((sum, sale) => sum + sale.value, 0)
  })

  /**
   * Retorna o número total de vendas confirmadas
   */
  const totalConfirmedSales = computed(() => confirmedSales.value.length)

  /**
   * Retorna o número total de vendas perdidas
   */
  const totalLostSales = computed(() => lostSales.value.length)

  /**
   * Retorna o ticket médio (valor médio por venda confirmada)
   */
  const averageTicket = computed(() => {
    const confirmed = confirmedSales.value
    if (confirmed.length === 0) return 0
    return totalRevenue.value / confirmed.length
  })

  /**
   * Retorna a taxa de conversão (vendas / total de contatos)
   * NOTA: Em produção, isso virá da API ou do dashboard store
   */
  const conversionRate = computed(() => {
    const totalContacts = contactsStoreForMetrics.totalContacts
    if (totalContacts === 0) return 0
    return (totalConfirmedSales.value / totalContacts) * 100
  })

  /**
   * Retorna número total de vendas (considerando filtros)
   */
  const totalSales = computed(() => pagination.value.total)

  /**
   * Verifica se há filtros aplicados
   */
  const hasFilters = computed(() => {
    return !!(
      (filters.value.origins && filters.value.origins.length > 0) ||
      filters.value.dateFrom ||
      filters.value.dateTo ||
      filters.value.minValue !== undefined ||
      filters.value.maxValue !== undefined
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
  // ACTIONS
  // ========================================================================

  /**
   * Busca vendas com filtros e paginação
   *
   * @param newFilters - Filtros opcionais (usa state.filters se não informado)
   */
  const fetchSales = async (newFilters?: SaleFilters): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Atualiza filtros se fornecido
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      // Usa salesService que gerencia mock/API automaticamente
      const result = await salesService.getAll(filters.value)

      sales.value = result.data
      pagination.value = result.pagination

      console.log(
        '[Sales Store] Fetched',
        result.data.length,
        'sales (page',
        result.pagination.page,
        'of',
        result.pagination.totalPages,
        ')'
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar vendas'
      error.value = errorMessage
      console.error('[Sales Store] Error fetching sales:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Busca e seleciona uma venda por ID
   *
   * @param id - ID da venda
   */
  const selectSale = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock: busca na lista local
      // API real: const result = await getSaleById(id)
      const sale = sales.value.find((s) => s.id === id)

      selectedSale.value = sale || null
      console.log('[Sales Store] Selected sale:', sale?.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar venda'
      error.value = errorMessage
      console.error('[Sales Store] Error selecting sale:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cria uma nova venda (conversão de contato)
   *
   * @param data - Dados da nova venda
   * @returns A venda criada
   */
  const createSale = async (data: CreateSaleDTO): Promise<Sale> => {
    isLoading.value = true
    error.value = null

    try {
      // Usa o serviço que lida com mock/API real
      const newSale = await salesService.create(data)

      // Adiciona à lista local (se estiver na primeira página)
      if (pagination.value.page === 1) {
        sales.value.unshift(newSale)
      }

      // Atualiza contador total
      pagination.value.total += 1

      console.log('[Sales Store] Created sale:', newSale.id)
      return newSale
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar venda'
      error.value = errorMessage
      console.error('[Sales Store] Error creating sale:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza uma venda existente
   *
   * @param id - ID da venda
   * @param data - Dados atualizados
   * @returns Venda atualizada
   */
  const updateSale = async (id: string, data: Partial<CreateSaleDTO>): Promise<Sale> => {
    isLoading.value = true
    error.value = null

    try {
      // Usa o serviço que lida com mock/API real
      const updatedSale = await salesService.update(id, data)

      // Atualiza na lista local
      const saleIndex = sales.value.findIndex((s) => s.id === id)
      if (saleIndex !== -1) {
        sales.value[saleIndex] = updatedSale
      }

      console.log('[Sales Store] Updated sale:', updatedSale.id)
      return updatedSale
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar venda'
      error.value = errorMessage
      console.error('[Sales Store] Error updating sale:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Marca uma venda como perdida
   *
   * @param id - ID da venda
   * @param data - Dados sobre a perda (motivo, observações)
   * @returns A venda atualizada
   */
  const markSaleLost = async (id: string, data: MarkSaleLostDTO): Promise<Sale> => {
    isLoading.value = true
    error.value = null

    try {
      // Usa o serviço que lida com mock/API real
      const updated = await salesService.markAsLost(id, data)

      // Atualiza na lista local
      const index = sales.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        sales.value[index] = updated
      }

      // Atualiza venda selecionada se for a mesma
      if (selectedSale.value?.id === id) {
        selectedSale.value = updated
      }

      console.log('[Sales Store] Marked sale as lost:', id)
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar venda como perdida'
      error.value = errorMessage
      console.error('[Sales Store] Error marking sale as lost:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Recupera uma venda perdida (marca como não perdida)
   *
   * @param id - ID da venda
   * @returns A venda atualizada
   */
  const recoverSale = async (id: string): Promise<Sale> => {
    isLoading.value = true
    error.value = null

    try {
      // Recuperação explícita via endpoint dedicado
      const updated = await salesService.recover(id)

      // Atualiza na lista local
      const index = sales.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        sales.value[index] = updated
      }

      // Atualiza venda selecionada se for a mesma
      if (selectedSale.value?.id === id) {
        selectedSale.value = updated
      }

      console.log('[Sales Store] Recovered sale:', id)
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recuperar venda'
      error.value = errorMessage
      console.error('[Sales Store] Error recovering sale:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Exclui uma venda
   *
   * @param id - ID da venda
   */
  const deleteSale = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Usa o serviço que lida com mock/API real
      await salesService.delete(id)

      // Remove da lista local
      const index = sales.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        sales.value.splice(index, 1)
      }

      // Limpa venda selecionada se for a mesma
      if (selectedSale.value?.id === id) {
        selectedSale.value = null
      }

      console.log('[Sales Store] Deleted sale:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir venda'
      error.value = errorMessage
      console.error('[Sales Store] Error deleting sale:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Define filtros e busca vendas
   *
   * @param newFilters - Novos filtros a aplicar
   */
  const setFilters = async (newFilters: SaleFilters): Promise<void> => {
    // Reset para primeira página ao mudar filtros
    filters.value = {
      ...newFilters,
      page: 1
    }

    await fetchSales()
  }

  /**
   * Limpa todos os filtros e busca vendas
   */
  const clearFilters = async (): Promise<void> => {
    filters.value = {
      page: 1,
      pageSize: filters.value.pageSize || 10
    }

    await fetchSales()
  }

  /**
   * Define a venda selecionada (sem fetch)
   *
   * @param sale - Venda a selecionar (ou null para limpar)
   */
  const setSelectedSale = (sale: Sale | null): void => {
    selectedSale.value = sale
  }

  /**
   * Vai para a próxima página
   */
  const nextPage = async (): Promise<void> => {
    if (hasNextPage.value) {
      filters.value.page = (filters.value.page || 1) + 1
      await fetchSales()
    }
  }

  /**
   * Vai para a página anterior
   */
  const previousPage = async (): Promise<void> => {
    if (hasPreviousPage.value) {
      filters.value.page = Math.max((filters.value.page || 1) - 1, 1)
      await fetchSales()
    }
  }

  /**
   * Vai para uma página específica
   *
   * @param page - Número da página (1-indexed)
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      filters.value.page = page
      await fetchSales()
    }
  }

  /**
   * Limpa o estado de erro
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Recarrega a página atual de vendas
   */
  const refresh = async (): Promise<void> => {
    await fetchSales()
  }

  /**
   * Busca vendas fechadas em uma data específica (para drill-down)
   * 
   * @param date - Data no formato ISO (YYYY-MM-DD)
   * @returns Lista de vendas fechadas nessa data
   */
  const getSalesByDate = async (date: string): Promise<Sale[]> => {
    try {
      // Normaliza a data para comparação (remove horas)
      const targetDate = new Date(date).toISOString().split('T')[0]

      // Filtra vendas pela data de venda ou criação
      const filtered = sales.value.filter((sale) => {
        // Sale.date é a data principal da venda
        const saleDate = new Date(sale.date).toISOString().split('T')[0]
        return saleDate === targetDate
      })

      console.log(`[Sales Store] Found ${filtered.length} sales for date ${targetDate}`)
      return filtered
    } catch (err) {
      console.error('[Sales Store] Error filtering sales by date:', err)
      return []
    }
  }

  /**
   * Resolve origin ID para nome amigável
   * Usado para exibição em UI (ex: EntityListDrawer)
   */
  const getOriginNameById = (originId: string | null | undefined): string => {
    if (!originId) return 'Sem origem'
    const originsStore = useOriginsStore()
    const origin = originsStore.origins.find((o: any) => o.id === originId)
    return origin?.name || 'Origem desconhecida'
  }

  /**
   * Resolve contact ID para nome amigável
   * Usado para exibição em UI (ex: EntityListDrawer)
   */
  const getContactNameById = (contactId: string | null | undefined): string => {
    if (!contactId) return 'Sem contato'
    const contactsStore = useContactsStore()
    const contact = contactsStore.contacts.find((c: any) => c.id === contactId)
    return contact?.name || `Venda #${contactId.slice(0, 8)}`
  }

  // ========================================================================
  // RETURN (API pública da store)
  // ========================================================================

  return {
    // State (readonly para prevenir mutações diretas)
    sales: readonly(sales),
    selectedSale: readonly(selectedSale),
    isLoading: readonly(isLoading),
    error: readonly(error),
    filters: readonly(filters),
    pagination: readonly(pagination),

    // Getters
    confirmedSales,
    lostSales,
    salesByOrigin,
    totalRevenue,
    totalConfirmedSales,
    totalLostSales,
    averageTicket,
    conversionRate,
    totalSales,
    hasFilters,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    // Actions - CRUD
    fetchSales,
    selectSale,
    createSale,
    updateSale,
    markSaleLost,
    recoverSale,
    deleteSale,

    // Actions - Filtros e navegação
    setFilters,
    clearFilters,
    setSelectedSale,
    nextPage,
    previousPage,
    goToPage,

    // Actions - Utilitários
    clearError,
    refresh,
    getSalesByDate,

    // Helpers - Name resolution
    getOriginNameById,
    getContactNameById
  }
})
