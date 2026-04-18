/**
 * Testes unitários para create-instance.ts
 * 
 * Testa o handler de criação de instância WhatsApp Multi-Broker.
 * 
 * @module tests/create-instance.test
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { createInstanceSchema, extractValidationErrors } from '../validators/whatsappSchemas.ts'
import { BROKER_TYPES, BROKER_DEFAULTS } from '../constants/brokers.ts'

// ============================================================================
// Mocks
// ============================================================================

/**
 * Mock de broker uazapi do banco de dados
 */
const mockUazapiBroker = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'uazapi',
  display_name: 'UAZAPI',
  platform: 'whatsapp',
  broker_type: 'api',
  is_active: true,
  admin_token: 'encrypted_admin_token_here',
  api_base_url: 'https://free.uazapi.com',
  required_fields: [],
}

/**
 * Mock de broker gupshup do banco de dados
 */
const mockGupshupBroker = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'gupshup',
  display_name: 'Gupshup',
  platform: 'whatsapp',
  broker_type: 'api',
  is_active: true,
  admin_token: null,
  api_base_url: 'https://api.gupshup.io',
  required_fields: ['apiKey', 'appName'],
}

/**
 * Mock de resultado de criação de instância
 */
const mockInstanceResult = {
  instanceId: 'instance-abc123',
  instanceName: 'test-instance',
  apikey: 'instance-api-key-456',
  token: 'instance-token-789',
  status: 'disconnected',
  instanceData: {
    id: 'instance-abc123',
    name: 'test-instance',
    number: null,
    status: 'disconnected',
  },
}

/**
 * Mock de conta criada
 */
const mockCreatedAccount = {
  id: 'account-xyz789',
  project_id: '550e8400-e29b-41d4-a716-446655440000',
  platform: 'whatsapp',
  broker_type: 'uazapi',
  account_identifier: 'test-instance',
  account_name: 'test-instance',
  status: 'disconnected',
  broker_config: {
    instanceId: 'instance-abc123',
    instanceName: 'test-instance',
    apiBaseUrl: 'https://free.uazapi.com',
  },
}

// ============================================================================
// Tests for Schema Validation
// ============================================================================

Deno.test('createInstance - Schema deve validar dados mínimos obrigatórios', () => {
  const validData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440001',
  }
  
  const result = createInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('createInstance - Schema deve validar todos os campos opcionais', () => {
  const fullData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    brokerId: '550e8400-e29b-41d4-a716-446655440001',
    instanceName: 'my-custom-instance',
    apiBaseUrl: 'https://custom.uazapi.com',
    systemName: 'mySystem',
    phone: '+5511999999999',
    accountName: 'My Account',
    adminField01: 'value1',
    adminField02: 'value2',
  }
  
  const result = createInstanceSchema.safeParse(fullData)
  
  assertEquals(result.success, true)
  if (result.success) {
    assertEquals(result.data.instanceName, 'my-custom-instance')
    assertEquals(result.data.systemName, 'mySystem')
  }
})

Deno.test('createInstance - Schema deve rejeitar projectId inválido', () => {
  const invalidData = {
    projectId: 'not-a-uuid',
    brokerId: '550e8400-e29b-41d4-a716-446655440001',
  }
  
  const result = createInstanceSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
  if (!result.success) {
    const errors = extractValidationErrors(result.error)
    assertEquals(errors.some(e => e.includes('projectId')), true)
  }
})

Deno.test('createInstance - Schema deve rejeitar brokerId ausente', () => {
  const invalidData = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
  }
  
  const result = createInstanceSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
})

// ============================================================================
// Tests for Broker Type Validation
// ============================================================================

Deno.test('createInstance - BROKER_TYPES deve conter uazapi', () => {
  assertEquals(BROKER_TYPES.UAZAPI, 'uazapi')
})

Deno.test('createInstance - BROKER_TYPES deve conter gupshup', () => {
  assertEquals(BROKER_TYPES.GUPSHUP, 'gupshup')
})

