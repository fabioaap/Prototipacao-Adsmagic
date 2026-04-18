/**
 * Stages Store
 *
 * Gerencia o estado das etapas do funil de vendas.
 * Etapas definem os passos da jornada do cliente e controlam
 * a visualização do Kanban e os eventos de conversão.
 *
 * @module stores/stages
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { MOCK_STAGES } from '@/mocks/stages'
import type { Stage, CreateStageDTO, UpdateStageDTO } from '@/types'
import {
  getStages as getStagesService,
  createStage as createStageService,
  updateStage as updateStageService,
  deleteStage as deleteStageService,
  reorderStages as reorderStagesService
} from '@/services/api/stages'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useStagesStore = defineStore('stages', () => {
  let inFlightFetchPromise: Promise<void> | null = null
  let inFlightProjectId: string | null = null
  let lastFetchedProjectId: string | null = null
  let lastFetchedAt = 0
  const FETCH_TTL_MS = 10000

  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de todas as etapas do funil
   * Inicializa vazio - será populado via fetchStages()
   */
  const stages = ref<Stage[]>([])

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
        console.log('[Stages Store] Project changed, clearing data:', { oldProjectId, newProjectId })

        // Clear all data
        stages.value = []
        error.value = null

        // Reload data for new project if project exists
        if (newProjectId) {
          console.log('[Stages Store] Loading data for new project:', newProjectId)
          fetchStages()
        }
      }
    },
    { immediate: false }
  )

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Retorna apenas etapas ativas
   */
  const activeStages = computed(() => {
    return stages.value.filter((stage) => stage.isActive)
  })

  /**
   * Retorna etapas para visualização Kanban
   * Exclui etapa "Venda Perdida" (tipo lost)
   */
  const kanbanStages = computed(() => {
    return stages.value
      .filter((stage) => stage.type !== 'lost' && stage.isActive)
      .sort((a, b) => a.order - b.order)
  })

  /**
   * Retorna a etapa de venda (tipo 'sale')
   */
  const saleStage = computed(() => {
    return stages.value.find((stage) => stage.type === 'sale')
  })

  /**
   * Retorna a etapa de perda (tipo 'lost')
   */
  const lostStage = computed(() => {
    return stages.value.find((stage) => stage.type === 'lost')
  })

  /**
   * Retorna a etapa padrão (primeira etapa normal)
   */
  const defaultStage = computed(() => {
    const normal = stages.value.find((stage) => stage.type === 'normal' && stage.isActive)
    if (!normal) {
      console.warn('[Stages Store] No default stage found')
      return stages.value[0]
    }
    return normal
  })

  /**
   * Busca uma etapa por ID
   */
  const stageById = (id: string): Stage | undefined => {
    return stages.value.find((stage) => stage.id === id)
  }

  /**
   * Retorna número total de etapas
   */
  const totalStages = computed(() => stages.value.length)

  /**
   * Verifica se pode criar mais etapas de venda
   * (apenas 1 permitida)
   */
  const canCreateSaleStage = computed(() => {
    return !stages.value.some((stage) => stage.type === 'sale')
  })

  /**
   * Verifica se pode criar mais etapas de perda
   * (apenas 1 permitida)
   */
  const canCreateLostStage = computed(() => {
    return !stages.value.some((stage) => stage.type === 'lost')
  })

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Busca todas as etapas do Supabase
   */
  const fetchStages = async (): Promise<void> => {
    const getActiveProjectId = () => currentProjectId.value ?? localStorage.getItem('current_project_id')
    const projectId = getActiveProjectId()

    if (!projectId) {
      stages.value = []
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
      return await fetchStages()
    }

    const canUseCache =
      stages.value.length > 0 &&
      lastFetchedProjectId === projectId &&
      Date.now() - lastFetchedAt < FETCH_TTL_MS

    if (canUseCache) {
      return
    }

    const runFetch = async () => {
      isLoading.value = true
      error.value = null

      try {
        const result = await getStagesService()

        // Evita sobrescrever estado quando o usuário trocou de projeto durante o request.
        if (getActiveProjectId() !== projectId) {
          if (import.meta.env.DEV) {
            console.log('[Stages Store] Discarding stale fetch result due to project switch:', { projectId })
          }
          return
        }

        if (result.ok) {
          stages.value = result.value
          lastFetchedProjectId = projectId
          lastFetchedAt = Date.now()
          console.log('[Stages Store] Fetched', stages.value.length, 'stages')
        } else {
          throw result.error
        }
      } catch (err) {
        // Se trocou de projeto, não aplicar erro/fallback de projeto antigo.
        if (getActiveProjectId() !== projectId) {
          if (import.meta.env.DEV) {
            console.log('[Stages Store] Ignoring stale fetch error due to project switch:', { projectId })
          }
          return
        }

        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar etapas'
        error.value = errorMessage
        console.error('[Stages Store] Error fetching stages:', err)
        // Fallback to mocks on error
        stages.value = [...MOCK_STAGES]
        console.warn('[Stages Store] Using mock data as fallback')
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
   * Auto-load stages on store initialization
   */
  async function fetchStagesOnInit() {
    const projectId = localStorage.getItem('current_project_id')
    if (projectId) {
      await fetchStages()
    }
  }

  // Auto-load stages on store creation (must be after fetchStages definition)
  fetchStagesOnInit().catch((err) => {
    console.warn('[Stages Store] Auto-init failed:', err)
  })

  /**
   * Cria uma nova etapa
   *
   * @param data - Dados da nova etapa
   * @returns A etapa criada
   */
  const createStage = async (data: CreateStageDTO): Promise<Stage> => {
    isLoading.value = true
    error.value = null

    try {
      // Validações
      if (data.type === 'sale' && !canCreateSaleStage.value) {
        throw new Error('Já existe uma etapa de venda. Apenas 1 permitida por projeto.')
      }

      if (data.type === 'lost' && !canCreateLostStage.value) {
        throw new Error('Já existe uma etapa de perda. Apenas 1 permitida por projeto.')
      }

      const result = await createStageService(data)

      if (result.ok) {
        stages.value.push(result.value)
        console.log('[Stages Store] Created stage:', result.value.name)
        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar etapa'
      error.value = errorMessage
      console.error('[Stages Store] Error creating stage:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza uma etapa existente
   *
   * @param id - ID da etapa
   * @param data - Dados a atualizar
   * @returns A etapa atualizada
   */
  const updateStage = async (id: string, data: UpdateStageDTO): Promise<Stage> => {
    isLoading.value = true
    error.value = null

    try {
      const index = stages.value.findIndex((s) => s.id === id)

      if (index === -1) {
        throw new Error('Etapa não encontrada')
      }

      const currentStage = stages.value[index]
      if (!currentStage) {
        throw new Error('Etapa não encontrada')
      }

      // Etapas de sistema (sem projectId) são somente leitura
      if (!currentStage.projectId) {
        throw new Error('Etapas padrão do sistema não podem ser editadas')
      }

      const result = await updateStageService(id, data)

      if (result.ok) {
        stages.value[index] = result.value
        console.log('[Stages Store] Updated stage:', result.value.name)
        return result.value
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar etapa'
      error.value = errorMessage
      console.error('[Stages Store] Error updating stage:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deleta uma etapa
   *
   * IMPORTANTE: Etapa "Contato iniciado" (primeira normal) não pode ser deletada
   *
   * @param id - ID da etapa a deletar
   */
  const deleteStage = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const stage = stageById(id)

      if (!stage) {
        throw new Error('Etapa não encontrada')
      }

      // Etapas de sistema (sem projectId) são somente leitura
      if (!stage.projectId) {
        throw new Error('Etapas padrão do sistema não podem ser removidas')
      }

      // Validação: não pode deletar etapa padrão
      if (stage.id === defaultStage.value?.id) {
        throw new Error('Não é possível deletar a etapa padrão "Contato iniciado"')
      }

      const result = await deleteStageService(id)

      if (result.ok) {
        stages.value = stages.value.filter((s) => s.id !== id)
        console.log('[Stages Store] Deleted stage:', stage.name)
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar etapa'
      error.value = errorMessage
      console.error('[Stages Store] Error deleting stage:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reordena as etapas (drag-and-drop)
   * Chama a API de reorder e atualiza o estado com fetchStages para refletir a nova ordem.
   *
   * @param newOrder - Array de IDs na nova ordem
   */
  const reorderStages = async (newOrder: string[]): Promise<void> => {
    if (newOrder.length === 0) return

    isLoading.value = true
    error.value = null

    try {
      const result = await reorderStagesService(newOrder)
      if (result.ok) {
        // Atualiza a lista completa para refletir a nova ordem (inclui etapas sistema)
        await fetchStages()
      } else {
        throw result.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reordenar etapas'
      error.value = errorMessage
      console.error('[Stages Store] Error reordering stages:', err)
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
    stages: readonly(stages),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    activeStages,
    kanbanStages,
    saleStage,
    lostStage,
    defaultStage,
    stageById,
    totalStages,
    canCreateSaleStage,
    canCreateLostStage,

    // Actions
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
    clearError
  }
})
