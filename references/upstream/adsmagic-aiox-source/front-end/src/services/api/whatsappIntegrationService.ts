/**
 * WhatsApp Integration Service
 *
 * Serviço para comunicação com a API de integração WhatsApp Multi-Broker.
 * Este serviço é a camada única de comunicação de rede para funcionalidades WhatsApp.
 *
 * Responsabilidades:
 * - Listar brokers disponíveis
 * - Criar instâncias (uazapi)
 * - Conectar instâncias
 * - Verificar status de conexão
 * - Configurar brokers com credenciais (Gupshup, API Oficial)
 * - Salvar contas conectadas
 *
 * @module services/api/whatsappIntegrationService
 */

import { apiClient, getApiErrorMessage } from './client'
import { cacheService } from '@/services/cache/cacheService'
import { whatsappAdapter } from '@/services/adapters/whatsappAdapter'
import type {
  WhatsAppBroker,
  ConnectionStatus,
  ConnectedAccount,
  CreateInstanceParams,
  CreateInstanceResponse,
  ConnectInstanceParams,
  ConnectInstanceResponse,
  ConfigureBrokerParams,
  ConfigureBrokerResponse,
  SaveConnectedAccountParams,
  SaveConnectedAccountResponse,
  WhatsAppIntegrationError,
  BackendWhatsAppBroker,
  BackendWhatsAppInstance,
  BackendConnectionStatus,
} from '@/types/whatsapp'

// ============================================================================
// CONSTANTES
// ============================================================================

/** Base path para endpoints de messaging */
const MESSAGING_BASE_PATH = '/messaging'

/** Timeout padrão para requisições (10 segundos) */
const DEFAULT_TIMEOUT = 10000

/** Número máximo de retries para operações críticas */
const MAX_RETRIES = 3

/** Delay base para retry em ms */
const RETRY_DELAY_BASE = 1000

/** TTL do cache de contas WhatsApp (2 minutos) */
const ACCOUNTS_CACHE_TTL = 2 * 60 * 1000

/** Prefixo da cache key para contas WhatsApp */
const ACCOUNTS_CACHE_PREFIX = 'whatsapp-status'

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

/**
 * Resultado de uma operação do serviço
 * Usa pattern Result<T, E> para tratamento de erros
 */
type ServiceResult<T> = Promise<
  | { success: true; data: T }
  | { success: false; error: WhatsAppIntegrationError }
>

// ============================================================================
// HELPERS INTERNOS
// ============================================================================

/**
 * Mapeia erro de API para erro tipado do WhatsApp
 */
function mapApiError(error: unknown): WhatsAppIntegrationError {
  const message = getApiErrorMessage(error)

  // Mapear códigos HTTP específicos
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { code?: string } } }).response
    const status = response?.status
    const code = response?.data?.code

    if (status === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Sessão expirada. Faça login novamente.',
        recoverable: false,
      }
    }

    if (status === 404) {
      return {
        code: code === 'BROKER_NOT_FOUND' ? 'BROKER_NOT_FOUND' : 'UNKNOWN_ERROR',
        message: 'Recurso não encontrado.',
        recoverable: false,
      }
    }

    if (status === 429) {
      return {
        code: 'RATE_LIMITED',
        message: 'Limite de requisições atingido. Tente novamente em alguns minutos.',
        recoverable: true,
      }
    }

    if (status === 400 && code === 'INVALID_CREDENTIALS') {
      return {
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciais inválidas. Verifique os dados informados.',
        recoverable: true,
      }
    }

    if (status === 400 && code === 'QR_CODE_EXPIRED') {
      return {
        code: 'QR_CODE_EXPIRED',
        message: 'QR Code expirado. Gerando novo código...',
        recoverable: true,
      }
    }

    if (status && status >= 500) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'Erro no servidor. Tente novamente mais tarde.',
        details: message,
        recoverable: true,
      }
    }
  }

  // Erro de rede
  if (message.includes('conexão') || message.includes('Network') || message.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Erro de conexão. Verifique sua internet.',
      recoverable: true,
    }
  }

  // Erro genérico
  return {
    code: 'UNKNOWN_ERROR',
    message: message || 'Erro desconhecido. Tente novamente.',
    details: message,
    recoverable: true,
  }
}

