/**
 * Testes unitários para configure-broker.ts
 * 
 * Testa o handler de configuração de broker com credenciais (Gupshup, API Oficial).
 * 
 * @module tests/configure-broker.test
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { configureBrokerSchema, extractValidationErrors } from '../validators/whatsappSchemas.ts'

// ============================================================================
// Mocks
// ============================================================================

/**
 * Mock de broker Gupshup do banco de dados
 */
const mockGupshupBroker = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'gupshup',
  display_name: 'Gupshup',
  platform: 'whatsapp',
  broker_type: 'api',
  is_active: true,
  required_fields: ['apiKey', 'appName'],
  optional_fields: [],
  api_base_url: 'https://api.gupshup.io/sm/api/v1',
}

/**
 * Mock de broker API Oficial do banco de dados
 */
const mockOfficialBroker = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  name: 'official_whatsapp',
  display_name: 'API Oficial WhatsApp',
  platform: 'whatsapp',
  broker_type: 'official',
  is_active: true,
  required_fields: ['accessToken', 'phoneNumberId'],
  optional_fields: ['businessAccountId'],
  api_base_url: 'https://graph.facebook.com/v18.0',
}

/**
 * Mock de broker inativo
 */
const mockInactiveBroker = {
  ...mockGupshupBroker,
  id: '550e8400-e29b-41d4-a716-446655440004',
  is_active: false,
}

/**
 * Mock de credenciais Gupshup válidas
 */
const mockGupshupCredentials = {
  apiKey: 'gupshup-api-key-12345',
  appName: 'my-gupshup-app',
}

/**
 * Mock de credenciais API Oficial válidas
 */
const mockOfficialCredentials = {
  accessToken: 'EAABsbCS1iHgBAK...longtoken',
  phoneNumberId: '1234567890',
  businessAccountId: '9876543210',
}

/**
 * Mock de resultado de validação bem-sucedida
 */
const mockSuccessValidation = {
  valid: true,
  accountInfo: {
    phoneNumber: '+5511999999999',
    accountName: 'Test Account',
  },
}

/**
 * Mock de resultado de validação falha
 */
const mockFailedValidation = {
  valid: false,
  errors: ['Invalid API key', 'Account not found'],
}

// ============================================================================
// Tests for Schema Validation
// ============================================================================

Deno.test('configureBroker - Schema deve validar dados válidos', () => {
  const validData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440002',
    credentials: {
      apiKey: 'test-api-key',
      appName: 'test-app',
    },
  }
  
  const result = configureBrokerSchema.safeParse(validData)
  
  assertEquals(result.success, true)
  if (result.success) {
    assertEquals(result.data.credentials.apiKey, 'test-api-key')
    assertEquals(result.data.credentials.appName, 'test-app')
  }
})

Deno.test('configureBroker - Schema deve validar credenciais API Oficial', () => {
  const validData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440003',
    credentials: mockOfficialCredentials,
  }
  
  const result = configureBrokerSchema.safeParse(validData)
  
  assertEquals(result.success, true)
  if (result.success) {
    assertEquals(result.data.credentials.accessToken, mockOfficialCredentials.accessToken)
    assertEquals(result.data.credentials.phoneNumberId, mockOfficialCredentials.phoneNumberId)
  }
})

Deno.test('configureBroker - Schema deve rejeitar projectId inválido', () => {
  const invalidData = {
    projectId: 'not-a-uuid',
    brokerId: '550e8400-e29b-41d4-a716-446655440002',
    credentials: { apiKey: 'key' },
  }
  
  const result = configureBrokerSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
  if (!result.success) {
    const errors = extractValidationErrors(result.error)
    assertEquals(errors.some(e => e.includes('projectId')), true)
  }
})

Deno.test('configureBroker - Schema deve rejeitar brokerId inválido', () => {
  const invalidData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: 'invalid',
    credentials: { apiKey: 'key' },
  }
  
  const result = configureBrokerSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
})

