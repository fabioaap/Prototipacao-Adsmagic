import { ref, type ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useToast } from '@/components/ui/toast/use-toast'
import type { Account, Connection, Integration } from '@/types/models'
import type { AdvertisingPlatform } from '@/types/integrations'

interface IntegrationsStoreActions {
  initiateOAuth: (platform: string, options: { locale: string }) => Promise<unknown>
  fetchIntegrations: () => Promise<unknown>
  saveAccounts: (platform: string, accountIds: string[]) => Promise<unknown>
  disconnectPlatform: (platform: string) => Promise<unknown>
  refreshConnection: (platform: string) => Promise<unknown>
  getIntegrationAccounts: (integrationId: string) => Promise<{
    accounts: Array<{
      id: string
      account_name: string
      external_account_id: string
      external_account_name: string
      pixel_id?: string
      is_primary: boolean
      status: string
      account_metadata?: Record<string, unknown>
    }>
  }>
  generateWhatsAppQR: () => Promise<string | null | undefined>
  checkWhatsAppConnection: (qrCode: string) => Promise<boolean>
}

interface UseIntegrationsPlatformActionsOptions {
  route: RouteLocationNormalizedLoaded
  getIntegrationByPlatform: (platform: string) => Integration | undefined
  integrationsStore: IntegrationsStoreActions
  refreshPlatformMetrics: (platform: AdvertisingPlatform) => Promise<void>
  openGoogleConversionActionsDrawer: (integrationId: string) => Promise<void>
  loadWhatsAppAccounts: () => Promise<void>
  isWhatsAppConnected: ComputedRef<boolean>
  whatsappQR: ComputedRef<string | null | undefined>
}

