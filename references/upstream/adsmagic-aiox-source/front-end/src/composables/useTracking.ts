/**
 * Composable para tracking de eventos
 * 
 * Fornece interface reativa para o serviço de tracking
 * 
 * @module composables/useTracking
 */

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import { trackingService, type TagConfig, type ConversionData, type LeadData, type PurchaseData, type TagStatus } from '@/services/tracking'

export function useTracking(projectId?: string) {
  // Estado reativo
  const isInitialized = ref(false)
  const tagStatus = ref<TagStatus>({
    isInstalled: false,
    isActive: false,
    version: undefined,
    lastChecked: new Date().toISOString(),
    events: {
      pageView: false,
      click: false,
      purchase: false,
      lead: false
    }
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isTagWorking = computed(() => tagStatus.value.isInstalled && tagStatus.value.isActive)
  const canTrackEvents = computed(() => isTagWorking.value && isInitialized.value)

  /**
   * Inicializar tracking
   */
  const init = async (config: TagConfig) => {
    isLoading.value = true
    error.value = null

    try {
      await trackingService.init(config)
      isInitialized.value = true
      
      // Verificar status da tag
      await checkTagStatus()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao inicializar tracking'
      console.error('[useTracking] Init error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verificar status da tag
   */
  const checkTagStatus = async () => {
    try {
      const status = await trackingService.checkTagInstallation()
      tagStatus.value = status
    } catch (err) {
      console.error('[useTracking] Check status error:', err)
    }
  }

  /**
   * Rastrear evento customizado
   */
  const trackEvent = (eventName: string, properties: Record<string, unknown> = {}) => {
    if (!canTrackEvents.value) {
      console.warn('[useTracking] Cannot track event - tag not working')
      return
    }

    try {
      trackingService.trackEvent(eventName, properties)
    } catch (err) {
      console.error('[useTracking] Track event error:', err)
    }
  }

  /**
   * Rastrear conversão
   */
  const trackConversion = (data: ConversionData) => {
    if (!canTrackEvents.value) {
      console.warn('[useTracking] Cannot track conversion - tag not working')
      return
    }

    try {
      trackingService.trackConversion(data)
    } catch (err) {
      console.error('[useTracking] Track conversion error:', err)
    }
  }

  /**
   * Rastrear lead
   */
  const trackLead = (data: LeadData) => {
    if (!canTrackEvents.value) {
      console.warn('[useTracking] Cannot track lead - tag not working')
      return
    }

    try {
      trackingService.trackLead(data)
    } catch (err) {
      console.error('[useTracking] Track lead error:', err)
    }
  }

  /**
   * Rastrear compra
   */
  const trackPurchase = (data: PurchaseData) => {
    if (!canTrackEvents.value) {
      console.warn('[useTracking] Cannot track purchase - tag not working')
      return
    }

    try {
      trackingService.trackPurchase(data)
    } catch (err) {
      console.error('[useTracking] Track purchase error:', err)
    }
  }

  /**
   * Definir usuário
   */
  const setUser = (userData: { id: string; email?: string; name?: string }) => {
    if (!isInitialized.value) {
      console.warn('[useTracking] Service not initialized')
      return
    }

    try {
      trackingService.setUser(userData)
    } catch (err) {
      console.error('[useTracking] Set user error:', err)
    }
  }

  /**
   * Definir projeto
   */
  const setProject = (projectData: { id: string; name?: string }) => {
    if (!isInitialized.value) {
      console.warn('[useTracking] Service not initialized')
      return
    }

    try {
      trackingService.setProject(projectData)
    } catch (err) {
      console.error('[useTracking] Set project error:', err)
    }
  }

  /**
   * Forçar envio de eventos
   */
  const flush = () => {
    if (!isInitialized.value) {
      console.warn('[useTracking] Service not initialized')
      return
    }

    try {
      trackingService.flush()
    } catch (err) {
      console.error('[useTracking] Flush error:', err)
    }
  }

  /**
   * Obter informações da sessão
   */
  const getSession = () => {
    if (!isInitialized.value) {
      return {}
    }

    try {
      return trackingService.getSession()
    } catch (err) {
      console.error('[useTracking] Get session error:', err)
      return {}
    }
  }

  /**
   * Gerar código de instalação
   */
  const generateInstallationCode = (projectId: string) => {
    return trackingService.generateInstallationCode(projectId)
  }

  /**
   * Testar tag
   */
  const testTag = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await trackingService.testTag()
      
      if (!result.success) {
        error.value = result.message
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Destruir serviço
   */
  const destroy = () => {
    try {
      trackingService.destroy()
      isInitialized.value = false
      tagStatus.value = {
        isInstalled: false,
        isActive: false,
        version: undefined,
        lastChecked: new Date().toISOString(),
        events: {
          pageView: false,
          click: false,
          purchase: false,
          lead: false
        }
      }
    } catch (err) {
      console.error('[useTracking] Destroy error:', err)
    }
  }

  // Auto-inicializar se projectId fornecido
  onMounted(async () => {
    if (projectId) {
      await init({
        projectId,
        debug: import.meta.env.DEV,
        autoInit: true
      })
    }
  })

  // Cleanup
  onUnmounted(() => {
    destroy()
  })

  return {
    // Estado
    isInitialized: readonly(isInitialized),
    tagStatus: readonly(tagStatus),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    isTagWorking,
    canTrackEvents,
    
    // Métodos
    init,
    checkTagStatus,
    trackEvent,
    trackConversion,
    trackLead,
    trackPurchase,
    setUser,
    setProject,
    flush,
    getSession,
    generateInstallationCode,
    testTag,
    destroy
  }
}
