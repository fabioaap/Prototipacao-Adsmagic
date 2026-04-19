/**
 * Base WhatsApp broker — ported from Deno Edge Function
 */
import type {
  IWhatsAppBroker, BrokerConfig, SendTextParams, SendMediaParams,
  SendTemplateParams, SendMessageResult, MessageStatus, ConnectionStatus,
  ValidationResult, NormalizedWebhookData, AccountInfo,
} from '../../types/messaging.js'

export abstract class BaseWhatsAppBroker implements IWhatsAppBroker {
  protected readonly config: BrokerConfig
  protected readonly accountId: string

  constructor(config: BrokerConfig, accountId: string) {
    this.config = config
    this.accountId = accountId
  }

  abstract readonly brokerId: string
  abstract readonly brokerName: string
  abstract readonly brokerType: 'unofficial' | 'official' | 'intermediary'
  abstract sendTextMessage(params: SendTextParams): Promise<SendMessageResult>
  abstract sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult>
  abstract normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData>

  async sendTemplateMessage(_params: SendTemplateParams): Promise<SendMessageResult> {
    throw new Error(`Template messages not supported by ${this.brokerName}`)
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    return { messageId, status: 'sent', timestamp: new Date() }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return { connected: true }
  }

  async validateConfiguration(config: BrokerConfig): Promise<ValidationResult> {
    if (!config.accountName) return { valid: false, errors: ['accountName is required'] }
    return { valid: true }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    return { phoneNumber: this.config.accountName, name: this.config.accountName, status: 'active' }
  }

  async validateWebhookSignature(_rawBody: string, signature: string, secret: string): Promise<boolean> {
    if (!secret) return true
    if (!signature) return false
    return true
  }

  protected async makeRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: unknown }): Promise<unknown> {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    return await response.json()
  }

  protected handleError(error: unknown): Error {
    if (error instanceof Error) return error
    return new Error(String(error))
  }
}
