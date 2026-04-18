/**
 * Tracking Store
 *
 * Store de mensagens rastreáveis integrado à Edge Function `trackable-links`.
 *
 * @module stores/tracking
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { Link, LinkStats } from '@/types/models'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import {
  getTrackableLinks,
  createTrackableLink,
  updateTrackableLink,
  deleteTrackableLink,
  getTrackableLinkStats,
  type TrackableLinkStats,
} from '@/services/api/trackableLinks'

export interface CreateTrackingLinkDTO {
  name: string
  initialMessage?: string
  whatsappNumber: string
}

export interface UpdateTrackingLinkDTO {
  name?: string
  initialMessage?: string
  whatsappNumber?: string
  isActive?: boolean
}

export const useTrackingStore = defineStore('tracking', () => {
  const links = ref<Link[]>([])
  const selectedLink = ref<Link | null>(null)
  const selectedLinkStats = ref<LinkStats | null>(null)
  const selectedLinkDetailedStats = ref<TrackableLinkStats | null>(null)
  const isLoading = ref(false)
  const isLoadingStats = ref(false)
  const error = ref<string | null>(null)

  const MAX_LINKS = 50
  const BASE_URL = ref('https://r.adsmagic.com.br')

  const { currentProjectId } = useCurrentProjectId()

  watch(
    currentProjectId,
    (newProjectId, oldProjectId) => {
      if (newProjectId !== oldProjectId) {
        links.value = []
        selectedLink.value = null
        selectedLinkStats.value = null
        selectedLinkDetailedStats.value = null
        error.value = null

        if (newProjectId) {
          void fetchLinks()
        }
      }
    },
    { immediate: false }
  )

  const activeLinks = computed(() => links.value.filter((link) => link.isActive))
  const totalLinks = computed(() => links.value.length)
  const activeLinksCount = computed(() => activeLinks.value.length)
  const canCreateMore = computed(() => links.value.length < MAX_LINKS)
  const remainingSlots = computed(() => MAX_LINKS - links.value.length)
  const totalClicks = computed(() => activeLinks.value.reduce((sum, link) => sum + (link.stats?.clicks || 0), 0))
  const totalContacts = computed(() => activeLinks.value.reduce((sum, link) => sum + (link.stats?.contacts || 0), 0))
  const totalSales = computed(() => activeLinks.value.reduce((sum, link) => sum + (link.stats?.sales || 0), 0))
  const totalRevenue = computed(() => activeLinks.value.reduce((sum, link) => sum + (link.stats?.revenue || 0), 0))
  const overallConversionRate = computed(() => {
    if (totalClicks.value === 0) return 0
    return (totalContacts.value / totalClicks.value) * 100
  })
  const linkById = (id: string): Link | undefined => links.value.find((link) => link.id === id)

  const getActiveProjectId = (): string | null => currentProjectId.value ?? localStorage.getItem('current_project_id')

  const fetchLinks = async (): Promise<void> => {
    const projectId = getActiveProjectId()

    if (!projectId) {
      links.value = []
      error.value = null
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await getTrackableLinks(projectId)
      if (!result.ok) {
        throw result.error
      }

      links.value = result.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar links de rastreamento'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createLink = async (data: CreateTrackingLinkDTO): Promise<Link> => {
    isLoading.value = true
    error.value = null

    try {
      if (!canCreateMore.value) {
        throw new Error(`Limite de ${MAX_LINKS} links atingido.`)
      }

      const projectId = getActiveProjectId()
      if (!projectId) {
        throw new Error('Nenhum projeto selecionado')
      }

      if (!data.whatsappNumber?.trim()) {
        throw new Error('Número do WhatsApp é obrigatório')
      }

      const result = await createTrackableLink(projectId, data)
      if (!result.ok) {
        throw result.error
      }

      links.value.unshift(result.value)
      return result.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar link'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateLink = async (id: string, data: UpdateTrackingLinkDTO): Promise<Link> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await updateTrackableLink(id, data)
      if (!result.ok) {
        throw result.error
      }

      const index = links.value.findIndex((link) => link.id === id)
      if (index >= 0) {
        links.value[index] = result.value
      }

      if (selectedLink.value?.id === id) {
        selectedLink.value = result.value
      }

      return result.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar link'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteLink = async (id: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await deleteTrackableLink(id)
      if (!result.ok) {
        throw result.error
      }

      links.value = links.value.filter((link) => link.id !== id)

      if (selectedLink.value?.id === id) {
        selectedLink.value = null
        selectedLinkStats.value = null
        selectedLinkDetailedStats.value = null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar link'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleActive = async (id: string, active: boolean): Promise<void> => {
    await updateLink(id, { isActive: active })
  }

  const fetchLinkStats = async (id: string): Promise<void> => {
    isLoadingStats.value = true
    error.value = null

    try {
      const result = await getTrackableLinkStats(id)
      if (!result.ok) {
        throw result.error
      }

      const details = result.value
      selectedLinkDetailedStats.value = details
      selectedLinkStats.value = {
        clicks: details.clicksCount,
        contacts: details.contactsCount,
        sales: details.salesCount,
        revenue: details.revenue
      }

      const linkIndex = links.value.findIndex((link) => link.id === id)
      if (linkIndex >= 0) {
        const currentLink = links.value[linkIndex]
        if (currentLink) {
          links.value[linkIndex] = {
            ...currentLink,
            stats: {
              clicks: details.clicksCount,
              contacts: details.contactsCount,
              sales: details.salesCount,
              revenue: details.revenue
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas do link'
      error.value = errorMessage
      throw err
    } finally {
      isLoadingStats.value = false
    }
  }

  const setSelectedLink = (link: Link | null): void => {
    selectedLink.value = link
    selectedLinkStats.value = null
    selectedLinkDetailedStats.value = null
  }

  const setBaseUrl = (url: string): void => {
    BASE_URL.value = url
  }

  const clearError = (): void => {
    error.value = null
  }

  const refresh = async (): Promise<void> => {
    await fetchLinks()
  }

  return {
    links: readonly(links),
    selectedLink: readonly(selectedLink),
    selectedLinkStats: readonly(selectedLinkStats),
    selectedLinkDetailedStats: readonly(selectedLinkDetailedStats),
    isLoading: readonly(isLoading),
    isLoadingStats: readonly(isLoadingStats),
    error: readonly(error),
    BASE_URL: readonly(BASE_URL),

    MAX_LINKS,
    activeLinks,
    totalLinks,
    activeLinksCount,
    canCreateMore,
    remainingSlots,
    totalClicks,
    totalContacts,
    totalSales,
    totalRevenue,
    overallConversionRate,
    linkById,

    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    toggleActive,
    fetchLinkStats,
    setSelectedLink,
    setBaseUrl,
    clearError,
    refresh
  }
})
