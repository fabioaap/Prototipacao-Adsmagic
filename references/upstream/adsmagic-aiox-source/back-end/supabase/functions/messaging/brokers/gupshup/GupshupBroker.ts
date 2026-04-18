/**
 * Broker intermediário: Gupshup
 * https://www.gupshup.io
 * Já tem integração com WhatsApp Business API
 */

import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.ts'
import type {
  BrokerConfig,
  SendTextParams,
  SendMediaParams,
  SendMessageResult,
  NormalizedWebhookData,
  NormalizedMessage,
} from '../../types.ts'
import type { GupshupWebhookData, GupshupSendResponse } from './types.ts'

export class GupshupBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'gupshup'
  readonly brokerName = 'Gupshup'
  readonly brokerType = 'intermediary' as const
  
  private readonly apiUrl: string
  private readonly apiKey: string
  private readonly appName: string
  
  constructor(config: BrokerConfig, accountId: string) {
    super(config, accountId)
    this.apiUrl = (config.apiBaseUrl as string) || 'https://api.gupshup.io/sm/api/v1'
    this.apiKey = (config.apiKey as string) || ''
    this.appName = (config.appName as string) || ''
    
    if (!this.apiKey) {
      throw new Error('Gupshup: apiKey é obrigatório')
    }
    if (!this.appName) {
      throw new Error('Gupshup: appName é obrigatório')
    }
  }
  
  async sendTextMessage(params: SendTextParams): Promise<SendMessageResult> {
    try {
      // Gupshup usa form-urlencoded
      const formData = new URLSearchParams()
      formData.append('channel', 'whatsapp')
      formData.append('source', this.appName)
      formData.append('destination', params.to)
      formData.append('message', params.text)
      
      const response = await fetch(`${this.apiUrl}/msg`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json() as GupshupSendResponse
      
      return {
        messageId: result.messageId,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[GupshupBroker] Error sending text message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  async sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult> {
    try {
      const formData = new URLSearchParams()
      formData.append('channel', 'whatsapp')
      formData.append('source', this.appName)
      formData.append('destination', params.to)
      formData.append('message.type', params.type)
      formData.append('message.url', params.mediaUrl)
      if (params.caption) {
        formData.append('message.caption', params.caption)
      }
      
      const response = await fetch(`${this.apiUrl}/msg`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json() as GupshupSendResponse
      
      return {
        messageId: result.messageId,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[GupshupBroker] Error sending media message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
    // Normaliza formato Gupshup para formato padrão
    const data = rawData as GupshupWebhookData
    
    const message: NormalizedMessage = {
      messageId: data.messageId,
      externalMessageId: data.messageId,
      brokerId: this.brokerId,
      accountId: this.accountId,
      from: {
        phoneNumber: data.source,
      },
      to: {
        phoneNumber: data.destination,
        accountName: this.config.accountName,
      },
      content: {
        type: (data.payload.type as NormalizedMessage['content']['type']) || 'text',
        text: data.payload.text,
        mediaUrl: data.payload.mediaUrl,
        caption: data.payload.caption,
      },
      timestamp: new Date(data.timestamp),
      status: 'delivered',
      isGroup: false,
    }
    
    return {
      eventType: 'message',
      message,
      timestamp: new Date(),
      rawData: data,
    }
  }
}