export const useIntegrationsPlatformActions = ({
  route,
  getIntegrationByPlatform,
  integrationsStore,
  refreshPlatformMetrics,
  openGoogleConversionActionsDrawer: _openGoogleConversionActionsDrawer,
  loadWhatsAppAccounts,
  isWhatsAppConnected,
  whatsappQR,
}: UseIntegrationsPlatformActionsOptions) => {
  const { toast } = useToast()

  const isWhatsAppQRModalOpen = ref(false)
  const isMetaConnectionModalOpen = ref(false)
  const isGoogleConnectionModalOpen = ref(false)
  const isAccountSelectorOpen = ref(false)
  const isConnectionInfoOpen = ref(false)

  const selectedPlatform = ref('')
  const selectedAccountIds = ref<string[]>([])
  const availableAccounts = ref<Account[]>([])
  const selectedConnection = ref<Connection | null>(null)

  const isDisconnectDialogOpen = ref(false)
  const disconnectPlatformTarget = ref('')
  const disconnectLoading = ref(false)
  const lastWhatsAppFallbackSyncAt = ref(0)

  const handlePlatformConnect = async (platform: string) => {
    try {
      selectedPlatform.value = platform

      const locale = (route.params.locale as string) || 'pt'
      await integrationsStore.initiateOAuth(platform, { locale })

      if (platform === 'meta' || platform === 'google' || platform === 'tiktok') {
        await refreshPlatformMetrics(platform)
      }

      toast({
        title: 'Conectado!',
        description: `${platform} foi conectado com sucesso`,
      })
    } catch (error) {
      console.error(`Erro ao conectar ${platform}:`, error)
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : `Não foi possível conectar com ${platform}`,
        variant: 'destructive',
      })
    }
  }

  const handleMetaConnect = () => {
    isMetaConnectionModalOpen.value = true
  }

  const handleMetaConnectionSuccess = async () => {
    isMetaConnectionModalOpen.value = false
    await integrationsStore.fetchIntegrations()
    await refreshPlatformMetrics('meta')
    toast({
      title: 'Conectado!',
      description: 'Meta Ads foi conectado com sucesso',
    })
  }

  const handleGoogleConnect = () => {
    isGoogleConnectionModalOpen.value = true
  }

  const handleGoogleConnectionSuccess = async () => {
    isGoogleConnectionModalOpen.value = false
    await integrationsStore.fetchIntegrations()
    await refreshPlatformMetrics('google')
    toast({
      title: 'Conectado!',
      description: 'Google Ads foi conectado com sucesso',
    })
  }

  const handleTikTokConnect = async () => {
    await handlePlatformConnect('tiktok')
  }

  const handleConfirmAccountSelection = async () => {
    try {
      await integrationsStore.saveAccounts(selectedPlatform.value, selectedAccountIds.value)
      isAccountSelectorOpen.value = false
      toast({
        title: 'Conectado!',
        description: `${selectedPlatform.value} foi conectado com sucesso`,
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as contas selecionadas',
        variant: 'destructive',
      })
    }
  }

  const openDisconnectConfirmation = (platform: string) => {
    disconnectPlatformTarget.value = platform
    isDisconnectDialogOpen.value = true
  }

  const handleMetaDisconnect = () => openDisconnectConfirmation('meta')
  const handleGoogleDisconnect = () => openDisconnectConfirmation('google')
  const handleTikTokDisconnect = () => openDisconnectConfirmation('tiktok')
  const handleWhatsAppDisconnect = () => openDisconnectConfirmation('whatsapp')

  const getPlatformDisplayName = (platform: string): string => {
    const names: Record<string, string> = {
      meta: 'Meta Ads',
      google: 'Google Ads',
      tiktok: 'TikTok Ads',
      whatsapp: 'WhatsApp',
    }
    return names[platform] || platform
  }

  const confirmDisconnect = async () => {
    const platform = disconnectPlatformTarget.value
    if (!platform) return

    disconnectLoading.value = true
    try {
      await integrationsStore.disconnectPlatform(platform)
      if (platform === 'whatsapp') {
        await loadWhatsAppAccounts()
      }
      toast({
        title: 'Desconectado',
        description: `${getPlatformDisplayName(platform)} foi desconectado com sucesso`,
      })
      isDisconnectDialogOpen.value = false
    } catch {
      toast({
        title: 'Erro',
        description: `Não foi possível desconectar ${getPlatformDisplayName(platform)}`,
        variant: 'destructive',
      })
    } finally {
      disconnectLoading.value = false
    }
  }

  const cancelDisconnect = () => {
    isDisconnectDialogOpen.value = false
    disconnectPlatformTarget.value = ''
  }

  const handleMetaReconnect = () => handlePlatformConnect('meta')
  const handleGoogleReconnect = () => {
    isGoogleConnectionModalOpen.value = true
  }
  const handleTikTokReconnect = () => handlePlatformConnect('tiktok')
  const handleWhatsAppReconnect = async () => {
    isWhatsAppQRModalOpen.value = true
  }

  const handlePlatformSync = async (platform: string) => {
    try {
      await integrationsStore.refreshConnection(platform)

      if (platform === 'meta' || platform === 'google' || platform === 'tiktok') {
        await refreshPlatformMetrics(platform)
      }

      toast({
        title: 'Sincronizado',
        description: `${platform} foi sincronizado com sucesso`,
      })
    } catch {
      toast({
        title: 'Erro',
        description: `Não foi possível sincronizar ${platform}`,
        variant: 'destructive',
      })
    }
  }

  const handleMetaSync = () => handlePlatformSync('meta')
  const handleGoogleSync = () => handlePlatformSync('google')
  const handleTikTokSync = () => handlePlatformSync('tiktok')

  const handleWhatsAppSync = async () => {
    try {
      await integrationsStore.refreshConnection('whatsapp')
      await loadWhatsAppAccounts()
      toast({
        title: 'Sincronizado',
        description: 'WhatsApp foi sincronizado com sucesso',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível sincronizar o WhatsApp',
        variant: 'destructive',
      })
    }
  }

  const createConnectionFromIntegration = (platform: string, integration: Integration): Connection => {
    const settings = (integration.settings || integration.platformConfig || {}) as Record<string, unknown>

    const fallbackAccountId =
      integration.connection?.accountId ||
      (typeof settings.accountId === 'string' ? settings.accountId : undefined) ||
      (typeof settings.adAccountId === 'string' ? settings.adAccountId : undefined) ||
      (typeof settings.customerId === 'string' ? settings.customerId : undefined) ||
      integration.id

    const fallbackAccountName =
      integration.connection?.accountName ||
      (typeof settings.accountName === 'string' ? settings.accountName : undefined) ||
      (typeof settings.businessName === 'string' ? settings.businessName : undefined) ||
      getPlatformDisplayName(platform)

    const fallbackEmail =
      integration.connection?.email ||
      (typeof settings.email === 'string' ? settings.email : undefined)

    const fallbackConnectedAt =
      integration.connection?.connectedAt ||
      integration.lastSync ||
      integration.updatedAt ||
      integration.createdAt

    const fallbackExpiresAt =
      integration.connection?.expiresAt ||
      (typeof settings.expiresAt === 'string' ? settings.expiresAt : undefined)

    return {
      id: `${platform}_${Date.now()}`,
      platform,
      accountId: fallbackAccountId,
      accountName: fallbackAccountName,
      email: fallbackEmail,
      connectedAt: fallbackConnectedAt,
      expiresAt: fallbackExpiresAt,
      permissions: [],
    }
  }

  const resolveConnectionDetails = async (platform: string, integration: Integration): Promise<Connection> => {
    if (integration.connection) {
      const connection = integration.connection
      return {
        id: `${platform}_${Date.now()}`,
        platform,
        accountId: connection.accountId || '',
        accountName: connection.accountName || getPlatformDisplayName(platform),
        email: connection.email,
        connectedAt: connection.connectedAt,
        expiresAt: connection.expiresAt,
        permissions: [],
      }
    }

    try {
      const response = await integrationsStore.getIntegrationAccounts(integration.id)
      const primaryAccount =
        response.accounts.find((account) => account.is_primary) || response.accounts[0]

      if (primaryAccount) {
        return {
          id: `${platform}_${Date.now()}`,
          platform,
          accountId: primaryAccount.external_account_id || primaryAccount.id,
          accountName:
            primaryAccount.external_account_name ||
            primaryAccount.account_name ||
            getPlatformDisplayName(platform),
          connectedAt: integration.lastSync || integration.updatedAt || integration.createdAt,
          permissions: [],
          metadata: primaryAccount.account_metadata,
        }
      }
    } catch (error) {
      console.warn(`[Integrations] Nao foi possivel buscar contas da integracao ${platform}:`, error)
    }

    return createConnectionFromIntegration(platform, integration)
  }

  const handlePlatformViewDetails = async (platform: string) => {
    const integration = getIntegrationByPlatform(platform)
    if (!integration || integration.status !== 'connected') {
      toast({
        title: 'Detalhes indisponiveis',
        description: `Nao foi possivel localizar uma conexao ativa para ${getPlatformDisplayName(platform)}.`,
        variant: 'destructive',
      })
      return
    }

    selectedConnection.value = await resolveConnectionDetails(platform, integration)

    selectedPlatform.value = platform
    isConnectionInfoOpen.value = true
  }

  const handleMetaViewDetails = () => handlePlatformViewDetails('meta')

  const handleGoogleViewDetails = () => handlePlatformViewDetails('google')

  const handleTikTokViewDetails = () => handlePlatformViewDetails('tiktok')

  const handleWhatsAppViewDetails = () => {
    const integration = getIntegrationByPlatform('whatsapp')
    if (!integration?.connection) {
      return
    }

    const connection = integration.connection
    selectedConnection.value = {
      id: `whatsapp_${Date.now()}`,
      platform: 'whatsapp',
      accountId: connection.accountId || '',
      accountName: connection.accountName || 'WhatsApp Business',
      email: connection.email,
      connectedAt: connection.connectedAt,
      expiresAt: connection.expiresAt,
      permissions: [],
    }

    selectedPlatform.value = 'whatsapp'
    isConnectionInfoOpen.value = true
  }

  const handleViewConnectionLogs = () => {
    toast({
      title: 'Logs',
      description: 'Funcionalidade de logs será implementada em breve',
    })
  }

  const handleRefreshConnection = async () => {
    try {
      await integrationsStore.refreshConnection(selectedPlatform.value)
      toast({
        title: 'Atualizado',
        description: 'Conexão foi atualizada com sucesso',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a conexão',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnectConnection = () => {
    isConnectionInfoOpen.value = false
    openDisconnectConfirmation(selectedPlatform.value)
  }

  const handleWhatsAppConnect = async () => {
    await loadWhatsAppAccounts()

    if (isWhatsAppConnected.value) {
      toast({
        title: 'WhatsApp já conectado',
        description: 'A conexão já está ativa para este projeto.',
      })
      return
    }

    isWhatsAppQRModalOpen.value = true
  }

  const handleGenerateWhatsAppQR = async () => {
    try {
      const qrCode = await integrationsStore.generateWhatsAppQR()
      await loadWhatsAppAccounts()

      if (!qrCode && isWhatsAppConnected.value) {
        toast({
          title: 'Conectado!',
          description: 'WhatsApp já estava conectado.',
        })
        isWhatsAppQRModalOpen.value = false
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o QR Code',
        variant: 'destructive',
      })
    }
  }

  const handleCheckWhatsAppConnection = async () => {
    try {
      const isConnected = await integrationsStore.checkWhatsAppConnection(whatsappQR.value || '')
      if (isConnected) {
        await loadWhatsAppAccounts()
        toast({
          title: 'Conectado!',
          description: 'WhatsApp foi conectado com sucesso',
        })
        isWhatsAppQRModalOpen.value = false
        return
      }

      const now = Date.now()
      if (now - lastWhatsAppFallbackSyncAt.value >= 12000) {
        lastWhatsAppFallbackSyncAt.value = now
        await integrationsStore.fetchIntegrations()
        await loadWhatsAppAccounts()

        if (isWhatsAppConnected.value) {
          toast({
            title: 'Conectado!',
            description: 'WhatsApp foi conectado com sucesso',
          })
          isWhatsAppQRModalOpen.value = false
        }
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar a conexão',
        variant: 'destructive',
      })
    }
  }

  return {
    isWhatsAppQRModalOpen,
    isMetaConnectionModalOpen,
    isGoogleConnectionModalOpen,
    isAccountSelectorOpen,
    isConnectionInfoOpen,
    selectedPlatform,
    selectedAccountIds,
    availableAccounts,
    selectedConnection,
    isDisconnectDialogOpen,
    disconnectPlatformTarget,
    disconnectLoading,
    handleMetaConnect,
    handleMetaConnectionSuccess,
    handleGoogleConnect,
    handleGoogleConnectionSuccess,
    handleTikTokConnect,
    handleConfirmAccountSelection,
    handleMetaDisconnect,
    handleGoogleDisconnect,
    handleTikTokDisconnect,
    handleWhatsAppDisconnect,
    confirmDisconnect,
    cancelDisconnect,
    getPlatformDisplayName,
    handleMetaReconnect,
    handleGoogleReconnect,
    handleTikTokReconnect,
    handleWhatsAppReconnect,
    handleMetaSync,
    handleGoogleSync,
    handleTikTokSync,
    handleWhatsAppSync,
    handleMetaViewDetails,
    handleGoogleViewDetails,
    handleTikTokViewDetails,
    handleWhatsAppViewDetails,
    handleViewConnectionLogs,
    handleRefreshConnection,
    handleDisconnectConnection,
    handleWhatsAppConnect,
    handleGenerateWhatsAppQR,
    handleCheckWhatsAppConnection,
  }
}