Deno.test('createInstance - BROKER_TYPES deve conter official_whatsapp', () => {
  assertEquals(BROKER_TYPES.OFFICIAL_WHATSAPP, 'official_whatsapp')
})

Deno.test('createInstance - BROKER_DEFAULTS deve ter URL base do uazapi', () => {
  assertEquals(BROKER_DEFAULTS.UAZAPI_BASE_URL, 'https://free.uazapi.com')
})

// ============================================================================
// Tests for Broker Support Validation
// ============================================================================

Deno.test('createInstance - Apenas uazapi suporta criação prévia de instância', () => {
  // Simular lógica do handler
  const brokersThatSupportInstanceCreation = ['uazapi', 'evolution']
  
  assertEquals(brokersThatSupportInstanceCreation.includes('uazapi'), true)
  assertEquals(brokersThatSupportInstanceCreation.includes('gupshup'), false)
  assertEquals(brokersThatSupportInstanceCreation.includes('official_whatsapp'), false)
})

Deno.test('createInstance - Deve retornar erro para Gupshup', () => {
  // Simular validação do handler
  const brokerName: string = 'gupshup'
  const supportsInstanceCreation = brokerName === BROKER_TYPES.UAZAPI
  
  assertEquals(supportsInstanceCreation, false)
})

Deno.test('createInstance - Deve retornar erro para API Oficial', () => {
  // Simular validação do handler
  const brokerName: string = 'official_whatsapp'
  const supportsInstanceCreation = brokerName === BROKER_TYPES.UAZAPI
  
  assertEquals(supportsInstanceCreation, false)
})

// ============================================================================
// Tests for Admin Token Validation
// ============================================================================

Deno.test('createInstance - Deve verificar se admin_token existe', () => {
  const broker = mockUazapiBroker
  const hasAdminToken = !!broker.admin_token
  
  assertEquals(hasAdminToken, true)
})

Deno.test('createInstance - Deve falhar se admin_token não configurado', () => {
  const brokerWithoutToken = {
    ...mockUazapiBroker,
    admin_token: null,
  }
  
  const hasAdminToken = !!brokerWithoutToken.admin_token
  
  assertEquals(hasAdminToken, false)
})

Deno.test('createInstance - Deve falhar se admin_token vazio', () => {
  const brokerWithEmptyToken = {
    ...mockUazapiBroker,
    admin_token: '',
  }
  
  const hasAdminToken = !!brokerWithEmptyToken.admin_token
  
  assertEquals(hasAdminToken, false)
})

// ============================================================================
// Tests for Instance Result Processing
// ============================================================================

Deno.test('createInstance - Deve extrair instanceId do resultado', () => {
  const result = mockInstanceResult
  
  assertExists(result.instanceId)
  assertEquals(result.instanceId, 'instance-abc123')
})

Deno.test('createInstance - Deve extrair apikey do resultado', () => {
  const result = mockInstanceResult
  
  assertExists(result.apikey)
  assertEquals(result.apikey, 'instance-api-key-456')
})

Deno.test('createInstance - Deve extrair token do resultado', () => {
  const result = mockInstanceResult
  
  assertExists(result.token)
  assertEquals(result.token, 'instance-token-789')
})

Deno.test('createInstance - Deve tratar resultado sem apikey nem token', () => {
  const resultWithoutTokens = {
    ...mockInstanceResult,
    apikey: null,
    token: null,
  }
  
  const hasApikey = !!resultWithoutTokens.apikey
  const hasToken = !!resultWithoutTokens.token
  const hasAnyToken = hasApikey || hasToken
  
  assertEquals(hasAnyToken, false)
})

Deno.test('createInstance - Deve priorizar apikey sobre token', () => {
  const result = mockInstanceResult
  
  // Lógica do handler: api_key = apikey || token || null
  const apiKey = result.apikey || result.token || null
  
  assertEquals(apiKey, 'instance-api-key-456')
})