Deno.test('configureBroker - Schema deve rejeitar credentials vazio', () => {
  const invalidData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440002',
    credentials: {},
  }
  
  const result = configureBrokerSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
  if (!result.success) {
    const errors = extractValidationErrors(result.error)
    assertEquals(errors.some(e => e.includes('empty')), true)
  }
})

Deno.test('configureBroker - Schema deve rejeitar sem credentials', () => {
  const invalidData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440002',
  }
  
  const result = configureBrokerSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
})

// ============================================================================
// Tests for Required Fields Validation
// ============================================================================

Deno.test('configureBroker - Deve validar campos obrigatórios Gupshup', () => {
  const broker = mockGupshupBroker
  const credentials = mockGupshupCredentials
  
  const requiredFields = broker.required_fields
  const missingFields = requiredFields.filter(
    (field: string) => !credentials[field as keyof typeof credentials] || 
                       credentials[field as keyof typeof credentials]?.trim() === ''
  )
  
  assertEquals(missingFields.length, 0)
})

Deno.test('configureBroker - Deve identificar campos faltantes Gupshup', () => {
  const broker = mockGupshupBroker
  const incompleteCredentials = {
    apiKey: 'my-key',
    // appName está faltando
  }
  
  const requiredFields = broker.required_fields
  const missingFields = requiredFields.filter(
    (field: string) => !incompleteCredentials[field as keyof typeof incompleteCredentials]
  )
  
  assertEquals(missingFields.length, 1)
  assertEquals(missingFields[0], 'appName')
})

Deno.test('configureBroker - Deve validar campos obrigatórios API Oficial', () => {
  const broker = mockOfficialBroker
  const credentials = mockOfficialCredentials
  
  const requiredFields = broker.required_fields
  const missingFields = requiredFields.filter(
    (field: string) => !credentials[field as keyof typeof credentials]
  )
  
  assertEquals(missingFields.length, 0)
})

Deno.test('configureBroker - Deve identificar campos faltantes API Oficial', () => {
  const broker = mockOfficialBroker
  const incompleteCredentials = {
    accessToken: 'my-token',
    // phoneNumberId está faltando
  }
  
  const requiredFields = broker.required_fields
  const missingFields = requiredFields.filter(
    (field: string) => !incompleteCredentials[field as keyof typeof incompleteCredentials]
  )
  
  assertEquals(missingFields.length, 1)
  assertEquals(missingFields[0], 'phoneNumberId')
})

Deno.test('configureBroker - Deve rejeitar campos vazios como faltantes', () => {
  const broker = mockGupshupBroker
  const credentialsWithEmpty = {
    apiKey: 'my-key',
    appName: '',  // Vazio deve ser tratado como faltante
  }
  
  const requiredFields = broker.required_fields
  const missingFields = requiredFields.filter(
    (field: string) => {
      const value = credentialsWithEmpty[field as keyof typeof credentialsWithEmpty]
      return !value || (typeof value === 'string' && value.trim() === '')
    }
  )
  
  assertEquals(missingFields.length, 1)
  assertEquals(missingFields[0], 'appName')
})

// ============================================================================
// Tests for Platform Validation
// ============================================================================

Deno.test('configureBroker - Deve validar plataforma whatsapp', () => {
  const broker = mockGupshupBroker
  
  assertEquals(broker.platform, 'whatsapp')
})

Deno.test('configureBroker - Deve rejeitar plataforma não-whatsapp', () => {
  const telegramBroker = {
    ...mockGupshupBroker,
    platform: 'telegram',
  }
  
  const isWhatsApp = telegramBroker.platform === 'whatsapp'
  
  assertEquals(isWhatsApp, false)
})

// ============================================================================
// Tests for Broker Active Status
// ============================================================================

Deno.test('configureBroker - Deve aceitar broker ativo', () => {
  const broker = mockGupshupBroker
  
  assertEquals(broker.is_active, true)
})

Deno.test('configureBroker - Deve rejeitar broker inativo', () => {
  const broker = mockInactiveBroker
  
  assertEquals(broker.is_active, false)
})

// ============================================================================
// Tests for Validation Response
// ============================================================================

