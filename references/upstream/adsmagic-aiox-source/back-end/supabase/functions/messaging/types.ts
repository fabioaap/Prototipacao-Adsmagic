/**
 * Tipos TypeScript para Edge Function de Mensageria
 * 
 * Tipos compartilhados entre handlers, brokers e services
 */

// ============================================================================
// TIPOS DO BANCO DE DADOS
// ============================================================================

export interface MessagingBroker {
  id: string
  name: string
  display_name: string
  platform: 'whatsapp' | 'facebook_messenger' | 'telegram' | 'instagram_direct' | 'discord' | 'slack'
  broker_type: 'api' | 'webhook' | 'bot' | 'official'
  description?: string | null
  is_active: boolean
  api_base_url?: string | null
  webhook_endpoint?: string | null
  auth_type?: 'api_key' | 'bearer' | 'basic' | 'bot_token' | 'page_token' | 'none' | null
  required_fields: string[]
  optional_fields: string[]
  max_connections: number
  supports_media: boolean
  supports_templates: boolean
  supports_webhooks: boolean
  supports_automation: boolean
  documentation_url?: string | null
  support_url?: string | null
  version?: string | null
  /** Token administrativo do broker (ex: AdminToken do uazapi). Deve ser criptografado antes de salvar. */
  admin_token?: string | null
  /** Indica se o admin_token já está criptografado. Útil para validações e migrações. */
  admin_token_encrypted?: boolean | null
  created_at: string
  updated_at: string
}

export interface MessagingAccount {
  id: string
  integration_account_id: string
  project_id: string
  platform: 'whatsapp' | 'facebook_messenger' | 'telegram' | 'instagram_direct' | 'discord' | 'slack'
  broker_type: string
  broker_config: Record<string, unknown>
  account_identifier: string
  account_name: string
  account_display_name?: string | null
  status: 'active' | 'inactive' | 'suspended' | 'connecting' | 'disconnected'
  is_primary: boolean
  platform_config: Record<string, unknown>
  access_token?: string | null
  refresh_token?: string | null
  token_expires_at?: string | null
  webhook_url?: string | null
  webhook_secret?: string | null
  api_key?: string | null
  total_messages: number
  total_contacts: number
  last_message_at?: string | null
  last_webhook_at?: string | null
  created_at: string
  updated_at: string
}

export interface MessagingWebhook {
  id: string
  messaging_account_id: string
  project_id: string
  webhook_url: string
  webhook_secret?: string | null
  events: string[]
  status: 'active' | 'inactive' | 'error'
  last_triggered_at?: string | null
  total_events: number
  error_count: number
  last_error?: string | null
  retry_count: number
  max_retries: number
  retry_delay: number
  created_at: string
  updated_at: string
}

// ============================================================================
// TIPOS NORMALIZADOS (Formato Padrão do Sistema)
// ============================================================================

export interface NormalizedMessage {
  // Identificação
  messageId: string
  externalMessageId: string // ID do broker original
  brokerId: string
  accountId: string
  
  // Remetente
  from: {
    phoneNumber: string
    name?: string
    profilePicture?: string
    /** JID (Jabber ID) - identificador único do WhatsApp no formato: "554791662434@s.whatsapp.net" */
    jid?: string
    /** LID (Local ID) - identificador local do WhatsApp no formato: "213709100187796@lid" */
    lid?: string
    /** Identificador canônico normalizado para busca unificada (formato: "phone:55:16997202704" ou "jid:554791662434@s.whatsapp.net" ou "lid:213709100187796@lid") */
    canonicalIdentifier?: string
  }
  
  // Destinatário (número da conta)
  to: {
    phoneNumber: string
    accountName: string
  }
  
  // Conteúdo
  content: {
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
    text?: string
    mediaUrl?: string
    caption?: string
    mimeType?: string
    fileName?: string
    location?: {
      latitude: number
      longitude: number
      name?: string
    }
  }
  
  // Metadados
  timestamp: Date
  status: 'sent' | 'delivered' | 'read' | 'failed'
  isGroup: boolean
  groupId?: string
  groupName?: string
  
