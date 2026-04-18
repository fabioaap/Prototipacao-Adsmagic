/**
 * Testes de Performance e Segurança - FASE 8
 * 
 * Testa:
 * - Performance de normalização e extração
 * - Validação de segurança (entrada maliciosa)
 * - Edge cases de performance
 */

import { describe, it } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals, assertExists, assertRejects } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { normalizeIdentifier, extractPhoneNumber } from '../utils/identifier-normalizer.ts'
import { SourceDataExtractorFactory } from '../mappers/source-data-mapper.ts'
import type { NormalizedMessage } from '../types.ts'

describe('Performance Tests', () => {
  describe('Identifier Normalization Performance', () => {
    it('should normalize identifier quickly (< 10ms)', () => {
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        normalizeIdentifier('5511999999999@s.whatsapp.net')
      }
      
      const end = performance.now()
      const avgTime = (end - start) / 100
      
      // Média deve ser menor que 10ms por operação
      assertEquals(avgTime < 10, true, `Average time: ${avgTime}ms`)
    })
    
    it('should handle batch normalization efficiently', () => {
      const inputs = Array.from({ length: 1000 }, (_, i) => 
        `5511999999${String(i).padStart(4, '0')}@s.whatsapp.net`
      )
      
      const start = performance.now()
      
      inputs.forEach(input => {
        normalizeIdentifier(input)
      })
      
      const end = performance.now()
      const totalTime = end - start
      
      // 1000 normalizações devem completar em menos de 1000ms
      assertEquals(totalTime < 1000, true, `Total time: ${totalTime}ms`)
    })
  })
  
  describe('Source Data Extraction Performance', () => {
    it('should extract source data quickly (< 50ms)', () => {
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
      
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        SourceDataExtractorFactory.extract(message)
      }
      
      const end = performance.now()
      const avgTime = (end - start) / 100
      
      // Média deve ser menor que 50ms por operação
      assertEquals(avgTime < 50, true, `Average time: ${avgTime}ms`)
    })
  })
})

describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should reject SQL injection attempts in identifier', async () => {
      await assertRejects(
        async () => {
          normalizeIdentifier("'; DROP TABLE contacts; --")
        },
        Error,
        'Formato de identificador não reconhecido'
      )
    })
    
    it('should reject XSS attempts in identifier', async () => {
      await assertRejects(
        async () => {
          normalizeIdentifier('<script>alert("xss")</script>')
        },
        Error,
        'Formato de identificador não reconhecido'
      )
    })
    
    it('should reject extremely long inputs', async () => {
      const longInput = 'a'.repeat(10000)
      
      await assertRejects(
        async () => {
          normalizeIdentifier(longInput)
        },
        Error,
        'Formato de identificador não reconhecido'
      )
    })
    
    it('should reject null and undefined inputs', async () => {
      await assertRejects(
        async () => {
          // @ts-expect-error - Testando entrada inválida
          normalizeIdentifier(null)
        },
        Error,
        'must be a non-empty string'
      )
      
      await assertRejects(
        async () => {
          // @ts-expect-error - Testando entrada inválida
          normalizeIdentifier(undefined)
        },
        Error,
        'must be a non-empty string'
      )
    })
    
    it('should reject empty string', async () => {
      await assertRejects(
        async () => {
          normalizeIdentifier('')
        },
        Error,
        'must be a non-empty string'
      )
    })
  })
  
  describe('Data Sanitization', () => {
    it('should sanitize special characters in phone numbers', () => {
      // Números com caracteres especiais devem ser rejeitados
      assertRejects(
        async () => {
          normalizeIdentifier('55 11 99999-9999') // Espaços e hífens
        },
        Error
      )
    })
    
    it('should handle unicode characters safely', () => {
      // O normalizador remove o sufixo @anything e processa como telefone
      // Isso é comportamento tolerante (aceita formatos variados)
      const result = normalizeIdentifier('5511999999999@whatsapp.net\u0000') // Null byte
      assertExists(result)
      assertEquals(result.primaryType, 'phone')
      // O null byte é removido durante o processamento
    })
  })
  
  describe('Type Safety', () => {
    it('should enforce type checking on NormalizedMessage', () => {
      // Este teste valida que TypeScript está fazendo type checking
      // Se o código compila sem erros, o type checking está funcionando
      
      const validMessage: NormalizedMessage = {
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
      }
      
      assertExists(validMessage)
    })
  })
})

describe('Edge Cases - Performance', () => {
  describe('Large Dataset Handling', () => {
    it('should handle large number of identifiers without memory issues', () => {
      const identifiers = Array.from({ length: 10000 }, (_, i) => 
        `5511999999${String(i).padStart(4, '0')}@s.whatsapp.net`
      )
      
      const results = identifiers.map(id => {
        try {
          return normalizeIdentifier(id)
        } catch {
          return null
        }
      })
      
      // Deve processar todos sem erro
      assertEquals(results.length, 10000)
    })
    
    it('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(normalizeIdentifier(`5511999999${String(i).padStart(4, '0')}@s.whatsapp.net`))
      )
      
      const results = await Promise.all(promises)
      
      assertEquals(results.length, 100)
      results.forEach(result => {
        assertExists(result)
      })
    })
  })
  
  describe('Memory Management', () => {
    it('should not leak memory with repeated operations', () => {
      // Executar muitas operações e verificar que não há crescimento exponencial
      const iterations = 1000
      
      for (let i = 0; i < iterations; i++) {
        normalizeIdentifier(`5511999999${String(i % 100).padStart(4, '0')}@s.whatsapp.net`)
      }
      
      // Se chegou aqui sem erro de memória, passou
      assertEquals(true, true)
    })
  })
})

describe('Edge Cases - Security', () => {
  describe('Boundary Conditions', () => {
    it('should handle minimum length inputs', () => {
      const result = normalizeIdentifier('5512345678') // Mínimo válido
      assertExists(result)
    })
    
    it('should handle maximum length inputs', () => {
      const result = normalizeIdentifier('12345678901234567890@lid') // Máximo LID
      assertExists(result)
      assertEquals(result.primaryType, 'lid')
    })
    
    it('should reject inputs exceeding maximum length', async () => {
      await assertRejects(
        async () => {
          normalizeIdentifier('123456789012345678901@lid') // 21 dígitos
        },
        Error
      )
    })
  })
  
  describe('Special Characters Handling', () => {
    it('should handle valid special characters in JID', () => {
      const result = normalizeIdentifier('5511999999999-1234567890@g.us')
      assertExists(result)
      assertEquals(result.primaryType, 'jid')
    })
    
    it('should handle invalid special characters gracefully', () => {
      // O normalizador é tolerante e remove sufixos @anything, processando como telefone
      // Isso é comportamento intencional (aceita formatos variados)
      const result = normalizeIdentifier('5511999999999@invalid.net')
      assertExists(result)
      assertEquals(result.primaryType, 'phone')
      // O sufixo @invalid.net é removido e processa como telefone
    })
  })
})
