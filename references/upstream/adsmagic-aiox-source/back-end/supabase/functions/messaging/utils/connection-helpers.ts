/**
 * Helpers compartilhados para handlers de conexão
 * 
 * Elimina duplicação de código entre generate-qrcode, generate-paircode e connect-instance.
 * 
 * Este módulo centraliza a lógica comum de:
 * - Validação de acesso à conta
 * - Validação de suporte do broker
 * - Extração de configuração do broker
 * - Criação de configuração para conexão
 * 
 * @module utils/connection-helpers
 */

import type { MessagingAccount, BrokerConfig } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Configuração do broker para conexão
 * 
 * Contém os dados necessários para estabelecer conexão com o broker:
 * - instanceId: ID da instância no broker
 * - accessToken: Token de autenticação
 * - apiKey: Chave da API (pode ser o mesmo que accessToken para UAZAPI)
 * - apiBaseUrl: URL base da API do broker
 */
export interface BrokerConnectionConfig {
  instanceId: string
  accessToken: string
  apiKey: string
  apiBaseUrl: string
}

/**
 * Resultado da validação de acesso à conta
 */
export interface AccountAccessValidation {
  valid: boolean
  error?: string
  user?: { id: string }
}

/**
 * Valida se o usuário autenticado tem acesso à conta e ao projeto
 * 
 * Realiza três verificações:
 * 1. Verifica se o usuário está autenticado
 * 2. Verifica se a conta existe
 * 3. Verifica se o usuário tem acesso ao projeto da conta
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param account - Conta de mensageria a ser validada
 * @returns Resultado da validação com informações do usuário se válido
 * 
 * @example
 * ```typescript
 * const validation = await validateAccountAccess(supabaseClient, account)
 * if (!validation.valid) {
 *   return errorResponse(validation.error, 403)
 * }
 * const userId = validation.user.id
 * ```
 */
export async function validateAccountAccess(
  supabaseClient: SupabaseDbClient,
  account: MessagingAccount | null
): Promise<AccountAccessValidation> {
  // Verificar autenticação
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !user) {
    return {
      valid: false,
      error: 'Authentication required'
    }
  }

  // Verificar se conta existe
  if (!account) {
    return {
      valid: false,
      error: 'Conta não encontrada'
    }
  }

  // Verificar se usuário tem acesso ao projeto
  const { data: projectCheck } = await supabaseClient
    .from('project_users')
    .select('project_id')
    .eq('project_id', account.project_id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!projectCheck) {
    return {
      valid: false,
      error: 'Acesso negado ao projeto'
    }
  }

  return {
    valid: true,
    user: { id: user.id }
  }
}

/**
 * Valida se o broker suporta conexão via QR Code/Pair Code
 * 
 * Apenas brokers não oficiais (uazapi, evolution) suportam conexão
 * via QR Code ou Pair Code. Brokers oficiais usam outros métodos
 * de autenticação.
 * 
 * @param brokerType - Tipo do broker (ex: 'uazapi', 'evolution', 'official_whatsapp')
 * @returns Resultado da validação com mensagem de erro se inválido
 * 
 * @example
 * ```typescript
 * const validation = validateBrokerSupportsConnection(account.broker_type)
 * if (!validation.valid) {
 *   return errorResponse(validation.error, 400)
 * }
 * ```
 */
export function validateBrokerSupportsConnection(
  brokerType: string
): { valid: boolean; error?: string } {
  // Apenas brokers não oficiais suportam QR Code/Pair Code
  if (brokerType !== 'uazapi' && brokerType !== 'evolution') {
    return {
      valid: false,
      error: 'Conexão via QR Code/Pair Code só está disponível para brokers não oficiais'
    }
  }

  return { valid: true }
}

/**
 * Extrai configuração do broker para conexão
 * 
 * Para UAZAPI, extrai instanceId e accessToken de múltiplas fontes possíveis:
 * - instanceId: broker_config.instanceId, broker_config.instanceData.id, etc.
 * - accessToken: api_key (prioritário), access_token, broker_config.instanceData.token
 * 
 * Valida se os campos obrigatórios estão presentes antes de retornar.
 * 
 * @param account - Conta de mensageria com configuração do broker
 * @returns Configuração extraída ou erro se campos obrigatórios faltarem
 * 
 * @example
 * ```typescript
 * const config = extractBrokerConnectionConfig(account)
 * if (!config.instanceId) {
 *   return errorResponse('Instance ID não encontrado', 400)
 * }
 * ```
 */
