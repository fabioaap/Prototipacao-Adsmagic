/**
 * Integrations API Service
 *
 * Gerencia todas as operações relacionadas a integrações.
 * Segue o padrão "Mock First, API Ready" para desenvolvimento.
 *
 * @module services/api/integrations
 */

import { apiClient } from './client'
import type {
  Integration,
  TagInstallation,
  OAuthResult,
  Account,
  GoogleConversionAction,
  TagVerificationStartResponse,
  TagVerificationStatusResponse,
} from '@/types/models'
import {
  buildDefaultTagScriptUrl,
  buildTagSnippet,
} from '@/services/tagSnippet'

// Mock data para desenvolvimento
const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    projectId: '2',
    platform: 'whatsapp',
    platformType: 'messaging',
    status: 'connected',
    isActive: true,
    platformConfig: {
      phoneNumber: '+5511999999999',
      businessName: 'Minha Empresa'
    },
    settings: {
      phoneNumber: '+5511999999999',
      businessName: 'Minha Empresa'
    },
    connection: {
      connectedAt: '2025-10-20T10:00:00Z',
      lastSync: '2025-10-20T09:30:00Z',
      accountId: 'whatsapp_123',
      accountName: 'WhatsApp Business'
    },
    lastSync: '2025-10-20T09:30:00Z',
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-10-20T10:00:00Z'
  },
  {
    id: '2',
    projectId: '2',
    platform: 'meta',
    platformType: 'advertising',
    status: 'connected',
    isActive: true,
    platformConfig: {
      adAccountId: 'act_123456789',
      pixelId: '123456789012345'
    },
    settings: {
      adAccountId: 'act_123456789',
      pixelId: '123456789012345'
    },
    connection: {
      connectedAt: '2025-10-19T14:00:00Z',
      lastSync: '2025-10-20T08:00:00Z',
      accountId: 'act_123456789',
      accountName: 'Meta Ads Account'
    },
    lastSync: '2025-10-20T08:00:00Z',
    createdAt: '2025-10-19T14:00:00Z',
    updatedAt: '2025-10-20T08:00:00Z'
  },
  {
    id: '3',
    projectId: '2',
    platform: 'google',
    platformType: 'advertising',
    status: 'connected',
    isActive: true,
    platformConfig: {
      adAccountId: '123-456-7890',
      customerId: '1234567890'
    },
    settings: {
      adAccountId: '123-456-7890',
      customerId: '1234567890'
    },
    connection: {
      connectedAt: '2025-10-18T10:00:00Z',
      lastSync: '2025-10-20T07:00:00Z',
      accountId: '123-456-7890',
      accountName: 'Google Ads Account'
    },
    lastSync: '2025-10-20T07:00:00Z',
    createdAt: '2025-10-18T10:00:00Z',
    updatedAt: '2025-10-20T07:00:00Z'
  },
  {
    id: '4',
    projectId: '2',
    platform: 'tiktok',
    platformType: 'advertising',
    status: 'pending',
    isActive: false,
    platformConfig: {},
    settings: {},
    createdAt: '2025-10-17T10:00:00Z',
    updatedAt: '2025-10-17T10:00:00Z'
  }
]

const MOCK_TAG_ORIGIN = 'http://localhost:5173'

const buildMockTagInstallation = (projectId: string): TagInstallation => ({
  projectId,
  isInstalled: true,
  scriptCode: buildTagSnippet({
    projectId,
    scriptUrl: buildDefaultTagScriptUrl(MOCK_TAG_ORIGIN),
    debug: false,
    autoInit: true,
  }),
  status: 'active',
  lastPing: '2025-10-20T09:00:00Z',
  eventsReceived: 1250,
})

const MOCK_TAG_INSTALLATION: TagInstallation = buildMockTagInstallation('2')
const MOCK_TAG_VERIFICATION_STORE = new Map<string, TagVerificationStatusResponse>()