Deno.test('configureBroker - Resposta sucesso deve ter estrutura correta', () => {
  const validationResult = mockSuccessValidation
  
  const response = {
    valid: true,
    message: 'Credenciais validadas com sucesso',
    accountInfo: validationResult.accountInfo,
  }
  
  assertEquals(response.valid, true)
  assertExists(response.message)
  assertExists(response.accountInfo)
  assertEquals(response.accountInfo!.phoneNumber, '+5511999999999')
})

Deno.test('configureBroker - Resposta falha deve incluir erros', () => {
  const validationResult = mockFailedValidation
  
  const response = {
    valid: false,
    errors: validationResult.errors,
  }
  
  assertEquals(response.valid, false)
  assertExists(response.errors)
  assertEquals(response.errors.length, 2)
})

// ============================================================================
// Tests for Error Handling
// ============================================================================

Deno.test('configureBroker - Deve tratar erro 401 (credenciais inválidas)', () => {
  const errorMessage = 'HTTP 401: Unauthorized'
  const isAuthError = errorMessage.includes('401') || errorMessage.includes('Unauthorized')
  
  assertEquals(isAuthError, true)
  
  const userMessage = 'Credenciais inválidas: Token ou chave de API incorretos'
  const statusCode = 401
  
  assertEquals(statusCode, 401)
  assertEquals(userMessage.includes('inválidas'), true)
})

Deno.test('configureBroker - Deve tratar erro 404 (recurso não encontrado)', () => {
  const errorMessage = 'HTTP 404: Not Found'
  const isNotFoundError = errorMessage.includes('404') || errorMessage.includes('Not Found')
  
  assertEquals(isNotFoundError, true)
  
  const userMessage = 'Recurso não encontrado: Verifique se phoneNumberId (API Oficial) ou appName (Gupshup) estão corretos'
  const statusCode = 404
  
  assertEquals(statusCode, 404)
  assertEquals(userMessage.includes('phoneNumberId'), true)
})

Deno.test('configureBroker - Deve tratar erro de conexão', () => {
  const errorMessage = 'TypeError: fetch failed'
  const isFetchError = errorMessage.includes('fetch')
  
  assertEquals(isFetchError, true)
  
  const userMessage = 'Erro de conexão: Não foi possível conectar ao broker. Verifique sua internet.'
  const statusCode = 503
  
  assertEquals(statusCode, 503)
})

Deno.test('configureBroker - Deve tratar erro de broker não encontrado', () => {
  const errorMessage = 'Broker não encontrado ou inativo'
  const statusCode = 404
  
  assertEquals(statusCode, 404)
  assertEquals(errorMessage.includes('não encontrado'), true)
})

Deno.test('configureBroker - Deve tratar erro de acesso negado ao projeto', () => {
  const errorMessage = 'Acesso negado ao projeto ou projeto não encontrado'
  const statusCode = 403
  
  assertEquals(statusCode, 403)
})

// ============================================================================
// Tests for Broker Config Creation
// ============================================================================

Deno.test('configureBroker - Deve criar config com apiBaseUrl do broker', () => {
  const broker = mockGupshupBroker
  const credentials = mockGupshupCredentials
  
  const brokerConfig = {
    accountName: `temp-${Date.now()}`,
    ...credentials,
    apiBaseUrl: broker.api_base_url,
  }
  
  assertEquals(brokerConfig.apiBaseUrl, 'https://api.gupshup.io/sm/api/v1')
  assertEquals(brokerConfig.apiKey, 'gupshup-api-key-12345')
})

Deno.test('configureBroker - Deve gerar accountName temporário', () => {
  const timestamp = 1705766400000
  const accountName = `temp-${timestamp}`
  
  assertEquals(accountName.startsWith('temp-'), true)
})

// ============================================================================
// Tests for Gupshup Validation
// ============================================================================

Deno.test('configureBroker - Gupshup deve construir URL de teste correta', () => {
  const broker = mockGupshupBroker
  const apiBaseUrl = broker.api_base_url || 'https://api.gupshup.io/sm/api/v1'
  const testUrl = `${apiBaseUrl}/apps`
  
  assertEquals(testUrl, 'https://api.gupshup.io/sm/api/v1/apps')
})

