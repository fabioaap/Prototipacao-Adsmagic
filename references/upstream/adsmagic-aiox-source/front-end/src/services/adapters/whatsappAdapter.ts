/**
 * WhatsApp Adapter
 *
 * Adapter para normalização de dados entre backend (snake_case) e frontend (camelCase)
 * para a integração WhatsApp Multi-Broker.
 *
 * Responsabilidades:
 * - Converter dados do backend para formato do frontend
 * - Normalizar respostas de diferentes brokers para formato comum
 * - Validar dados antes de normalizar
 *
 * @module services/adapters/whatsappAdapter
 */

import {
  WHATSAPP_BROKER_TYPES,
  type WhatsAppBroker,
  type WhatsAppInstance,
  type ConnectionStatus,
  type ConnectedAccount,
  type BackendWhatsAppBroker,
  type BackendWhatsAppInstance,
  type BackendConnectionStatus,
  type BackendConnectedAccount,
  type BackendBrokerRequiredField,
  type BrokerRequiredField,
  type WhatsAppBrokerType,
  type ConnectionStatusType,
  type ConnectionMethod,
} from '@/types/whatsapp'

// ============================================================================
// HELPERS INTERNOS - TYPE GUARDS
// ============================================================================

/**
 * Valida se um valor é um objeto não-nulo
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard para validar estrutura mínima de BackendWhatsAppBroker
 */
