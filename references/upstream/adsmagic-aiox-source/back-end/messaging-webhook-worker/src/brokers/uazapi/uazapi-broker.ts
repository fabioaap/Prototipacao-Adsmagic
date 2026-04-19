/**
 * UAZAPI broker — ported from Deno Edge Function
 * Only webhook normalization logic is needed for the consumer.
 * Send/connect methods are stubs (not used in webhook processing).
 */

import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.js'
import type { BrokerConfig, SendTextParams, SendMediaParams, SendMessageResult, NormalizedWebhookData, NormalizedMessage } from '../../types/messaging.js'
import type { UazapiWebhookData, UazapiProfileResponse } from './types.js'
import { normalizeWebhookIdentifier, generateCanonicalIdentifier, extractPhoneNumber, type WebhookContactIdentifierData } from '../../utils/identifier-normalizer.js'
import { decodeWhatsAppProtocol } from '../../utils/whatsapp-protocol.js'

const DEFAULT_UAZAPI_URL = 'https://free.uazapi.com'

export class UazapiBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'uazapi'
  readonly brokerName = 'UAZAPI'
  readonly brokerType = 'unofficial' as const

  private readonly apiUrl: string
  private readonly apiKey: string
  private readonly accessToken: string

  constructor(config: BrokerConfig, accountId: string) {
    super(config, accountId)
    this.apiUrl = (config.apiBaseUrl as string) || DEFAULT_UAZAPI_URL
    this.apiKey = (config.apiKey as string) || ''
    this.accessToken = (config.accessToken as string) || ''
  }

  async sendTextMessage(_params: SendTextParams): Promise<SendMessageResult> {
    return { messageId: '', status: 'failed', timestamp: new Date(), error: 'Not implemented in worker' }
  }

  async sendMediaMessage(_params: SendMediaParams): Promise<SendMessageResult> {
    return { messageId: '', status: 'failed', timestamp: new Date(), error: 'Not implemented in worker' }
  }

  async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
    const data = this.validateWebhookData(rawData)
    const message = data.message

    const [contactInfo, protocolInfo, conversionData] = await Promise.all([
      this.extractContactInfo(message, data.token),
      Promise.resolve(this.extractProtocolInfo(message)),
      Promise.resolve(this.extractConversionData(message.content?.contextInfo as {
        conversionSource?: string
        externalAdReply?: {
          title?: string; body?: string; sourceType?: string; sourceID?: string
          sourceURL?: string; sourceApp?: string; ctwaClid?: string; fbclid?: string
          [key: string]: unknown
        }
      })),
    ])

    const normalizedMessage = this.buildNormalizedMessage({ message, contactInfo, protocolInfo, conversionData, data })
    const eventType = this.mapEventType(data.EventType)

    return { eventType, message: normalizedMessage, timestamp: new Date(), rawData: data }
  }

  private validateWebhookData(rawData: unknown): UazapiWebhookData {
    if (!rawData || typeof rawData !== 'object') throw new Error('Invalid webhook data: expected object')
    const data = rawData as UazapiWebhookData
    if (!data.message || !data.message.chatid) throw new Error('Invalid webhook data: missing required fields (message.chatid)')
    return data
  }

  private async extractContactInfo(
    message: UazapiWebhookData['message'], instanceToken?: string
  ): Promise<{ phoneNumber: string; name: string; jid?: string; lid?: string; canonicalIdentifier?: string }> {
    const webhookData: WebhookContactIdentifierData = {
      chatid: message.chatid, sender_lid: message.sender_lid, sender_pn: message.sender_pn,
    }
    const normalized = normalizeWebhookIdentifier(webhookData)
    const canonicalId = generateCanonicalIdentifier(normalized)

    const preferredIdentifier = message.chatid?.includes('@g.us')
      ? (message.sender_pn || message.chatid) : message.chatid

    let phoneNumber = ''
    if (preferredIdentifier) {
      try {
        const parsed = extractPhoneNumber(preferredIdentifier)
        phoneNumber = `${parsed.countryCode}${parsed.phone}`
      } catch { /* fallback */ }
    }
    if (!phoneNumber && normalized.normalizedPhone) {
      phoneNumber = `${normalized.normalizedPhone.countryCode}${normalized.normalizedPhone.phone}`
    }
    if (!phoneNumber) {
      phoneNumber = message.chatid.replace('@s.whatsapp.net', '').replace('@c.us', '')
    }

    let name = message.senderName || ''
    if (message.fromMe && instanceToken) {
      try {
        const apiResponse = await this.fetchProfileName(instanceToken, phoneNumber)
        name = apiResponse?.wa_name || 'Nao consta'
      } catch { name = 'Nao consta' }
    }

    return { phoneNumber, name, jid: normalized.originalJid, lid: normalized.originalLid, canonicalIdentifier: canonicalId }
  }

  private extractProtocolInfo(message: UazapiWebhookData['message']): { protocolNumber: string; isProtocol: boolean } {
    const messageBody = message.text || message.content?.text || ''
    const captionBody = message.content?.caption || ''
    const protocolNumber = decodeWhatsAppProtocol(messageBody) || decodeWhatsAppProtocol(captionBody) || ''
    return { protocolNumber, isProtocol: protocolNumber.length > 0 }
  }

  private extractConversionData(contextInfo?: {
    conversionSource?: string
    externalAdReply?: { title?: string; body?: string; sourceType?: string; sourceID?: string; sourceURL?: string; sourceApp?: string; ctwaClid?: string; fbclid?: string; [key: string]: unknown }
  }): {
    conversionSource: string
    externalAdReply?: { title?: string; body?: string; sourceType?: string; sourceID?: string; sourceURL?: string; sourceApp?: string; ctwaClid?: string; fbclid?: string; [key: string]: unknown }
  } {
    const conversionSource = contextInfo?.conversionSource || ''
    const externalAdReply = contextInfo?.externalAdReply
    return {
      conversionSource,
      externalAdReply: externalAdReply ? {
        title: externalAdReply.title, body: externalAdReply.body,
        sourceType: externalAdReply.sourceType, sourceID: externalAdReply.sourceID,
        sourceURL: externalAdReply.sourceURL, sourceApp: externalAdReply.sourceApp,
        ctwaClid: externalAdReply.ctwaClid, fbclid: externalAdReply.fbclid,
        ...(Object.keys(externalAdReply).reduce((acc, key) => {
          if (!['title','body','sourceType','sourceID','sourceURL','sourceApp','ctwaClid','fbclid'].includes(key)) acc[key] = externalAdReply[key]
          return acc
        }, {} as Record<string, unknown>)),
      } : undefined,
    }
  }

  private buildNormalizedMessage(params: {
    message: UazapiWebhookData['message']
    contactInfo: { phoneNumber: string; name: string; jid?: string; lid?: string; canonicalIdentifier?: string }
    protocolInfo: { protocolNumber: string; isProtocol: boolean }
    conversionData: { conversionSource: string; externalAdReply?: Record<string, unknown> }
    data: UazapiWebhookData
  }): NormalizedMessage {
    const { message, contactInfo, protocolInfo, conversionData, data } = params
    const messageBody = message.text || message.content?.text || ''
    const messageType = this.mapMessageType(message.messageType || message.type || 'text')

    return {
      messageId: message.id || message.messageid || '',
      externalMessageId: message.id || message.messageid || '',
      brokerId: this.brokerId,
      accountId: this.accountId,
      from: {
        phoneNumber: contactInfo.phoneNumber, name: contactInfo.name,
        jid: contactInfo.jid, lid: contactInfo.lid, canonicalIdentifier: contactInfo.canonicalIdentifier,
      },
      to: { phoneNumber: data.owner || '', accountName: this.config.accountName },
      content: { type: messageType, text: messageBody, mediaUrl: message.content?.mediaUrl, caption: message.content?.caption },
      timestamp: new Date(message.messageTimestamp || Date.now()),
      status: 'delivered',
      isGroup: message.isGroup === true,
      groupId: message.isGroup ? message.chatid : undefined,
      groupName: message.groupName,
      context: {
        metadata: {
          conversionSource: conversionData.conversionSource,
          isProtocol: protocolInfo.isProtocol,
          protocolNumber: protocolInfo.protocolNumber,
          messageDevice: message.source, owner: data.owner, instanceToken: data.token,
          externalAdReply: conversionData.externalAdReply,
          ctwaClid: conversionData.externalAdReply?.ctwaClid,
          fbclid: conversionData.externalAdReply?.fbclid,
          sourceType: conversionData.externalAdReply?.sourceType,
          sourceID: conversionData.externalAdReply?.sourceID,
          sourceApp: conversionData.externalAdReply?.sourceApp,
          sourceURL: conversionData.externalAdReply?.sourceURL,
          utm_source: conversionData.externalAdReply?.sourceApp || (conversionData.externalAdReply ? 'facebook' : undefined),
          utm_medium: conversionData.externalAdReply?.sourceType === 'ad' ? 'paid_social' : undefined,
          utm_campaign: conversionData.externalAdReply?.sourceID,
        },
      },
    }
  }

  private mapEventType(eventType: string): 'message' | 'status' | 'delivery' | 'read' | 'connection' {
    switch (eventType) {
      case 'messages': return 'message'
      case 'status': return 'status'
      case 'connection': return 'connection'
      default: return 'message'
    }
  }

  private async fetchProfileName(instanceToken: string, contactPhone: string): Promise<UazapiProfileResponse | null> {
    try {
      return await this.makeRequest(`${this.apiUrl}/chat/GetNameAndImageURL`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'token': instanceToken },
        body: { number: contactPhone, preview: true },
      }) as UazapiProfileResponse
    } catch { return null }
  }

  private mapMessageType(uazapiType: string): NormalizedMessage['content']['type'] {
    const mapping: Record<string, NormalizedMessage['content']['type']> = {
      'ExtendedTextMessage': 'text', 'ImageMessage': 'image', 'VideoMessage': 'video',
      'AudioMessage': 'audio', 'DocumentMessage': 'document', 'LocationMessage': 'location',
      'ContactMessage': 'contact', 'text': 'text', 'image': 'image', 'video': 'video',
      'audio': 'audio', 'document': 'document', 'location': 'location', 'contact': 'contact',
    }
    return mapping[uazapiType] || 'text'
  }
}
