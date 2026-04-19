/**
 * Source data extractor factory — ported from Deno Edge Function
 */
import type { ISourceDataExtractor } from '../brokers/base/SourceDataExtractor.js'
import { BaseSourceDataExtractor } from '../brokers/base/SourceDataExtractor.js'
import { UazapiSourceExtractor } from '../brokers/uazapi/uazapi-source-extractor.js'
import type { NormalizedMessage } from '../types/messaging.js'
import type { StandardizedSourceData, CampaignIds, OriginMetadata } from '../types/contact-origin-types.js'

export class SourceDataExtractorFactory {
  static create(brokerId: string): ISourceDataExtractor {
    switch (brokerId.toLowerCase()) {
      case 'uazapi': return new UazapiSourceExtractor()
      default:
        return new (class extends BaseSourceDataExtractor {
          protected extractCampaignIds(_message: NormalizedMessage): CampaignIds | null { return null }
          protected extractMetadata(_message: NormalizedMessage): OriginMetadata | null { return null }
        })()
    }
  }

  static extract(message: NormalizedMessage): StandardizedSourceData | null {
    const extractor = this.create(message.brokerId)
    return extractor.extract(message)
  }
}
