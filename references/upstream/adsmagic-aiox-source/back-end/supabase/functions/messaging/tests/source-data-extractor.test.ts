/**
 * Testes unitários para SourceDataExtractor
 * 
 * Testa:
 * - Classe base BaseSourceDataExtractor
 * - UazapiSourceExtractor
 * - Factory (SourceDataExtractorFactory)
 * - Métodos utilitários
 */

import { describe, it } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { BaseSourceDataExtractor } from '../brokers/base/SourceDataExtractor.ts'
import { UazapiSourceExtractor } from '../brokers/uazapi/UazapiSourceExtractor.ts'
import { SourceDataExtractorFactory } from '../mappers/source-data-mapper.ts'
import type { NormalizedMessage } from '../types.ts'
import type { CampaignIds, OriginMetadata } from '../types/contact-origin-types.ts'

/**
 * Classe de teste que estende BaseSourceDataExtractor
 * para testar métodos da classe base
 */
class TestSourceDataExtractor extends BaseSourceDataExtractor {
  protected extractCampaignIds(_message: NormalizedMessage): CampaignIds | null {
    return {
      campaign_id: 'test-campaign-123',
      campaign_name: 'Test Campaign',
    }
  }
  
  protected extractMetadata(_message: NormalizedMessage): OriginMetadata | null {
    return {
      source_type: 'ad',
      source_app: 'google',
      first_interaction_at: new Date().toISOString(),
    }
  }
}

/**
 * Helper para criar mensagem normalizada de teste
 */
function createTestMessage(metadata: Record<string, unknown> = {}): NormalizedMessage {
  return {
    messageId: 'msg-1',
    externalMessageId: 'ext-1',
    brokerId: 'uazapi',
    accountId: 'acc-1',
    from: {
      phoneNumber: '5511999999999',
      name: 'Test User',
    },
    to: {
      phoneNumber: '5511888888888',
      accountName: 'Test Account',
    },
    content: {
      type: 'text',
      text: 'Hello',
    },
    timestamp: new Date(),
    status: 'delivered',
    isGroup: false,
    context: {
      metadata,
    },
  }
}