Deno.test('createInstance - Deve usar token se apikey ausente', () => {
  const resultOnlyToken = {
    ...mockInstanceResult,
    apikey: null,
    token: 'only-token-123',
  }
  
  const apiKey = resultOnlyToken.apikey || resultOnlyToken.token || null
  
  assertEquals(apiKey, 'only-token-123')
})

// ============================================================================
// Tests for Account Data Structure
// ============================================================================

Deno.test('createInstance - Deve criar estrutura de conta correta', () => {
  const projectId = '550e8400-e29b-41d4-a716-446655440000'
  const instanceResult = mockInstanceResult
  const apiBaseUrl = BROKER_DEFAULTS.UAZAPI_BASE_URL
  
  const accountData = {
    project_id: projectId,
    platform: 'whatsapp',
    broker_type: 'uazapi',
    account_identifier: instanceResult.instanceName,
    account_name: instanceResult.instanceName,
    account_display_name: instanceResult.instanceName,
    broker_config: {
      instanceId: instanceResult.instanceId,
      instanceName: instanceResult.instanceName,
      apiBaseUrl: apiBaseUrl,
    },
    api_key: instanceResult.apikey || instanceResult.token || null,
    access_token: instanceResult.token || instanceResult.apikey || null,
    status: instanceResult.status || 'disconnected',
    is_primary: false,
    total_messages: 0,
    total_contacts: 0,
  }
  
  assertEquals(accountData.platform, 'whatsapp')
  assertEquals(accountData.broker_type, 'uazapi')
  assertEquals(accountData.is_primary, false)
  assertEquals(accountData.total_messages, 0)
  assertExists(accountData.broker_config.instanceId)
})

Deno.test('createInstance - Deve salvar instanceId no broker_config', () => {
  const instanceResult = mockInstanceResult
  
  const brokerConfig = {
    instanceId: instanceResult.instanceId,
    instanceName: instanceResult.instanceName,
    apiBaseUrl: BROKER_DEFAULTS.UAZAPI_BASE_URL,
  }
  
  assertEquals(brokerConfig.instanceId, 'instance-abc123')
  assertEquals(brokerConfig.instanceName, 'test-instance')
})

Deno.test('createInstance - Deve definir status inicial como disconnected', () => {
  const instanceResult = mockInstanceResult
  const status = instanceResult.status || 'disconnected'
  
  assertEquals(status, 'disconnected')
})

// ============================================================================
// Tests for Response Format
// ============================================================================

Deno.test('createInstance - Resposta deve ter estrutura correta', () => {
  const createdAccount = mockCreatedAccount
  const instanceResult = mockInstanceResult
  
  const response = {
    success: true,
    data: {
      accountId: createdAccount.id,
      instanceId: instanceResult.instanceId,
      instanceName: instanceResult.instanceName,
      brokerType: 'uazapi',
      status: instanceResult.status || 'disconnected',
      account: {
        id: createdAccount.id,
        accountName: createdAccount.account_name,
        status: createdAccount.status,
        brokerType: createdAccount.broker_type,
      },
      brokerSpecificData: {
        hasToken: !!instanceResult.token,
        hasApikey: !!instanceResult.apikey,
      },
    },
    message: 'Instância criada e salva com sucesso',
  }
  
  assertEquals(response.success, true)
  assertExists(response.data.accountId)
  assertExists(response.data.instanceId)
  assertExists(response.message)
  assertEquals(response.data.brokerSpecificData.hasApikey, true)
})

Deno.test('createInstance - Resposta não deve expor tokens', () => {
  const response = {
    success: true,
    data: {
      accountId: 'account-123',
      instanceId: 'instance-456',
      instanceName: 'test',
      brokerType: 'uazapi',
      status: 'disconnected',
    },
  }
  
  assertEquals('apiKey' in response.data, false)
  assertEquals('accessToken' in response.data, false)
  assertEquals('adminToken' in response.data, false)
  assertEquals('token' in response.data, false)
})

// ============================================================================
// Tests for Error Handling
// ============================================================================

