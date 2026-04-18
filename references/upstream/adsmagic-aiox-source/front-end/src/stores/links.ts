/**
 * Links Store
 *
 * Gerencia os links de rastreamento do projeto.
 * Links são gerados automaticamente e capturam dados de origem
 * quando novos contatos são criados.
 *
 * Funcionalidades:
 * - Lista de links de rastreamento
 * - Criação de novos links
 * - Edição e desativação de links
 * - Estatísticas de cliques e conversões por link
 * - Integração com origens (cada link tem uma origem associada)
 *
 * @module stores/links
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { Link, CreateLinkDTO, UpdateLinkDTO, LinkStats } from '@/types'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'

export const useLinksStore = defineStore('links', () => {
  // ========================================================================
  // STATE
  // ========================================================================

  /**
   * Lista de todos os links de rastreamento
   */
  const links = ref<Link[]>([])

  /**
   * Link selecionado para visualização/edição
   */
  const selectedLink = ref<Link | null>(null)

  /**
   * Estatísticas do link selecionado
   */
  const selectedLinkStats = ref<LinkStats | null>(null)

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
        console.log('[Links Store] Project changed, clearing data:', { oldProjectId, newProjectId })
        
        // Clear all data
        links.value = []
        selectedLink.value = null
        selectedLinkStats.value = null
        error.value = null
        
        // Reload data for new project if project exists
        if (newProjectId) {
          console.log('[Links Store] Loading data for new project:', newProjectId)
          fetchLinks()
        }
      }
    },
    { immediate: false }
  )

  // ========================================================================
  // CONSTANTS
  // ========================================================================

  /**
   * Limite máximo de links por projeto
   */
  const MAX_LINKS = 50

  /**
   * URL base para links (será configurada no projeto)
   */
  const BASE_URL = ref('https://r.adsmagic.com.br')

  // ========================================================================
  // GETTERS
  // ========================================================================

  /**
   * Retorna apenas links ativos
   */
  const activeLinks = computed(() => {
    return links.value.filter((link) => link.isActive)
  })

  /**
   * Retorna links agrupados por origem
   * Formato: { [originId]: Link[] }
   */
  const linksByOrigin = computed(() => {
    const grouped: Record<string, Link[]> = {}

    links.value.forEach((link) => {
      const originId = link.originId
      if (originId) {
        if (!grouped[originId]) {
          grouped[originId] = []
        }
        grouped[originId].push(link)
      }
    })

    return grouped
  })

  /**
   * Busca um link por ID
   */
  const linkById = (id: string): Link | undefined => {
    return links.value.find((link) => link.id === id)
  }

  /**
   * Retorna número total de links
   */
  const totalLinks = computed(() => links.value.length)

  /**
   * Retorna número de links ativos
   */
  const activeLinksCount = computed(() => activeLinks.value.length)

  /**
   * Verifica se pode criar mais links
   * (máximo 50)
   */
  const canCreateMore = computed(() => {
    return links.value.length < MAX_LINKS
  })

  /**
   * Retorna quantos links ainda podem ser criados
   */
  const remainingSlots = computed(() => {
    return MAX_LINKS - links.value.length
  })

  /**
   * Retorna o total de cliques em todos os links ativos
   */
  const totalClicks = computed(() => {
    return activeLinks.value.reduce((sum, link) => sum + (link.stats?.clicks || 0), 0)
  })

  /**
   * Retorna o total de conversões em todos os links ativos
   */
  const totalConversions = computed(() => {
    return activeLinks.value.reduce((sum, link) => sum + (link.stats?.sales || 0), 0)
  })

  /**
   * Retorna a taxa de conversão geral de todos os links
   */
  const overallConversionRate = computed(() => {
    if (totalClicks.value === 0) return 0
    return (totalConversions.value / totalClicks.value) * 100
  })

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Busca todos os links
   * Em modo mock, inicializa com dados vazios
   */
  const fetchLinks = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock: dados vazios (será populado quando houver API)
      // API real: const response = await linksService.getAll()
      // links.value = response.data

      console.log('[Links Store] Fetched', links.value.length, 'links')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar links'
      error.value = errorMessage
      console.error('[Links Store] Error fetching links:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cria um novo link de rastreamento
   *
   * @param data - Dados do novo link
   * @returns O link criado
   */
  const createLink = async (data: CreateLinkDTO): Promise<Link> => {
    isLoading.value = true
    error.value = null

    try {
      // Validação: verifica limite
      if (!canCreateMore.value) {
        throw new Error(
          `Limite de ${MAX_LINKS} links atingido. Delete um link existente para criar um novo.`
        )
      }

      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 400))
      const id = `link-${Date.now()}`
      const trackingUrl = `${BASE_URL.value}/${id}`

      // Mock: cria link localmente
      const newLink: Link = {
        id,
        projectId: data.projectId || '',
        name: data.name,
        destinationUrl: data.destinationUrl,
        trackingUrl,
        url: trackingUrl,
        originId: data.originId,
        isActive: true,
        stats: {
          clicks: 0,
          contacts: 0,
          sales: 0,
          revenue: 0
        },
        initialMessage: data.initialMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      links.value.push(newLink)

      console.log('[Links Store] Created link:', newLink.name)
      console.log('[Links Store] Full URL:', newLink.trackingUrl)
      return newLink
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar link'
      error.value = errorMessage
      console.error('[Links Store] Error creating link:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza um link existente
   *
   * @param id - ID do link
   * @param data - Dados a atualizar
   * @returns O link atualizado
   */
  const updateLink = async (id: string, data: UpdateLinkDTO): Promise<Link> => {
    isLoading.value = true
    error.value = null

    try {
      const index = links.value.findIndex((l) => l.id === id)

      if (index === -1) {
        throw new Error('Link não encontrado')
      }

      const currentLink = links.value[index]
      if (!currentLink) {
        throw new Error('Link não encontrado')
      }

      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Mock: atualiza localmente - garantir que todas propriedades obrigatórias estejam presentes
      // UpdateLinkDTO não tem id, projectId, trackingUrl - usar valores do currentLink
      const updated: Link = {
        ...currentLink,
        ...data,
        id: currentLink.id, // id não pode ser alterado
        projectId: currentLink.projectId, // projectId não pode ser alterado
        destinationUrl: data.destinationUrl ?? currentLink.destinationUrl,
        trackingUrl: currentLink.trackingUrl, // trackingUrl é gerado automaticamente
        updatedAt: new Date().toISOString()
      }

      links.value[index] = updated

      // Atualiza link selecionado se for o mesmo
      if (selectedLink.value?.id === id) {
        selectedLink.value = updated
      }

      console.log('[Links Store] Updated link:', updated.name)
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar link'
      error.value = errorMessage
      console.error('[Links Store] Error updating link:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deleta um link
   *
   * @param id - ID do link a deletar
   */
  const deleteLink = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const link = linkById(id)

      if (!link) {
        throw new Error('Link não encontrado')
      }

      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock: remove localmente
      links.value = links.value.filter((l) => l.id !== id)

      // Limpa seleção se for o link deletado
      if (selectedLink.value?.id === id) {
        selectedLink.value = null
        selectedLinkStats.value = null
      }

      console.log('[Links Store] Deleted link:', link.name)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar link'
      error.value = errorMessage
      console.error('[Links Store] Error deleting link:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ativa ou desativa um link
   *
   * @param id - ID do link
   * @param active - Novo estado (ativo/inativo)
   */
  const toggleActive = async (id: string, active: boolean): Promise<void> => {
    try {
      await updateLink(id, { isActive: active })
      console.log('[Links Store] Toggled link active state:', id, active)
    } catch (err) {
      console.error('[Links Store] Error toggling link:', err)
      throw err
    }
  }

  /**
   * Busca estatísticas detalhadas de um link
   *
   * @param id - ID do link
   */
  const fetchLinkStats = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const link = linkById(id)

      if (!link) {
        throw new Error('Link não encontrado')
      }

      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock: estatísticas fictícias
      // API real: const response = await linksService.getStats(id)
      const mockStats: LinkStats = {
        clicks: link.stats?.clicks || 0,
        contacts: link.stats?.contacts || 0,
        sales: link.stats?.sales || 0,
        revenue: link.stats?.revenue || 0
      }

      selectedLinkStats.value = mockStats
      console.log('[Links Store] Fetched stats for link:', link.name)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas'
      error.value = errorMessage
      console.error('[Links Store] Error fetching link stats:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Define o link selecionado (sem fetch)
   *
   * @param link - Link a selecionar (ou null para limpar)
   */
  const setSelectedLink = (link: Link | null): void => {
    selectedLink.value = link
    selectedLinkStats.value = null
  }

  /**
   * Define a URL base para links
   *
   * @param url - Nova URL base
   */
  const setBaseUrl = (url: string): void => {
    BASE_URL.value = url
  }

  /**
   * Gera a URL completa de um link
   *
   * @param linkId - UUID do link
   * @returns URL completa
   */
  const getFullUrl = (linkId: string): string => {
    return `${BASE_URL.value}/${linkId}`
  }

  /**
   * Limpa o estado de erro
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Recarrega a lista de links
   */
  const refresh = async (): Promise<void> => {
    await fetchLinks()
  }

  // ========================================================================
  // RETURN (API pública da store)
  // ========================================================================

  return {
    // State (readonly para prevenir mutações diretas)
    links: readonly(links),
    selectedLink: readonly(selectedLink),
    selectedLinkStats: readonly(selectedLinkStats),
    isLoading: readonly(isLoading),
    error: readonly(error),
    BASE_URL: readonly(BASE_URL),

    // Constants
    MAX_LINKS,

    // Getters
    activeLinks,
    linksByOrigin,
    linkById,
    totalLinks,
    activeLinksCount,
    canCreateMore,
    remainingSlots,
    totalClicks,
    totalConversions,
    overallConversionRate,

    // Actions
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    toggleActive,
    fetchLinkStats,
    setSelectedLink,
    setBaseUrl,
    getFullUrl,
    clearError,
    refresh
  }
})
