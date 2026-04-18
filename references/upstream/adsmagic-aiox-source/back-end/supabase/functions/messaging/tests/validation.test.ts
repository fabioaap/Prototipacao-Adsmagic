/**
 * Testes unitários para validation.ts
 * 
 * Testa funções de validação reutilizáveis
 */

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  isValidUUID,
  isValidBrokerType,
  isValidJSON,
  isAccountActive,
  SUPPORTED_BROKERS,
} from '../utils/validation.ts'

Deno.test('isValidUUID - Deve validar UUID v4 corretamente', () => {
  // UUIDs válidos (v4) - devem ter '4' na posição da versão e [89ab] na variante
  assertEquals(isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true)
  assertEquals(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479'), true)
  assertEquals(isValidUUID('00000000-0000-4000-8000-000000000000'), true)
  
  // UUIDs inválidos
  assertEquals(isValidUUID('invalid-uuid'), false)
  assertEquals(isValidUUID('550e8400-e29b-41d4-a716'), false)
  assertEquals(isValidUUID('550e8400-e29b-31d4-a716-446655440000'), false) // Versão 3
  assertEquals(isValidUUID(''), false)
  assertEquals(isValidUUID('not-a-uuid'), false)
})

Deno.test('isValidBrokerType - Deve validar broker types suportados', () => {
  // Brokers válidos
  for (const broker of SUPPORTED_BROKERS) {
    assertEquals(isValidBrokerType(broker), true, `Broker ${broker} deve ser válido`)
  }
  
  // Brokers inválidos
  assertEquals(isValidBrokerType('invalid_broker'), false)
  assertEquals(isValidBrokerType(''), false)
  assertEquals(isValidBrokerType('UAZAPI'), false) // Case sensitive
})

Deno.test('isValidJSON - Deve validar strings JSON', () => {
  // JSONs válidos
  assertEquals(isValidJSON('{}'), true)
  assertEquals(isValidJSON('{"key": "value"}'), true)
  assertEquals(isValidJSON('[]'), true)
  assertEquals(isValidJSON('{"nested": {"key": "value"}}'), true)
  
  // JSONs inválidos
  assertEquals(isValidJSON('invalid json'), false)
  assertEquals(isValidJSON('{key: value}'), false)
  assertEquals(isValidJSON(''), false)
  assertEquals(isValidJSON('not json'), false)
})

Deno.test('isAccountActive - Deve validar status de conta', () => {
  // Status ativo
  assertEquals(isAccountActive('active'), true)
  
  // Status inativos
  assertEquals(isAccountActive('inactive'), false)
  assertEquals(isAccountActive('pending'), false)
  assertEquals(isAccountActive('error'), false)
  assertEquals(isAccountActive(''), false)
})

Deno.test('SUPPORTED_BROKERS - Deve conter todos os brokers suportados', () => {
  const expectedBrokers = ['uazapi', 'gupshup', 'official_whatsapp', 'evolution']
  
  assertEquals(SUPPORTED_BROKERS.length, expectedBrokers.length)
  
  for (const broker of expectedBrokers) {
    assertEquals(SUPPORTED_BROKERS.includes(broker as typeof SUPPORTED_BROKERS[number]), true)
  }
})
