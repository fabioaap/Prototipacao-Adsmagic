/**
 * Broker factory — ported from Deno Edge Function
 */
import type { IWhatsAppBroker, BrokerConfig } from '../types/messaging.js'
import { UazapiBroker } from './uazapi/uazapi-broker.js'
import { OfficialWhatsAppBroker } from './official/official-broker.js'
import { GupshupBroker } from './gupshup/gupshup-broker.js'

export class WhatsAppBrokerFactory {
  private static brokers: Map<string, new (config: BrokerConfig, accountId: string) => IWhatsAppBroker> = new Map()

  static register(brokerType: string, BrokerClass: new (config: BrokerConfig, accountId: string) => IWhatsAppBroker): void {
    this.brokers.set(brokerType, BrokerClass)
  }

  static create(brokerType: string, config: BrokerConfig, accountId: string): IWhatsAppBroker {
    const BrokerClass = this.brokers.get(brokerType)
    if (!BrokerClass) throw new Error(`Broker não suportado: ${brokerType}`)
    return new BrokerClass(config, accountId)
  }

  static listAvailable(): string[] { return Array.from(this.brokers.keys()) }
  static isAvailable(brokerType: string): boolean { return this.brokers.has(brokerType) }
}

WhatsAppBrokerFactory.register('uazapi', UazapiBroker)
WhatsAppBrokerFactory.register('official_whatsapp', OfficialWhatsAppBroker)
WhatsAppBrokerFactory.register('gupshup', GupshupBroker)
