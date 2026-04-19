import { ref, type ComputedRef } from 'vue'
import { adInsightsService } from '@/services/api/adInsights'
import { whatsappIntegrationService } from '@/services/api/whatsappIntegrationService'
import type { Integration } from '@/types/models'
import type { ConnectedAccount } from '@/types/whatsapp'
import type {
  AdMetricsMap,
  AdMetricsLoadingMap,
  AdvertisingPlatform,
} from '@/types/integrations'

interface UseIntegrationsDataLoaderOptions {
  currentProjectId: ComputedRef<string>
  fetchIntegrations: () => Promise<unknown>
  getTagScript: (projectId: string) => Promise<unknown>
  getIntegrationByPlatform: (platform: AdvertisingPlatform) => Integration | undefined
}

export const useIntegrationsDataLoader = ({
  currentProjectId,
  fetchIntegrations,
  getTagScript,
  getIntegrationByPlatform,
}: UseIntegrationsDataLoaderOptions) => {
  const adMetrics = ref<AdMetricsMap>({
    meta: null,
    google: null,
    tiktok: null,
  })

  const metricsLoading = ref<AdMetricsLoadingMap>({
    meta: false,
    google: false,
    tiktok: false,
  })

  const whatsappAccounts = ref<ConnectedAccount[]>([])
  const whatsappAccountsLoading = ref(false)

  const loadWhatsAppAccounts = async () => {
    if (!currentProjectId.value) {
      whatsappAccounts.value = []
      return
    }

    try {
      whatsappAccountsLoading.value = true
      const result = await whatsappIntegrationService.listProjectAccounts(currentProjectId.value)

      if (!result.success) {
        console.error('[IntegrationsView] Erro ao buscar instâncias WhatsApp:', result.error)
        whatsappAccounts.value = []
        return
      }

      const statusWeight: Record<ConnectedAccount['status'], number> = {
        connected: 0,
        connecting: 1,
        disconnected: 2,
      }

      whatsappAccounts.value = [...result.data].sort((a, b) => {
        const byStatus = statusWeight[a.status] - statusWeight[b.status]
        if (byStatus !== 0) return byStatus
        return (b.connectedAt || '').localeCompare(a.connectedAt || '')
      })
    } catch (error) {
      console.error('[IntegrationsView] Erro inesperado ao buscar instâncias WhatsApp:', error)
      whatsappAccounts.value = []
    } finally {
      whatsappAccountsLoading.value = false
    }
  }

  const loadAdMetrics = async () => {
    const advertisingPlatforms: readonly AdvertisingPlatform[] = ['meta', 'google', 'tiktok']

    for (const platform of advertisingPlatforms) {
      const integration = getIntegrationByPlatform(platform)

      if (integration?.status !== 'connected') {
        continue
      }

      metricsLoading.value[platform] = true

      try {
        const metrics = await adInsightsService.getPlatformMetrics(platform, { period: '30d' })
        adMetrics.value[platform] = metrics
      } catch (error) {
        console.error(`Erro ao carregar métricas de ${platform}:`, error)
        adMetrics.value[platform] = null
      } finally {
        metricsLoading.value[platform] = false
      }
    }
  }

  const refreshPlatformMetrics = async (platform: AdvertisingPlatform) => {
    metricsLoading.value[platform] = true

    try {
      const metrics = await adInsightsService.getPlatformMetrics(platform, { period: '30d' })
      adMetrics.value[platform] = metrics
    } catch (error) {
      console.error(`Erro ao atualizar métricas de ${platform}:`, error)
      adMetrics.value[platform] = null
    } finally {
      metricsLoading.value[platform] = false
    }
  }

  const loadData = async () => {
    if (!currentProjectId.value) {
      console.warn('[IntegrationsView] No projectId available, skipping loadData')
      return
    }

    try {
      await Promise.all([
        fetchIntegrations(),
        getTagScript(currentProjectId.value),
        loadWhatsAppAccounts(),
      ])

      await loadAdMetrics()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const getWhatsAppStatusLabel = (status: ConnectedAccount['status']) => {
    if (status === 'connected') return 'Conectada'
    if (status === 'connecting') return 'Conectando'
    return 'Desconectada'
  }

  const getWhatsAppStatusClass = (status: ConnectedAccount['status']) => {
    if (status === 'connected') return 'border-green-200 text-green-700 bg-green-50'
    if (status === 'connecting') return 'border-amber-200 text-amber-700 bg-amber-50'
    return 'border-border text-muted-foreground bg-background'
  }

  const isPrimaryConnectedInstance = (account: ConnectedAccount) => {
    return account.status === 'connected'
  }

  return {
    adMetrics,
    metricsLoading,
    whatsappAccounts,
    whatsappAccountsLoading,
    loadData,
    loadWhatsAppAccounts,
    loadAdMetrics,
    refreshPlatformMetrics,
    getWhatsAppStatusLabel,
    getWhatsAppStatusClass,
    isPrimaryConnectedInstance,
  }
}
