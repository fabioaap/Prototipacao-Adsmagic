import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type {
  Integration,
  TagInstallation,
  OAuthResult,
  Account,
  TagVerificationStartResponse,
  TagVerificationStatusResponse,
} from '@/types/models'
import { integrationsService } from '@/services/api/integrations'
import { whatsappIntegrationService } from '@/services/api/whatsappIntegrationService'
import {
  buildDefaultTagScriptUrl,
  buildTagSnippet,
} from '@/services/tagSnippet'
import { openOAuthPopup } from '@/composables/useOAuthPopup'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import { getOAuthRedirectUri } from '@/utils/oauthRedirect'

export const useIntegrationsStore = defineStore('integrations', () => {
  const getWhatsAppAccountStorageKey = (projectId: string) => `whatsapp_account_id:${projectId}`

  // ============================================================================
  // STATE
  // ============================================================================

  /**
   * Lista de integrações
   */
  const integrations = ref<Integration[]>([])

  /**
   * Status da tag de rastreamento
   */
  const tagInstallation = ref<TagInstallation | null>(null)

  /**
   * Estado de loading
   */
  const isLoading = ref(false)

  /**
   * Erro atual
   */
  const error = ref<string | null>(null)

  /**
   * QR Code do WhatsApp (temporário)
   */
  const whatsappQR = ref<string | null>(null)

  /**
   * Data de expiração do QR Code
   */
  const qrExpiresAt = ref<string | null>(null)
  const whatsappAccountId = ref<string | null>(null)
  const whatsappStatusCheckInFlight = ref(false)
  const lastWhatsAppStatusCheckAt = ref(0)
  const WHATSAPP_STATUS_CHECK_MIN_INTERVAL_MS = 3000

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
        console.log('[Integrations Store] Project changed, clearing data:', { oldProjectId, newProjectId })
        
        // Clear all data
        integrations.value = []
        tagInstallation.value = null
        whatsappQR.value = null
        qrExpiresAt.value = null
        error.value = null
        
        // Reload data for new project if project exists
        if (newProjectId) {
          console.log('[Integrations Store] Loading data for new project:', newProjectId)
          fetchIntegrations()
        }
      }
    },
    { immediate: false }
  )

  /**
   * Estado de conexão do WhatsApp
   */
  const whatsappConnecting = ref(false)

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Integrações conectadas
   */
  const connectedIntegrations = computed(() => 
    integrations.value.filter(integration => integration.status === 'connected')
  )

  /**
   * Integrações com erro
   */
  const errorIntegrations = computed(() => 
    integrations.value.filter(integration => integration.status === 'error')
  )

  /**
   * Integração por plataforma
   */
  const getIntegrationByPlatform = computed(() => (platform: string) => 
    integrations.value.find(integration => integration.platform === platform)
  )

  /**
   * Status da tag de rastreamento
   */
  const isTagInstalled = computed(() => 
    tagInstallation.value?.isInstalled ?? false
  )

  /**
   * Número de eventos recebidos pela tag
   */
  const eventsReceived = computed(() => 
    tagInstallation.value?.eventsReceived ?? 0
  )

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Busca todas as integrações do projeto atual
   * Combina dados reais da API com plataformas padrão (whatsapp, meta, google, tiktok)
   */
  const fetchIntegrations = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      // Get current project ID
      const projectId = localStorage.getItem('current_project_id') || ''

      if (!projectId) {
        console.warn('[Integrations Store] No project ID available')
        integrations.value = []
        return
      }

      // Buscar integrações reais da API
      const apiIntegrations = await integrationsService.getIntegrations(projectId)

      // Plataformas padrão que devem sempre aparecer
      const defaultPlatforms: Array<{ platform: Integration['platform']; platformType: Integration['platformType'] }> = [
        { platform: 'whatsapp', platformType: 'messaging' },
        { platform: 'meta', platformType: 'advertising' },
        { platform: 'google', platformType: 'advertising' },
        { platform: 'tiktok', platformType: 'advertising' },
      ]

      // Mesclar integrações reais com plataformas padrão
      const mergedIntegrations: Integration[] = defaultPlatforms.map(({ platform, platformType }) => {
        // Verificar se existe integração real para esta plataforma
        const existingIntegration = apiIntegrations.find(i => i.platform === platform)

        if (existingIntegration) {
          return existingIntegration
        }

        // Criar placeholder para plataformas não conectadas
        return {
          id: `placeholder-${platform}`,
          projectId,
          platform,
          platformType,
          status: 'disconnected' as const,
          platformConfig: {},
          lastSync: undefined,
          errorMessage: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })

      // Hidratar status do WhatsApp a partir de messaging_accounts
      try {
        const whatsappResult = await whatsappIntegrationService.listProjectAccounts(projectId)
        if (whatsappResult.success) {
          const activeAccount = whatsappResult.data.find(acc => acc.status === 'connected')
          if (activeAccount) {
            const wa = mergedIntegrations.find(i => i.platform === 'whatsapp')
            if (wa) {
              wa.status = 'connected'
              wa.connection = {
                connectedAt: activeAccount.connectedAt || new Date().toISOString(),
                accountId: activeAccount.accountId,
                accountName: activeAccount.profileName || activeAccount.phoneNumber || 'WhatsApp Business',
              }
              wa.lastSync = new Date().toISOString()
              whatsappAccountId.value = activeAccount.accountId
              localStorage.setItem(getWhatsAppAccountStorageKey(projectId), activeAccount.accountId)
            }
          }
        }
      } catch (err) {
        console.warn('[Integrations Store] Failed to hydrate WhatsApp status:', err)
      }

      integrations.value = mergedIntegrations
      console.log('[Integrations Store] Loaded integrations:', mergedIntegrations.length, 'connected:', mergedIntegrations.filter(i => i.status === 'connected').length)
    } catch (err) {
      console.error('[Integrations Store] Error fetching integrations:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao buscar integrações'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicia fluxo OAuth para plataforma
   * @param platform - Plataforma (meta, google, tiktok)
   * @param options - redirectUri ou locale para construir URL de callback dinâmica
   */
  const initiateOAuth = async (
    platform: string,
    options?: { redirectUri?: string; locale?: string }
  ): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const redirectUri =
        options?.redirectUri ?? getOAuthRedirectUri(options?.locale ?? 'pt')

      console.log(`[Integrations Store] Iniciando OAuth para ${platform}`)

      // 1. Obter URL de autorização da API (envia redirectUri para backend incluir na URL do Meta)
      const { authUrl } = await integrationsService.startOAuth(
        platform as 'meta' | 'google' | 'tiktok',
        redirectUri
      )

      console.log(`[Integrations Store] URL de autorização recebida`)

      // 2. Abrir popup OAuth
      await openOAuthPopup({
        authUrl,
        redirectUri,
        onSuccess: async (token: string) => {
          console.log(`[Integrations Store] Token recebido, processando callback`)

          try {
            // 3. Processar callback (backend troca por long-lived e salva)
            const result = await integrationsService.handleOAuthCallback(platform, token)

            if (result.success) {
              console.log(`[Integrations Store] OAuth concluído com sucesso`, result)

              // 4. Atualizar integração local
              const integration = integrations.value.find(i => i.platform === platform)
              if (integration) {
                integration.status = 'connected'
                integration.lastSync = new Date().toISOString()
                integration.error = undefined
                integration.connection = {
                  connectedAt: new Date().toISOString(),
                  accountId: result.accounts?.[0]?.accountId || '',
                  accountName: result.accounts?.[0]?.name || '',
                }
              }

              // Recarregar integrações para obter dados atualizados do servidor
              await fetchIntegrations()
            } else {
              throw new Error(result.error || 'Falha na autenticação')
            }
          } catch (err) {
            console.error(`[Integrations Store] Erro ao processar callback:`, err)
            throw err
          }
        },
        onError: (err: Error) => {
          console.error(`[Integrations Store] Erro no OAuth:`, err)
          error.value = err.message
        },
        timeout: 5 * 60 * 1000, // 5 minutos
      })
    } catch (err) {
      console.error(`[Integrations Store] Erro ao iniciar OAuth:`, err)
      error.value = err instanceof Error ? err.message : 'Erro ao iniciar autenticação'
      
      // Atualizar integração com erro
      const integration = integrations.value.find(i => i.platform === platform)
      if (integration) {
        integration.status = 'error'
        integration.error = {
          message: error.value || 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Conecta uma plataforma (legacy - mantido para compatibilidade)
   */
  const connectPlatform = async (platform: string, data: any): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      // Atualizar integração
      const integration = integrations.value.find(i => i.platform === platform)
      if (integration) {
        integration.status = 'connected'
        integration.connection = data.connection
        integration.lastSync = new Date().toISOString()
        integration.error = undefined
      }

      console.log(`Conectando ${platform}:`, data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao conectar plataforma'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Desconecta uma plataforma
   */
  const disconnectPlatform = async (platform: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      if (platform === 'whatsapp') {
        // Disconnect real via backend
        const projectId = localStorage.getItem('current_project_id') || ''
        let accountId = whatsappAccountId.value
        if (!accountId && projectId) {
          accountId = localStorage.getItem(getWhatsAppAccountStorageKey(projectId))
        }
        if (accountId) {
          const result = await whatsappIntegrationService.disconnectAccount(accountId)
          if (!result.success) {
            console.warn('[Integrations Store] WhatsApp disconnect API failed:', result.error)
          }
        }
        // Limpar estado local
        whatsappAccountId.value = null
        whatsappQR.value = null
        qrExpiresAt.value = null
        if (projectId) {
          localStorage.removeItem(getWhatsAppAccountStorageKey(projectId))
        }
      } else {
        // Simular delay da API para outras plataformas
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Atualizar integração local
      const integration = integrations.value.find(i => i.platform === platform)
      if (integration) {
        integration.status = 'disconnected'
        integration.connection = undefined
        integration.lastSync = undefined
        integration.error = undefined
      }

      console.log(`[Integrations Store] Desconectado: ${platform}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao desconectar plataforma'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza conexão de uma plataforma
   */
  const refreshConnection = async (platform: string): Promise<void> => {
    try {
      const integration = integrations.value.find(i => i.platform === platform)
      if (!integration) return

      integration.status = 'syncing'
      
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      integration.status = 'connected'
      integration.lastSync = new Date().toISOString()
    } catch (err) {
      const integration = integrations.value.find(i => i.platform === platform)
      if (integration) {
        integration.status = 'error'
        integration.error = {
          message: err instanceof Error ? err.message : 'Erro na sincronização',
          timestamp: new Date().toISOString()
        }
      }
      throw err
    }
  }

  /**
   * Gera QR Code para WhatsApp
   */
  const generateWhatsAppQR = async (): Promise<string> => {
    try {
      whatsappConnecting.value = true
      error.value = null
      const projectId = localStorage.getItem('current_project_id') || ''
      if (!projectId) {
        throw new Error('Projeto atual não encontrado')
      }

      let currentAccountId = whatsappAccountId.value
      if (!currentAccountId) {
        currentAccountId = localStorage.getItem(getWhatsAppAccountStorageKey(projectId))
      }

      if (!currentAccountId) {
        const accountsResult = await whatsappIntegrationService.listProjectAccounts(projectId)
        if (accountsResult.success) {
          const reusableAccount =
            accountsResult.data.find(account => account.status === 'connecting') ||
            accountsResult.data.find(account => account.status === 'disconnected') ||
            accountsResult.data.find(account => account.status === 'connected')

          if (reusableAccount) {
            currentAccountId = reusableAccount.accountId
            whatsappAccountId.value = currentAccountId
            localStorage.setItem(getWhatsAppAccountStorageKey(projectId), currentAccountId)

            if (reusableAccount.status === 'connected') {
              const integration = integrations.value.find(i => i.platform === 'whatsapp')
              if (integration) {
                integration.status = 'connected'
                integration.connection = {
                  connectedAt: reusableAccount.connectedAt || new Date().toISOString(),
                  accountId: currentAccountId,
                  accountName: reusableAccount.profileName || reusableAccount.phoneNumber || 'WhatsApp Business',
                }
                integration.lastSync = new Date().toISOString()
              }
              whatsappQR.value = null
              qrExpiresAt.value = null
              return ''
            }
          }
        }
      }

      if (!currentAccountId) {
        const brokersResult = await whatsappIntegrationService.listAvailableBrokers()
        if (!brokersResult.success) {
          throw new Error(brokersResult.error.message)
        }

        const uazapiBroker = brokersResult.data.find(broker => broker.name.toLowerCase() === 'uazapi')
        if (!uazapiBroker) {
          throw new Error('Broker Uazapi não está disponível')
        }

        const instanceResult = await whatsappIntegrationService.createInstance({
          projectId,
          brokerId: uazapiBroker.id,
        })

        if (!instanceResult.success) {
          throw new Error(instanceResult.error.message)
        }

        currentAccountId = instanceResult.data.accountId
        whatsappAccountId.value = currentAccountId
        localStorage.setItem(getWhatsAppAccountStorageKey(projectId), currentAccountId)
      }

      if (!currentAccountId) {
        throw new Error('Não foi possível preparar a conta do WhatsApp')
      }

      const connectResult = await whatsappIntegrationService.connectInstance({ accountId: currentAccountId })
      if (!connectResult.success) {
        throw new Error(connectResult.error.message)
      }

      if (connectResult.data.status === 'connected') {
        const integration = integrations.value.find(i => i.platform === 'whatsapp')
        if (integration) {
          integration.status = 'connected'
          integration.connection = {
            connectedAt: new Date().toISOString(),
            accountId: currentAccountId,
            accountName: 'WhatsApp Business',
          }
          integration.lastSync = new Date().toISOString()
        }
        whatsappQR.value = null
        qrExpiresAt.value = null
        return ''
      }

      if (!connectResult.data.qrcode) {
        throw new Error('Não foi possível gerar QR Code')
      }

      whatsappQR.value = connectResult.data.qrcode
      qrExpiresAt.value = connectResult.data.expiresAt || new Date(Date.now() + 2 * 60 * 1000).toISOString()

      const integration = integrations.value.find(i => i.platform === 'whatsapp')
      if (integration) {
        integration.status = 'pending'
      }

      return connectResult.data.qrcode
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao gerar QR Code'
      throw err
    } finally {
      whatsappConnecting.value = false
    }
  }

  /**
   * Verifica conexão do WhatsApp
   */
  const checkWhatsAppConnection = async (_qrId: string): Promise<boolean> => {
    try {
      const now = Date.now()
      if (whatsappStatusCheckInFlight.value) {
        return false
      }
      if (now - lastWhatsAppStatusCheckAt.value < WHATSAPP_STATUS_CHECK_MIN_INTERVAL_MS) {
        return false
      }

      const currentAccountId = whatsappAccountId.value
      if (!currentAccountId) {
        const projectId = localStorage.getItem('current_project_id') || ''
        if (projectId) {
          whatsappAccountId.value = localStorage.getItem(getWhatsAppAccountStorageKey(projectId))
        }
      }

      if (!whatsappAccountId.value) {
        return false
      }

      const ensuredAccountId = whatsappAccountId.value
      whatsappStatusCheckInFlight.value = true
      lastWhatsAppStatusCheckAt.value = now
      const statusResult = await whatsappIntegrationService.checkConnectionStatus(ensuredAccountId)
      if (!statusResult.success) {
        throw new Error(statusResult.error.message)
      }

      const status = statusResult.data
      if (status.status === 'connected') {
        const integration = integrations.value.find(i => i.platform === 'whatsapp')
        if (integration) {
          integration.status = 'connected'
          integration.connection = {
            connectedAt: new Date().toISOString(),
            accountId: ensuredAccountId,
            accountName: status.profileName || 'WhatsApp Business',
          }
          integration.lastSync = new Date().toISOString()
        }

        whatsappQR.value = null
        qrExpiresAt.value = null
        return true
      }

      if (status.qrcode) {
        whatsappQR.value = status.qrcode
      }

      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao verificar conexão'
      throw err
    } finally {
      whatsappStatusCheckInFlight.value = false
    }
  }

  /**
   * Obtém script da tag de rastreamento
   */
  const getTagScript = async (projectId: string): Promise<TagInstallation> => {
    try {
      isLoading.value = true
      error.value = null

      if (!projectId?.trim()) {
        throw new Error('Project ID é obrigatório para gerar o script da tag')
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
      const scriptCode = buildTagSnippet({
        projectId,
        scriptUrl: buildDefaultTagScriptUrl(origin),
        debug: false,
        autoInit: true,
      })

      const current = tagInstallation.value
      const isSameProject = current?.projectId === projectId

      const installation: TagInstallation = {
        projectId,
        scriptCode,
        isInstalled: isSameProject ? (current?.isInstalled ?? false) : false,
        status: isSameProject ? current?.status : 'inactive',
        lastPing: isSameProject ? current?.lastPing : undefined,
        eventsReceived: isSameProject ? (current?.eventsReceived ?? 0) : 0,
      }

      tagInstallation.value = installation
      return installation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao obter script da tag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verifica instalação da tag
   */
  const checkTagInstallation = async (projectId: string): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const installation = await integrationsService.checkTagInstallation()
      const resolvedProjectId = projectId || installation.projectId || currentProjectId.value || ''
      const snippetProjectId = resolvedProjectId || 'PROJECT_ID_AQUI'
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
      const sameProjectFromApi = !installation.projectId || installation.projectId === resolvedProjectId

      const scriptCode = sameProjectFromApi && installation.scriptCode?.trim()
        ? installation.scriptCode
        : buildTagSnippet({
            projectId: snippetProjectId,
            scriptUrl: buildDefaultTagScriptUrl(origin),
            debug: false,
            autoInit: true,
          })

      tagInstallation.value = {
        ...installation,
        projectId: resolvedProjectId,
        scriptCode,
      }

      return installation.isInstalled
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao verificar instalação'
      throw err instanceof Error ? err : new Error('Erro ao verificar instalação')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicia verificação one-shot da tag para uma URL informada pelo usuário.
   */
  const startTagVerification = async (
    siteUrl: string
  ): Promise<TagVerificationStartResponse> => {
    try {
      isLoading.value = true
      error.value = null

      return await integrationsService.startTagVerification(siteUrl)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao iniciar verificação da tag'
      throw err instanceof Error ? err : new Error('Erro ao iniciar verificação da tag')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Consulta status da verificação one-shot da tag.
   */
  const getTagVerificationStatus = async (
    verificationId: string
  ): Promise<TagVerificationStatusResponse> => {
    try {
      error.value = null
      return await integrationsService.getTagVerificationStatus(verificationId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao consultar status da verificação'
      throw err instanceof Error ? err : new Error('Erro ao consultar status da verificação')
    }
  }

  /**
   * Processa callback do OAuth
   */
  const handleOAuthCallback = async (platform: string, _code: string): Promise<OAuthResult> => {
    try {
      // Simular processamento do callback
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAccounts: Account[] = [
        {
          id: `${platform}_account_1`,
          name: `Conta ${platform} 1`,
          accountId: `${platform}_account_1_external`,
          type: 'ad_account',
          permissions: getScopes(platform)
        },
        {
          id: `${platform}_account_2`,
          name: `Conta ${platform} 2`,
          accountId: `${platform}_account_2_external`,
          type: 'ad_account',
          permissions: getScopes(platform)
        }
      ]
      
      const result: OAuthResult = {
        success: true,
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
        accounts: mockAccounts
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro no callback OAuth'
      throw err
    }
  }

  /**
   * Salva contas selecionadas
   */
  const saveAccounts = async (platform: string, accountIds: string[]): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Conectar plataforma com as contas selecionadas
      const integration = integrations.value.find(i => i.platform === platform)
      if (integration) {
        integration.status = 'connected'
        integration.connection = {
          connectedAt: new Date().toISOString(),
          accountId: accountIds[0],
          accountName: `Conta ${platform}`
        }
        integration.lastSync = new Date().toISOString()
      }

      console.log(`Salvando contas para ${platform}:`, accountIds)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao salvar contas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtém scopes necessários para uma plataforma
   */
  const getScopes = (platform: string): string[] => {
    const scopes: Record<string, string[]> = {
      meta: ['ads_management', 'ads_read', 'pages_read_engagement', 'instagram_basic'],
      google: ['https://www.googleapis.com/auth/adwords', 'https://www.googleapis.com/auth/analytics.readonly'],
      tiktok: ['user.info.basic', 'video.list', 'ad.account.info'],
      linkedin: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
    }
    
    return scopes[platform] || []
  }

  /**
   * Limpa erro
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Limpa QR Code do WhatsApp
   */
  const clearWhatsAppQR = () => {
    whatsappQR.value = null
    qrExpiresAt.value = null
    whatsappConnecting.value = false
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    integrations: readonly(integrations),
    tagInstallation: readonly(tagInstallation),
    isLoading: readonly(isLoading),
    error: readonly(error),
    whatsappQR: readonly(whatsappQR),
    qrExpiresAt: readonly(qrExpiresAt),
    whatsappConnecting: readonly(whatsappConnecting),

    // Getters
    connectedIntegrations,
    errorIntegrations,
    getIntegrationByPlatform,
    isTagInstalled,
    eventsReceived,

    // Actions
    fetchIntegrations,
    connectPlatform,
    disconnectPlatform,
    refreshConnection,
    generateWhatsAppQR,
    checkWhatsAppConnection,
    getTagScript,
    checkTagInstallation,
    startTagVerification,
    getTagVerificationStatus,
    initiateOAuth,
    handleOAuthCallback,
    saveAccounts,
    clearError,
    clearWhatsAppQR
  }
})
