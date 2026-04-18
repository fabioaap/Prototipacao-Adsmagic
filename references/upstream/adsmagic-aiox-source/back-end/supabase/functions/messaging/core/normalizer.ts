/**
 * Camada de Normalização
 * 
 * Responsável por normalizar dados de qualquer broker
 * para o formato padrão do sistema
 */

import type { IWhatsAppBroker, NormalizedWebhookData } from '../types.ts'

export class WhatsAppNormalizer {
  private brokers: Map<string, IWhatsAppBroker>
  
  constructor(brokers: IWhatsAppBroker[]) {
    this.brokers = new Map(
      brokers.map(b => [b.brokerId, b])
    )
  }
  
  /**
   * Normaliza dados de webhook recebidos
   */
  async normalizeWebhook(
    brokerId: string,
    rawData: unknown
  ): Promise<NormalizedWebhookData> {
    const broker = this.brokers.get(brokerId)
    
    if (!broker) {
      throw new Error(`Broker não encontrado: ${brokerId}`)
    }
    
    // Delega para o broker específico normalizar
    const normalized = await broker.normalizeWebhookData(rawData)
    
    // Valida estrutura normalizada
    this.validateNormalized(normalized)
    
    return normalized
  }
  
  /**
   * Valida estrutura normalizada
   */
  private validateNormalized(data: NormalizedWebhookData): void {
    // Validações comuns
    if (!data.eventType) {
      throw new Error('eventType é obrigatório')
    }
    
    if (!data.timestamp) {
      throw new Error('timestamp é obrigatório')
    }
    
    // Validações específicas por tipo de evento
    if (data.eventType === 'message' && !data.message) {
      throw new Error('message é obrigatório para evento de mensagem')
    }
    
    if (data.eventType === 'status' && !data.status) {
      throw new Error('status é obrigatório para evento de status')
    }
  }
}
