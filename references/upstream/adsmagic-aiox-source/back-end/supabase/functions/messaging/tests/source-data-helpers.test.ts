/**
 * Testes unitários para source-data-helpers
 * 
 * Testa a função extractCriticalFields que extrai campos críticos de source_data
 * Segue princípios SOLID e Clean Code
 */

import { describe, it } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { extractCriticalFields } from '../utils/source-data-helpers.ts'
import type { StandardizedSourceData } from '../types/contact-origin-types.ts'

describe('extractCriticalFields', () => {
  describe('Extração de campos completos', () => {
    it('should extract all critical fields from standard structure', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'test-campaign-123',
          ad_id: 'test-ad-456',
          adgroup_id: 'test-adgroup-789',
        },
        metadata: {
          source_app: 'facebook',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'test-campaign-123')
      assertEquals(fields.adId, 'test-ad-456')
      assertEquals(fields.adgroupId, 'test-adgroup-789')
      assertEquals(fields.sourceApp, 'facebook')
    })
    
    it('should extract campaign_id and ad_id from campaign structure', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'campaign-789',
          ad_id: 'ad-012',
        },
        metadata: {
          source_app: 'google',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'campaign-789')
      assertEquals(fields.adId, 'ad-012')
      assertEquals(fields.adgroupId, null) // Não fornecido
      assertEquals(fields.sourceApp, 'google')
    })
    
    it('should extract adgroup_id when provided', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'campaign-123',
          ad_id: 'ad-456',
          adgroup_id: 'adgroup-789',
        },
        metadata: {
          source_app: 'facebook',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'campaign-123')
      assertEquals(fields.adId, 'ad-456')
      assertEquals(fields.adgroupId, 'adgroup-789')
      assertEquals(fields.sourceApp, 'facebook')
    })
  })
  
  describe('Campos opcionais', () => {
    it('should return null for missing campaign_id', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          ad_id: 'ad-456',
        },
        metadata: {
          source_app: 'facebook',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, null)
      assertEquals(fields.adId, 'ad-456')
      assertEquals(fields.sourceApp, 'facebook')
    })
    
    it('should return null for missing ad_id', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'campaign-123',
        },
        metadata: {
          source_app: 'google',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'campaign-123')
      assertEquals(fields.adId, null)
      assertEquals(fields.sourceApp, 'google')
    })
    
    it('should return null for missing adgroup_id', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'campaign-123',
          ad_id: 'ad-456',
        },
        metadata: {
          source_app: 'tiktok',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'campaign-123')
      assertEquals(fields.adId, 'ad-456')
      assertEquals(fields.adgroupId, null)
      assertEquals(fields.sourceApp, 'tiktok')
    })
    
    it('should return null for missing source_app', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'campaign-123',
          ad_id: 'ad-456',
        },
        metadata: {},
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'campaign-123')
      assertEquals(fields.adId, 'ad-456')
      assertEquals(fields.sourceApp, null)
    })
  })
  
  describe('Casos extremos', () => {
    it('should return null for all fields when sourceData is null', () => {
      const fields = extractCriticalFields(null)
      
      assertEquals(fields.campaignId, null)
      assertEquals(fields.adId, null)
      assertEquals(fields.adgroupId, null)
      assertEquals(fields.sourceApp, null)
    })
    
    it('should return null for all fields when sourceData is undefined', () => {
      const fields = extractCriticalFields(undefined)
      
      assertEquals(fields.campaignId, null)
      assertEquals(fields.adId, null)
      assertEquals(fields.adgroupId, null)
      assertEquals(fields.sourceApp, null)
    })
    
    it('should return null for all fields when sourceData is empty object', () => {
      const sourceData: StandardizedSourceData = {}
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, null)
      assertEquals(fields.adId, null)
      assertEquals(fields.adgroupId, null)
      assertEquals(fields.sourceApp, null)
    })
    
    it('should return null when campaign is missing', () => {
      const sourceData: StandardizedSourceData = {
        metadata: {
          source_app: 'facebook',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, null)
      assertEquals(fields.adId, null)
      assertEquals(fields.adgroupId, null)
      assertEquals(fields.sourceApp, 'facebook')
    })
    
    it('should return null when metadata is missing', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'campaign-123',
          ad_id: 'ad-456',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.campaignId, 'campaign-123')
      assertEquals(fields.adId, 'ad-456')
      assertEquals(fields.adgroupId, null)
      assertEquals(fields.sourceApp, null)
    })
  })
  
  describe('Diferentes source_app', () => {
    it('should extract source_app for facebook', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'fb-campaign-123',
        },
        metadata: {
          source_app: 'facebook',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.sourceApp, 'facebook')
    })
    
    it('should extract source_app for instagram', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'ig-campaign-123',
        },
        metadata: {
          source_app: 'instagram',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.sourceApp, 'instagram')
    })
    
    it('should extract source_app for google', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'google-campaign-123',
        },
        metadata: {
          source_app: 'google',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.sourceApp, 'google')
    })
    
    it('should extract source_app for tiktok', () => {
      const sourceData: StandardizedSourceData = {
        campaign: {
          campaign_id: 'tiktok-campaign-123',
        },
        metadata: {
          source_app: 'tiktok',
        },
      }
      
      const fields = extractCriticalFields(sourceData)
      
      assertEquals(fields.sourceApp, 'tiktok')
    })
  })
})
