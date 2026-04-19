/**
 * Contacts Store
 *
 * Gerencia o estado dos contatos, filtros, paginação e operações CRUD.
 * Este é o store mais complexo, integrando com stages e origins.
 *
 * Funcionalidades:
 * - Lista paginada de contatos
 * - Filtros avançados (busca, origem, etapa, datas)
 * - Agrupamento para Kanban (por etapa)
 * - Operações CRUD completas
 * - Seleção de contato (para detalhes/edição)
 *
 * @module stores/contacts
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type {
  Contact,
  CreateContactDTO,
  UpdateContactDTO,
  ContactFilters
} from '@/types'
import {
  getContacts,
  getContactById,
  createContact as createContactService,
  updateContact as updateContactService,
  deleteContact as deleteContactService,
  moveContactToStage as moveContactToStageService,
  batchUpdateContacts as batchUpdateContactsService
} from '@/services/api/contacts'
import { useStagesStore } from './stages'
import { useOriginsStore } from './origins'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useContactsStore = defineStore('contacts', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de contatos (página atual)
   */
  const contacts = ref<Contact[]>([])
  const kanbanContacts = ref<Contact[]>([])

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
        contacts.value = []
        kanbanContacts.value = []
        kanbanCacheKey = ''
        kanbanCacheTime = 0
        selectedContact.value = null
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
        // No auto-fetch here to avoid duplicate calls
      }
    },
    { immediate: false }
  )

  /**
   * Contato selecionado para visualização/edição
   */
  const selectedContact = ref<Contact | null>(null)

  /**
   * Indica carregamento de listagem (fetch de contatos)
   */
  const isFetching = ref(false)
  const isFetchingKanban = ref(false)
  let fetchContactsRequestId = 0
  let fetchKanbanContactsRequestId = 0

  // Kanban cache (5 min TTL)
  let kanbanCacheKey = ''
  let kanbanCacheTime = 0
  const KANBAN_CACHE_TTL = 5 * 60 * 1000

  /**
   * Indica mutações em andamento (create/update/delete/move)
   */
  const isMutating = ref(false)

  /**
   * Mensagem de erro, se houver
   */
  const error = ref<string | null>(null)

  /**
   * Filtros aplicados
   */
  const filters = ref<ContactFilters>({
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
  // GETTERS
  // ========================================================================

  /**
   * Retorna contatos agrupados por etapa (para Kanban)
   * Formato: { [stageId]: Contact[] }
   */
  const contactsByStage = computed(() => {
    const grouped: Record<string, Contact[]> = {}

    contacts.value.forEach((contact) => {
      const stage = contact.stage
      if (stage) {
        if (!grouped[stage]) {
          grouped[stage] = []
        }
        grouped[stage].push(contact)
      }
    })

    return grouped
  })

  /**
   * Retorna contatos do kanban agrupados por etapa
   * Formato: { [stageId]: Contact[] }
   */
  const kanbanContactsByStage = computed(() => {
    const grouped: Record<string, Contact[]> = {}

    kanbanContacts.value.forEach((contact) => {
      const stage = contact.stage
      if (stage) {
        if (!grouped[stage]) {
          grouped[stage] = []
        }
        grouped[stage].push(contact)
      }
    })

    return grouped
  })

  /**
   * Retorna contatos agrupados por origem
   * Formato: { [originId]: Contact[] }
   */
  const contactsByOrigin = computed(() => {
    const grouped: Record<string, Contact[]> = {}

    contacts.value.forEach((contact) => {
      const origin = contact.origin
      if (origin) {
        if (!grouped[origin]) {
          grouped[origin] = []
        }
        grouped[origin].push(contact)
      }
    })

    return grouped
  })

  /**
   * Retorna número total de contatos (considerando filtros)
   */
  const totalContacts = computed(() => pagination.value.total)

  /**
   * Verifica se há filtros aplicados
   */
  const hasFilters = computed(() => {
    return !!(
      filters.value.search ||
      (filters.value.origins && filters.value.origins.length > 0) ||
      (filters.value.stages && filters.value.stages.length > 0) ||
      filters.value.dateFrom ||
      filters.value.dateTo ||
      filters.value.hasSales !== undefined
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

  /**
   * Loading agregado para compatibilidade com consumidores antigos
   */
  const isLoading = computed(() => isFetching.value || isMutating.value)

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Busca contatos com filtros e paginação
   *
   * @param newFilters - Filtros opcionais (usa state.filters se não informado)
   */
  const fetchContacts = async (newFilters?: ContactFilters): Promise<void> => {
    const requestId = ++fetchContactsRequestId
    isFetching.value = true
    error.value = null

    try {
      // Atualiza filtros se fornecido
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      const result = await getContacts(filters.value)

      if (result.ok) {
        if (requestId !== fetchContactsRequestId) {
          return
        }
        contacts.value = result.value.data
        pagination.value = result.value.pagination

      } else {
        throw result.error
      }
    } catch (err) {
      if (requestId !== fetchContactsRequestId) {
        return
      }
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar contatos'
      error.value = errorMessage
      console.error('[Contacts Store] Error fetching contacts:', err)
      throw err
    } finally {
      if (requestId === fetchContactsRequestId) {
        isFetching.value = false
      }
    }
  }

  /**
   * Busca todos os contatos para Kanban usando paginação em lotes.
   *
   * @param newFilters - Filtros opcionais (usa state.filters se não informado)
   */
  const fetchKanbanContacts = async (newFilters?: ContactFilters): Promise<void> => {
    const sourceFilters = newFilters ? { ...filters.value, ...newFilters } : { ...filters.value }

    // Check cache - skip fetch if same filters and cache is fresh
    const cacheKey = JSON.stringify(sourceFilters)
    if (cacheKey === kanbanCacheKey && kanbanContacts.value.length > 0 && Date.now() - kanbanCacheTime < KANBAN_CACHE_TTL) {
      return
    }

    const requestId = ++fetchKanbanContactsRequestId
    isFetchingKanban.value = true
    error.value = null

    try {
      const batchSize = 100
      const baseFilters: ContactFilters = {
        ...sourceFilters,
        pageSize: batchSize,
      }

      const allContacts: Contact[] = []
      let page = 1
      let totalPages = 1

      do {
        if (requestId !== fetchKanbanContactsRequestId) {
          return
        }

        const result = await getContacts({
          ...baseFilters,
          page,
        })

        if (requestId !== fetchKanbanContactsRequestId) {
          return
        }

        if (!result.ok) {
          throw result.error
        }

        allContacts.push(...result.value.data)
        totalPages = result.value.pagination.totalPages
        page += 1
      } while (page <= totalPages)

      if (requestId !== fetchKanbanContactsRequestId) {
        return
      }
      kanbanContacts.value = allContacts
      kanbanCacheKey = cacheKey
      kanbanCacheTime = Date.now()

    } catch (err) {
      if (requestId !== fetchKanbanContactsRequestId) {
        return
      }
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar contatos do kanban'
      error.value = errorMessage
      console.error('[Contacts Store] Error fetching kanban contacts:', err)
      throw err
    } finally {
      if (requestId === fetchKanbanContactsRequestId) {
        isFetchingKanban.value = false
      }
    }
  }

  const upsertContactInCollection = (collection: Contact[], contact: Contact): Contact[] => {
    const index = collection.findIndex((c) => c.id === contact.id)
    if (index !== -1) {
      const next = [...collection]
      next[index] = contact
      return next
    }
    return [contact, ...collection]
  }

  /**
   * Busca e seleciona um contato por ID
   *
   * @param id - ID do contato
   */
  const selectContact = async (id: string): Promise<void> => {
    isFetching.value = true
    error.value = null

    try {
      const result = await getContactById(id)

      if (result.ok) {
        selectedContact.value = result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar contato'
      error.value = errorMessage
      console.error('[Contacts Store] Error selecting contact:', err)
      throw err
    } finally {
      isFetching.value = false
    }
  }

  /**
   * Cria um novo contato
   *
   * @param data - Dados do novo contato
   * @returns O contato criado
   */
  const createContact = async (data: CreateContactDTO): Promise<Contact> => {
    isMutating.value = true
    error.value = null

    try {
      const result = await createContactService(data)

      if (result.ok) {
        // Adiciona contato à lista local (se estiver na primeira página)
        if (pagination.value.page === 1) {
          contacts.value.unshift(result.value)
        }
        kanbanContacts.value = upsertContactInCollection(kanbanContacts.value, result.value)

        // Atualiza contador total
        pagination.value.total += 1

        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar contato'
      error.value = errorMessage
      console.error('[Contacts Store] Error creating contact:', err)
      throw err
    } finally {
      isMutating.value = false
    }
  }

  /**
   * Atualiza um contato existente
   *
   * @param id - ID do contato
   * @param data - Dados a atualizar
   * @returns O contato atualizado
   */
  const updateContact = async (id: string, data: UpdateContactDTO): Promise<Contact> => {
    isMutating.value = true
    error.value = null

    try {
      const result = await updateContactService(id, data)

      if (result.ok) {
        // Atualiza na lista local
        const index = contacts.value.findIndex((c) => c.id === id)
        if (index !== -1) {
          contacts.value[index] = result.value
        }
        kanbanContacts.value = upsertContactInCollection(kanbanContacts.value, result.value)

        // Atualiza contato selecionado se for o mesmo
        if (selectedContact.value?.id === id) {
          selectedContact.value = result.value
        }

        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar contato'
      error.value = errorMessage
      console.error('[Contacts Store] Error updating contact:', err)
      throw err
    } finally {
      isMutating.value = false
    }
  }

  /**
   * Deleta um contato
   *
   * @param id - ID do contato a deletar
   */
  const deleteContact = async (id: string): Promise<void> => {
    isMutating.value = true
    error.value = null

    try {
      const result = await deleteContactService(id)

      if (result.ok) {
        // Remove da lista local
        contacts.value = contacts.value.filter((c) => c.id !== id)
        kanbanContacts.value = kanbanContacts.value.filter((c) => c.id !== id)

        // Limpa seleção se for o contato deletado
        if (selectedContact.value?.id === id) {
          selectedContact.value = null
        }

        // Atualiza contador total
        pagination.value.total -= 1

      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar contato'
      error.value = errorMessage
      console.error('[Contacts Store] Error deleting contact:', err)
      throw err
    } finally {
      isMutating.value = false
    }
  }

  /**
   * Move um contato para outra etapa (usado no Kanban)
   *
   * @param id - ID do contato
   * @param stageId - ID da nova etapa
   * @returns O contato atualizado
   */
  const moveContactToStage = async (id: string, stageId: string): Promise<Contact> => {
    isMutating.value = true
    error.value = null

    try {
      const result = await moveContactToStageService(id, stageId)

      if (result.ok) {
        // Atualiza na lista local
        const index = contacts.value.findIndex((c) => c.id === id)
        if (index !== -1) {
          contacts.value[index] = result.value
        }
        kanbanContacts.value = upsertContactInCollection(kanbanContacts.value, result.value)

        // Atualiza contato selecionado se for o mesmo
        if (selectedContact.value?.id === id) {
          selectedContact.value = result.value
        }

        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao mover contato'
      error.value = errorMessage
      console.error('[Contacts Store] Error moving contact:', err)
      throw err
    } finally {
      isMutating.value = false
    }
  }

  /**
   * Atualiza múltiplos contatos em lote
   * Útil para operações como mudança de etapa em massa, deleção em massa, etc.
   *
   * @param contactIds - IDs dos contatos a atualizar
   * @param updates - Dados a aplicar em todos os contatos
   * @returns Array de contatos atualizados
   */
  const batchUpdateContacts = async (
    contactIds: string[],
    updates: UpdateContactDTO
  ): Promise<Contact[]> => {
    isMutating.value = true
    error.value = null

    try {
      const result = await batchUpdateContactsService(contactIds, updates)

      if (result.ok) {
        // Atualiza contatos na lista local
        result.value.forEach((updated) => {
          const index = contacts.value.findIndex((c) => c.id === updated.id)
          if (index !== -1) {
            contacts.value[index] = updated
          }
          kanbanContacts.value = upsertContactInCollection(kanbanContacts.value, updated)
        })

        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar contatos'
      error.value = errorMessage
      console.error('[Contacts Store] Error in batch update:', err)
      throw err
    } finally {
      isMutating.value = false
    }
  }

  /**
   * Define filtros e busca contatos
   *
   * @param newFilters - Novos filtros a aplicar
   */
  const setFilters = async (newFilters: ContactFilters, options?: { skipFetch?: boolean }): Promise<void> => {
    // Reset para primeira página ao mudar filtros
    filters.value = {
      ...newFilters,
      page: 1
    }

    if (!options?.skipFetch) {
      await fetchContacts()
    }
  }

  /**
   * Limpa todos os filtros e busca contatos
   */
  const clearFilters = async (): Promise<void> => {
    filters.value = {
      page: 1,
      pageSize: filters.value.pageSize || 10
    }

    await fetchContacts()
  }

  /**
   * Define o contato selecionado (sem fetch)
   *
   * @param contact - Contato a selecionar (ou null para limpar)
   */
  const setSelectedContact = (contact: Contact | null): void => {
    selectedContact.value = contact
  }

  /**
   * Vai para a próxima página
   */
  const nextPage = async (): Promise<void> => {
    if (hasNextPage.value) {
      filters.value.page = (filters.value.page || 1) + 1
      await fetchContacts()
    }
  }

  /**
   * Vai para a página anterior
   */
  const previousPage = async (): Promise<void> => {
    if (hasPreviousPage.value) {
      filters.value.page = Math.max((filters.value.page || 1) - 1, 1)
      await fetchContacts()
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
      await fetchContacts()
    }
  }

  /**
   * Limpa o estado de erro
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Recarrega a página atual de contatos
   */
  const refresh = async (): Promise<void> => {
    await fetchContacts()
  }

  /**
   * Busca contatos criados em uma data específica (para drill-down)
   * 
   * @param date - Data no formato ISO (YYYY-MM-DD)
   * @returns Lista de contatos criados nessa data
   */
  const getContactsByDate = async (date: string): Promise<Contact[]> => {
    try {
      // Normaliza a data para comparação (remove horas)
      const targetDate = new Date(date).toISOString().split('T')[0]

      // Filtra contatos pela data de criação
      const filtered = contacts.value.filter((contact) => {
        const contactDate = new Date(contact.createdAt).toISOString().split('T')[0]
        return contactDate === targetDate
      })

      return filtered
    } catch (err) {
      console.error('[Contacts Store] Error filtering contacts by date:', err)
      return []
    }
  }

  /**
   * Resolve stage ID para nome amigável
   * Usado para exibição em UI (ex: EntityListDrawer)
   */
  const getStageNameById = (stageId: string | null | undefined): string => {
    if (!stageId) return 'Sem etapa'
    const stagesStore = useStagesStore()
    const stage = stagesStore.stages.find((s: any) => s.id === stageId)
    return stage?.name || 'Etapa desconhecida'
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

  // ========================================================================
  // RETURN (API pública da store)
  // ========================================================================

  return {
    // State (readonly para prevenir mutações diretas)
    contacts: readonly(contacts),
    kanbanContacts: readonly(kanbanContacts),
    selectedContact: readonly(selectedContact),
    isLoading: readonly(isLoading),
    isFetching: readonly(isFetching),
    isFetchingKanban: readonly(isFetchingKanban),
    isMutating: readonly(isMutating),
    error: readonly(error),
    filters: readonly(filters),
    pagination: readonly(pagination),

    // Getters
    contactsByStage,
    kanbanContactsByStage,
    contactsByOrigin,
    totalContacts,
    hasFilters,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    // Actions - CRUD
    fetchContacts,
    fetchKanbanContacts,
    selectContact,
    createContact,
    updateContact,
    deleteContact,
    moveContactToStage,
    batchUpdateContacts,

    // Actions - Filtros e navegação
    setFilters,
    clearFilters,
    setSelectedContact,
    nextPage,
    previousPage,
    goToPage,

    // Actions - Utilitários
    clearError,
    refresh,
    getContactsByDate,

    // Helpers - Name resolution
    getStageNameById,
    getOriginNameById
  }
})