/**
 * Executa uma operação com retry automático
 * @param operation - Função a ser executada
 * @param retries - Número de tentativas restantes
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries <= 1) {
      throw error
    }

    // Verificar se erro é recuperável
    const mappedError = mapApiError(error)
    if (!mappedError.recoverable) {
      throw error
    }

    // Aguardar antes de retry (backoff exponencial)
    const delay = RETRY_DELAY_BASE * (MAX_RETRIES - retries + 1)
    await new Promise(resolve => setTimeout(resolve, delay))

    return withRetry(operation, retries - 1)
  }
}

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

/**
 * Serviço de integração WhatsApp
 * Singleton exportado para uso em toda a aplicação
 */
export const whatsappIntegrationService = {
  /**
   * Lista brokers WhatsApp disponíveis
   *
   * @returns Lista de brokers ativos para plataforma WhatsApp
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.listAvailableBrokers()
   * if (result.success) {
   * }
   * ```
   */
  async listAvailableBrokers(): ServiceResult<WhatsAppBroker[]> {
    try {

      const response = await apiClient.get<{ brokers: BackendWhatsAppBroker[] }>(
        `${MESSAGING_BASE_PATH}/brokers`,
        { timeout: DEFAULT_TIMEOUT }
      )

      const normalizedBrokers = whatsappAdapter.normalizeBrokerList(response.data.brokers)

      return { success: true, data: normalizedBrokers }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao listar brokers:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Cria uma instância WhatsApp no broker selecionado
   * Apenas para brokers que suportam criação de instância (uazapi)
   *
   * @param params - Parâmetros para criação
   * @returns Dados da instância criada incluindo accountId
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.createInstance({
   *   projectId: 'uuid-do-projeto',
   *   brokerId: 'uuid-do-broker-uazapi'
   * })
   * ```
   */
  async createInstance(params: CreateInstanceParams): ServiceResult<CreateInstanceResponse> {
    try {

      const response = await withRetry(() =>
        apiClient.post<{
          instance: BackendWhatsAppInstance
          qrcode?: string
          account_id: string
        }>(
          `${MESSAGING_BASE_PATH}/instances`,
          {
            projectId: params.projectId,
            brokerId: params.brokerId,
          },
          { timeout: DEFAULT_TIMEOUT }
        )
      )

      // Validação de segurança: verificar se a resposta tem o formato esperado
      if (!response.data?.instance) {
        console.error('[WhatsAppService] Resposta inválida - instance não encontrado:', response.data)
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Resposta da API não contém dados da instância',
            details: 'O backend retornou uma resposta em formato inesperado',
            recoverable: true,
          },
        }
      }

      const normalizedInstance = whatsappAdapter.normalizeInstanceData(
        response.data.instance.broker_type,
        response.data.instance
      )

      const result: CreateInstanceResponse = {
        instance: normalizedInstance,
        qrcode: response.data.qrcode,
        accountId: response.data.account_id,
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao criar instância:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Conecta uma instância existente (gera QR Code ou Pair Code)
   *
   * @param params - Parâmetros de conexão
   * @returns QR Code ou Pair Code para conexão
   *
   * @example
   * ```ts
   * // QR Code
   * const result = await whatsappIntegrationService.connectInstance({
   *   accountId: 'uuid-da-conta'
   * })
   *
   * // Pair Code
   * const result = await whatsappIntegrationService.connectInstance({
   *   accountId: 'uuid-da-conta',
   *   phone: '5511999999999'
   * })
   * ```
   */
  async connectInstance(params: ConnectInstanceParams): ServiceResult<ConnectInstanceResponse> {
    try {

      const body: { phone?: string } = {}
      if (params.phone) {
        body.phone = params.phone
      }

      const response = await apiClient.post<{
        success: boolean
        type: 'qrcode' | 'paircode' | 'connected'
        data: {
          qrCode?: string
          code?: string
          pairCode?: string
          expiresAt?: string
          instanceId?: string
          phone?: string
          status?: 'connected' | 'connecting'
          phoneNumber?: string
          profileName?: string
        }
        message?: string
      }>(
        `${MESSAGING_BASE_PATH}/connect/${params.accountId}`,
        body,
        { timeout: DEFAULT_TIMEOUT }
      )

      // O backend retorna { success: true, type: 'qrcode' | 'paircode' | 'connected', data: { ... } }
      const responseData = response.data
      const connectionData = responseData.data || {}

      // Se já está conectada, retornar status connected
      if (responseData.type === 'connected') {
        const result: ConnectInstanceResponse = {
          connectionMethod: 'qr_code', // Valor padrão, não usado quando já conectado
          status: 'connected',
        }
        
        return { success: true, data: result }
      }

      // Caso contrário, processar QR Code ou Pair Code
      const result: ConnectInstanceResponse = {
        qrcode: connectionData.qrCode ?? (connectionData as { qrcode?: string }).qrcode,
        expiresAt: connectionData.expiresAt,
        pairCode: connectionData.code || connectionData.pairCode,
        connectionMethod: responseData.type === 'paircode' ? 'pair_code' : 'qr_code',
        status: 'connecting',
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao conectar instância:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Verifica o status atual da conexão
   *
   * @param accountId - ID da conta (messaging_accounts.id)
   * @returns Status atualizado da conexão
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.checkConnectionStatus('uuid-da-conta')
   * if (result.success && result.data.status === 'connected') {
   * }
   * ```
   */
  async checkConnectionStatus(accountId: string): ServiceResult<ConnectionStatus> {
    try {
      const response = await apiClient.get<BackendConnectionStatus & {
        connected?: boolean
        phoneNumber?: string
        profileName?: string
        errorMessage?: string
        qrcode?: string
        pairCode?: string
      }>(
        `${MESSAGING_BASE_PATH}/connection-status/${accountId}`,
        { timeout: DEFAULT_TIMEOUT }
      )

      // Identificar broker type pela resposta (se disponível) ou usar padrão
      const brokerType = 'uazapi' // Valor padrão, pode ser melhorado se backend retornar

      const rawStatus = response.data
      const adaptedStatus: BackendConnectionStatus = {
        status: rawStatus.connected === true ? 'connected' : rawStatus.status,
        connection_method: rawStatus.connection_method,
        qrcode: rawStatus.qrcode,
        pair_code: rawStatus.pair_code ?? rawStatus.pairCode,
        phone_number: rawStatus.phone_number ?? rawStatus.phoneNumber,
        profile_name: rawStatus.profile_name ?? rawStatus.profileName,
        profile_photo: rawStatus.profile_photo,
        error_message: rawStatus.error_message ?? rawStatus.errorMessage,
        last_checked_at: rawStatus.last_checked_at,
      }

      const normalizedStatus = whatsappAdapter.normalizeConnectionStatus(
        brokerType,
        adaptedStatus
      )

      return { success: true, data: normalizedStatus }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao verificar status:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Configura broker com credenciais (Gupshup, API Oficial)
   * Valida credenciais antes de salvar
   *
   * @param params - Parâmetros de configuração
   * @returns Resultado da validação
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.configureBroker({
   *   projectId: 'uuid-do-projeto',
   *   brokerId: 'uuid-do-broker-gupshup',
   *   credentials: {
   *     apiKey: 'sua-api-key',
   *     appName: 'seu-app-name'
   *   }
   * })
   * ```
   */
  async configureBroker(params: ConfigureBrokerParams): ServiceResult<ConfigureBrokerResponse> {
    try {

      const response = await apiClient.post<{
        valid: boolean
        message?: string
        account_info?: {
          phone_number?: string
          account_name?: string
        }
      }>(
        `${MESSAGING_BASE_PATH}/configure-broker`,
        {
          projectId: params.projectId,
          brokerId: params.brokerId,
          credentials: params.credentials,
        },
        { timeout: DEFAULT_TIMEOUT }
      )

      const result: ConfigureBrokerResponse = {
        valid: response.data.valid,
        message: response.data.message,
        accountInfo: response.data.account_info
          ? {
              phoneNumber: response.data.account_info.phone_number,
              accountName: response.data.account_info.account_name,
            }
          : undefined,
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao configurar broker:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Salva conta conectada no banco de dados
   *
   * @param params - Dados da conta a salvar
   * @returns Dados da conta salva
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.saveConnectedAccount({
   *   projectId: 'uuid-do-projeto',
   *   brokerType: 'uazapi',
   *   instanceId: 'instance-id',
   *   instanceToken: 'instance-token',
   *   phoneNumber: '+5511999999999',
   *   profileName: 'Minha Empresa'
   * })
   * ```
   */
  async saveConnectedAccount(
    params: SaveConnectedAccountParams
  ): ServiceResult<SaveConnectedAccountResponse> {
    try {

      const response = await withRetry(() =>
        apiClient.post<{
          account_id: string
          phone_number: string
          profile_name?: string
          status: 'connected'
        }>(
          `${MESSAGING_BASE_PATH}/save-connected-account`,
          {
            projectId: params.projectId,
            brokerType: params.brokerType,
            instanceId: params.instanceId,
            instanceToken: params.instanceToken,
            credentials: params.credentials,
            phoneNumber: params.phoneNumber,
            profileName: params.profileName,
          },
          { timeout: DEFAULT_TIMEOUT }
        )
      )

      const result: SaveConnectedAccountResponse = {
        accountId: response.data.account_id,
        phoneNumber: response.data.phone_number,
        profileName: response.data.profile_name,
        status: response.data.status,
      }

      cacheService.invalidatePattern(ACCOUNTS_CACHE_PREFIX)
      return { success: true, data: result }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao salvar conta:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Cria conta WhatsApp via webhook (API Oficial Meta)
   *
   * @param params - Parâmetros para criação
   * @returns Dados da conta criada incluindo webhook URL
   */
  async createOfficialWebhookAccount(params: {
    projectId: string
    phoneNumberId: string
    accessToken?: string
    accountName?: string
  }): ServiceResult<{
    accountId: string
    webhookUrl: string
    phoneNumber?: string
    accountName?: string
  }> {
    try {

      const response = await apiClient.post<{
        account_id: string
        webhook_url: string
        phone_number?: string
        account_name?: string
      }>(
        `${MESSAGING_BASE_PATH}/save-connected-account`,
        {
          projectId: params.projectId,
          brokerType: 'official_whatsapp',
          phoneNumberId: params.phoneNumberId,
          accessToken: params.accessToken,
          accountName: params.accountName,
        },
        { timeout: DEFAULT_TIMEOUT }
      )

      const result = {
        accountId: response.data.account_id,
        webhookUrl: response.data.webhook_url,
        phoneNumber: response.data.phone_number,
        accountName: response.data.account_name,
      }

      cacheService.invalidatePattern(ACCOUNTS_CACHE_PREFIX)
      return { success: true, data: result }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao criar conta webhook:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Obtém detalhes de uma conta conectada
   *
   * @param accountId - ID da conta
   * @returns Dados da conta
   */
  async getConnectedAccount(accountId: string): ServiceResult<ConnectedAccount> {
    try {

      const response = await apiClient.get<{
        account_id: string
        instance_id?: string
        instance_name?: string
        phone_number: string
        profile_name?: string
        broker_type: string
        status: 'connected' | 'connecting' | 'disconnected' | 'active'
        profile_photo?: string
        connected_at?: string
      }>(
        `${MESSAGING_BASE_PATH}/accounts/${accountId}`,
        { timeout: DEFAULT_TIMEOUT }
      )

      const result = whatsappAdapter.normalizeAccountData(
        response.data.broker_type,
        response.data
      )

      return { success: true, data: result }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao buscar conta:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Desconecta uma conta WhatsApp
   *
   * @param accountId - ID da conta a desconectar
   * @returns Sucesso ou erro
   */
  async disconnectAccount(accountId: string): ServiceResult<void> {
    try {

      await apiClient.post(
        `${MESSAGING_BASE_PATH}/disconnect/${accountId}`,
        {},
        { timeout: DEFAULT_TIMEOUT }
      )

      cacheService.invalidatePattern(ACCOUNTS_CACHE_PREFIX)
      return { success: true, data: undefined }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao desconectar conta:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Lista todas as contas WhatsApp conectadas de um projeto
   *
   * @param projectId - ID do projeto
   * @returns Lista de contas conectadas
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.listProjectAccounts('uuid-do-projeto')
   * if (result.success && result.data.length > 0) {
   * }
   * ```
   */
  async listProjectAccounts(projectId: string): ServiceResult<ConnectedAccount[]> {
    try {
      const cacheKey = `${ACCOUNTS_CACHE_PREFIX}:${projectId}`
      const cached = cacheService.get<ConnectedAccount[]>(cacheKey)
      if (cached) {
        return { success: true, data: cached }
      }

      const response = await apiClient.get<{
        accounts: Array<{
          account_id: string
          instance_id?: string
          instance_name?: string
          phone_number?: string | null
          profile_name?: string
          broker_type: string
          status: 'active' | 'connecting' | 'disconnected'
          profile_photo?: string
          connected_at?: string
        }>
      }>(
        `${MESSAGING_BASE_PATH}/accounts`,
        {
          params: { projectId, platform: 'whatsapp', includeAll: true },
          timeout: DEFAULT_TIMEOUT
        }
      )

      const accounts = (response.data.accounts || []).map(account =>
        whatsappAdapter.normalizeAccountData(account.broker_type, {
          account_id: account.account_id,
          instance_id: account.instance_id,
          instance_name: account.instance_name,
          phone_number: account.phone_number || '',
          profile_name: account.profile_name,
          broker_type: account.broker_type,
          status: account.status === 'active' ? 'connected' : account.status,
          profile_photo: account.profile_photo,
          connected_at: account.connected_at,
        })
      )

      cacheService.set(cacheKey, accounts, ACCOUNTS_CACHE_TTL)
      return { success: true, data: accounts }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao listar contas:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  /**
   * Busca uma conta WhatsApp existente para um projeto e broker específico
   * Usa o endpoint de status para verificar se a conta existe e está acessível
   *
   * @param accountId - ID da conta (se conhecido)
   * @returns Conta encontrada ou null
   *
   * @example
   * ```ts
   * const result = await whatsappIntegrationService.getExistingAccount('uuid-da-conta')
   * if (result.success && result.data) {
   * }
   * ```
   */
  /**
   * Cria token de compartilhamento para QR Code do WhatsApp
   *
   * Gera um link público para que terceiros possam escanear o QR Code
   * sem precisar de acesso ao sistema.
   *
   * @param accountId - ID da conta WhatsApp
   * @returns URL de compartilhamento e data de expiração
   */
  async createShareToken(
    accountId: string
  ): ServiceResult<{ shareUrl: string; token: string; expiresAt: string }> {
    try {

      const response = await apiClient.post(
        `${MESSAGING_BASE_PATH}/share/${accountId}`,
        {},
        { timeout: DEFAULT_TIMEOUT }
      )

      const { shareUrl, token, expiresAt } = response.data
      return { success: true, data: { shareUrl, token, expiresAt } }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao criar token de compartilhamento:', error)
      return { success: false, error: mapApiError(error) }
    }
  },

  async getExistingAccount(accountId: string): ServiceResult<ConnectedAccount | null> {
    try {

      const result = await this.getConnectedAccount(accountId)
      if (result.success) {
        return { success: true, data: result.data }
      }

      return { success: true, data: null }
    } catch (error) {
      console.error('[WhatsAppService] Erro ao verificar conta:', error)
      return { success: true, data: null } // Não é erro crítico, retornar null
    }
  },
}

// Export type para uso em testes
export type WhatsAppIntegrationService = typeof whatsappIntegrationService
