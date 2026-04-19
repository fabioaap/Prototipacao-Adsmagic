/**
 * Factory para criar extrator de dados de origem baseado no broker
 * 
 * Strategy Pattern: Cada broker tem sua estratégia de extração
 */

import type { ISourceDataExtractor } from '../brokers/base/SourceDataExtractor.ts'
import { BaseSourceDataExtractor } from '../brokers/base/SourceDataExtractor.ts'
import { UazapiSourceExtractor } from '../brokers/uazapi/UazapiSourceExtractor.ts'
// TODO: Futuro - outros extractors
// import { GupshupSourceExtractor } from '../brokers/gupshup/GupshupSourceExtractor.ts'
// import { OfficialSourceExtractor } from '../brokers/official/OfficialSourceExtractor.ts'
import type { NormalizedMessage } from '../types.ts'
import type { StandardizedSourceData, CampaignIds, OriginMetadata } from '../types/contact-origin-types.ts'

/**
 * Factory para criar extrator apropriado baseado no brokerId
 */
export class SourceDataExtractorFactory {
  /**
   * Cria extrator baseado no brokerId
   */
  static create(brokerId: string): ISourceDataExtractor {
    switch (brokerId.toLowerCase()) {
      case 'uazapi':
        return new UazapiSourceExtractor()
      
      // Futuro: outros brokers
      // case 'gupshup':
      //   return new GupshupSourceExtractor()
      // case 'official_whatsapp':
      // case 'official':
      //   return new OfficialSourceExtractor()
      
      default:
        // Fallback: retorna extrator genérico (só extrai UTMs e click IDs básicos)
        // Criamos uma classe anônima que estende BaseSourceDataExtractor
        return new (class extends BaseSourceDataExtractor {
          protected extractCampaignIds(_message: NormalizedMessage): CampaignIds | null {
            return null
          }
          
          protected extractMetadata(_message: NormalizedMessage): OriginMetadata | null {
            return null
          }
        })()
    }
  }
  
  /**
   * Extrai dados de origem da mensagem usando extrator apropriado
   */
  static extract(message: NormalizedMessage): StandardizedSourceData | null {
    const extractor = this.create(message.brokerId)
    return extractor.extract(message)
  }
}