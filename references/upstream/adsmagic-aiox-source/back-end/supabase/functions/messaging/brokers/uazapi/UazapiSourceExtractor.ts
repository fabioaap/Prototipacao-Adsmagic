/**
 * Extrator de dados de origem específico para UAZAPI
 * 
 * Implementa lógica específica para extrair dados de Meta Ads CTWA
 * do formato UAZAPI.
 */

import { BaseSourceDataExtractor } from '../base/SourceDataExtractor.ts'
import type {
  CampaignIds,
  OriginMetadata,
  ClickIds,
  UtmParams,
} from '../../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../../types.ts'

export class UazapiSourceExtractor extends BaseSourceDataExtractor {
  /**
   * Extrai click IDs específicos do UAZAPI (Meta Ads CTWA)
   * O ctwaClid vem em externalAdReply no metadata
   */
  protected override extractAdditionalClickIds(message: NormalizedMessage): ClickIds | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    
    if (!externalAdReply) {
      return null
    }
    
    const clickIds: ClickIds = {}
    
    // UAZAPI específico: ctwaClid vem em externalAdReply
    if (externalAdReply.ctwaClid) {
      clickIds.ctwaClid = String(externalAdReply.ctwaClid)
    }
    
    // fbclid também pode vir em externalAdReply (se disponível)
    if (externalAdReply.fbclid) {
      clickIds.fbclid = String(externalAdReply.fbclid)
    }
    
    return Object.keys(clickIds).length > 0 ? clickIds : null
  }
  
  /**
   * Extrai UTMs do externalAdReply (UAZAPI específico)
   * UAZAPI fornece sourceApp e sourceID que podem ser mapeados para UTMs
   */
  protected override extractAdditionalUtmParams(message: NormalizedMessage): UtmParams | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    
    if (!externalAdReply) {
      return null
    }
    
    const utm: UtmParams = {}
    
    // UAZAPI fornece sourceApp e sourceID que podem ser mapeados para UTMs
    if (externalAdReply.sourceApp) {
      utm.utm_source = String(externalAdReply.sourceApp)
    }
    if (externalAdReply.sourceType === 'ad') {
      utm.utm_medium = 'paid_social'
    }
    if (externalAdReply.sourceID) {
      utm.utm_campaign = String(externalAdReply.sourceID)
      utm.utm_content = String(externalAdReply.sourceID) // Fallback
    }
    
    return Object.keys(utm).length > 0 ? utm : null
  }
  
  /**
   * Extrai IDs de campanha do externalAdReply (UAZAPI)
   */
  protected extractCampaignIds(message: NormalizedMessage): CampaignIds | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    
    if (!externalAdReply) {
      return null
    }
    
    const campaign: CampaignIds = {}
    
    // UAZAPI fornece sourceID que pode ser usado como campaign_id
    if (externalAdReply.sourceID) {
      campaign.campaign_id = String(externalAdReply.sourceID)
      // UAZAPI não diferencia entre campanha e anúncio, então usamos o mesmo ID
      campaign.ad_id = String(externalAdReply.sourceID)
    }
    
    // Se houver título do anúncio, pode ser usado como campaign_name
    if (externalAdReply.title) {
      campaign.campaign_name = String(externalAdReply.title)
    }
    
    return Object.keys(campaign).length > 0 ? campaign : null
  }
  
  /**
   * Extrai metadados do externalAdReply (UAZAPI)
   */
  protected extractMetadata(message: NormalizedMessage): OriginMetadata | null {
    const metadata = message.context?.metadata || {}
    const externalAdReply = metadata.externalAdReply as Record<string, unknown> | undefined
    
    if (!externalAdReply) {
      return null
    }
    
    // Detectar source_app baseado em utm_source ou sourceApp
    let sourceApp: OriginMetadata['source_app'] = 'other'
    if (metadata.utm_source) {
      const detectedApp = this.detectSourceAppFromUtmSource(String(metadata.utm_source))
      if (detectedApp) {
        sourceApp = detectedApp
      }
    } else if (externalAdReply.sourceApp) {
      const detectedApp = this.detectSourceAppFromUtmSource(String(externalAdReply.sourceApp))
      sourceApp = detectedApp || 'facebook' // Default para facebook se não detectar
    }
    
    const originMetadata: OriginMetadata = {
      source_type: externalAdReply.sourceType === 'ad' ? 'ad' : 'other',
      source_app: sourceApp,
      source_id: externalAdReply.sourceID ? String(externalAdReply.sourceID) : undefined,
      source_url: externalAdReply.sourceURL ? String(externalAdReply.sourceURL) : undefined,
      first_interaction_at: message.timestamp.toISOString(),
    }
    
    // Detectar source_type baseado em utm_medium se disponível
    if (metadata.utm_medium) {
      const detectedType = this.detectSourceTypeFromUtmMedium(String(metadata.utm_medium))
      if (detectedType) {
        originMetadata.source_type = detectedType
      }
    }
    
    return originMetadata
  }
}