function isValidBackendBroker(value: unknown): value is BackendWhatsAppBroker {
  if (!isObject(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.id !== '' &&
    value.name !== ''
  )
}

/**
 * Type guard para validar estrutura mínima de BackendWhatsAppInstance
 */
function isValidBackendInstance(value: unknown): value is BackendWhatsAppInstance {
  if (!isObject(value)) return false
  return (
    typeof value.instance_id === 'string' &&
    typeof value.instance_name === 'string'
  )
}

/**
 * Type guard para validar estrutura mínima de BackendConnectionStatus
 */
function isValidBackendConnectionStatus(value: unknown): value is BackendConnectionStatus {
  if (!isObject(value)) return false
  return typeof value.status === 'string'
}

/**
 * Type guard para validar estrutura mínima de BackendConnectedAccount
 */
function isValidBackendConnectedAccount(value: unknown): value is BackendConnectedAccount {
  if (!isObject(value)) return false
  return (
    typeof value.account_id === 'string' &&
    typeof value.phone_number === 'string'
  )
}

/**
 * Converte status do backend para tipo tipado
 */
function normalizeStatus(status: unknown): ConnectionStatusType {
  if (typeof status !== 'string') {
    return 'disconnected'
  }

  const validStatuses: ConnectionStatusType[] = ['disconnected', 'connecting', 'connected', 'error']
  if (validStatuses.includes(status as ConnectionStatusType)) {
    return status as ConnectionStatusType
  }

  // Mapear status alternativos do backend/uazapi
  const statusMap: Record<string, ConnectionStatusType> = {
    'open': 'connected',
    'active': 'connected',  // Backend usa 'active' para conta conectada
    'close': 'disconnected',
    'qrcode': 'connecting',
    'connecting': 'connecting',
    'timeout': 'disconnected',
    'conflicted': 'error',
  }

  return statusMap[status.toLowerCase()] || 'disconnected'
}

/**
 * Converte método de conexão do backend para tipo tipado
 */
function normalizeConnectionMethod(method: unknown): ConnectionMethod | undefined {
  if (typeof method !== 'string') {
    return undefined
  }

  const validMethods: ConnectionMethod[] = ['qr_code', 'oauth', 'credentials', 'pair_code']
  if (validMethods.includes(method as ConnectionMethod)) {
    return method as ConnectionMethod
  }

  // Mapear variantes
  const methodMap: Record<string, ConnectionMethod> = {
    'qrcode': 'qr_code',
    'qr': 'qr_code',
    'paircode': 'pair_code',
    'pair': 'pair_code',
  }

  return methodMap[method.toLowerCase()] || undefined
}

/**
 * Normaliza broker type para tipo tipado
 */
function normalizeBrokerType(brokerType: unknown): WhatsAppBrokerType {
  if (typeof brokerType !== 'string') {
    return 'uazapi'
  }

  const validTypes: WhatsAppBrokerType[] = ['uazapi', 'gupshup', 'official_whatsapp']
  if (validTypes.includes(brokerType as WhatsAppBrokerType)) {
    return brokerType as WhatsAppBrokerType
  }

  // Mapear variantes
  const typeMap: Record<string, WhatsAppBrokerType> = {
    'official': 'official_whatsapp',
    'meta': 'official_whatsapp',
    'whatsapp_official': 'official_whatsapp',
  }

  return typeMap[brokerType.toLowerCase()] || 'uazapi'
}

// ============================================================================
// NORMALIZADORES - FUNÇÕES REUTILIZÁVEIS (DRY)
// ============================================================================

/**
 * Normaliza dados de instância para qualquer broker
 * Função parametrizada que elimina duplicação de código
 *
 * @param data - Dados da instância do backend
 * @param brokerType - Tipo do broker
 * @returns Instância normalizada
 */
function normalizeInstance(
  data: BackendWhatsAppInstance,
  brokerType: WhatsAppBrokerType
): WhatsAppInstance {
  return {
    instanceId: data.instance_id,
    instanceName: data.instance_name,
    brokerType,
    status: normalizeStatus(data.status),
    accountId: data.account_id,
    brokerSpecificData: data.broker_specific_data,
  }
}

/**
 * Normaliza status de conexão baseado no tipo de broker
 * Função parametrizada que lida com especificidades de cada broker
 *
 * @param data - Dados de status do backend
 * @param brokerType - Tipo do broker
 * @returns Status de conexão normalizado
 */
function normalizeConnectionStatusByBroker(
  data: BackendConnectionStatus,
  brokerType: WhatsAppBrokerType
): ConnectionStatus {
  // Campos comuns a todos os brokers
  const baseStatus: ConnectionStatus = {
    status: normalizeStatus(data.status),
    phoneNumber: data.phone_number,
    profileName: data.profile_name,
    errorMessage: data.error_message,
    lastCheckedAt: data.last_checked_at,
  }

  // Campos específicos por broker
  switch (brokerType) {
    case WHATSAPP_BROKER_TYPES.UAZAPI:
      return {
        ...baseStatus,
        connectionMethod: normalizeConnectionMethod(data.connection_method) || 'qr_code',
        qrcode: data.qrcode,
        pairCode: data.pair_code,
        profilePhoto: data.profile_photo,
      }

    case WHATSAPP_BROKER_TYPES.GUPSHUP:
      return {
        ...baseStatus,
        connectionMethod: 'credentials',
      }

    case WHATSAPP_BROKER_TYPES.OFFICIAL_WHATSAPP:
      return {
        ...baseStatus,
        connectionMethod: normalizeConnectionMethod(data.connection_method) || 'credentials',
        oauthUrl: data.oauth_url,
        profilePhoto: data.profile_photo,
      }

    default:
      return {
        ...baseStatus,
        connectionMethod: 'qr_code',
      }
  }
}

// ============================================================================
// ADAPTER PRINCIPAL
// ============================================================================

/**
 * Adapter para normalização de dados WhatsApp
 * Exportado como singleton para uso em toda a aplicação
 */
export const whatsappAdapter = {
  /**
   * Normaliza lista de brokers do backend
   *
   * @param rawData - Lista de brokers do backend
   * @returns Lista de brokers normalizados
   *
   * @example
   * ```ts
   * const brokers = whatsappAdapter.normalizeBrokerList(response.data.brokers)
   * ```
   */
  normalizeBrokerList(rawData: unknown): WhatsAppBroker[] {
    if (!Array.isArray(rawData)) {
      console.warn('[WhatsAppAdapter] normalizeBrokerList: dados não são array')
      return []
    }

    return rawData
      .filter(isValidBackendBroker)
      .map((broker) => {
        // Normalizar required_fields se existirem
        let requiredFields: BrokerRequiredField[] | undefined
        if (Array.isArray(broker.required_fields)) {
          requiredFields = broker.required_fields.map((field: BackendBrokerRequiredField) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder,
            description: field.description,
            required: field.required,
          }))
        }

        return {
          id: broker.id,
          name: broker.name,
          displayName: broker.display_name || broker.name,
          description: broker.description,
          brokerType: broker.broker_type || 'api',
          supportsMedia: Boolean(broker.supports_media),
          supportsTemplates: Boolean(broker.supports_templates),
          supportsWebhooks: Boolean(broker.supports_webhooks),
          documentationUrl: broker.documentation_url,
          requiredFields,
        } satisfies WhatsAppBroker
      })
  },

  /**
   * Normaliza dados de instância baseado no tipo de broker
   *
   * @param brokerType - Tipo do broker
   * @param rawData - Dados da instância do backend
   * @returns Instância normalizada
   *
   * @example
   * ```ts
   * const instance = whatsappAdapter.normalizeInstanceData('uazapi', response.data)
   * ```
   */
  normalizeInstanceData(brokerType: string, rawData: unknown): WhatsAppInstance {
    const normalizedBrokerType = normalizeBrokerType(brokerType)

    // Validar estrutura mínima dos dados
    if (!isValidBackendInstance(rawData)) {
      console.warn('[WhatsAppAdapter] normalizeInstanceData: dados inválidos ou incompletos')
      return {
        instanceId: '',
        instanceName: '',
        brokerType: normalizedBrokerType,
        status: 'disconnected',
      }
    }

    // Usar função parametrizada (DRY)
    return normalizeInstance(rawData, normalizedBrokerType)
  },

  /**
   * Normaliza status de conexão baseado no tipo de broker
   *
   * @param brokerType - Tipo do broker
   * @param rawData - Dados de status do backend
   * @returns Status normalizado
   *
   * @example
   * ```ts
   * const status = whatsappAdapter.normalizeConnectionStatus('uazapi', response.data)
   * ```
   */
  normalizeConnectionStatus(brokerType: string, rawData: unknown): ConnectionStatus {
    const normalizedBrokerType = normalizeBrokerType(brokerType)

    // Validar estrutura mínima dos dados
    if (!isValidBackendConnectionStatus(rawData)) {
      console.warn('[WhatsAppAdapter] normalizeConnectionStatus: dados inválidos ou incompletos')
      return {
        status: 'disconnected',
      }
    }

    // Usar função parametrizada com lógica específica por broker (DRY)
    return normalizeConnectionStatusByBroker(rawData, normalizedBrokerType)
  },

  /**
   * Normaliza dados de conta conectada
   *
   * @param brokerType - Tipo do broker
   * @param rawData - Dados da conta do backend
   * @returns Conta normalizada
   *
   * @example
   * ```ts
   * const account = whatsappAdapter.normalizeAccountData('uazapi', response.data)
   * ```
   */
  normalizeAccountData(brokerType: string, rawData: unknown): ConnectedAccount {
    const normalizedBrokerType = normalizeBrokerType(brokerType)

    // Validar estrutura mínima dos dados
    if (!isValidBackendConnectedAccount(rawData)) {
      console.warn('[WhatsAppAdapter] normalizeAccountData: dados inválidos ou incompletos')
      return {
        accountId: '',
        phoneNumber: '',
        brokerType: normalizedBrokerType,
        status: 'disconnected',
      }
    }

    return {
      accountId: rawData.account_id,
      instanceId: rawData.instance_id,
      instanceName: rawData.instance_name,
      phoneNumber: rawData.phone_number,
      profileName: rawData.profile_name,
      brokerType: normalizeBrokerType(rawData.broker_type || brokerType),
      status:
        rawData.status === 'connected' || rawData.status === 'active'
          ? 'connected'
          : rawData.status === 'connecting'
            ? 'connecting'
            : 'disconnected',
      profilePhoto: rawData.profile_photo,
      connectedAt: rawData.connected_at,
    }
  },

  /**
   * Determina o método de conexão baseado no tipo de broker
   *
   * @param broker - Broker selecionado
   * @returns Método de conexão apropriado
   */
  getConnectionMethod(broker: WhatsAppBroker): ConnectionMethod {
    // Se broker tem método definido, usar
    if (broker.connectionMethod) {
      return broker.connectionMethod
    }

    // Inferir baseado no tipo de broker (usando constantes)
    const brokerName = broker.name.toLowerCase()
    switch (brokerName) {
      case WHATSAPP_BROKER_TYPES.UAZAPI:
        return 'qr_code'
      case WHATSAPP_BROKER_TYPES.GUPSHUP:
        return 'credentials'
      case WHATSAPP_BROKER_TYPES.OFFICIAL_WHATSAPP:
        return 'credentials' // Pode ser 'oauth' dependendo da configuração
      default:
        return 'qr_code'
    }
  },

  /**
   * Verifica se broker suporta criação de instância prévia
   *
   * @param brokerType - Tipo do broker
   * @returns true se suporta criação prévia
   */
  supportsInstanceCreation(brokerType: WhatsAppBrokerType): boolean {
    // Apenas uazapi cria instância antes da conexão
    return brokerType === WHATSAPP_BROKER_TYPES.UAZAPI
  },

  /**
   * Formata número de telefone para exibição
   *
   * @param phone - Número de telefone
   * @returns Número formatado ou string vazia
   */
  formatPhoneNumber(phone: string | undefined | null): string {
    if (!phone) return ''

    // Remover caracteres não numéricos
    const digits = phone.replace(/\D/g, '')

    // Formatar para brasileiro se começar com 55
    if (digits.startsWith('55') && digits.length >= 12) {
      const ddd = digits.slice(2, 4)
      const part1 = digits.slice(4, digits.length - 4)
      const part2 = digits.slice(-4)
      return `+55 (${ddd}) ${part1}-${part2}`
    }

    // Retornar com + se não tiver
    return phone.startsWith('+') ? phone : `+${phone}`
  },
}

// Export type para uso em testes
export type WhatsAppAdapter = typeof whatsappAdapter
