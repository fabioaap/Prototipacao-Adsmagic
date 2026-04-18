/**
 * Testes de Integração - FASE 8
 * 
 * Testa fluxo completo: Webhook → Normalização → Extração → Serviço → Banco
 * 
 * Nota: Estes testes são básicos e focam em validar o fluxo completo.
 * Testes completos com dados reais requerem ambiente de staging.
 */

import { describe, it } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { normalizeIdentifier, generateCanonicalIdentifier } from '../utils/identifier-normalizer.ts'
import { SourceDataExtractorFactory } from '../mappers/source-data-mapper.ts'
import { OriginDataNormalizer } from '../services/OriginDataNormalizer.ts'
import type { NormalizedMessage } from '../types.ts'

describe('Integration Tests - Full Flow', () => {
  describe('Flow: Identifier Normalization → Source Data Extraction', () => {
    it('should normalize identifier and extract source data from UAZAPI message', () => {
      // 1. Normalizar identificador
      const identifier = normalizeIdentifier('5511999999999@s.whatsapp.net')
      
      assertEquals(identifier.primaryType, 'jid')
      assertExists(identifier.normalizedPhone)
      
      // 2. Gerar canonical identifier
      const canonicalId = generateCanonicalIdentifier(identifier)
      assertEquals(canonicalId, 'jid:5511999999999@s.whatsapp.net')
      
      // 3. Criar mensagem normalizada com dados de origem
      const message: NormalizedMessage = {
        messageId: 'msg-1',
        externalMessageId: 'ext-1',
        brokerId: 'uazapi',
        accountId: 'acc-1',
        from: {
          phoneNumber: '5511999999999',
          jid: '5511999999999@s.whatsapp.net',
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
          metadata: {
            externalAdReply: {
              ctwaClid: 'Afeuo72uo9mEzDVOmiY4mhswyu01ZTvR0y7KInhHbw3hk0QRylpNYvrbl4uwe8WvWr3OjG87rB3SOVvV0oRTKhJQ9UQWR583PuZPvawJ1-nP4vRhBapMa6kzd2R6H7EkuPV4YsSetg',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
              sourceURL: 'https://fb.me/7f0MzrhFz',
              title: 'Test Ad',
            },
          },
        },
      }
      
      // 4. Extrair dados de origem
      const sourceData = OriginDataNormalizer.normalize(message)
      
      assertExists(sourceData)
      assertExists(sourceData.clickIds)
      assertEquals(sourceData.clickIds!.ctwaClid, 'Afeuo72uo9mEzDVOmiY4mhswyu01ZTvR0y7KInhHbw3hk0QRylpNYvrbl4uwe8WvWr3OjG87rB3SOVvV0oRTKhJQ9UQWR583PuZPvawJ1-nP4vRhBapMa6kzd2R6H7EkuPV4YsSetg')
      assertExists(sourceData.utm)
      assertEquals(sourceData.utm!.utm_source, 'facebook')
      assertExists(sourceData.campaign)
      assertEquals(sourceData.campaign!.campaign_id, '1234567890')
      assertExists(sourceData.metadata)
      assertEquals(sourceData.metadata!.source_type, 'ad')
      assertEquals(sourceData.metadata!.source_app, 'facebook')
    })
    
    it('should handle message without source data', () => {
      const message: NormalizedMessage = {
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
      }
      
      const sourceData = OriginDataNormalizer.normalize(message)
      
      // Sem dados de origem, deve retornar null
      assertEquals(sourceData, null)
    })
    
    it('should validate origin data correctly', () => {
      const hasData = OriginDataNormalizer.hasOriginData({
        clickIds: { ctwaClid: 'test' },
      })
      assertEquals(hasData, true)
      
      const noData = OriginDataNormalizer.hasOriginData(null)
      assertEquals(noData, false)
      
      const emptyData = OriginDataNormalizer.hasOriginData({})
      assertEquals(emptyData, false)
    })
  })
  
  describe('Flow: Multiple Identifiers Priority', () => {
    it('should prioritize canonicalIdentifier > jid > phone > lid', () => {
      // Testa que a priorização funciona corretamente
      const identifier1 = normalizeIdentifier('5511999999999@s.whatsapp.net')
      assertEquals(identifier1.primaryType, 'jid')
      
      const identifier2 = normalizeIdentifier('213709100187796@lid')
      assertEquals(identifier2.primaryType, 'lid')
      
      const identifier3 = normalizeIdentifier('5511999999999')
      assertEquals(identifier3.primaryType, 'phone')
    })
  })
  
  describe('Flow: Factory Pattern', () => {
    it('should use correct extractor based on brokerId', () => {
      const message1: NormalizedMessage = {
        messageId: 'msg-1',
        externalMessageId: 'ext-1',
        brokerId: 'uazapi',
        accountId: 'acc-1',
        from: {
          phoneNumber: '5511999999999',
        },
        to: {
          phoneNumber: '5511888888888',
          accountName: 'Test',
        },
        content: {
          type: 'text',
          text: 'Hello',
        },
        timestamp: new Date(),
        status: 'delivered',
        isGroup: false,
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'test',
            },
          },
        },
      }
      
      const extractor1 = SourceDataExtractorFactory.create('uazapi')
      assertExists(extractor1)
      
      const result1 = extractor1.extract(message1)
      // UAZAPI extractor deve extrair ctwaClid
      assertExists(result1)
      assertExists(result1.clickIds)
      
      // Testar factory genérico
      const extractor2 = SourceDataExtractorFactory.create('unknown')
      assertExists(extractor2)
      
      const result2 = extractor2.extract(message1)
      // Extrator genérico não deve extrair dados específicos do UAZAPI
      // Mas pode extrair UTMs básicos se disponíveis
    })
  })
})

describe('Integration Tests - Data Validation', () => {
  describe('Source Data Structure', () => {
    it('should have correct structure for Meta Ads data', () => {
      const message: NormalizedMessage = {
        messageId: 'msg-1',
        externalMessageId: 'ext-1',
        brokerId: 'uazapi',
        accountId: 'acc-1',
        from: {
          phoneNumber: '5511999999999',
        },
        to: {
          phoneNumber: '5511888888888',
          accountName: 'Test',
        },
        content: {
          type: 'text',
          text: 'Hello',
        },
        timestamp: new Date(),
        status: 'delivered',
        isGroup: false,
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'Afeuo72uo9m...',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
            },
          },
        },
      }
      
      const sourceData = OriginDataNormalizer.normalize(message)
      
      assertExists(sourceData)
      
      // Validar estrutura completa
      assertExists(sourceData.clickIds)
      assertExists(sourceData.utm)
      assertExists(sourceData.campaign)
      assertExists(sourceData.metadata)
      
      // Validar campos específicos
      assertEquals(sourceData.clickIds!.ctwaClid, 'Afeuo72uo9m...')
      assertEquals(sourceData.metadata!.source_type, 'ad')
      assertEquals(sourceData.metadata!.source_app, 'facebook')
    })
  })
})
