/**
 * Factory para criar instâncias de brokers
 * Centraliza a lógica de criação e configuração
 */

import type { IWhatsAppBroker, BrokerConfig } from '../types.ts'
import type { BaseWhatsAppBroker } from './base/WhatsAppBroker.ts'

// Importações dos brokers
import { UazapiBroker } from './uazapi/UazapiBroker.ts'
import { OfficialWhatsAppBroker } from './official/OfficialWhatsAppBroker.ts'
import { GupshupBroker } from './gupshup/GupshupBroker.ts'

/**
 * Factory para criar instâncias de brokers
 */
export class WhatsAppBrokerFactory {
  private static brokers: Map<string, new (config: BrokerConfig, accountId: string) => IWhatsAppBroker> = new Map()
  
  /**
   * Registra um broker no factory
   */
  static register(
    brokerType: string,
    BrokerClass: new (config: BrokerConfig, accountId: string) => IWhatsAppBroker
  ): void {
    this.brokers.set(brokerType, BrokerClass)
  }
  
  /**
   * Cria instância de broker baseado no tipo
   */
  static create(
    brokerType: string,
    config: BrokerConfig,
    accountId: string
  ): IWhatsAppBroker {
    const BrokerClass = this.brokers.get(brokerType)
    
    if (!BrokerClass) {
      throw new Error(`Broker não suportado: ${brokerType}`)
    }
    
    return new BrokerClass(config, accountId)
  }
  
  /**
   * Lista brokers disponíveis
   */
  static listAvailable(): string[] {
    return Array.from(this.brokers.keys())
  }
  
  /**
   * Verifica se um broker está disponível
   */
  static isAvailable(brokerType: string): boolean {
    return this.brokers.has(brokerType)
  }
}

// Registrar brokers
WhatsAppBrokerFactory.register('uazapi', UazapiBroker)
WhatsAppBrokerFactory.register('official_whatsapp', OfficialWhatsAppBroker)
WhatsAppBrokerFactory.register('gupshup', GupshupBroker)
