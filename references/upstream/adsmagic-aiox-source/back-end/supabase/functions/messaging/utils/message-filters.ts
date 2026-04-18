/**
 * Strategy Pattern para filtros de mensagem
 * 
 * Permite que cada broker tenha suas próprias regras de ignorar mensagens
 * sem modificar código existente
 */

/**
 * Interface para filtros de mensagem
 * Cada broker pode implementar sua própria lógica
 */
export interface MessageFilter {
  /**
   * Verifica se mensagem deve ser ignorada
   */
  shouldIgnore(body: unknown): boolean
  
  /**
   * Retorna razão pela qual mensagem foi ignorada
   */
  getReason(body: unknown): string
}

/**
 * Filtro padrão que não ignora nenhuma mensagem
 * Usado como fallback quando broker não tem filtro específico
 */
export class DefaultMessageFilter implements MessageFilter {
  shouldIgnore(_body: unknown): boolean {
    return false
  }
  
  getReason(_body: unknown): string {
    return 'Unknown'
  }
}

/**
 * Filtro específico para UAZAPI
 * Ignora mensagens de erro e status@broadcast
 */
export class UazapiMessageFilter implements MessageFilter {
  shouldIgnore(body: unknown): boolean {
    if (!body || typeof body !== 'object') {
      return false
    }
    
    const data = body as { message?: { messageType?: string; chatid?: string } }
    
    // Ignorar mensagens de erro
    if (data.message?.messageType === 'error') {
      return true
    }
    
    // Ignorar status@broadcast
    if (data.message?.chatid === 'status@broadcast') {
      return true
    }
    
    return false
  }
  
  getReason(body: unknown): string {
    if (!body || typeof body !== 'object') {
      return 'Unknown'
    }
    
    const data = body as { message?: { messageType?: string; chatid?: string } }
    
    if (data.message?.messageType === 'error') {
      return 'Mensagem de erro'
    }
    
    if (data.message?.chatid === 'status@broadcast') {
      return 'Mensagem de status broadcast'
    }
    
    return 'Unknown'
  }
}

/**
 * Filtro específico para WhatsApp Business API (Oficial)
 * Pode ignorar eventos de verificação, status de leitura, etc.
 */
export class OfficialWhatsAppMessageFilter implements MessageFilter {
  shouldIgnore(body: unknown): boolean {
    if (!body || typeof body !== 'object') {
      return false
    }
    
    const data = body as { 
      entry?: Array<{
        changes?: Array<{
          value?: {
            statuses?: unknown[]
            messages?: unknown[]
          }
        }>
      }>
    }
    
    // Ignorar webhooks de verificação (GET requests)
    // Este filtro é chamado apenas para POST, mas pode ter outras regras
    
    // Ignorar se não há mensagens no payload
    const hasMessages = data.entry?.some(
      entry => entry.changes?.some(
        change => change.value?.messages && change.value.messages.length > 0
      )
    )
    
    return !hasMessages
  }
  
  getReason(body: unknown): string {
    if (!body || typeof body !== 'object') {
      return 'Unknown'
    }
    
    const data = body as { 
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: unknown[]
          }
        }>
      }>
    }
    
    const hasMessages = data.entry?.some(
      entry => entry.changes?.some(
        change => change.value?.messages && change.value.messages.length > 0
      )
    )
    
    if (!hasMessages) {
      return 'Webhook sem mensagens (status update ou verificação)'
    }
    
    return 'Unknown'
  }
}

/**
 * Filtro específico para Gupshup
 * Pode ter regras específicas do broker
 */
export class GupshupMessageFilter implements MessageFilter {
  shouldIgnore(body: unknown): boolean {
    if (!body || typeof body !== 'object') {
      return false
    }
    
    // Adicionar regras específicas do Gupshup aqui
    // Por enquanto, não ignora nada
    return false
  }
  
  getReason(_body: unknown): string {
    return 'Unknown'
  }
}

/**
 * Factory para criar filtros de mensagem baseado no tipo de broker
 */
export class MessageFilterFactory {
  private static filters: Map<string, () => MessageFilter> = new Map([
    ['uazapi', () => new UazapiMessageFilter()],
    ['official_whatsapp', () => new OfficialWhatsAppMessageFilter()],
    ['gupshup', () => new GupshupMessageFilter()],
  ])
  
  /**
   * Cria filtro apropriado para o tipo de broker
   */
  static create(brokerType: string): MessageFilter {
    const filterFactory = this.filters.get(brokerType)
    
    if (filterFactory) {
      return filterFactory()
    }
    
    // Fallback para filtro padrão
    return new DefaultMessageFilter()
  }
  
  /**
   * Registra novo filtro para um tipo de broker
   * Útil para adicionar novos brokers sem modificar código existente
   */
  static register(
    brokerType: string,
    filterFactory: () => MessageFilter
  ): void {
    this.filters.set(brokerType, filterFactory)
  }
  
  /**
   * Lista tipos de brokers com filtros registrados
   */
  static listRegistered(): string[] {
    return Array.from(this.filters.keys())
  }
}