// Flag para alternar entre mock e API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const integrationsService = {
  /**
   * Buscar todas as integrações
   */
  async getAll(): Promise<Integration[]> {
    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))
      return [...MOCK_INTEGRATIONS]
    }

    const response = await apiClient.get<Integration[]>('/integrations')
    return response.data
  },

  /**
   * Buscar integração por ID
   */
  async getById(id: string): Promise<Integration | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_INTEGRATIONS.find(integration => integration.id === id) || null
    }

    const response = await apiClient.get<Integration>(`/integrations/${id}`)
    return response.data
  },

  /**
   * Iniciar processo OAuth
   * @param platform - Plataforma de integração
   * @param redirectUri - URI de callback (opcional, será construída automaticamente se não fornecida)
   */
  async startOAuth(
    platform: 'meta' | 'google' | 'tiktok',
    redirectUri?: string
  ): Promise<{ authUrl: string }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      // Simular URL de OAuth da plataforma
      const mockAuthUrls: Record<string, string> = {
        meta: `https://www.facebook.com/v18.0/dialog/oauth?client_id=MOCK_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri || '')}&state=MOCK_STATE&scope=ads_management,ads_read,business_management`,
        google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=MOCK_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri || '')}&state=MOCK_STATE&scope=https://www.googleapis.com/auth/adwords`,
        tiktok: `https://ads.tiktok.com/marketing_api/auth?app_id=MOCK_APP_ID&redirect_uri=${encodeURIComponent(redirectUri || '')}&state=MOCK_STATE`
      }

      return { authUrl: mockAuthUrls[platform] || mockAuthUrls.meta! }
    }

    const response = await apiClient.post<{ authUrl: string }>(
      `/integrations/oauth/${platform}`,
      redirectUri ? { redirectUri } : undefined
    )
    return response.data
  },

  /**
   * Processar callback OAuth
   * @param platform - Plataforma de integração
   * @param accessToken - Token de acesso recebido do OAuth
   * @param projectId - ID do projeto (opcional, extraído do state parameter)
   */
  async handleOAuthCallback(platform: string, accessToken: string, projectId?: string | null, redirectUri?: string): Promise<OAuthResult> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simular resposta de sucesso com contas mock específicas por plataforma
      const mockIntegrationId = `mock-integration-${platform}-${Date.now()}`

      let mockAccounts: Account[] = []

      if (platform === 'meta') {
        mockAccounts = [
          {
            id: 'act_123456789',
            name: 'Agência AdsMagic - Conta Principal',
            accountId: '123456789',
            type: 'ad_account' as const,
            permissions: ['ads_management', 'ads_read']
          },
          {
            id: 'act_987654321',
            name: 'Cliente Beta - Conta Secundária',
            accountId: '987654321',
            type: 'ad_account' as const,
            permissions: ['ads_management', 'ads_read']
          }
        ]
      } else if (platform === 'google') {
        mockAccounts = [
          {
            id: 'gads_123-456-7890',
            name: 'Google Ads - Conta Empresa (123-456-7890)',
            accountId: '123-456-7890',
            type: 'ad_account' as const,
            permissions: ['adwords']
          },
          {
            id: 'gads_098-765-4321',
            name: 'Google Ads - Conta Cliente (098-765-4321)',
            accountId: '098-765-4321',
            type: 'ad_account' as const,
            permissions: ['adwords']
          },
          {
            id: 'gads_555-111-2222',
            name: 'Google Ads - Conta Teste (555-111-2222)',
            accountId: '555-111-2222',
            type: 'ad_account' as const,
            permissions: ['adwords']
          }
        ]
      }

      return {
        success: true,
        integrationId: mockIntegrationId,
        accounts: mockAccounts
      }
    }

    const body: { accessToken: string; projectId?: string; redirectUri?: string } = { accessToken }

    // Incluir projectId no body se disponível (fallback para casos de sessão perdida)
    if (projectId) {
      body.projectId = projectId
    }

    // Incluir redirectUri (necessário para Google OAuth code exchange)
    if (redirectUri) {
      body.redirectUri = redirectUri
    }

    const response = await apiClient.post<OAuthResult>(`/integrations/oauth/${platform}/callback`, body)
    return response.data
  },

  /**
   * Desconectar integração
   */
  async disconnect(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const index = MOCK_INTEGRATIONS.findIndex(integration => integration.id === id)
      if (index !== -1) {
        const existingIntegration = MOCK_INTEGRATIONS[index]!
        MOCK_INTEGRATIONS[index] = {
          ...existingIntegration,
          status: 'disconnected',
          isActive: false,
          connection: undefined,
          lastSync: undefined,
          updatedAt: new Date().toISOString()
        }
      }
      return
    }

    await apiClient.delete(`/integrations/${id}`)
  },

  /**
   * Sincronizar integração
   */
  async sync(id: string): Promise<Integration> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const index = MOCK_INTEGRATIONS.findIndex(integration => integration.id === id)
      if (index === -1) throw new Error('Integração não encontrada')

      const existingIntegration = MOCK_INTEGRATIONS[index]!
      MOCK_INTEGRATIONS[index] = {
        ...existingIntegration,
        lastSync: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return MOCK_INTEGRATIONS[index]!
    }

    const response = await apiClient.post<Integration>(`/integrations/${id}/sync`)
    return response.data
  },

  /**
   * Buscar status da tag de rastreamento
   */
  async getTagStatus(): Promise<TagInstallation> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return buildMockTagInstallation(MOCK_TAG_INSTALLATION.projectId)
    }

    const response = await apiClient.get<TagInstallation>('/integrations/tag/status')
    return response.data
  },

  /**
   * Verificar instalação da tag
   */
  async checkTagInstallation(): Promise<TagInstallation> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        ...buildMockTagInstallation(MOCK_TAG_INSTALLATION.projectId),
        lastPing: new Date().toISOString(),
      }
    }

    const response = await apiClient.post<TagInstallation>('/integrations/tag/check')
    return response.data
  },

  /**
   * Iniciar verificação one-shot da tag
   */
  async startTagVerification(siteUrl: string): Promise<TagVerificationStartResponse> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))

      const verificationId = `mock-verification-${Date.now()}`
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      const verificationUrl = new URL(siteUrl)
      verificationUrl.searchParams.set('adsmagic_verify_token', `mock-token-${Date.now()}`)
      verificationUrl.searchParams.set('adsmagic_verify_endpoint', 'https://example.com/integrations/tag/verification/ping')
      verificationUrl.searchParams.set('adsmagic_verify_project_id', MOCK_TAG_INSTALLATION.projectId)

      MOCK_TAG_VERIFICATION_STORE.set(verificationId, {
        verificationId,
        status: 'pending',
        expiresAt,
        siteUrl,
        lastUpdatedAt: new Date().toISOString(),
      })

      return {
        verificationId,
        verificationUrl: verificationUrl.toString(),
        expiresAt,
        status: 'pending',
      }
    }

    const response = await apiClient.post<TagVerificationStartResponse>(
      '/integrations/tag/verification/start',
      { siteUrl }
    )
    return response.data
  },

  /**
   * Consultar status de verificação one-shot da tag
   */
  async getTagVerificationStatus(verificationId: string): Promise<TagVerificationStatusResponse> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const current = MOCK_TAG_VERIFICATION_STORE.get(verificationId)
      if (!current) {
        throw new Error('Verification not found')
      }

      // Simula conclusão após alguns segundos
      if (current.status === 'pending' && Math.random() > 0.6) {
        const verifiedAt = new Date().toISOString()
        const next: TagVerificationStatusResponse = {
          ...current,
          status: 'verified',
          verifiedAt,
          lastUpdatedAt: verifiedAt,
          verifiedPageUrl: current.siteUrl,
        }
        MOCK_TAG_VERIFICATION_STORE.set(verificationId, next)
        return next
      }

      return {
        ...current,
        lastUpdatedAt: new Date().toISOString(),
      }
    }

    const response = await apiClient.get<TagVerificationStatusResponse>(
      `/integrations/tag/verification/${verificationId}`
    )
    return response.data
  },

  /**
   * Buscar contas conectadas
   */
  async getAccounts(platform: string): Promise<Account[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const mockAccounts: Account[] = [
        {
          id: '1',
          accountId: 'act_123456',
          type: 'ad_account',
          name: 'Conta Principal',
          permissions: ['read', 'write']
        },
        {
          id: '2',
          accountId: 'act_789012',
          type: 'ad_account',
          name: 'Conta Secundária',
          permissions: ['read']
        }
      ]

      return mockAccounts
    }

    const response = await apiClient.get<Account[]>(`/integrations/accounts/${platform}`)
    return response.data
  },

  /**
   * Selecionar contas após OAuth
   */
  async selectAccounts(
    integrationId: string,
    accountIds: string[],
    pixelId?: string,
    createPixel?: { name: string }
  ): Promise<{ success: boolean; integrationId: string; accountsCount: number }> {
    const response = await apiClient.post<{ success: boolean; integrationId: string; accountsCount: number }>(
      `/integrations/${integrationId}/select-accounts`,
      { accountIds, pixelId, createPixel }
    )
    return response.data
  },

  /**
   * Buscar pixels disponíveis
   * @param integrationId - ID da integração
   * @param accountId - ID da conta (opcional). Se fornecido, busca pixels dessa conta específica
   */
  async getPixels(integrationId: string, accountId?: string): Promise<Array<{ id: string; name: string; isCreated?: boolean }>> {
    const url = accountId
      ? `/integrations/${integrationId}/pixels?accountId=${encodeURIComponent(accountId)}`
      : `/integrations/${integrationId}/pixels`

    const response = await apiClient.get<{ pixels: Array<{ id: string; name: string; isCreated?: boolean }> }>(url)
    return response.data.pixels
  },

  /**
   * Criar novo pixel
   */
  async createPixel(
    integrationId: string,
    name: string,
    accountId?: string
  ): Promise<{ success: boolean; pixel: { id: string; name: string; isCreated?: boolean } }> {
    const response = await apiClient.post<{ success: boolean; pixel: { id: string; name: string; isCreated?: boolean } }>(
      `/integrations/${integrationId}/pixels`,
      { name, accountId }
    )
    return response.data
  },

  /**
   * Buscar conversion actions do Google Ads para uma conta específica
   */
  async getGoogleConversionActions(
    integrationId: string,
    accountId: string
  ): Promise<{
    accountId: string
    conversionActions: GoogleConversionAction[]
    selectedConversionActionIds: string[]
    enhancedConversionsForLeadsEnabled?: boolean
    enhancedConversionsForLeadsCheckedAt?: string
  }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        accountId,
        conversionActions: [
          {
            id: '1111111111',
            name: 'Purchase',
            type: 'UPLOAD_CLICKS',
            status: 'ENABLED',
            category: 'PURCHASE',
            primaryForGoal: true,
            resourceName: `customers/${accountId.replace(/-/g, '')}/conversionActions/1111111111`,
          },
          {
            id: '2222222222',
            name: 'Lead',
            type: 'UPLOAD_CLICKS',
            status: 'ENABLED',
            category: 'LEAD',
            primaryForGoal: true,
            resourceName: `customers/${accountId.replace(/-/g, '')}/conversionActions/2222222222`,
          },
        ],
        selectedConversionActionIds: [],
        enhancedConversionsForLeadsEnabled: false,
        enhancedConversionsForLeadsCheckedAt: new Date().toISOString(),
      }
    }

    const response = await apiClient.get<{
      accountId: string
      conversionActions: GoogleConversionAction[]
      selectedConversionActionIds: string[]
      enhancedConversionsForLeadsEnabled?: boolean
      enhancedConversionsForLeadsCheckedAt?: string
    }>(`/integrations/${integrationId}/google/conversion-actions?accountId=${encodeURIComponent(accountId)}`)

    return response.data
  },

  /**
   * Salvar seleção de conversion actions do Google Ads
   */
  async saveGoogleConversionActions(
    integrationId: string,
    accountId: string,
    selectedConversionActionIds: string[],
    selectedConversionActions: GoogleConversionAction[]
  ): Promise<{
    success: boolean
    accountId: string
    selectedCount: number
  }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        accountId,
        selectedCount: selectedConversionActionIds.length,
      }
    }

    const response = await apiClient.post<{
      success: boolean
      accountId: string
      selectedCount: number
    }>(`/integrations/${integrationId}/google/conversion-actions`, {
      accountId,
      selectedConversionActionIds,
      selectedConversionActions,
    })

    return response.data
  },

  /**
   * Validar token
   */
  async validateToken(integrationId: string): Promise<{
    isValid: boolean
    isExpired: boolean
    isExpiringSoon?: boolean
    daysUntilExpiry?: number | null
    error?: string
    errorCode?: string
  }> {
    const response = await apiClient.get<{
      isValid: boolean
      isExpired: boolean
      isExpiringSoon?: boolean
      daysUntilExpiry?: number | null
      error?: string
      errorCode?: string
    }>(`/integrations/${integrationId}/validate-token`)
    return response.data
  },

  /**
   * Renovar token
   */
  async refreshToken(integrationId: string): Promise<{
    success: boolean
    expiresAt: string
    expiresInDays: number
  }> {
    const response = await apiClient.post<{
      success: boolean
      expiresAt: string
      expiresInDays: number
    }>(`/integrations/${integrationId}/refresh-token`)
    return response.data
  },

  /**
   * Sincronizar contas
   */
  async syncAccounts(integrationId: string): Promise<{
    success: boolean
    added: number
    updated: number
    removed: number
  }> {
    const response = await apiClient.post<{
      success: boolean
      added: number
      updated: number
      removed: number
    }>(`/integrations/${integrationId}/sync-accounts`)
    return response.data
  },

  /**
   * Obter logs de auditoria
   */
  async getAuditLogs(integrationId: string, limit = 50): Promise<{
    logs: Array<{
      id: string
      action: string
      status: string
      metadata: Record<string, unknown>
      error_message?: string
      created_at: string
    }>
    count: number
  }> {
    const response = await apiClient.get<{
      logs: Array<{
        id: string
        action: string
        status: string
        metadata: Record<string, unknown>
        error_message?: string
        created_at: string
      }>
      count: number
    }>(`/integrations/${integrationId}/audit-logs?limit=${limit}`)
    return response.data
  },

  /**
   * Buscar integrações por projeto
   * @param projectId - ID do projeto (usado apenas para validação, o header X-Project-ID é usado no backend)
   */
  async getIntegrations(projectId: string): Promise<Integration[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return MOCK_INTEGRATIONS.filter(i => i.projectId === projectId)
    }

    // O header X-Project-ID já é adicionado automaticamente pelo interceptor
    // O backend retorna apenas integrações do projeto especificado no header
    // Criar tipo para resposta do backend (snake_case)
    interface BackendIntegration {
      id: string
      project_id: string
      platform: string
      platform_type: string
      status: string
      platform_config: Record<string, unknown>
      created_at: string
      updated_at: string
    }

    const response = await apiClient.get<BackendIntegration[]>('/integrations')

    // Mapear resposta do backend (snake_case) para formato do frontend (camelCase)
    return response.data.map((integration: BackendIntegration) => ({
      id: integration.id,
      projectId: integration.project_id || projectId,
      platform: integration.platform as Integration['platform'],
      platformType: integration.platform_type as Integration['platformType'],
      status: integration.status as Integration['status'],
      isActive: integration.status === 'connected',
      platformConfig: integration.platform_config || {},
      settings: integration.platform_config || {},
      createdAt: integration.created_at,
      updatedAt: integration.updated_at,
      lastSync: undefined,
    }))
  },

  /**
   * Buscar contas salvas de uma integração
   * 
   * ✅ Conformidade:
   * - Usa apiClient (única camada de rede)
   * - Type-safe
   * - Error handling
   */
  async getIntegrationAccounts(
    integrationId: string
  ): Promise<{
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
  }> {
    const response = await apiClient.get<{
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
    }>(`/integrations/${integrationId}/accounts`)

    return response.data
  }
}
