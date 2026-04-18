/**
 * Tracking Service
 *
 * Gerencia a integração com a tag AdsMagic e captura de eventos.
 * Fornece SDK para rastreamento de conversões e leads.
 *
 * @module services/tracking
 */

import {
  buildDefaultTagScriptUrl,
  buildTagSnippet,
} from '@/services/tagSnippet'

/**
 * Configuração do runtime da tag de rastreamento.
 */
export interface TagRuntimeConfig {
  projectId: string
  /** @deprecated The tag now auto-resolves the endpoint from its script src. */
  apiEndpoint?: string
  debug?: boolean
  autoInit?: boolean
  batchSize?: number
  flushIntervalMs?: number
  maxQueueSize?: number
  maxRetries?: number
  eventTtlMs?: number
}

// Mantido por compatibilidade com imports existentes.
export type TagConfig = TagRuntimeConfig

/**
 * Dados de evento de rastreamento
 */
export interface TrackingEvent {
  type: string
  name: string
  properties: Record<string, unknown>
  timestamp?: string
  sessionId?: string
  userId?: string
  projectId?: string
}

/**
 * Dados de conversão
 */
export interface ConversionData {
  conversionType: string
  value: number
  currency?: string
  orderId?: string
  items?: Array<{
    id: string
    name: string
    category: string
    quantity: number
    price: number
  }>
}

/**
 * Dados de lead
 */
export interface LeadData {
  email?: string
  phone?: string
  name?: string
  company?: string
  source?: string
  medium?: string
  campaign?: string
  customFields?: Record<string, unknown>
}

/**
 * Dados de compra
 */
export interface PurchaseData {
  orderId: string
  value: number
  currency?: string
  items: Array<{
    id: string
    name: string
    category: string
    quantity: number
    price: number
  }>
  customer?: {
    id: string
    email: string
    name?: string
  }
}

/**
 * Status da tag
 */
export interface TagStatus {
  isInstalled: boolean
  isActive: boolean
  version?: string
  lastChecked: string
  events: {
    pageView: boolean
    click: boolean
    purchase: boolean
    lead: boolean
  }
}

interface TagSessionInfo {
  sessionId?: string
  userId?: string
  projectId?: string
  isInitialized?: boolean
}

interface AdsmagicTagRuntime {
  track: (eventName: string, properties?: Record<string, unknown>) => void
  trackEvent?: (eventName: string, properties?: Record<string, unknown>) => void
  trackConversion: (conversionType: string, value: number, currency?: string) => void
  trackLead: (leadData: LeadData) => void
  trackPurchase: (purchaseData: PurchaseData) => void
  setUser: (userData: { id: string; email?: string; name?: string }) => void
  setProject: (projectData: { id: string; name?: string }) => void
  flush: () => void | Promise<boolean>
  getSession: () => TagSessionInfo
  destroy: () => void
}

type TrackingWindow = Window & {
  adsmagicConfig?: TagRuntimeConfig
  AdsmagicTag?: AdsmagicTagRuntime
}

class TrackingService {
  private isInitialized = false

  private getTrackingWindow(): TrackingWindow | null {
    if (typeof window === 'undefined') {
      return null
    }

    return window as TrackingWindow
  }

  private getRuntimeTag(): AdsmagicTagRuntime | null {
    const trackingWindow = this.getTrackingWindow()
    if (!trackingWindow?.AdsmagicTag) {
      return null
    }

    return trackingWindow.AdsmagicTag
  }

  private validateConfig(config: TagRuntimeConfig): void {
    if (!config.projectId?.trim()) {
      throw new Error('Tracking config inválida: projectId é obrigatório')
    }
  }

  /**
   * Inicializar o serviço de tracking
   */
  async init(config: TagRuntimeConfig): Promise<void> {
    this.validateConfig(config)

    const trackingWindow = this.getTrackingWindow()
    if (!trackingWindow) {
      return
    }

    trackingWindow.adsmagicConfig = {
      projectId: config.projectId,
      ...(config.apiEndpoint ? { apiEndpoint: config.apiEndpoint } : {}),
      debug: config.debug ?? false,
      autoInit: config.autoInit ?? true,
      batchSize: config.batchSize ?? 10,
      flushIntervalMs: config.flushIntervalMs ?? 5000,
      maxQueueSize: config.maxQueueSize ?? 200,
      maxRetries: config.maxRetries ?? 3,
      eventTtlMs: config.eventTtlMs ?? 24 * 60 * 60 * 1000,
    }

    this.isInitialized = true
  }

  /**
   * Verificar se a tag está instalada
   */
  async checkTagInstallation(): Promise<TagStatus> {
    const lastChecked = new Date().toISOString()
    const runtimeTag = this.getRuntimeTag()

    if (!runtimeTag) {
      return {
        isInstalled: false,
        isActive: false,
        lastChecked,
        events: {
          pageView: false,
          click: false,
          purchase: false,
          lead: false,
        },
      }
    }

    let session: TagSessionInfo = {}
    try {
      session = runtimeTag.getSession() || {}
    } catch (error) {
      console.warn('[Tracking] Falha ao obter sessão da tag:', error)
    }

    const isActive = !!session.isInitialized

    return {
      isInstalled: true,
      isActive,
      version: '1.1.0',
      lastChecked,
      events: {
        pageView: isActive,
        click: isActive,
        purchase: isActive,
        lead: isActive,
      },
    }
  }

  /**
   * Rastrear evento customizado
   */
  trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.track(eventName, properties)
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Rastrear conversão
   */
  trackConversion(data: ConversionData): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.trackConversion(data.conversionType, data.value, data.currency)
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Rastrear lead
   */
  trackLead(data: LeadData): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.trackLead(data)
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Rastrear compra
   */
  trackPurchase(data: PurchaseData): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.trackPurchase(data)
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Definir usuário
   */
  setUser(userData: { id: string; email?: string; name?: string }): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.setUser(userData)
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Definir projeto
   */
  setProject(projectData: { id: string; name?: string }): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.setProject(projectData)
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Forçar envio de eventos
   */
  flush(): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      console.warn('[Tracking] Service not initialized')
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.flush()
    } else {
      console.warn('[Tracking] AdsmagicTag not available')
    }
  }

  /**
   * Obter informações da sessão
   */
  getSession(): TagSessionInfo {
    if (typeof window === 'undefined' || !this.isInitialized) {
      return {}
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      return tag.getSession()
    }

    return {}
  }

  /**
   * Destruir o serviço
   */
  destroy(): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      return
    }

    const tag = this.getRuntimeTag()
    if (tag) {
      tag.destroy()
    }

    this.isInitialized = false
  }

  /**
   * Gerar código de instalação da tag
   */
  generateInstallationCode(projectId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

    return buildTagSnippet({
      projectId,
      scriptUrl: buildDefaultTagScriptUrl(origin),
      debug: false,
      autoInit: true,
    })
  }

  /**
   * Verificar se a tag está funcionando
   */
  async testTag(): Promise<{ success: boolean; message: string }> {
    try {
      const status = await this.checkTagInstallation()

      if (!status.isInstalled) {
        return {
          success: false,
          message: 'Tag não encontrada no site. Verifique se o script foi instalado corretamente.',
        }
      }

      if (!status.isActive) {
        return {
          success: false,
          message: 'Tag encontrada mas não está ativa. Verifique a configuração.',
        }
      }

      // Testar envio de evento
      this.trackEvent('test_event', { test: true })

      return {
        success: true,
        message: 'Tag funcionando corretamente!',
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro ao testar tag: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }
}

// Instância singleton
export const trackingService = new TrackingService()

// Tipos já exportados como interfaces acima
