/**
 * Classe base abstrata para extração de dados de origem
 * 
 * Todos os brokers devem estender esta classe para extrair dados de origem
 * de forma padronizada e reutilizável.
 * 
 * Template Method Pattern: Define o esqueleto do algoritmo de extração,
 * delegando passos específicos para subclasses.
 */

import type {
  StandardizedSourceData,
  ClickIds,
  UtmParams,
  CampaignIds,
  OriginMetadata,
} from '../../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../../types.ts'

/**
 * Interface para extração de dados de origem
 * Cada broker implementa métodos específicos
 */
export interface ISourceDataExtractor {
  /**
   * Extrai dados de origem padronizados da mensagem normalizada
   */
  extract(message: NormalizedMessage): StandardizedSourceData | null
}

/**
 * Classe base abstrata com lógica comum reutilizável
 */
export abstract class BaseSourceDataExtractor implements ISourceDataExtractor {
  /**
   * Template Method: Define o fluxo de extração
   */
  extract(message: NormalizedMessage): StandardizedSourceData | null {
    // 1. Extrair click IDs (comum a todos)
    const clickIds = this.extractClickIds(message)
    
    // 2. Extrair parâmetros UTM (comum a todos)
    const utm = this.extractUtmParams(message)
    
    // 3. Extrair IDs de campanha (específico por broker)
    const campaign = this.extractCampaignIds(message)
    
    // 4. Extrair metadados (específico por broker)
    const metadata = this.extractMetadata(message)
    
    // 5. Validar se há dados válidos
    if (!this.hasValidData({ clickIds, utm, campaign, metadata })) {
      return null
    }
    
    return {
      clickIds: clickIds && Object.keys(clickIds).length > 0 ? clickIds : undefined,
      utm: utm && Object.keys(utm).length > 0 ? utm : undefined,
      campaign: campaign && Object.keys(campaign).length > 0 ? campaign : undefined,
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    }
  }
  
  /**
   * Extrai click IDs da mensagem (método comum)
   * Pode ser sobrescrito por brokers específicos para lógica customizada
   */
  protected extractClickIds(message: NormalizedMessage): ClickIds | null {
    const metadata = message.context?.metadata || {}
    const clickIds: ClickIds = {}
    
    // Extrair click IDs do metadata (comum a todos)
    if (metadata.gclid) clickIds.gclid = String(metadata.gclid)
    if (metadata.wbraid) clickIds.wbraid = String(metadata.wbraid)
    if (metadata.gbraid) clickIds.gbraid = String(metadata.gbraid)
    if (metadata.fbclid) clickIds.fbclid = String(metadata.fbclid)
    if (metadata.ctwaClid) clickIds.ctwaClid = String(metadata.ctwaClid)
    if (metadata.ttclid) clickIds.ttclid = String(metadata.ttclid)
    
    // Permitir que subclasses adicionem mais click IDs
    const additionalClickIds = this.extractAdditionalClickIds(message)
    if (additionalClickIds) {
      Object.assign(clickIds, additionalClickIds)
    }
    
    return Object.keys(clickIds).length > 0 ? clickIds : null
  }
  
  /**
   * Extrai parâmetros UTM da mensagem (método comum)
   * UTMs podem vir de qualquer fonte (URL, metadata, etc.)
   */
  protected extractUtmParams(message: NormalizedMessage): UtmParams | null {
    const metadata = message.context?.metadata || {}
    const utm: UtmParams = {}
    
    // Extrair UTMs do metadata (comum a todos)
    if (metadata.utm_source) utm.utm_source = String(metadata.utm_source)
    if (metadata.utm_medium) utm.utm_medium = String(metadata.utm_medium)
    if (metadata.utm_campaign) utm.utm_campaign = String(metadata.utm_campaign)
    if (metadata.utm_content) utm.utm_content = String(metadata.utm_content)
    if (metadata.utm_term) utm.utm_term = String(metadata.utm_term)
    
    // Permitir que subclasses extraiam UTMs de outras fontes (URL, headers, etc.)
    const additionalUtm = this.extractAdditionalUtmParams(message)
    if (additionalUtm) {
      Object.assign(utm, additionalUtm)
    }
    
    return Object.keys(utm).length > 0 ? utm : null
  }
  
  /**
   * Extrai IDs de campanha da mensagem (abstrato - deve ser implementado)
   */
  protected abstract extractCampaignIds(message: NormalizedMessage): CampaignIds | null
  
  /**
   * Extrai metadados da mensagem (abstrato - deve ser implementado)
   */
  protected abstract extractMetadata(message: NormalizedMessage): OriginMetadata | null
  
  /**
   * Hook para brokers específicos extraírem click IDs adicionais
   * Retorna null por padrão (pode ser sobrescrito)
   */
  protected extractAdditionalClickIds(message: NormalizedMessage): ClickIds | null {
    return null
  }
  
  /**
   * Hook para brokers específicos extraírem UTMs adicionais
   * Retorna null por padrão (pode ser sobrescrito)
   */
  protected extractAdditionalUtmParams(message: NormalizedMessage): UtmParams | null {
    return null
  }
  
  /**
   * Valida se há dados válidos para criar source_data
   */
  protected hasValidData(data: {
    clickIds: ClickIds | null
    utm: UtmParams | null
    campaign: CampaignIds | null
    metadata: OriginMetadata | null
  }): boolean {
    return !!(
      data.clickIds ||
      data.utm ||
      data.campaign ||
      data.metadata
    )
  }
  
  /**
   * Utilitário: Detecta source_app baseado em utm_source
   * Reutilizável por todos os brokers
   */
  protected detectSourceAppFromUtmSource(
    utmSource?: string
  ): OriginMetadata['source_app'] {
    if (!utmSource) return undefined
    
    const lower = utmSource.toLowerCase()
    
    if (lower.includes('google')) return 'google'
    if (lower.includes('facebook') || lower.includes('fb')) return 'facebook'
    if (lower.includes('instagram') || lower.includes('ig')) return 'instagram'
    if (lower.includes('tiktok')) return 'tiktok'
    
    return 'other'
  }
  
  /**
   * Utilitário: Detecta source_type baseado em utm_medium
   * Reutilizável por todos os brokers
   */
  protected detectSourceTypeFromUtmMedium(
    utmMedium?: string
  ): OriginMetadata['source_type'] {
    if (!utmMedium) return undefined
    
    const lower = utmMedium.toLowerCase()
    
    if (lower === 'cpc' || lower === 'paid_social' || lower.includes('paid')) {
      return 'ad'
    }
    if (lower === 'organic' || lower === 'search') {
      return 'organic'
    }
    if (lower === 'referral') {
      return 'referral'
    }
    
    return 'other'
  }
}