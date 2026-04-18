import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useCompaniesStore } from './companies'
import { settingsService } from '@/services/api/settings'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import type {
  ProjectSettings,
  GeneralSettings,
  CurrencySettings,
  NotificationSettings
} from '@/types/models'

/**
 * Store para gerenciar configurações do projeto
 */
export const useSettingsStore = defineStore('settings', () => {
  // ============================================================================
  // STATE
  // ============================================================================

  /**
   * Configurações completas do projeto
   */
  const settings = ref<ProjectSettings | null>(null)

  /**
   * Estado de loading
   */
  const isLoading = ref(false)

  /**
   * Erro atual
   */
  const error = ref<string | null>(null)

  /**
   * Se há mudanças não salvas
   */
  const hasUnsavedChanges = ref(false)

  // ============================================================================
  // MULTI-TENANCY: Watch for project changes
  // ============================================================================

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
        console.log('[Settings Store] Project changed, clearing data:', { oldProjectId, newProjectId })
        
        // Clear all data
        settings.value = null
        hasUnsavedChanges.value = false
        error.value = null
        
        // Reload data for new project if project exists
        if (newProjectId) {
          console.log('[Settings Store] Loading data for new project:', newProjectId)
          fetchSettings(newProjectId)
        }
      }
  },
  { immediate: false }
)

  /**
   * Watch for company changes to reload settings
   * This ensures settings are updated when switching companies
   */
  watch(
    () => {
      const companiesStore = useCompaniesStore()
      return companiesStore.currentCompanyId
    },
    (newCompanyId, oldCompanyId) => {
      if (newCompanyId !== oldCompanyId && newCompanyId) {
        console.log('[Settings] Company changed, reloading settings...')
        // Carregar configurações da nova empresa
        const companiesStore = useCompaniesStore()
        if (companiesStore.companySettings) {
          // Mapear configurações da empresa para settings do projeto
          // (manter compatibilidade com estrutura existente)
          console.log('[Settings] Company settings loaded:', companiesStore.companySettings)
        }
      }
    },
    { immediate: false }
  )

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Modelo de atribuição atual
   */
  const currentAttributionModel = computed(() => {
    return settings.value?.general?.attributionModel || 'first_touch'
  })

  /**
   * Moeda atual
   */
  const currentCurrency = computed(() => {
    return settings.value?.currency?.currency || 'BRL'
  })

  /**
   * Fuso horário atual
   */
  const currentTimezone = computed(() => {
    return settings.value?.currency?.timezone || 'America/Sao_Paulo'
  })

  /**
   * Se notificações estão habilitadas
   */
  const isNotificationsEnabled = computed(() => {
    return settings.value?.notifications?.enabled || false
  })

  /**
   * Configurações gerais
   */
  const generalSettings = computed(() => {
    return settings.value?.general || null
  })

  /**
   * Configurações de moeda
   */
  const currencySettings = computed(() => {
    return settings.value?.currency || null
  })

  /**
   * Configurações de notificação
   */
  const notificationSettings = computed(() => {
    return settings.value?.notifications || null
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Busca configurações do projeto
   */
  const fetchSettings = async (_projectId: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const data = await settingsService.getSettings()
      settings.value = data
      hasUnsavedChanges.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar configurações'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza configurações gerais
   */
  const updateGeneralSettings = async (data: GeneralSettings): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const updated = await settingsService.updateGeneral(data)
      if (settings.value) {
        settings.value.general = { ...settings.value.general, ...updated }
        hasUnsavedChanges.value = false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar configurações gerais'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza configurações de moeda
   */
  const updateCurrencySettings = async (data: CurrencySettings): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const updated = await settingsService.updateCurrency(data)
      if (settings.value) {
        settings.value.currency = { ...settings.value.currency, ...updated }
        hasUnsavedChanges.value = false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar configurações de moeda'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza configurações de notificação
   */
  const updateNotificationSettings = async (data: NotificationSettings): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const updated = await settingsService.updateNotifications(data)
      if (settings.value) {
        settings.value.notifications = { ...settings.value.notifications, ...updated }
        hasUnsavedChanges.value = false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar configurações de notificação'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Arquivar projeto
   */
  const archiveProject = async (projectId: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const { apiClient } = await import('@/services/api/client')
      await apiClient.patch(`/projects/${projectId}`, { status: 'archived' })

      settings.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao arquivar projeto'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deletar projeto
   */
  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const { apiClient } = await import('@/services/api/client')
      await apiClient.delete(`/projects/${projectId}`)

      settings.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar projeto'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Detecta fuso horário do navegador
   */
  const detectBrowserTimezone = (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
      return 'America/Sao_Paulo' // Fallback para Brasil
    }
  }

  /**
   * Detecta locale do navegador
   */
  const detectBrowserLocale = (): { currency: string; dateFormat: string } => {
    try {
      const locale = navigator.language || 'pt-BR'
      
      // Detectar moeda baseada no locale
      let currency = 'BRL'
      if (locale.startsWith('en-US')) currency = 'USD'
      else if (locale.startsWith('en-GB')) currency = 'GBP'
      else if (locale.startsWith('en')) currency = 'USD'
      else if (locale.startsWith('es')) currency = 'ARS'
      else if (locale.startsWith('fr')) currency = 'EUR'
      else if (locale.startsWith('de')) currency = 'EUR'
      else if (locale.startsWith('it')) currency = 'EUR'
      else if (locale.startsWith('pt')) currency = 'BRL'

      // Detectar formato de data baseado no locale
      let dateFormat = 'DD/MM/YYYY'
      if (locale.startsWith('en-US')) dateFormat = 'MM/DD/YYYY'
      else if (locale.startsWith('en')) dateFormat = 'DD/MM/YYYY'
      else if (locale.startsWith('pt')) dateFormat = 'DD/MM/YYYY'
      else if (locale.startsWith('es')) dateFormat = 'DD/MM/YYYY'
      else if (locale.startsWith('fr')) dateFormat = 'DD/MM/YYYY'
      else if (locale.startsWith('de')) dateFormat = 'DD/MM/YYYY'
      else if (locale.startsWith('it')) dateFormat = 'DD/MM/YYYY'

      return { currency, dateFormat }
    } catch (error) {
      return { currency: 'BRL', dateFormat: 'DD/MM/YYYY' }
    }
  }

  /**
   * Marca que há mudanças não salvas
   */
  const markAsChanged = (): void => {
    hasUnsavedChanges.value = true
  }

  /**
   * Limpa o estado do store
   */
  const clearSettings = (): void => {
    settings.value = null
    error.value = null
    hasUnsavedChanges.value = false
  }

  /**
   * Reseta o estado de loading e erro
   */
  const resetState = (): void => {
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    settings,
    isLoading,
    error,
    hasUnsavedChanges,

    // Getters
    currentAttributionModel,
    currentCurrency,
    currentTimezone,
    isNotificationsEnabled,
    generalSettings,
    currencySettings,
    notificationSettings,

    // Actions
    fetchSettings,
    updateGeneralSettings,
    updateCurrencySettings,
    updateNotificationSettings,
    archiveProject,
    deleteProject,
    detectBrowserTimezone,
    detectBrowserLocale,
    markAsChanged,
    clearSettings,
    resetState
  }
})
