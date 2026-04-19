/**
 * Tipos TypeScript para integração WhatsApp Multi-Broker
 *
 * Este arquivo define todas as interfaces e tipos necessários para a integração
 * do WhatsApp no Project Wizard, suportando múltiplos brokers (uazapi, Gupshup, API Oficial).
 *
 * @module types/whatsapp
 */

// ============================================================================
// CONSTANTES E ENUMS
// ============================================================================

/**
 * Tipos de broker suportados pelo sistema
 */
export const WHATSAPP_BROKER_TYPES = {
  UAZAPI: 'uazapi',
  GUPSHUP: 'gupshup',
  OFFICIAL_WHATSAPP: 'official_whatsapp',
} as const

/**
 * Tipo union para os tipos de broker
 */
export type WhatsAppBrokerType = typeof WHATSAPP_BROKER_TYPES[keyof typeof WHATSAPP_BROKER_TYPES]

/**
 * Status possíveis de uma conexão WhatsApp
 */
export type ConnectionStatusType = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Métodos de conexão suportados
 * - qr_code: Conexão via QR Code (uazapi)
 * - oauth: Conexão via OAuth (API Oficial)
 * - credentials: Conexão via credenciais (Gupshup, API Oficial)
 * - pair_code: Conexão via código de pareamento (uazapi)
 */
export type ConnectionMethod = 'qr_code' | 'oauth' | 'credentials' | 'pair_code'

/**
 * Tipo de broker (classificação)
 */
export type BrokerClassificationType = 'api' | 'webhook' | 'bot' | 'official'

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

/**
 * Representa um broker WhatsApp disponível para seleção
 * Dados públicos expostos ao frontend (sem tokens ou dados sensíveis)
 */
export interface WhatsAppBroker {
  /** ID único do broker */
  id: string
  /** Nome interno do broker (ex: 'uazapi') */
  name: string
  /** Nome de exibição (ex: 'WhatsApp via uazapi') */
  displayName: string
  /** Descrição do broker */
  description?: string
  /** Tipo/classificação do broker */
  brokerType: BrokerClassificationType
  /** Suporta envio de mídia */
  supportsMedia: boolean
  /** Suporta templates de mensagem */
  supportsTemplates: boolean
  /** Suporta webhooks */
  supportsWebhooks: boolean
  /** URL da documentação */
  documentationUrl?: string
  /** Campos obrigatórios para configuração (dinâmico) */
  requiredFields?: BrokerRequiredField[]
  /** Método de conexão padrão */
  connectionMethod?: ConnectionMethod
}

/**
 * Campo obrigatório para configuração de um broker
 */
export interface BrokerRequiredField {
  /** Nome do campo (ex: 'apiKey') */
  name: string
  /** Label para exibição */
  label: string
  /** Tipo do campo */
  type: 'text' | 'password' | 'url'
  /** Placeholder */
  placeholder?: string
  /** Descrição/ajuda */
  description?: string
  /** Se é campo obrigatório */
  required: boolean
}

/**
 * Representa uma instância WhatsApp criada (uazapi)
 * Usado após criação de instância para brokers que requerem criação prévia
 */
export interface WhatsAppInstance {
  /** ID da instância no broker externo */
  instanceId: string
  /** Nome da instância */
  instanceName: string
  /** Tipo do broker */
  brokerType: WhatsAppBrokerType
  /** Status atual da instância */
  status: ConnectionStatusType
  /** ID da conta criada no banco (messaging_accounts) */
  accountId?: string
  /** Dados específicos do broker (não tipados) */
  brokerSpecificData?: Record<string, unknown>
}

/**
 * Status de conexão retornado pela API
 * Formato normalizado para todos os brokers
 */
export interface ConnectionStatus {
  /** Status atual da conexão */
  status: ConnectionStatusType
  /** Método de conexão sendo usado */
  connectionMethod?: ConnectionMethod
  /** QR Code em base64 (se aplicável - uazapi) */
  qrcode?: string
  /** URL para OAuth (se aplicável - API Oficial) */
  oauthUrl?: string
  /** Código de pareamento (se aplicável - uazapi pair code) */
  pairCode?: string
  /** Número de telefone conectado */
  phoneNumber?: string
  /** Nome do perfil WhatsApp */
  profileName?: string
  /** Foto do perfil em base64 ou URL */
  profilePhoto?: string
  /** Mensagem de erro (se status === 'error') */
  errorMessage?: string
  /** Timestamp da última verificação */
  lastCheckedAt?: string
}

