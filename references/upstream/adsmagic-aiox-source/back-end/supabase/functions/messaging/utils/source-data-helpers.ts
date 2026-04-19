/**
 * Helpers para extrair campos críticos de source_data
 * 
 * Centraliza lógica de extração para manter consistência
 * Segue princípios SOLID (SRP) e DRY
 */

import type { StandardizedSourceData } from '../types/contact-origin-types.ts'

/**
 * Campos críticos extraídos de source_data
 */
export interface CriticalFields {
  campaignId: string | null
  adId: string | null
  adgroupId: string | null
  sourceApp: string | null
}

/**
 * Extrai campos críticos de source_data
 * 
 * campaign_id é padronizado e diferenciado pela source_app/origin_id.
 * Não precisa de metaCampaignId ou googleCampaignId separados.
 * 
 * @param sourceData - Dados padronizados de origem
 * @returns Campos críticos extraídos
 * 
 * @example
 * ```ts
 * const fields = extractCriticalFields({
 *   campaign: { campaign_id: '123', ad_id: '456', adgroup_id: '789' },
 *   metadata: { source_app: 'facebook' }
 * })
 * // { campaignId: '123', adId: '456', adgroupId: '789', sourceApp: 'facebook' }
 * ```
 */
export function extractCriticalFields(
  sourceData: StandardizedSourceData | null | undefined
): CriticalFields {
  if (!sourceData) {
    return {
      campaignId: null,
      adId: null,
      adgroupId: null,
      sourceApp: null,
    }
  }
  
  // Extrair campaign_id padronizado (diferenciado por source_app/origin_id)
  const campaignId = sourceData.campaign?.campaign_id || null
  
  // Extrair ad_id
  const adId = sourceData.campaign?.ad_id || null
  
  // Extrair adgroup_id (Google/Meta)
  const adgroupId = sourceData.campaign?.adgroup_id || null
  
  // Extrair source_app
  const sourceApp = sourceData.metadata?.source_app || null
  
  return {
    campaignId,
    adId,
    adgroupId,
    sourceApp,
  }
}

