/**
 * Broker oficial: WhatsApp Business API
 * https://developers.facebook.com/docs/whatsapp
 */

import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.ts'
import type {
  BrokerConfig,
  SendTextParams,
  SendMediaParams,
  SendTemplateParams,
  SendMessageResult,
  NormalizedWebhookData,
  NormalizedMessage,
} from '../../types.ts'
import type { OfficialWebhookData, OfficialSendResponse } from './types.ts'

export class OfficialWhatsAppBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'official_whatsapp'
  readonly brokerName = 'WhatsApp Business API'
  readonly brokerType = 'official' as const
  
  private readonly apiUrl = 'https://graph.facebook.com/v18.0'
  private readonly accessToken: string
  private readonly phoneNumberId: string
  
  constructor(config: BrokerConfig, accountId: string) {
    super(config, accountId)
    this.accessToken = (config.accessToken as string) || ''
    this.phoneNumberId = (config.phoneNumberId as string) || ''
    // Validação lazy: accessToken e phoneNumberId só são obrigatórios para envio,
    // não para recepção de webhooks. Ver ensureSendCredentials().
  }

  /**
   * Valida credenciais necessárias para envio de mensagens.
   * Chamado apenas nos métodos de envio (send*), não na recepção de webhooks.
   */
  private ensureSendCredentials(): void {
    if (!this.accessToken) {
      throw new Error('WhatsApp Business API: accessToken é obrigatório para envio')
    }
    if (!this.phoneNumberId) {
      throw new Error('WhatsApp Business API: phoneNumberId é obrigatório para envio')
    }
  }
  
  async sendTextMessage(params: SendTextParams): Promise<SendMessageResult> {
    this.ensureSendCredentials()
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            messaging_product: 'whatsapp',
            to: params.to,
            type: 'text',
            text: {
              body: params.text,
            },
          },
        }
      ) as OfficialSendResponse
      
      return {
        messageId: response.messages[0].id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[OfficialWhatsAppBroker] Error sending text message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  async sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult> {
    this.ensureSendCredentials()
    try {
      // Primeiro fazer upload da mídia (simplificado - na prática precisa de upload separado)
      const response = await this.makeRequest(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            messaging_product: 'whatsapp',
            to: params.to,
            type: params.type,
            [params.type]: {
              link: params.mediaUrl,
              caption: params.caption,
              filename: params.fileName,
            },
          },
        }
      ) as OfficialSendResponse
      
      return {
        messageId: response.messages[0].id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[OfficialWhatsAppBroker] Error sending media message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  override async sendTemplateMessage(params: SendTemplateParams): Promise<SendMessageResult> {
    this.ensureSendCredentials()
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: {
            messaging_product: 'whatsapp',
            to: params.to,
            type: 'template',
            template: {
              name: params.templateName,
              language: {
                code: params.languageCode,
              },
              components: params.parameters ? [{
                type: 'body',
                parameters: params.parameters.map(p => ({ type: 'text', text: p })),
              }] : undefined,
            },
          },
        }
      ) as OfficialSendResponse
      
      return {
        messageId: response.messages[0].id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[OfficialWhatsAppBroker] Error sending template message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
    // Normaliza formato oficial para formato padrão
    const data = rawData as OfficialWebhookData
    
    if (!data.entry || data.entry.length === 0) {
      return {
        eventType: 'connection',
        timestamp: new Date(),
        rawData: data,
      }
    }
    
    const entry = data.entry[0]
    const change = entry.changes[0]
    const value = change.value
    
    // Processar mensagens
    if (value.messages && value.messages.length > 0) {
      const message = value.messages[0]
      const contact = value.contacts?.[0]
      
      const normalizedMessage: NormalizedMessage = {
        messageId: message.id,
        externalMessageId: message.id,
        brokerId: this.brokerId,
        accountId: this.accountId,
        from: {
          phoneNumber: message.from,
          name: contact?.profile?.name,
        },
        to: {
          phoneNumber: value.metadata.display_phone_number,
          accountName: this.config.accountName,
        },
        content: {
          type: message.type as NormalizedMessage['content']['type'],
          text: message.text?.body,
          caption: message.image?.caption || message.video?.caption || message.document?.caption,
        },
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        status: 'delivered',
        isGroup: false,
        context: message.context ? {
          quotedMessageId: message.context.id,
        } : undefined,
      }
      
      return {
        eventType: 'message',
        message: normalizedMessage,
        timestamp: new Date(),
        rawData: data,
      }
    }
    
    // Processar status updates
    if (value.statuses && value.statuses.length > 0) {
      const status = value.statuses[0]
      return {
        eventType: 'status',
        status: {
          messageId: status.id,
          status: status.status,
          timestamp: new Date(parseInt(status.timestamp) * 1000),
        },
        timestamp: new Date(),
        rawData: data,
      }
    }
    
    // Evento desconhecido
    return {
      eventType: 'connection',
      timestamp: new Date(),
      rawData: data,
    }
  }
}