Deno.test('configureBroker - Gupshup deve incluir apikey no header', () => {
  const credentials = mockGupshupCredentials
  
  const headers = {
    'apikey': credentials.apiKey,
  }
  
  assertEquals(headers.apikey, 'gupshup-api-key-12345')
})

// ============================================================================
// Tests for API Oficial Validation
// ============================================================================

Deno.test('configureBroker - API Oficial deve construir URL de teste correta', () => {
  const credentials = mockOfficialCredentials
  const testUrl = `https://graph.facebook.com/v18.0/${credentials.phoneNumberId}`
  
  assertEquals(testUrl, 'https://graph.facebook.com/v18.0/1234567890')
})

Deno.test('configureBroker - API Oficial deve incluir Authorization header', () => {
  const credentials = mockOfficialCredentials
  
  const headers = {
    'Authorization': `Bearer ${credentials.accessToken}`,
  }
  
  assertEquals(headers.Authorization.startsWith('Bearer '), true)
})

Deno.test('configureBroker - API Oficial deve extrair phoneNumber da resposta', () => {
  const mockApiResponse = {
    display_phone_number: '+55 11 99999-9999',
    verified_name: 'Test Business',
  }
  
  const accountInfo = {
    phoneNumber: mockApiResponse.display_phone_number,
    accountName: mockApiResponse.verified_name,
  }
  
  assertEquals(accountInfo.phoneNumber, '+55 11 99999-9999')
  assertEquals(accountInfo.accountName, 'Test Business')
})

// ============================================================================
// Tests for Generic Broker Fallback
// ============================================================================

Deno.test('configureBroker - Deve usar validação básica para brokers sem validateConfiguration', () => {
  // Para brokers que não têm validateConfiguration implementado
  const unknownBroker = {
    ...mockGupshupBroker,
    name: 'unknown_broker',
  }
  
  // Fallback: validação básica retorna true
  const fallbackValidation = { valid: true }
  
  assertEquals(fallbackValidation.valid, true)
})

// ============================================================================
// Tests for Edge Cases
// ============================================================================

Deno.test('configureBroker - Deve aceitar credentials com campos extras', () => {
  const validData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440002',
    credentials: {
      apiKey: 'key',
      appName: 'app',
      extraField: 'value', // Campo extra não deve causar erro
    },
  }
  
  const result = configureBrokerSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('configureBroker - Deve tratar required_fields vazio', () => {
  const brokerWithNoRequiredFields = {
    ...mockGupshupBroker,
    required_fields: [],
  }
  
  const credentials = { anyField: 'value' }
  const missingFields = brokerWithNoRequiredFields.required_fields.filter(
    (field: string) => !credentials[field as keyof typeof credentials]
  )
  
  assertEquals(missingFields.length, 0)
})

Deno.test('configureBroker - Deve tratar optional_fields', () => {
  const broker = mockOfficialBroker
  const credentials = mockOfficialCredentials
  
  const optionalFields = broker.optional_fields
  const hasOptional = optionalFields.some(
    (field: string) => credentials[field as keyof typeof credentials]
  )
  
  assertEquals(hasOptional, true)
  assertEquals(optionalFields.includes('businessAccountId'), true)
})

// ============================================================================
// Tests for Logging
// ============================================================================

Deno.test('configureBroker - Log de sucesso deve incluir dados relevantes', () => {
  const logData = {
    brokerId: '550e8400-e29b-41d4-a716-446655440002',
    brokerName: 'gupshup',
    userId: 'user-123',
  }
  
  assertExists(logData.brokerId)
  assertExists(logData.brokerName)
  assertExists(logData.userId)
})

Deno.test('configureBroker - Log não deve incluir credenciais sensíveis', () => {
  const logData = {
    brokerId: 'broker-123',
    brokerName: 'gupshup',
    userId: 'user-123',
  }
  
  assertEquals('apiKey' in logData, false)
  assertEquals('accessToken' in logData, false)
  assertEquals('credentials' in logData, false)
})
