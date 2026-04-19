/**
 * Origins Store
 *
 * Gerencia o estado das origens de tráfego (fontes de contatos).
 * Origens podem ser do sistema (Google Ads, Meta Ads, etc.) ou customizadas.
 *
 * Regras:
 * - Origens do sistema não podem ser deletadas
 * - Máximo 20 origens customizadas por projeto
 *
 * @module stores/origins
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { Origin, CreateOriginDTO, UpdateOriginDTO } from '@/types'
import {
  getOrigins as getOriginsService,
  createOrigin as createOriginService,
  updateOrigin as updateOriginService,
  deleteOrigin as deleteOriginService
} from '@/services/api/origins'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useOriginsStore = defineStore('origins', () => {
  let inFlightFetchPromise: Promise<void> | null = null
  let inFlightProjectId: string | null = null
  let lastFetchedProjectId: string | null = null
  let lastFetchedAt = 0
  const FETCH_TTL_MS = 10000

  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de todas as origens (sistema + customizadas)
   * Inicializa vazio - será populado via fetchOrigins()
   */
  const origins = ref<Origin[]>([])

  /**
   * Indica se está carregando dados
   */
  const isLoading = ref(false)

  /**
   * Mensagem de erro, se houver
   */
  const error = ref<string | null>(null)

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
        origins.value = []
        error.value = null

        // Reload data for new project if project exists
        if (newProjectId) {
          fetchOrigins()
        }
      }
    },
    { immediate: false }
  )

  // ========================================================================
  // CONSTANTS
  // ========================================================================

  /**
   * Limite máximo de origens customizadas por projeto
   */
  const MAX_CUSTOM_ORIGINS = 20

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Retorna apenas origens do sistema (não deletáveis)
   */
  const systemOrigins = computed(() => {
    return origins.value.filter((origin) => origin.type === 'system')
  })

  /**
   * Retorna apenas origens customizadas (deletáveis)
   */
  const customOrigins = computed(() => {
    return origins.value.filter((origin) => origin.type === 'custom')
  })

  /**
   * Retorna apenas origens ativas
   */
  const activeOrigins = computed(() => {
    return origins.value.filter((origin) => origin.isActive)
  })

  /**
   * Busca uma origem por ID
   */
  const originById = (id: string): Origin | undefined => {
    return origins.value.find((origin) => origin.id === id)
  }

  /**
   * Busca uma origem por nome (case-insensitive)
   */
  const originByName = (name: string): Origin | undefined => {
    const lowerName = name.toLowerCase()
    return origins.value.find((origin) => origin.name.toLowerCase() === lowerName)
  }

  /**
   * Busca o ID de uma origem pelo nome (case-insensitive)
   */
  const getOriginIdByName = (name: string): string | undefined => {
    return originByName(name)?.id
  }

  /**
   * Retorna número total de origens
   */
  const totalOrigins = computed(() => origins.value.length)

  /**
   * Retorna número de origens customizadas
   */
  const customOriginsCount = computed(() => customOrigins.value.length)

  /**
   * Verifica se pode criar mais origens customizadas
   * (máximo 20)
   */
  const canCreateMore = computed(() => {
    return customOrigins.value.length < MAX_CUSTOM_ORIGINS
  })

  /**
   * Retorna quantas origens customizadas ainda podem ser criadas
   */
  const remainingSlots = computed(() => {
    return MAX_CUSTOM_ORIGINS - customOrigins.value.length
  })

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Busca todas as origens do Supabase
   */
  const fetchOrigins = async (): Promise<void> => {
    const getActiveProjectId = () => currentProjectId.value ?? localStorage.getItem('current_project_id')
    const projectId = getActiveProjectId()

    if (!projectId) {
      origins.value = []
      error.value = null
      lastFetchedProjectId = null
      lastFetchedAt = 0
      return
    }

    // Deduplicar apenas quando a requisição em voo é do mesmo projeto.
    // Se o projeto mudou, aguarda a antiga finalizar e dispara fetch do projeto atual.
    if (inFlightFetchPromise) {
      if (inFlightProjectId === projectId) {
        return await inFlightFetchPromise
      }
      await inFlightFetchPromise
      return await fetchOrigins()
    }

    const canUseCache =
      origins.value.length > 0 &&
      lastFetchedProjectId === projectId &&
      Date.now() - lastFetchedAt < FETCH_TTL_MS

    if (canUseCache) {
      return
    }

    const runFetch = async () => {
      isLoading.value = true
      error.value = null

      try {
        const result = await getOriginsService()

        // Evita sobrescrever estado quando o usuário trocou de projeto durante o request.
        if (getActiveProjectId() !== projectId) {
          return
        }

        if (result.ok) {
          origins.value = result.value
          lastFetchedProjectId = projectId
          lastFetchedAt = Date.now()
        } else {
          throw result.error
        }
      } catch (err) {
        // Se trocou de projeto, não aplicar erro/fallback de projeto antigo.
        if (getActiveProjectId() !== projectId) {
          return
        }

        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar origens'
        error.value = errorMessage
        console.error('[Origins Store] Error fetching origins:', err)
        origins.value = []
      } finally {
        if (inFlightProjectId === projectId) {
          isLoading.value = false
        }
      }
    }

    inFlightProjectId = projectId
    inFlightFetchPromise = runFetch()
    try {
      await inFlightFetchPromise
    } finally {
      if (inFlightProjectId === projectId) {
        inFlightFetchPromise = null
        inFlightProjectId = null
      }
    }
  }

  /**
   * Auto-load origins on store initialization
   */
  async function fetchOriginsOnInit() {
    const projectId = localStorage.getItem('current_project_id')
    if (projectId) {
      await fetchOrigins()
    }
  }

  // Auto-load origins on store creation (must be after fetchOrigins definition)
  fetchOriginsOnInit().catch((err) => {
    console.warn('[Origins Store] Auto-init failed:', err)
  })

  /**
   * Cria uma nova origem customizada
   *
   * @param data - Dados da nova origem
   * @returns A origem criada
   */
  const createOrigin = async (data: CreateOriginDTO): Promise<Origin> => {
    isLoading.value = true
    error.value = null

    try {
      // Validação: verifica limite
      if (!canCreateMore.value) {
        throw new Error(
          `Limite de ${MAX_CUSTOM_ORIGINS} origens customizadas atingido. Delete uma origem existente para criar uma nova.`
        )
      }

      const result = await createOriginService(data)

      if (result.ok) {
        origins.value.push(result.value)
        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar origem'
      error.value = errorMessage
      console.error('[Origins Store] Error creating origin:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza uma origem existente
   *
   * @param id - ID da origem
   * @param data - Dados a atualizar
   * @returns A origem atualizada
   */
  const updateOrigin = async (id: string, data: UpdateOriginDTO): Promise<Origin> => {
    isLoading.value = true
    error.value = null

    try {
      const index = origins.value.findIndex((o) => o.id === id)

      if (index === -1) {
        throw new Error('Origem não encontrada')
      }

      const origin = origins.value[index]
      if (!origin) {
        throw new Error('Origem não encontrada')
      }

      // Validação: não pode editar origens do sistema
      if (origin.type === 'system') {
        throw new Error('Origens do sistema não podem ser editadas')
      }

      const result = await updateOriginService(id, data)

      if (result.ok) {
        origins.value[index] = result.value
        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar origem'
      error.value = errorMessage
      console.error('[Origins Store] Error updating origin:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deleta uma origem customizada
   *
   * IMPORTANTE: Apenas origens customizadas podem ser deletadas
   *
   * @param id - ID da origem a deletar
   */
  const deleteOrigin = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const origin = originById(id)

      if (!origin) {
        throw new Error('Origem não encontrada')
      }

      // Validação: não pode deletar origens do sistema
      if (origin.type === 'system') {
        throw new Error(
          'Origens do sistema não podem ser deletadas. Apenas origens customizadas podem ser removidas.'
        )
      }

      const result = await deleteOriginService(id)

      if (result.ok) {
        origins.value = origins.value.filter((o) => o.id !== id)
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar origem'
      error.value = errorMessage
      console.error('[Origins Store] Error deleting origin:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ativa ou desativa uma origem
   *
   * @param id - ID da origem
   * @param active - Novo estado (ativo/inativo)
   */
  const toggleActive = async (id: string, active: boolean): Promise<void> => {
    try {
      await updateOrigin(id, { isActive: active })
    } catch (err) {
      console.error('[Origins Store] Error toggling origin:', err)
      throw err
    }
  }

  /**
   * Reordena as origens customizadas (drag-and-drop)
   *
   * @param newOrder - Array de IDs na nova ordem
   */
  const reorderOrigins = async (newOrder: string[]): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Mock: reordena localmente
      const reordered = newOrder.map((id, index) => {
        const origin = originById(id)
        if (!origin) {
          throw new Error(`Origem ${id} não encontrada`)
        }
        return {
          ...origin,
          order: index
        }
      })

      // Mantém origens do sistema (não reordenáveis) e outras customizadas
      const systemOriginsArray = origins.value.filter(o => o.isSystem)
      const otherCustom = origins.value.filter(o => !o.isSystem && !newOrder.includes(o.id))

      // Combina: sistema primeiro, depois customizadas reordenadas, depois outras
      origins.value = [
        ...systemOriginsArray,
        ...reordered,
        ...otherCustom
      ]

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reordenar origens'
      error.value = errorMessage
      console.error('[Origins Store] Error reordering origins:', err)
      throw err
    } finally {
      isLoading.value = false
    }
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
    origins: readonly(origins),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Constants
    MAX_CUSTOM_ORIGINS,

    // Getters
    systemOrigins,
    customOrigins,
    activeOrigins,
    originById,
    originByName,
    getOriginIdByName,
    totalOrigins,
    customOriginsCount,
    canCreateMore,
    remainingSlots,

    // Actions
    fetchOrigins,
    createOrigin,
    updateOrigin,
    deleteOrigin,
    toggleActive,
    reorderOrigins,
    clearError
  }
})