/**
 * Conta WhatsApp conectada e salva
 * Representa registro salvo em messaging_accounts
 */
export interface ConnectedAccount {
  /** ID da conta no banco (messaging_accounts.id) */
  accountId: string
  /** ID da instância no broker (quando disponível) */
  instanceId?: string
  /** Nome da instância no broker (quando disponível) */
  instanceName?: string
  /** Número de telefone conectado */
  phoneNumber: string
  /** Nome do perfil WhatsApp */
  profileName?: string
  /** Tipo do broker usado */
  brokerType: WhatsAppBrokerType
  /** Status da conexão */
  status: 'connected' | 'connecting' | 'disconnected'
  /** Foto do perfil */
  profilePhoto?: string
  /** Data de conexão */
  connectedAt?: string
}

// ============================================================================
// TIPOS DE REQUISIÇÃO/RESPOSTA
// ============================================================================

/**
 * Parâmetros para criar uma instância WhatsApp
 */
export interface CreateInstanceParams {
  /** ID do projeto */
  projectId: string
  /** ID do broker a ser usado */
  brokerId: string
}

/**
 * Resposta da criação de instância
 */
export interface CreateInstanceResponse {
  /** Dados da instância criada */
  instance: WhatsAppInstance
  /** QR Code inicial (se disponível) */
  qrcode?: string
  /** ID da conta criada no banco */
  accountId: string
}

/**
 * Parâmetros para conectar uma instância
 */
export interface ConnectInstanceParams {
  /** ID da conta (messaging_accounts.id) */
  accountId: string
  /** Número de telefone para pair code (opcional) */
  phone?: string
}

/**
 * Resposta da conexão de instância
 */
export interface ConnectInstanceResponse {
  /** QR Code em base64 (se connectionMethod === 'qr_code') */
  qrcode?: string
  /** Data/hora de expiração do QR Code */
  expiresAt?: string
  /** Código de pareamento (se connectionMethod === 'pair_code') */
  pairCode?: string
  /** Método de conexão usado */
  connectionMethod: ConnectionMethod
  /** Status atual */
  status: ConnectionStatusType
}

/**
 * Parâmetros para configurar broker (credenciais)
 * Usado para brokers que requerem credenciais (Gupshup, API Oficial)
 */
export interface ConfigureBrokerParams {
  /** ID do projeto */
  projectId: string
  /** ID do broker */
  brokerId: string
  /** Credenciais (campos dinâmicos baseados em required_fields) */
  credentials: BrokerCredentials
}

/**
 * Credenciais do broker (campos dinâmicos)
 */
export interface BrokerCredentials {
  /** API Key (Gupshup) */
  apiKey?: string
  /** Nome do app (Gupshup) */
  appName?: string
  /** Access Token (API Oficial) */
  accessToken?: string
  /** Phone Number ID (API Oficial) */
  phoneNumberId?: string
  /** Campos adicionais dinâmicos */
  [key: string]: string | undefined
}

/**
 * Resposta da configuração de broker
 */
export interface ConfigureBrokerResponse {
  /** Se as credenciais são válidas */
  valid: boolean
  /** Mensagem de erro (se inválido) */
  message?: string
  /** Informações da conta (se válido) */
  accountInfo?: {
    phoneNumber?: string
    accountName?: string
  }
}

/**
 * Parâmetros para salvar conta conectada
 */
export interface SaveConnectedAccountParams {
  /** ID do projeto */
  projectId: string
  /** Tipo do broker */
  brokerType: WhatsAppBrokerType
  /** ID da instância no broker (para uazapi) */
  instanceId?: string
  /** Token da instância (para uazapi) */
  instanceToken?: string
  /** Credenciais (para Gupshup/API Oficial) */
  credentials?: BrokerCredentials
  /** Número de telefone */
  phoneNumber: string
  /** Nome do perfil */
  profileName?: string
}

/**
 * Resposta do salvamento de conta
 */
export interface SaveConnectedAccountResponse {
  /** ID da conta criada */
  accountId: string
  /** Número de telefone */
  phoneNumber: string
  /** Nome do perfil */
  profileName?: string
  /** Status */
  status: 'connected'
}

// ============================================================================
// TIPOS PARA BACKEND (snake_case)
// ============================================================================

/**
 * Broker do backend (snake_case)
 * Representa dados vindos diretamente da API
 */
