/**
 * Message filters — ported from Deno Edge Function (pure logic)
 */

export interface MessageFilter {
  shouldIgnore(body: unknown): boolean
  getReason(body: unknown): string
}

export class DefaultMessageFilter implements MessageFilter {
  shouldIgnore(_body: unknown): boolean { return false }
  getReason(_body: unknown): string { return 'Unknown' }
}

export class UazapiMessageFilter implements MessageFilter {
  shouldIgnore(body: unknown): boolean {
    if (!body || typeof body !== 'object') return false
    const data = body as { message?: { messageType?: string; chatid?: string } }
    if (data.message?.messageType === 'error') return true
    if (data.message?.chatid === 'status@broadcast') return true
    return false
  }
  getReason(body: unknown): string {
    if (!body || typeof body !== 'object') return 'Unknown'
    const data = body as { message?: { messageType?: string; chatid?: string } }
    if (data.message?.messageType === 'error') return 'Mensagem de erro'
    if (data.message?.chatid === 'status@broadcast') return 'Mensagem de status broadcast'
    return 'Unknown'
  }
}

export class OfficialWhatsAppMessageFilter implements MessageFilter {
  shouldIgnore(body: unknown): boolean {
    if (!body || typeof body !== 'object') return false
    const data = body as { entry?: Array<{ changes?: Array<{ value?: { messages?: unknown[] } }> }> }
    const hasMessages = data.entry?.some(entry => entry.changes?.some(change => change.value?.messages && change.value.messages.length > 0))
    return !hasMessages
  }
  getReason(body: unknown): string {
    if (!body || typeof body !== 'object') return 'Unknown'
    const data = body as { entry?: Array<{ changes?: Array<{ value?: { messages?: unknown[] } }> }> }
    const hasMessages = data.entry?.some(entry => entry.changes?.some(change => change.value?.messages && change.value.messages.length > 0))
    if (!hasMessages) return 'Webhook sem mensagens (status update ou verificação)'
    return 'Unknown'
  }
}

export class GupshupMessageFilter implements MessageFilter {
  shouldIgnore(_body: unknown): boolean { return false }
  getReason(_body: unknown): string { return 'Unknown' }
}

export class MessageFilterFactory {
  private static filters: Map<string, () => MessageFilter> = new Map([
    ['uazapi', () => new UazapiMessageFilter()],
    ['official_whatsapp', () => new OfficialWhatsAppMessageFilter()],
    ['gupshup', () => new GupshupMessageFilter()],
  ])

  static create(brokerType: string): MessageFilter {
    const filterFactory = this.filters.get(brokerType)
    return filterFactory ? filterFactory() : new DefaultMessageFilter()
  }

  static register(brokerType: string, filterFactory: () => MessageFilter): void {
    this.filters.set(brokerType, filterFactory)
  }

  static listRegistered(): string[] {
    return Array.from(this.filters.keys())
  }
}
