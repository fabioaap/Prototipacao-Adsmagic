/**
 * Messaging types — ported from Deno Edge Function types.ts
 * Only webhook-relevant types are included (no send/connection types).
 */

export interface MessagingAccount {
  id: string
  integration_account_id: string
  project_id: string
  platform: string
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

export interface NormalizedMessage {
  messageId: string
  externalMessageId: string
  brokerId: string
  accountId: string
  from: {
    phoneNumber: string
    name?: string
    profilePicture?: string
    jid?: string
    lid?: string
    canonicalIdentifier?: string
  }
  to: {
    phoneNumber: string
    accountName: string
  }
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
  timestamp: Date
  status: 'sent' | 'delivered' | 'read' | 'failed'
  isGroup: boolean
  groupId?: string
  groupName?: string
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
  rawData: unknown
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
  context?: { quotedMessageId?: string }
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

export interface ProcessResult {
  success: boolean
  contactId?: string
  automationsTriggered?: number
  error?: string
}