  // Contexto
  context?: {
    quotedMessageId?: string
    metadata?: Record<string, unknown>
  }
}

export interface NormalizedWebhookData {
  eventType: 'message' | 'status' | 'delivery' | 'read' | 'connection'
  message?: NormalizedMessage
  status?: MessageStatus
  connectionStatus?: ConnectionStatus
  timestamp: Date
  rawData: unknown // Dados originais para debug
}

export interface MessageStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: Date
  error?: string
}

export interface ConnectionStatus {
  connected: boolean
  lastConnectedAt?: Date
  error?: string
}

export interface AccountInfo {
  phoneNumber: string
  name: string
  status: 'active' | 'inactive' | 'suspended' | 'connecting' | 'disconnected'
  qrCode?: string
}

// ============================================================================
// TIPOS DE BROKER
// ============================================================================

export interface BrokerConfig {
  apiBaseUrl?: string
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  instanceId?: string
  phoneNumberId?: string
  appName?: string
  accountName: string
  [key: string]: unknown
}

export interface SendTextParams {
  to: string
  text: string
  context?: {
    quotedMessageId?: string
  }
}

export interface SendMediaParams {
  to: string
  mediaUrl: string
  type: 'image' | 'video' | 'audio' | 'document'
  caption?: string
  fileName?: string
}

export interface SendTemplateParams {
  to: string
  templateName: string
  languageCode: string
  parameters?: string[]
}

export interface SendMessageResult {
  messageId: string
  status: 'sent' | 'failed'
  timestamp: Date
  error?: string
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

export interface IWhatsAppBroker {
  readonly brokerId: string
  readonly brokerName: string
  readonly brokerType: 'unofficial' | 'official' | 'intermediary'

  sendTextMessage(params: SendTextParams): Promise<SendMessageResult>
  sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult>
  sendTemplateMessage(params: SendTemplateParams): Promise<SendMessageResult>
  getMessageStatus(messageId: string): Promise<MessageStatus>
  getConnectionStatus(): Promise<ConnectionStatus>
  validateConfiguration(config: BrokerConfig): Promise<ValidationResult>
  normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData>
  getAccountInfo(): Promise<AccountInfo>
  validateWebhookSignature?(rawBody: string, signature: string, secret: string): Promise<boolean>
}

// ============================================================================
// DTOs PARA API
// ============================================================================

export interface SendMessageDTO {
  accountId: string
  to: string
  text?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  caption?: string
  templateName?: string
  templateLanguage?: string
  templateParameters?: string[]
}

export interface WebhookDTO {
  accountId: string
  brokerType: string
  data: unknown
  signature?: string
}

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

export interface ProcessResult {
  success: boolean
  contactId?: string
  automationsTriggered?: number
  error?: string
}

export interface SendMessageResponse {
  messageId: string
  status: string
  timestamp: string
}

export interface AccountStatusResponse {
  accountId: string
  status: string
  connected: boolean
  lastMessageAt?: string
  totalMessages: number
  totalContacts: number
}

export interface QRCodeResponse {
  qrCode?: string // Base64 ou URL da imagem (quando type é 'qrcode')
  code?: string // Código de pareamento (quando type é 'paircode')
  expiresAt: string // ISO timestamp
  instanceId: string
  status: 'generated' | 'connecting' | 'connected' | 'expired'
  type?: 'qrcode' | 'paircode' // Tipo de código gerado
  message?: string
}

export interface PairCodeResponse {
  code: string
  expiresAt: string // ISO timestamp
  instanceId: string
  status: 'generated' | 'connecting' | 'connected' | 'expired'
  message?: string
}

export interface ConnectionStatusResponse {
  instanceId: string
  connected: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'timeout'
  phoneNumber?: string
  profileName?: string // Nome do perfil WhatsApp conectado
  qrCode?: string // Base64 se ainda estiver gerando
  pairCode?: string // Pair Code se ainda estiver gerando
  message?: string
}
