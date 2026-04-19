/**
 * Interface e classe base para brokers de WhatsApp
 * 
 * Define o contrato que todos os brokers devem implementar
 */

import type {
  IWhatsAppBroker,
  BrokerConfig,
  SendTextParams,
  SendMediaParams,
  SendTemplateParams,
  SendMessageResult,
  MessageStatus,
  ConnectionStatus,
  ValidationResult,
  NormalizedWebhookData,
  AccountInfo,
} from '../../types.ts'

/**
 * Classe base abstrata que implementa lógica comum
 * Reduz duplicação de código entre brokers
 */
export abstract class BaseWhatsAppBroker implements IWhatsAppBroker {
  protected readonly config: BrokerConfig
  protected readonly accountId: string
  
  constructor(config: BrokerConfig, accountId: string) {
    this.config = config
    this.accountId = accountId
  }
  
  // Métodos abstratos (devem ser implementados por cada broker)
  abstract readonly brokerId: string
  abstract readonly brokerName: string
  abstract readonly brokerType: 'unofficial' | 'official' | 'intermediary'
  abstract sendTextMessage(params: SendTextParams): Promise<SendMessageResult>
  abstract sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult>
  abstract normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData>
  
  // Métodos comuns (podem ser sobrescritos)
  async sendTemplateMessage(params: SendTemplateParams): Promise<SendMessageResult> {
    throw new Error(`Template messages not supported by ${this.brokerName}`)
  }
  
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    // Implementação padrão - pode ser sobrescrita
    return {
      messageId,
      status: 'sent',
      timestamp: new Date(),
    }
  }
  
  async getConnectionStatus(): Promise<ConnectionStatus> {
    // Implementação padrão - pode ser sobrescrita
    return {
      connected: true,
    }
  }
  
  async validateConfiguration(config: BrokerConfig): Promise<ValidationResult> {
    // Validação básica comum
    if (!config.accountName) {
      return {
        valid: false,
        errors: ['accountName is required'],
      }
    }
    return { valid: true }
  }
  
  async getAccountInfo(): Promise<AccountInfo> {
    // Implementação padrão - pode ser sobrescrita
    return {
      phoneNumber: this.config.accountName,
      name: this.config.accountName,
      status: 'active',
    }
  }
  
  /**
   * Validação padrão de webhook (retorna true se não implementada)
   * Brokers podem sobrescrever para implementar validação específica
   */
  async validateWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    // Por padrão, retorna true se não houver secret configurado
    // (permite webhooks sem validação para desenvolvimento)
    if (!secret) {
      console.warn(`[${this.brokerName}] Webhook validation skipped: no secret configured`)
      return true
    }
    
    // Retorna false se houver secret mas não houver assinatura
    if (!signature) {
      console.warn(`[${this.brokerName}] Webhook validation failed: no signature provided`)
      return false
    }
    
    // Por padrão, aceita webhook (brokers específicos devem implementar validação)
    return true
  }
  
  /**
   * Método helper para fazer requisições HTTP
   */
  protected async makeRequest(
    url: string,
    options: {
      method?: string
      headers?: Record<string, string>
      body?: unknown
    }
  ): Promise<unknown> {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    return await response.json()
  }
  
  /**
   * Método helper para tratamento de erros
   */
  protected handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error(String(error))
  }
}
