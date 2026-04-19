/**
 * Official WhatsApp Business API broker — ported from Deno Edge Function
 */
import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.js'
import type { BrokerConfig, SendTextParams, SendMediaParams, SendMessageResult, NormalizedWebhookData, NormalizedMessage } from '../../types/messaging.js'

interface OfficialWebhookData {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        contacts?: Array<{ profile: { name: string }; wa_id: string }>
        messages?: Array<{
          from: string; id: string; timestamp: string; type: string
          text?: { body: string }
          image?: { id: string; caption?: string }
          video?: { id: string; caption?: string }
          document?: { id: string; caption?: string; filename?: string }
          context?: { from: string; id: string }
        }>
        statuses?: Array<{ id: string; status: 'sent' | 'delivered' | 'read' | 'failed'; timestamp: string; recipient_id: string }>
      }
      field: string
    }>
  }>
}

export class OfficialWhatsAppBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'official_whatsapp'
  readonly brokerName = 'WhatsApp Business API'
  readonly brokerType = 'official' as const

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
    const data = rawData as OfficialWebhookData
    if (!data.entry || data.entry.length === 0) {
      return { eventType: 'connection', timestamp: new Date(), rawData: data }
    }

    const entry = data.entry[0]
    const change = entry.changes[0]
    const value = change.value

    if (value.messages && value.messages.length > 0) {
      const msg = value.messages[0]
      const contact = value.contacts?.[0]
      const normalizedMessage: NormalizedMessage = {
        messageId: msg.id, externalMessageId: msg.id,
        brokerId: this.brokerId, accountId: this.accountId,
        from: { phoneNumber: msg.from, name: contact?.profile?.name },
        to: { phoneNumber: value.metadata.display_phone_number, accountName: this.config.accountName },
        content: {
          type: msg.type as NormalizedMessage['content']['type'],
          text: msg.text?.body,
          caption: msg.image?.caption || msg.video?.caption || msg.document?.caption,
        },
        timestamp: new Date(parseInt(msg.timestamp) * 1000),
        status: 'delivered', isGroup: false,
        context: msg.context ? { quotedMessageId: msg.context.id } : undefined,
      }
      return { eventType: 'message', message: normalizedMessage, timestamp: new Date(), rawData: data }
    }

    if (value.statuses && value.statuses.length > 0) {
      const status = value.statuses[0]
      return {
        eventType: 'status',
        status: { messageId: status.id, status: status.status, timestamp: new Date(parseInt(status.timestamp) * 1000) },
        timestamp: new Date(), rawData: data,
      }
    }

    return { eventType: 'connection', timestamp: new Date(), rawData: data }
  }
}
