/**
 * Normalizador de dados de origem (wrapper/facade)
 * 
 * Responsabilidade única: Interface simplificada para extração de dados de origem
 * Delega para SourceDataExtractorFactory que gerencia a lógica específica por broker
 */

import type { StandardizedSourceData } from '../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../types.ts'
import { SourceDataExtractorFactory } from '../mappers/source-data-mapper.ts'

export class OriginDataNormalizer {
  /**
   * Normaliza dados de origem da mensagem
   * 
   * Usa factory para criar extrator apropriado baseado no brokerId
   * 
   * @param message - Mensagem normalizada
   * @returns Dados de origem padronizados ou null se não houver dados válidos
   */
  static normalize(
    message: NormalizedMessage
  ): StandardizedSourceData | null {
    try {
      return SourceDataExtractorFactory.extract(message)
    } catch (error) {
      console.error('[OriginDataNormalizer] Error extracting source data:', error)
      return null
    }
  }
  
  /**
   * Verifica se há dados de origem válidos
   * 
   * @param sourceData - Dados de origem padronizados
   * @returns true se há dados válidos, false caso contrário
   */
  static hasOriginData(sourceData: StandardizedSourceData | null): boolean {
    if (!sourceData) return false
    
    return !!(
      sourceData.clickIds ||
      sourceData.utm ||
      sourceData.campaign ||
      sourceData.metadata
    )
  }
}