export function extractBrokerConnectionConfig(
  account: MessagingAccount
): { config: BrokerConnectionConfig | null; error?: string } {
  // Apenas UAZAPI requer extração especial de configuração
  if (account.broker_type !== 'uazapi') {
    // Para outros brokers, usar configuração padrão
    const instanceId = (account.broker_config?.instanceId as string) || ''
    const accessToken = account.api_key || account.access_token || ''
    const apiBaseUrl = (account.broker_config?.apiBaseUrl as string) || 'https://free.uazapi.com'

    if (!instanceId || !accessToken) {
      return {
        config: null,
        error: 'Configuração do broker incompleta'
      }
    }

    return {
      config: {
        instanceId,
        accessToken,
        apiKey: accessToken,
        apiBaseUrl
      }
    }
  }

  // Para UAZAPI, extrair instanceId de múltiplas fontes possíveis
  const instanceId = (account.broker_config?.instanceId as string) ||
    (account.broker_config?.instanceData as any)?.id ||
    (account.broker_config?.instanceData as any)?.instance?.id ||
    ''

  // Para UAZAPI, o token da instância está no campo api_key (prioritário)
  // Priorizar api_key (campo principal para UAZAPI)
  const tokenFromApiKey = account.api_key || ''
  const tokenFromAccessToken = account.access_token || ''
  const tokenFromInstanceData = (account.broker_config?.instanceData as any)?.token ||
    (account.broker_config?.instanceData as any)?.instance?.token ||
    ''

  // Priorizar api_key (campo principal onde o token é salvo)
  const accessToken = tokenFromApiKey || tokenFromAccessToken || tokenFromInstanceData

  // URL base da API (padrão para UAZAPI)
  const apiBaseUrl = (account.broker_config?.apiBaseUrl as string) || 'https://free.uazapi.com'

  // Validar campos obrigatórios
  if (!instanceId) {
    return {
      config: null,
      error: 'Instance ID não encontrado na configuração da conta. A conta pode não ter sido criada corretamente.'
    }
  }

  if (!accessToken) {
    return {
      config: null,
      error: 'Token de autenticação não encontrado. Para UAZAPI, o token da instância deve estar no campo api_key da tabela messaging_accounts.'
    }
  }

  return {
    config: {
      instanceId,
      accessToken,
      apiKey: accessToken, // Para UAZAPI, apiKey e accessToken são o mesmo
      apiBaseUrl
    }
  }
}

/**
 * Cria configuração do broker para conexão
 * 
 * Combina a configuração extraída do broker com os dados da conta
 * para criar um objeto BrokerConfig completo que será usado pelo
 * WhatsAppBrokerFactory para criar a instância do broker.
 * 
 * @param account - Conta de mensageria
 * @param connectionConfig - Configuração extraída do broker
 * @returns Configuração completa do broker para conexão
 * 
 * @example
 * ```typescript
 * const extracted = extractBrokerConnectionConfig(account)
 * if (!extracted.config) {
 *   return errorResponse(extracted.error, 400)
 * }
 * const brokerConfig = createBrokerConfigForConnection(account, extracted.config)
 * const broker = WhatsAppBrokerFactory.create(account.broker_type, brokerConfig, account.id)
 * ```
 */
export function createBrokerConfigForConnection(
  account: MessagingAccount,
  connectionConfig: BrokerConnectionConfig
): BrokerConfig {
  return {
    ...account.broker_config,
    accountName: account.account_name,
    // Para UAZAPI, api_key é o campo principal onde o token da instância é salvo
    apiKey: account.api_key || connectionConfig.accessToken || undefined,
    accessToken: account.api_key || connectionConfig.accessToken || account.access_token || undefined,
    // Garantir que instanceId seja passado explicitamente
    instanceId: connectionConfig.instanceId || (account.broker_config?.instanceId as string) || undefined,
    apiBaseUrl: connectionConfig.apiBaseUrl || (account.broker_config?.apiBaseUrl as string) || 'https://free.uazapi.com'
  }
}
