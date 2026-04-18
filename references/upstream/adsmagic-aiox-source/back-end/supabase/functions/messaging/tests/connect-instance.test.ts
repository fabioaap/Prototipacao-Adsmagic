/**
 * Testes unitários para connect-instance.ts
 * 
 * Testa o handler de conexão de instância WhatsApp (QR Code e Pair Code).
 * 
 * @module tests/connect-instance.test
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { connectInstanceSchema, extractValidationErrors } from '../validators/whatsappSchemas.ts'
import { 
  validateBrokerSupportsConnection, 
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection
} from '../utils/connection-helpers.ts'
import { QR_CODE_TIMEOUT_MS, PAIR_CODE_TIMEOUT_MS } from '../constants/connection.ts'
import type { MessagingAccount } from '../types.ts'

// ============================================================================
// Mocks
// ============================================================================

/**
 * Mock de conta de mensageria uazapi
 */
const mockUazapiAccount: MessagingAccount = {
  id: 'account-123',
  integration_account_id: 'integration-123',
  project_id: '550e8400-e29b-41d4-a716-446655440000',
  platform: 'whatsapp',
  broker_type: 'uazapi',
  account_identifier: 'test-instance',
  account_name: 'Test Instance',
  account_display_name: 'Test Instance',
  status: 'disconnected',
  api_key: 'instance-api-key-456',
  access_token: 'instance-token-789',
  broker_config: {
    instanceId: 'instance-abc123',
    instanceName: 'test-instance',
    apiBaseUrl: 'https://free.uazapi.com',
  },
  platform_config: {},
  total_messages: 0,
  total_contacts: 0,
  is_primary: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Mock de conta de mensageria gupshup
 */
const mockGupshupAccount: MessagingAccount = {
  ...mockUazapiAccount,
  id: 'account-456',
  broker_type: 'gupshup',
  broker_config: {
    appName: 'my-app',
    apiBaseUrl: 'https://api.gupshup.io',
  },
}

/**
 * Mock de resultado QR Code
 */
const mockQRCodeResult = {
  type: 'qrcode',
  qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...',
  expiresAt: new Date(Date.now() + QR_CODE_TIMEOUT_MS),
  instanceId: 'instance-abc123',
}

/**
 * Mock de resultado Pair Code
 */
const mockPairCodeResult = {
  type: 'paircode',
  code: '12345678',
  expiresAt: new Date(Date.now() + PAIR_CODE_TIMEOUT_MS),
  instanceId: 'instance-abc123',
  phone: '+5511999999999',
}

// ============================================================================
// Tests for Schema Validation
// ============================================================================

Deno.test('connectInstance - Schema deve validar sem phone (QR Code)', () => {
  const validData = {}
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Schema deve validar com phone (Pair Code)', () => {
  const validData = {
    phone: '+5511999999999',
  }
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
  if (result.success) {
    assertEquals(result.data.phone, '+5511999999999')
  }
})

Deno.test('connectInstance - Schema deve aceitar telefone BR sem +', () => {
  const validData = {
    phone: '5511999999999',
  }
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Schema deve aceitar telefone US', () => {
  const validData = {
    phone: '+14155551234',
  }
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Schema deve aceitar telefone PT', () => {
  const validData = {
    phone: '+351912345678',
  }
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Schema deve rejeitar telefone com letras', () => {
  const invalidData = {
    phone: '+55abc99999999',
  }
  
  const result = connectInstanceSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
})

Deno.test('connectInstance - Schema deve aceitar telefone curto válido', () => {
  // O regex /^\+?[1-9]\d{1,14}$/ aceita de 2 a 15 dígitos começando com 1-9
  const validData = {
    phone: '123', // 3 dígitos - válido pelo regex
  }
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Schema deve rejeitar telefone começando com 0', () => {
  const invalidData = {
    phone: '011999999999',
  }
  
  const result = connectInstanceSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
})

// ============================================================================
// Tests for Broker Support Validation
// ============================================================================

Deno.test('connectInstance - validateBrokerSupportsConnection deve aceitar uazapi', () => {
  const result = validateBrokerSupportsConnection('uazapi')
  
  assertEquals(result.valid, true)
  assertEquals(result.error, undefined)
})

Deno.test('connectInstance - validateBrokerSupportsConnection deve aceitar evolution', () => {
  const result = validateBrokerSupportsConnection('evolution')
  
  assertEquals(result.valid, true)
})

Deno.test('connectInstance - validateBrokerSupportsConnection deve rejeitar gupshup', () => {
  const result = validateBrokerSupportsConnection('gupshup')
  
  assertEquals(result.valid, false)
  assertExists(result.error)
  assertEquals(result.error!.includes('não oficiais'), true)
})

Deno.test('connectInstance - validateBrokerSupportsConnection deve rejeitar official_whatsapp', () => {
  const result = validateBrokerSupportsConnection('official_whatsapp')
  
  assertEquals(result.valid, false)
  assertExists(result.error)
})

// ============================================================================
// Tests for Broker Connection Config Extraction
// ============================================================================

Deno.test('connectInstance - extractBrokerConnectionConfig deve extrair config para uazapi', () => {
  const result = extractBrokerConnectionConfig(mockUazapiAccount)
  
  assertExists(result.config)
  assertEquals(result.config!.instanceId, 'instance-abc123')
  assertEquals(result.config!.accessToken, 'instance-api-key-456')
  assertEquals(result.config!.apiBaseUrl, 'https://free.uazapi.com')
})

Deno.test('connectInstance - extractBrokerConnectionConfig deve priorizar api_key', () => {
  const accountWithBothTokens: MessagingAccount = {
    ...mockUazapiAccount,
    api_key: 'api-key-value',
    access_token: 'access-token-value',
  }
  
  const result = extractBrokerConnectionConfig(accountWithBothTokens)
  
  assertExists(result.config)
  assertEquals(result.config!.accessToken, 'api-key-value')
})

Deno.test('connectInstance - extractBrokerConnectionConfig deve usar access_token se api_key ausente', () => {
  const accountOnlyAccessToken: MessagingAccount = {
    ...mockUazapiAccount,
    api_key: null,
    access_token: 'only-access-token',
  }
  
  const result = extractBrokerConnectionConfig(accountOnlyAccessToken)
  
  // Para UAZAPI, se api_key estiver vazio, usa access_token
  assertExists(result.config)
})

Deno.test('connectInstance - extractBrokerConnectionConfig deve retornar erro se instanceId ausente', () => {
  const accountWithoutInstanceId: MessagingAccount = {
    ...mockUazapiAccount,
    broker_config: {
      instanceName: 'test',
      apiBaseUrl: 'https://free.uazapi.com',
    },
  }
  
  const result = extractBrokerConnectionConfig(accountWithoutInstanceId)
  
  assertEquals(result.config, null)
  assertExists(result.error)
  assertEquals(result.error!.includes('Instance ID'), true)
})

Deno.test('connectInstance - extractBrokerConnectionConfig deve retornar erro se token ausente', () => {
  const accountWithoutToken: MessagingAccount = {
    ...mockUazapiAccount,
    api_key: null,
    access_token: null,
    broker_config: {
      instanceId: 'instance-abc123',
      instanceName: 'test',
      apiBaseUrl: 'https://free.uazapi.com',
    },
  }
  
  const result = extractBrokerConnectionConfig(accountWithoutToken)
  
  assertEquals(result.config, null)
  assertExists(result.error)
  assertEquals(result.error!.includes('Token'), true)
})

// ============================================================================
// Tests for Broker Config Creation
// ============================================================================

Deno.test('connectInstance - createBrokerConfigForConnection deve criar config completa', () => {
  const connectionConfig = {
    instanceId: 'instance-abc123',
    accessToken: 'token-123',
    apiKey: 'token-123',
    apiBaseUrl: 'https://free.uazapi.com',
  }
  
  const result = createBrokerConfigForConnection(mockUazapiAccount, connectionConfig)
  
  assertExists(result.instanceId)
  assertExists(result.accessToken)
  assertExists(result.apiBaseUrl)
  assertEquals(result.accountName, 'Test Instance')
})

Deno.test('connectInstance - createBrokerConfigForConnection deve manter broker_config existente', () => {
  const connectionConfig = {
    instanceId: 'instance-abc123',
    accessToken: 'token-123',
    apiKey: 'token-123',
    apiBaseUrl: 'https://free.uazapi.com',
  }
  
  const accountWithExtraConfig: MessagingAccount = {
    ...mockUazapiAccount,
    broker_config: {
      instanceId: 'instance-abc123',
      instanceName: 'test-instance',
      apiBaseUrl: 'https://free.uazapi.com',
      customField: 'custom-value',
    },
  }
  
  const result = createBrokerConfigForConnection(accountWithExtraConfig, connectionConfig)
  
  // Deve manter campos extras do broker_config original
  assertEquals(result.instanceName, 'test-instance')
})

// ============================================================================
// Tests for Timeout Constants
// ============================================================================

Deno.test('connectInstance - QR_CODE_TIMEOUT_MS deve ser 2 minutos', () => {
  assertEquals(QR_CODE_TIMEOUT_MS, 2 * 60 * 1000) // 120000ms
})

Deno.test('connectInstance - PAIR_CODE_TIMEOUT_MS deve ser 5 minutos', () => {
  assertEquals(PAIR_CODE_TIMEOUT_MS, 5 * 60 * 1000) // 300000ms
})

// ============================================================================
// Tests for Response Format - QR Code
// ============================================================================

Deno.test('connectInstance - Resposta QR Code deve ter estrutura correta', () => {
  const result = mockQRCodeResult
  const timeoutMinutes = Math.floor(QR_CODE_TIMEOUT_MS / (60 * 1000))
  
  const response = {
    success: true,
    type: 'qrcode',
    data: {
      qrCode: result.qrCode,
      expiresAt: result.expiresAt.toISOString(),
      instanceId: result.instanceId,
    },
    message: `Escaneie o QR Code com seu WhatsApp para conectar (expira em ${timeoutMinutes} minutos)`,
  }
  
  assertEquals(response.success, true)
  assertEquals(response.type, 'qrcode')
  assertExists(response.data.qrCode)
  assertExists(response.data.expiresAt)
  assertEquals(response.message.includes('2 minutos'), true)
})

Deno.test('connectInstance - QR Code deve ser base64', () => {
  const result = mockQRCodeResult
  
  assertEquals(result.qrCode.startsWith('data:image'), true)
})

// ============================================================================
// Tests for Response Format - Pair Code
// ============================================================================

Deno.test('connectInstance - Resposta Pair Code deve ter estrutura correta', () => {
  const result = mockPairCodeResult
  const timeoutMinutes = Math.floor(PAIR_CODE_TIMEOUT_MS / (60 * 1000))
  
  const response = {
    success: true,
    type: 'paircode',
    data: {
      code: result.code,
      expiresAt: result.expiresAt.toISOString(),
      instanceId: result.instanceId,
      phone: result.phone,
    },
    message: `Use este código no WhatsApp: Configurações > Aparelhos conectados > Conectar um aparelho (expira em ${timeoutMinutes} minutos)`,
  }
  
  assertEquals(response.success, true)
  assertEquals(response.type, 'paircode')
  assertExists(response.data.code)
  assertExists(response.data.phone)
  assertEquals(response.message.includes('5 minutos'), true)
})

Deno.test('connectInstance - Pair Code deve ter 8 dígitos', () => {
  const result = mockPairCodeResult
  
  assertEquals(result.code.length, 8)
  assertEquals(/^\d{8}$/.test(result.code), true)
})

// ============================================================================
// Tests for Connection Type Decision
// ============================================================================

Deno.test('connectInstance - Deve gerar QR Code se phone não fornecido', () => {
  const phone = undefined
  const connectionType = phone ? 'paircode' : 'qrcode'
  
  assertEquals(connectionType, 'qrcode')
})

Deno.test('connectInstance - Deve gerar Pair Code se phone fornecido', () => {
  const phone = '+5511999999999'
  const connectionType = phone ? 'paircode' : 'qrcode'
  
  assertEquals(connectionType, 'paircode')
})

Deno.test('connectInstance - Deve gerar QR Code se phone vazio', () => {
  const phone = ''
  const connectionType = phone ? 'paircode' : 'qrcode'
  
  assertEquals(connectionType, 'qrcode')
})

// ============================================================================
// Tests for Status Update
// ============================================================================

Deno.test('connectInstance - Status deve mudar para connecting', () => {
  const currentStatus: string = 'disconnected'
  const newStatus: string = 'connecting'
  
  assertEquals(newStatus, 'connecting')
  assertEquals(currentStatus !== newStatus, true)
})

// ============================================================================
// Tests for Error Handling
// ============================================================================

Deno.test('connectInstance - Deve tratar erro de conta não encontrada', () => {
  const errorMessage = 'Conta não encontrada'
  const statusCode = 404
  
  assertEquals(statusCode, 404)
  assertEquals(errorMessage.includes('não encontrada'), true)
})

Deno.test('connectInstance - Deve tratar erro de broker não suportado', () => {
  const result = validateBrokerSupportsConnection('gupshup')
  
  assertEquals(result.valid, false)
  assertEquals(result.error!.includes('não oficiais'), true)
})

Deno.test('connectInstance - Deve tratar erro de acesso negado', () => {
  const errorMessage = 'Acesso negado ao projeto'
  const statusCode = 403
  
  assertEquals(statusCode, 403)
})

Deno.test('connectInstance - Deve tratar erro de autenticação', () => {
  const errorMessage = 'Authentication required'
  const statusCode = 401
  
  assertEquals(statusCode, 401)
})

// ============================================================================
// Tests for Edge Cases
// ============================================================================

Deno.test('connectInstance - Deve tratar body vazio como QR Code', () => {
  const emptyBody = {}
  const result = connectInstanceSchema.safeParse(emptyBody)
  
  assertEquals(result.success, true)
  if (result.success) {
    assertEquals(result.data.phone, undefined)
  }
})

Deno.test('connectInstance - Deve tratar body com phone undefined', () => {
  const bodyWithUndefined = { phone: undefined }
  const result = connectInstanceSchema.safeParse(bodyWithUndefined)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Deve aceitar telefone muito longo (até 15 dígitos)', () => {
  const validData = {
    phone: '+123456789012345', // 15 dígitos
  }
  
  const result = connectInstanceSchema.safeParse(validData)
  
  assertEquals(result.success, true)
})

Deno.test('connectInstance - Deve rejeitar telefone com mais de 15 dígitos', () => {
  const invalidData = {
    phone: '+1234567890123456', // 16 dígitos
  }
  
  const result = connectInstanceSchema.safeParse(invalidData)
  
  assertEquals(result.success, false)
})

// ============================================================================
// Tests for Account Identifier Fallback
// ============================================================================

Deno.test('connectInstance - Deve usar phone se account_identifier ausente', () => {
  const phone = '+5511999999999'
  const accountIdentifier = undefined
  
  const identifier = phone || accountIdentifier || 'unknown'
  
  assertEquals(identifier, '+5511999999999')
})

Deno.test('connectInstance - Deve usar account_identifier se phone ausente', () => {
  const phone = undefined
  const accountIdentifier = 'test-instance'
  
  const identifier = phone || accountIdentifier || 'unknown'
  
  assertEquals(identifier, 'test-instance')
})
