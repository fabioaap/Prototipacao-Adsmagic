/**
 * Gupshup broker — ported from Deno Edge Function
 */
import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.js'
import type { BrokerConfig, SendTextParams, SendMediaParams, SendMessageResult, NormalizedWebhookData, NormalizedMessage } from '../../types/messaging.js'

interface GupshupWebhookData {
  messageId: string; source: string; destination: string; timestamp: string
  payload: { text?: string; type?: string; mediaUrl?: string; caption?: string }
}

export class GupshupBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'gupshup'
  readonly brokerName = 'Gupshup'
  readonly brokerType = 'intermediary' as const

  constructor(config: BrokerConfig, accountId: string) {
    super(config, accountId)
  }

  async sendTextMessage(_params: SendTextParams): Promise<SendMessageResult> {
    return { messageId: '', status: 'failed', timestamp: new Date(), error: 'Not implemented in worker' }
  }

  async sendMediaMessage(_params: SendMediaParams): Promise<SendMessageResult> {
    return { messageId: '', status: 'failed', timestamp: new Date(), error: 'Not implemented in worker' }
  }

  async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
    const data = rawData as GupshupWebhookData
    const message: NormalizedMessage = {
      messageId: data.messageId, externalMessageId: data.messageId,
      brokerId: this.brokerId, accountId: this.accountId,
      from: { phoneNumber: data.source },
      to: { phoneNumber: data.destination, accountName: this.config.accountName },
      content: {
        type: (data.payload.type as NormalizedMessage['content']['type']) || 'text',
        text: data.payload.text, mediaUrl: data.payload.mediaUrl, caption: data.payload.caption,
      },
      timestamp: new Date(data.timestamp), status: 'delivered', isGroup: false,
    }
    return { eventType: 'message', message, timestamp: new Date(), rawData: data }
  }
}
