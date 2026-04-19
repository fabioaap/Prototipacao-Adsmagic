/**
 * WhatsApp normalizer — ported from Deno Edge Function
 */
import type { IWhatsAppBroker, NormalizedWebhookData } from '../types/messaging.js'

export class WhatsAppNormalizer {
  private brokers: Map<string, IWhatsAppBroker>

  constructor(brokers: IWhatsAppBroker[]) {
    this.brokers = new Map(brokers.map(b => [b.brokerId, b]))
  }

  async normalizeWebhook(brokerId: string, rawData: unknown): Promise<NormalizedWebhookData> {
    const broker = this.brokers.get(brokerId)
    if (!broker) throw new Error(`Broker não encontrado: ${brokerId}`)
    const normalized = await broker.normalizeWebhookData(rawData)
    this.validateNormalized(normalized)
    return normalized
  }

  private validateNormalized(data: NormalizedWebhookData): void {
    if (!data.eventType) throw new Error('eventType é obrigatório')
    if (!data.timestamp) throw new Error('timestamp é obrigatório')
    if (data.eventType === 'message' && !data.message) throw new Error('message é obrigatório para evento de mensagem')
    if (data.eventType === 'status' && !data.status) throw new Error('status é obrigatório para evento de status')
  }
}
