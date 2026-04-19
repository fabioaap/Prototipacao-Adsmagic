/**
 * Origin data normalizer facade — ported from Deno Edge Function
 */
import type { StandardizedSourceData } from '../types/contact-origin-types.js'
import type { NormalizedMessage } from '../types/messaging.js'
import { SourceDataExtractorFactory } from './source-data-mapper.js'

export class OriginDataNormalizer {
  static normalize(message: NormalizedMessage): StandardizedSourceData | null {
    try {
      return SourceDataExtractorFactory.extract(message)
    } catch (error) {
      console.error('[OriginDataNormalizer] Error extracting source data:', error)
      return null
    }
  }

  static hasOriginData(sourceData: StandardizedSourceData | null): boolean {
    if (!sourceData) return false
    return !!(sourceData.clickIds || sourceData.utm || sourceData.campaign || sourceData.metadata)
  }
}