describe('SourceDataExtractor', () => {
  describe('BaseSourceDataExtractor - extractClickIds', () => {
    it('should extract gclid from metadata', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage({
        gclid: 'CjwKCAiA...',
      })
      
      // Usamos reflection para acessar método protegido
      const result = (extractor as unknown as { extractClickIds: (msg: NormalizedMessage) => unknown }).extractClickIds(message)
      
      assertExists(result)
      assertEquals((result as { gclid?: string }).gclid, 'CjwKCAiA...')
    })
    
    it('should extract multiple click IDs', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage({
        gclid: 'CjwKCAiA...',
        wbraid: 'CM...',
        fbclid: 'IwAR...',
        ctwaClid: 'Afeuo72uo9m...',
      })
      
      const result = (extractor as unknown as { extractClickIds: (msg: NormalizedMessage) => unknown }).extractClickIds(message) as Record<string, string>
      
      assertEquals(result.gclid, 'CjwKCAiA...')
      assertEquals(result.wbraid, 'CM...')
      assertEquals(result.fbclid, 'IwAR...')
      assertEquals(result.ctwaClid, 'Afeuo72uo9m...')
    })
    
    it('should return null when no click IDs found', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage()
      
      const result = (extractor as unknown as { extractClickIds: (msg: NormalizedMessage) => unknown }).extractClickIds(message)
      
      assertEquals(result, null)
    })
  })
  
  describe('BaseSourceDataExtractor - extractUtmParams', () => {
    it('should extract UTM parameters from metadata', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'campaign-123',
        utm_content: 'ad-456',
        utm_term: 'keyword',
      })
      
      const result = (extractor as unknown as { extractUtmParams: (msg: NormalizedMessage) => unknown }).extractUtmParams(message) as Record<string, string>
      
      assertEquals(result.utm_source, 'google')
      assertEquals(result.utm_medium, 'cpc')
      assertEquals(result.utm_campaign, 'campaign-123')
      assertEquals(result.utm_content, 'ad-456')
      assertEquals(result.utm_term, 'keyword')
    })
    
    it('should return null when no UTM params found', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage()
      
      const result = (extractor as unknown as { extractUtmParams: (msg: NormalizedMessage) => unknown }).extractUtmParams(message)
      
      assertEquals(result, null)
    })
  })
  
  describe('BaseSourceDataExtractor - detectSourceAppFromUtmSource', () => {
    it('should detect google from utm_source', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceAppFromUtmSource: (source?: string) => string | undefined }).detectSourceAppFromUtmSource('google')
      
      assertEquals(result, 'google')
    })
    
    it('should detect facebook from utm_source', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceAppFromUtmSource: (source?: string) => string | undefined }).detectSourceAppFromUtmSource('facebook')
      
      assertEquals(result, 'facebook')
    })
    
    it('should detect instagram from utm_source', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceAppFromUtmSource: (source?: string) => string | undefined }).detectSourceAppFromUtmSource('instagram')
      
      assertEquals(result, 'instagram')
    })
    
    it('should detect tiktok from utm_source', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceAppFromUtmSource: (source?: string) => string | undefined }).detectSourceAppFromUtmSource('tiktok')
      
      assertEquals(result, 'tiktok')
    })
    
    it('should return other for unknown source', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceAppFromUtmSource: (source?: string) => string | undefined }).detectSourceAppFromUtmSource('unknown')
      
      assertEquals(result, 'other')
    })
    
    it('should return undefined for empty source', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceAppFromUtmSource: (source?: string) => string | undefined }).detectSourceAppFromUtmSource(undefined)
      
      assertEquals(result, undefined)
    })
  })
  
  describe('BaseSourceDataExtractor - detectSourceTypeFromUtmMedium', () => {
    it('should detect ad from utm_medium cpc', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceTypeFromUtmMedium: (medium?: string) => string | undefined }).detectSourceTypeFromUtmMedium('cpc')
      
      assertEquals(result, 'ad')
    })
    
    it('should detect ad from utm_medium paid_social', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceTypeFromUtmMedium: (medium?: string) => string | undefined }).detectSourceTypeFromUtmMedium('paid_social')
      
      assertEquals(result, 'ad')
    })
    
    it('should detect organic from utm_medium organic', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceTypeFromUtmMedium: (medium?: string) => string | undefined }).detectSourceTypeFromUtmMedium('organic')
      
      assertEquals(result, 'organic')
    })
    
    it('should detect referral from utm_medium referral', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceTypeFromUtmMedium: (medium?: string) => string | undefined }).detectSourceTypeFromUtmMedium('referral')
      
      assertEquals(result, 'referral')
    })
    
    it('should return other for unknown medium', () => {
      const extractor = new TestSourceDataExtractor()
      const result = (extractor as unknown as { detectSourceTypeFromUtmMedium: (medium?: string) => string | undefined }).detectSourceTypeFromUtmMedium('unknown')
      
      assertEquals(result, 'other')
    })
  })
  
  describe('BaseSourceDataExtractor - extract (Template Method)', () => {
    it('should extract complete source data', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage({
        gclid: 'CjwKCAiA...',
        utm_source: 'google',
        utm_medium: 'cpc',
      })
      
      const result = extractor.extract(message)
      
      assertExists(result)
      assertExists(result.clickIds)
      assertEquals(result.clickIds!.gclid, 'CjwKCAiA...')
      assertExists(result.utm)
      assertEquals(result.utm!.utm_source, 'google')
      assertExists(result.campaign)
      assertEquals(result.campaign!.campaign_id, 'test-campaign-123')
      assertExists(result.metadata)
      assertEquals(result.metadata!.source_type, 'ad')
    })
    
    it('should return null when no valid data', () => {
      const extractor = new TestSourceDataExtractor()
      const message = createTestMessage()
      
      // Precisamos criar um extrator que retorna null para todos os dados
      const emptyExtractor = new (class extends BaseSourceDataExtractor {
        protected extractCampaignIds(_message: NormalizedMessage): CampaignIds | null {
          return null
        }
        
        protected extractMetadata(_message: NormalizedMessage): OriginMetadata | null {
          return null
        }
      })()
      
      const result = emptyExtractor.extract(message)
      
      assertEquals(result, null)
    })
  })
  
  describe('UazapiSourceExtractor - extractAdditionalClickIds', () => {
    it('should extract ctwaClid from externalAdReply', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        externalAdReply: {
          ctwaClid: 'Afeuo72uo9mEzDVOmiY4mhswyu01ZTvR0y7KInhHbw3hk0QRylpNYvrbl4uwe8WvWr3OjG87rB3SOVvV0oRTKhJQ9UQWR583PuZPvawJ1-nP4vRhBapMa6kzd2R6H7EkuPV4YsSetg',
        },
      })
      
      const result = (extractor as unknown as { extractAdditionalClickIds: (msg: NormalizedMessage) => unknown }).extractAdditionalClickIds(message) as { ctwaClid?: string }
      
      assertExists(result)
      assertEquals(result.ctwaClid, 'Afeuo72uo9mEzDVOmiY4mhswyu01ZTvR0y7KInhHbw3hk0QRylpNYvrbl4uwe8WvWr3OjG87rB3SOVvV0oRTKhJQ9UQWR583PuZPvawJ1-nP4vRhBapMa6kzd2R6H7EkuPV4YsSetg')
    })
    
    it('should extract fbclid from externalAdReply', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        externalAdReply: {
          fbclid: 'IwAR...',
        },
      })
      
      const result = (extractor as unknown as { extractAdditionalClickIds: (msg: NormalizedMessage) => unknown }).extractAdditionalClickIds(message) as { fbclid?: string }
      
      assertExists(result)
      assertEquals(result.fbclid, 'IwAR...')
    })
    
    it('should return null when externalAdReply not present', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage()
      
      const result = (extractor as unknown as { extractAdditionalClickIds: (msg: NormalizedMessage) => unknown }).extractAdditionalClickIds(message)
      
      assertEquals(result, null)
    })
  })
  
  describe('UazapiSourceExtractor - extractAdditionalUtmParams', () => {
    it('should extract UTMs from externalAdReply', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        externalAdReply: {
          sourceApp: 'facebook',
          sourceType: 'ad',
          sourceID: '1234567890',
        },
      })
      
      const result = (extractor as unknown as { extractAdditionalUtmParams: (msg: NormalizedMessage) => unknown }).extractAdditionalUtmParams(message) as Record<string, string>
      
      assertExists(result)
      assertEquals(result.utm_source, 'facebook')
      assertEquals(result.utm_medium, 'paid_social')
      assertEquals(result.utm_campaign, '1234567890')
    })
    
    it('should return null when externalAdReply not present', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage()
      
      const result = (extractor as unknown as { extractAdditionalUtmParams: (msg: NormalizedMessage) => unknown }).extractAdditionalUtmParams(message)
      
      assertEquals(result, null)
    })
  })
  
  describe('UazapiSourceExtractor - extractCampaignIds', () => {
    it('should extract campaign IDs from externalAdReply', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        externalAdReply: {
          sourceID: '1234567890',
          title: 'Test Ad Title',
        },
      })
      
      const result = extractor.extract(message)
      
      assertExists(result)
      assertExists(result.campaign)
      assertEquals(result.campaign!.campaign_id, '1234567890')
      assertEquals(result.campaign!.ad_id, '1234567890')
      assertEquals(result.campaign!.campaign_name, 'Test Ad Title')
    })
    
    it('should return null when externalAdReply not present', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage()
      
      const result = extractor.extract(message)
      
      // Como não há dados válidos, deve retornar null
      assertEquals(result, null)
    })
  })
  
  describe('UazapiSourceExtractor - extractMetadata', () => {
    it('should extract metadata from externalAdReply', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        externalAdReply: {
          sourceType: 'ad',
          sourceApp: 'facebook',
          sourceID: '1234567890',
          sourceURL: 'https://fb.me/7f0MzrhFz',
        },
      })
      
      const result = extractor.extract(message)
      
      assertExists(result)
      assertExists(result.metadata)
      assertEquals(result.metadata!.source_type, 'ad')
      assertEquals(result.metadata!.source_app, 'facebook')
      assertEquals(result.metadata!.source_id, '1234567890')
      assertEquals(result.metadata!.source_url, 'https://fb.me/7f0MzrhFz')
      assertExists(result.metadata!.first_interaction_at)
    })
    
    it('should detect source_app from utm_source when available', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        utm_source: 'google',
        externalAdReply: {
          sourceType: 'ad',
          sourceApp: 'unknown',
        },
      })
      
      const result = extractor.extract(message)
      
      assertExists(result)
      assertExists(result.metadata)
      assertEquals(result.metadata!.source_app, 'google')
    })
  })
  
  describe('UazapiSourceExtractor - extract (complete)', () => {
    it('should extract complete source data from UAZAPI message', () => {
      const extractor = new UazapiSourceExtractor()
      const message = createTestMessage({
        externalAdReply: {
          ctwaClid: 'Afeuo72uo9m...',
          sourceType: 'ad',
          sourceApp: 'facebook',
          sourceID: '1234567890',
          sourceURL: 'https://fb.me/7f0MzrhFz',
          title: 'Test Ad',
        },
        utm_source: 'facebook',
        utm_medium: 'paid_social',
      })
      
      const result = extractor.extract(message)
      
      assertExists(result)
      assertExists(result.clickIds)
      assertEquals(result.clickIds!.ctwaClid, 'Afeuo72uo9m...')
      assertExists(result.utm)
      assertEquals(result.utm!.utm_source, 'facebook')
      assertExists(result.campaign)
      assertEquals(result.campaign!.campaign_id, '1234567890')
      assertExists(result.metadata)
      assertEquals(result.metadata!.source_type, 'ad')
      assertEquals(result.metadata!.source_app, 'facebook')
    })
  })
  
  describe('SourceDataExtractorFactory', () => {
    it('should create UazapiSourceExtractor for uazapi broker', () => {
      const extractor = SourceDataExtractorFactory.create('uazapi')
      
      assertExists(extractor)
      assertEquals(extractor instanceof UazapiSourceExtractor, true)
    })
    
    it('should create generic extractor for unknown broker', () => {
      const extractor = SourceDataExtractorFactory.create('unknown')
      
      assertExists(extractor)
      assertEquals(extractor instanceof BaseSourceDataExtractor, true)
    })
    
    it('should extract source data using factory', () => {
      const message = createTestMessage({
        externalAdReply: {
          ctwaClid: 'Afeuo72uo9m...',
          sourceType: 'ad',
          sourceApp: 'facebook',
          sourceID: '1234567890',
        },
      })
      message.brokerId = 'uazapi'
      
      const result = SourceDataExtractorFactory.extract(message)
      
      assertExists(result)
      assertExists(result.clickIds)
      assertEquals(result.clickIds!.ctwaClid, 'Afeuo72uo9m...')
    })
    
    it('should handle case-insensitive broker IDs', () => {
      const extractor1 = SourceDataExtractorFactory.create('UAZAPI')
      const extractor2 = SourceDataExtractorFactory.create('uazapi')
      
      assertEquals(extractor1 instanceof UazapiSourceExtractor, true)
      assertEquals(extractor2 instanceof UazapiSourceExtractor, true)
    })
  })
})
