/**
 * Composable para navegação com contexto de projeto
 * 
 * Fornece helpers para navegar entre rotas que requerem projectId
 * 
 * @module composables/useProjectNavigation
 */

import { useRouter, useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { computed } from 'vue'

export function useProjectNavigation() {
  const router = useRouter()
  const route = useRoute()
  const projectsStore = useProjectsStore()

  // Computed
  const currentProjectId = computed(() => {
    return route.params.projectId as string || projectsStore.currentProject?.id
  })

  const currentLocale = computed(() => {
    return route.params.locale as string || 'pt'
  })

  /**
   * Navegar para uma rota com projectId
   */
  const navigateToProjectRoute = (routeName: string, projectId?: string) => {
    const targetProjectId = projectId || currentProjectId.value

    if (!targetProjectId) {
      console.error('[Project Navigation] No project ID available')
      // Fallback: redirect to projects list
      router.push({
        name: 'projects',
        params: { locale: currentLocale.value }
      })
      return
    }

    const targetRoute = {
      name: routeName,
      params: {
        projectId: targetProjectId,
        locale: currentLocale.value
      }
    }

    router.push(targetRoute)
  }

  /**
   * Navegar para dashboard do projeto atual (Dashboard V2)
   */
  const goToDashboard = (projectId?: string) => {
    navigateToProjectRoute('dashboard-v2', projectId)
  }

  /**
   * Navegar para contatos do projeto atual
   */
  const goToContacts = (projectId?: string) => {
    navigateToProjectRoute('contacts', projectId)
  }

  /**
   * Navegar para vendas do projeto atual
   */
  const goToSales = (projectId?: string) => {
    navigateToProjectRoute('sales', projectId)
  }

  /**
   * Navegar para eventos do projeto atual
   */
  const goToEvents = (projectId?: string) => {
    navigateToProjectRoute('events', projectId)
  }

  /**
   * Navegar para mensagens do projeto atual
   */
  const goToMessages = (projectId?: string) => {
    navigateToProjectRoute('messages', projectId)
  }

  /**
   * Navegar para tracking do projeto atual
   */
  const goToTracking = (projectId?: string) => {
    navigateToProjectRoute('tracking', projectId)
  }

  /**
   * Navegar para integrações do projeto atual
   */
  const goToIntegrations = (projectId?: string) => {
    navigateToProjectRoute('integrations', projectId)
  }

  /**
   * Navegar para configurações do projeto atual
   */
  const goToSettings = (projectId?: string, tab?: string) => {
    if (tab) {
      navigateToProjectRoute(`settings-${tab}`, projectId)
    } else {
      navigateToProjectRoute('settings', projectId)
    }
  }

  /**
   * Navegar para lista de projetos
   */
  const goToProjects = () => {
    router.push({
      name: 'projects',
      params: { locale: currentLocale.value }
    })
  }

  /**
   * Trocar de projeto e navegar para dashboard
   */
  const switchProject = async (projectId: string) => {
    try {
      // Carregar projeto
      const project = await projectsStore.loadProject(projectId)

      if (!project) {
        console.error('[Project Navigation] Project not found:', projectId)
        return
      }

      // Definir como projeto atual
      projectsStore.setCurrentProject(project)

      // Navegar para dashboard do novo projeto
      goToDashboard(projectId)
    } catch (error) {
      console.error('[Project Navigation] Error switching project:', error)
    }
  }

  /**
   * Obter URL para uma rota com projectId
   */
  const getProjectRouteUrl = (routeName: string, projectId?: string) => {
    const targetProjectId = projectId || currentProjectId.value

    if (!targetProjectId) {
      return null
    }

    return router.resolve({
      name: routeName,
      params: {
        projectId: targetProjectId,
        locale: currentLocale.value
      }
    }).href
  }

  /**
   * Verificar se a rota atual tem projectId
   */
  const hasProjectContext = computed(() => {
    return !!(route.params.projectId && typeof route.params.projectId === 'string')
  })

  return {
    // State
    currentProjectId,
    currentLocale,
    hasProjectContext,

    // Navigation methods
    navigateToProjectRoute,
    goToDashboard,
    goToContacts,
    goToSales,
    goToEvents,
    goToMessages,
    goToTracking,
    goToIntegrations,
    goToSettings,
    goToProjects,
    switchProject,

    // Helpers
    getProjectRouteUrl
  }
}