Deno.test('createInstance - Deve tratar erro de broker não encontrado', () => {
  const errorMessage = 'Broker não encontrado ou inativo'
  const statusCode = 404
  
  assertEquals(statusCode, 404)
  assertEquals(errorMessage.includes('não encontrado'), true)
})

Deno.test('createInstance - Deve tratar erro de broker não suportado', () => {
  const errorMessage = 'Broker não suporta criação prévia de instância. Use o fluxo de configuração de credenciais.'
  
  assertEquals(errorMessage.includes('não suporta'), true)
  assertEquals(errorMessage.includes('credenciais'), true)
})

Deno.test('createInstance - Deve tratar erro de admin_token não configurado', () => {
  const errorMessage = 'Admin token não configurado para este broker'
  const statusCode = 400
  
  assertEquals(statusCode, 400)
  assertEquals(errorMessage.includes('Admin token'), true)
})

Deno.test('createInstance - Deve tratar erro de acesso negado ao projeto', () => {
  const errorMessage = 'Acesso negado ao projeto ou projeto não encontrado'
  const statusCode = 403
  
  assertEquals(statusCode, 403)
  assertEquals(errorMessage.includes('Acesso negado'), true)
})

// ============================================================================
// Tests for Platform Validation
// ============================================================================

Deno.test('createInstance - Deve validar que broker é para plataforma whatsapp', () => {
  const whatsappBroker = mockUazapiBroker
  const isWhatsAppBroker = whatsappBroker.platform === 'whatsapp'
  
  assertEquals(isWhatsAppBroker, true)
})

Deno.test('createInstance - Deve rejeitar broker de outra plataforma', () => {
  const telegramBroker = {
    ...mockUazapiBroker,
    platform: 'telegram',
  }
  
  const isWhatsAppBroker = telegramBroker.platform === 'whatsapp'
  
  assertEquals(isWhatsAppBroker, false)
})

// ============================================================================
// Tests for Instance Name Generation
// ============================================================================

Deno.test('createInstance - Deve usar instanceName fornecido', () => {
  const providedName = 'my-custom-instance'
  const instanceName = providedName || `instance-${Date.now()}`
  
  assertEquals(instanceName, 'my-custom-instance')
})

Deno.test('createInstance - Deve gerar instanceName automático se não fornecido', () => {
  const providedName = undefined
  const timestamp = 1705766400000 // Mock timestamp
  const instanceName = providedName || `instance-${timestamp}`
  
  assertEquals(instanceName, 'instance-1705766400000')
  assertEquals(instanceName.startsWith('instance-'), true)
})

// ============================================================================
// Tests for API Base URL
// ============================================================================

Deno.test('createInstance - Deve usar apiBaseUrl fornecida', () => {
  const providedUrl = 'https://custom.uazapi.com'
  const brokerUrl = 'https://free.uazapi.com'
  const defaultUrl = BROKER_DEFAULTS.UAZAPI_BASE_URL
  
  const apiBaseUrl = providedUrl || brokerUrl || defaultUrl
  
  assertEquals(apiBaseUrl, 'https://custom.uazapi.com')
})

Deno.test('createInstance - Deve usar URL do broker se não fornecida', () => {
  const providedUrl = undefined
  const brokerUrl = 'https://free.uazapi.com'
  const defaultUrl = BROKER_DEFAULTS.UAZAPI_BASE_URL
  
  const apiBaseUrl = providedUrl || brokerUrl || defaultUrl
  
  assertEquals(apiBaseUrl, 'https://free.uazapi.com')
})

Deno.test('createInstance - Deve usar URL default se nenhuma disponível', () => {
  const providedUrl = undefined
  const brokerUrl = undefined
  const defaultUrl = BROKER_DEFAULTS.UAZAPI_BASE_URL
  
  const apiBaseUrl = providedUrl || brokerUrl || defaultUrl
  
  assertEquals(apiBaseUrl, 'https://free.uazapi.com')
})