export interface BackendWhatsAppBroker {
  id: string
  name: string
  display_name: string
  description?: string
  broker_type: BrokerClassificationType
  supports_media: boolean
  supports_templates: boolean
  supports_webhooks: boolean
  documentation_url?: string
  required_fields?: BackendBrokerRequiredField[]
}

/**
 * Campo obrigatório do backend
 */
export interface BackendBrokerRequiredField {
  name: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder?: string
  description?: string
  required: boolean
}

/**
 * Instância do backend (snake_case)
 */
export interface BackendWhatsAppInstance {
  instance_id: string
  instance_name: string
  broker_type: string
  status: ConnectionStatusType
  account_id?: string
  broker_specific_data?: Record<string, unknown>
}

/**
 * Status de conexão do backend (snake_case)
 */
export interface BackendConnectionStatus {
  status: ConnectionStatusType
  connection_method?: ConnectionMethod
  qrcode?: string
  oauth_url?: string
  pair_code?: string
  phone_number?: string
  profile_name?: string
  profile_photo?: string
  error_message?: string
  last_checked_at?: string
}

/**
 * Conta conectada do backend (snake_case)
 */
export interface BackendConnectedAccount {
  account_id: string
  instance_id?: string
  instance_name?: string
  phone_number: string
  profile_name?: string
  broker_type: string
  status: 'connected' | 'connecting' | 'disconnected' | 'active'
  profile_photo?: string
  connected_at?: string
}

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

/**
 * Erro específico da integração WhatsApp
 */
export interface WhatsAppIntegrationError {
  /** Código do erro */
  code: WhatsAppErrorCode
  /** Mensagem amigável para o usuário */
  message: string
  /** Detalhes técnicos (apenas para logs) */
  details?: string
  /** Se o erro é recuperável (pode tentar novamente) */
  recoverable: boolean
}

/**
 * Códigos de erro conhecidos
 */
export type WhatsAppErrorCode =
  | 'BROKER_NOT_FOUND'
  | 'BROKER_NOT_ACTIVE'
  | 'INSTANCE_CREATION_FAILED'
  | 'CONNECTION_FAILED'
  | 'QR_CODE_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR'

// ============================================================================
// TIPOS PARA STATE MANAGEMENT
// ============================================================================

/**
 * Estado do componente StepWhatsApp
 */
export type WhatsAppStepState =
  | 'selecting_broker'
  | 'loading_brokers'
  | 'configuring'
  | 'validating_credentials'
  | 'creating_instance'
  | 'connecting'
  | 'waiting_qr'
  | 'waiting_oauth'
  | 'testing_connection'
  | 'connected'
  | 'error'

/**
 * Dados do WhatsApp para o ProjectWizardStore
 */
export interface ProjectWhatsAppData {
  /** Broker selecionado */
  selectedBrokerId?: string
  /** Tipo do broker */
  brokerType?: WhatsAppBrokerType
  /** ID da instância (para uazapi) */
  instanceId?: string
  /** Token da instância (para uazapi) - temporário, não persistir */
  instanceToken?: string
  /** ID da conta no banco */
  accountId?: string
  /** Status de conexão */
  connected: boolean
  /** Número de telefone conectado */
  phoneNumber?: string
  /** QR Code atual */
  qrCode?: string
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Verifica se é um tipo de broker válido
 */
export function isValidBrokerType(value: unknown): value is WhatsAppBrokerType {
  return (
    typeof value === 'string' &&
    Object.values(WHATSAPP_BROKER_TYPES).includes(value as WhatsAppBrokerType)
  )
}

/**
 * Verifica se é um status de conexão válido
 */
export function isValidConnectionStatus(value: unknown): value is ConnectionStatusType {
  return (
    typeof value === 'string' &&
    ['disconnected', 'connecting', 'connected', 'error'].includes(value)
  )
}

/**
 * Verifica se broker suporta QR Code
 */
export function brokerSupportsQRCode(brokerType: WhatsAppBrokerType): boolean {
  return brokerType === WHATSAPP_BROKER_TYPES.UAZAPI
}

/**
 * Verifica se broker requer credenciais
 */
export function brokerRequiresCredentials(brokerType: WhatsAppBrokerType): boolean {
  return (
    brokerType === WHATSAPP_BROKER_TYPES.GUPSHUP ||
    brokerType === WHATSAPP_BROKER_TYPES.OFFICIAL_WHATSAPP
  )
}
