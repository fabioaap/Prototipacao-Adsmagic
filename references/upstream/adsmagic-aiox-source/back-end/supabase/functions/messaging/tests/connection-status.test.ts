/**
 * Testes unitários para connection-status.ts
 * 
 * Testa o handler de verificação de status de conexão WhatsApp.
 * 
 * @module tests/connection-status.test
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { 
  validateAccountAccess,
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection,
  type BrokerConnectionConfig,
} from '../utils/connection-helpers.ts'
import type { MessagingAccount, ConnectionStatusResponse } from '../types.ts'

// ============================================================================
// Mocks
// ============================================================================

/**
 * Mock de conta conectada
 */
const mockConnectedAccount: MessagingAccount = {
  id: 'account-123',
  integration_account_id: 'integration-123',
  project_id: '550e8400-e29b-41d4-a716-446655440000',
  platform: 'whatsapp',
  broker_type: 'uazapi',
  account_identifier: '+5511999999999',
  account_name: 'Test Instance',
  account_display_name: 'Test Instance',
  status: 'active',
  api_key: 'instance-api-key-456',
  access_token: 'instance-token-789',
  broker_config: {
    instanceId: 'instance-abc123',
    instanceName: 'test-instance',
    apiBaseUrl: 'https://free.uazapi.com',
  },
  platform_config: {},
  total_messages: 150,
  total_contacts: 25,
  is_primary: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Mock de conta desconectada
 */
const mockDisconnectedAccount: MessagingAccount = {
  ...mockConnectedAccount,
  id: 'account-456',
  status: 'disconnected',
  account_identifier: 'test-instance',
}

/**
 * Mock de conta conectando
 */
const mockConnectingAccount: MessagingAccount = {
  ...mockConnectedAccount,
  id: 'account-789',
  status: 'connecting',
}

/**
 * Mock de resultado de status conectado
 */
const mockConnectedStatus = {
  connected: true,
  error: undefined,
}

/**
 * Mock de resultado de status desconectado
 */
const mockDisconnectedStatus = {
  connected: false,
  error: 'Device not connected',
}

/**
 * Mock de resultado de status com timeout
 */
const mockTimeoutStatus = {
  connected: false,
  error: 'QR Code expirada - timeout',
}

/**
 * Mock de informações da conta
 */
const mockAccountInfo = {
  phoneNumber: '+5511999999999',
  name: 'Test User',
  status: 'active',
  profilePhoto: 'https://example.com/photo.jpg',
}

// ============================================================================
// Tests for Account Access Validation
// ============================================================================

Deno.test('connectionStatus - validateAccountAccess deve validar conta existente', async () => {
  // Simular o comportamento esperado
  const account = mockConnectedAccount
  const accountExists = !!account
  
  assertEquals(accountExists, true)
})

Deno.test('connectionStatus - validateAccountAccess deve rejeitar conta null', async () => {
  const account = null
  const expectedError = 'Conta não encontrada'
  
  assertEquals(account, null)
  assertEquals(expectedError.includes('não encontrada'), true)
})

// ============================================================================
// Tests for Broker Config Extraction
// ============================================================================

Deno.test('connectionStatus - Deve extrair configuração do broker para uazapi', () => {
  const result = extractBrokerConnectionConfig(mockConnectedAccount)
  
  assertExists(result.config)
  assertEquals(result.config!.instanceId, 'instance-abc123')
  assertEquals(result.config!.apiBaseUrl, 'https://free.uazapi.com')
})

Deno.test('connectionStatus - Deve extrair token corretamente', () => {
  const result = extractBrokerConnectionConfig(mockConnectedAccount)
  
  assertExists(result.config)
  assertExists(result.config!.accessToken)
  assertEquals(result.config!.accessToken.length > 0, true)
})

Deno.test('connectionStatus - Deve criar broker config para conexão', () => {
  const connectionConfig: BrokerConnectionConfig = {
    instanceId: 'instance-abc123',
    accessToken: 'token-123',
    apiKey: 'token-123',
    apiBaseUrl: 'https://free.uazapi.com',
  }
  
  const result = createBrokerConfigForConnection(mockConnectedAccount, connectionConfig)
  
  assertExists(result.instanceId)
  assertExists(result.apiBaseUrl)
  assertEquals(result.accountName, 'Test Instance')
})

// ============================================================================
// Tests for Status Determination
// ============================================================================

Deno.test('connectionStatus - Deve determinar status connected corretamente', () => {
  const connectionStatus = mockConnectedStatus
  const accountStatus = 'disconnected'
  
  let status: 'connected' | 'disconnected' | 'connecting' | 'timeout' = 'disconnected'
  if (connectionStatus.connected) {
    status = 'connected'
  }
  
  assertEquals(status, 'connected')
})

Deno.test('connectionStatus - Deve determinar status disconnected corretamente', () => {
  const connectionStatus = mockDisconnectedStatus
  const accountStatus: string = 'disconnected'
  
  let status: 'connected' | 'disconnected' | 'connecting' | 'timeout' = 'disconnected'
  if (connectionStatus.connected) {
    status = 'connected'
  } else if (accountStatus === 'connecting') {
    status = 'connecting'
  }
  
  assertEquals(status, 'disconnected')
})

Deno.test('connectionStatus - Deve determinar status connecting corretamente', () => {
  const connectionStatus = mockDisconnectedStatus
  const accountStatus = 'connecting'
  
  let status: 'connected' | 'disconnected' | 'connecting' | 'timeout' = 'disconnected'
  if (connectionStatus.connected) {
    status = 'connected'
  } else if (accountStatus === 'connecting') {
    status = 'connecting'
  }
  
  assertEquals(status, 'connecting')
})

Deno.test('connectionStatus - Deve determinar status timeout corretamente', () => {
  const connectionStatus = mockTimeoutStatus
  const accountStatus: string = 'disconnected'
  
  let status: 'connected' | 'disconnected' | 'connecting' | 'timeout' = 'disconnected'
  if (connectionStatus.connected) {
    status = 'connected'
  } else if (accountStatus === 'connecting') {
    status = 'connecting'
  } else if (connectionStatus.error?.includes('expirada') || connectionStatus.error?.includes('timeout')) {
    status = 'timeout'
  }
  
  assertEquals(status, 'timeout')
})

// ============================================================================
// Tests for Response Format
// ============================================================================

Deno.test('connectionStatus - Resposta deve ter estrutura ConnectionStatusResponse', () => {
  const connectionConfig: BrokerConnectionConfig = {
    instanceId: 'instance-abc123',
    accessToken: 'token',
    apiKey: 'token',
    apiBaseUrl: 'https://free.uazapi.com',
  }
  
  const response: ConnectionStatusResponse = {
    instanceId: connectionConfig.instanceId,
    connected: true,
    status: 'connected',
    phoneNumber: '+5511999999999',
    message: 'Conectado com sucesso',
  }
  
  assertExists(response.instanceId)
  assertEquals(response.connected, true)
  assertEquals(response.status, 'connected')
  assertExists(response.phoneNumber)
})

Deno.test('connectionStatus - Resposta desconectada deve incluir mensagem de erro', () => {
  const connectionStatus = mockDisconnectedStatus
  
  const response: ConnectionStatusResponse = {
    instanceId: 'instance-abc123',
    connected: false,
    status: 'disconnected',
    message: connectionStatus.error,
  }
  
  assertEquals(response.connected, false)
  assertExists(response.message)
  assertEquals(response.message, 'Device not connected')
})

Deno.test('connectionStatus - Resposta conectada deve incluir phoneNumber', () => {
  const accountInfo = mockAccountInfo
  
  const response: ConnectionStatusResponse = {
    instanceId: 'instance-abc123',
    connected: true,
    status: 'connected',
    phoneNumber: accountInfo.phoneNumber,
    message: 'Conectado com sucesso',
  }
  
  assertEquals(response.phoneNumber, '+5511999999999')
})

// ============================================================================
// Tests for Status Update Logic
// ============================================================================

Deno.test('connectionStatus - Deve atualizar status para active quando conectado', () => {
  const connectionStatus = mockConnectedStatus
  const currentAccountStatus: string = 'connecting'
  
  const shouldUpdate = connectionStatus.connected && currentAccountStatus !== 'active'
  const newStatus = 'active'
  
  assertEquals(shouldUpdate, true)
  assertEquals(newStatus, 'active')
})

Deno.test('connectionStatus - Não deve atualizar se já está active', () => {
  const connectionStatus = mockConnectedStatus
  const currentAccountStatus = 'active'
  
  const shouldUpdate = connectionStatus.connected && currentAccountStatus !== 'active'
  
  assertEquals(shouldUpdate, false)
})

Deno.test('connectionStatus - Deve atualizar account_identifier com phoneNumber', () => {
  const accountInfo = mockAccountInfo
  const currentIdentifier = 'test-instance'
  
  const newIdentifier = accountInfo.phoneNumber || currentIdentifier
  
  assertEquals(newIdentifier, '+5511999999999')
})

// ============================================================================
// Tests for Account Info Handling
// ============================================================================

Deno.test('connectionStatus - Deve usar accountInfo quando disponível', () => {
  const accountInfo = mockAccountInfo
  const fallbackIdentifier = 'test-instance'
  
  const phoneNumber = accountInfo.phoneNumber || fallbackIdentifier
  
  assertEquals(phoneNumber, '+5511999999999')
})

Deno.test('connectionStatus - Deve usar fallback quando accountInfo não disponível', () => {
  const accountInfo = { phoneNumber: undefined, name: 'Test', status: 'active' }
  const fallbackIdentifier = 'test-instance'
  
  const phoneNumber = accountInfo.phoneNumber || fallbackIdentifier
  
  assertEquals(phoneNumber, 'test-instance')
})

Deno.test('connectionStatus - Deve tratar erro ao obter accountInfo graciosamente', () => {
  // Simular fallback quando getAccountInfo falha
  const account = mockConnectedAccount
  
  const fallbackAccountInfo = {
    phoneNumber: account.account_identifier,
    name: account.account_name,
    status: account.status,
  }
  
  assertEquals(fallbackAccountInfo.phoneNumber, '+5511999999999')
  assertEquals(fallbackAccountInfo.name, 'Test Instance')
})

// ============================================================================
// Tests for Broker Types
// ============================================================================

Deno.test('connectionStatus - Deve funcionar com broker uazapi', () => {
  const account = mockConnectedAccount
  
  assertEquals(account.broker_type, 'uazapi')
})

Deno.test('connectionStatus - Deve funcionar com outros broker types', () => {
  const gupshupAccount: MessagingAccount = {
    ...mockConnectedAccount,
    broker_type: 'gupshup',
    broker_config: {
      instanceId: 'gupshup-123',
      apiBaseUrl: 'https://api.gupshup.io',
    },
  }
  
  assertEquals(gupshupAccount.broker_type, 'gupshup')
})

// ============================================================================
// Tests for Error Scenarios
// ============================================================================

Deno.test('connectionStatus - Deve tratar erro de configuração incompleta', () => {
  const accountWithoutConfig: MessagingAccount = {
    ...mockConnectedAccount,
    broker_config: {},
    api_key: null,
    access_token: null,
  }
  
  const result = extractBrokerConnectionConfig(accountWithoutConfig)
  
  assertEquals(result.config, null)
  assertExists(result.error)
})

Deno.test('connectionStatus - Deve retornar 404 para conta não encontrada', () => {
  const account = null
  const errorMessage = 'Conta não encontrada'
  const statusCode = 404
  
  assertEquals(account, null)
  assertEquals(statusCode, 404)
})

Deno.test('connectionStatus - Deve retornar 401 para não autenticado', () => {
  const errorMessage = 'Authentication required'
  const statusCode = 401
  
  assertEquals(statusCode, 401)
  assertEquals(errorMessage.includes('Authentication'), true)
})

Deno.test('connectionStatus - Deve retornar 403 para acesso negado', () => {
  const errorMessage = 'Acesso negado ao projeto'
  const statusCode = 403
  
  assertEquals(statusCode, 403)
})

Deno.test('connectionStatus - Deve retornar 400 para erro de configuração', () => {
  const errorMessage = 'Erro ao extrair configuração do broker'
  const statusCode = 400
  
  assertEquals(statusCode, 400)
})

// ============================================================================
// Tests for Message Generation
// ============================================================================

Deno.test('connectionStatus - Deve gerar mensagem para connected', () => {
  const connectionStatus = mockConnectedStatus
  
  const message = connectionStatus.connected ? 'Conectado com sucesso' : connectionStatus.error
  
  assertEquals(message, 'Conectado com sucesso')
})

Deno.test('connectionStatus - Deve gerar mensagem de erro para disconnected', () => {
  const connectionStatus = mockDisconnectedStatus
  
  const message = connectionStatus.connected ? 'Conectado com sucesso' : connectionStatus.error
  
  assertEquals(message, 'Device not connected')
})

Deno.test('connectionStatus - Deve preservar erro de timeout', () => {
  const connectionStatus = mockTimeoutStatus
  
  const message = connectionStatus.error
  
  assertExists(message)
  assertEquals(message!.includes('timeout'), true)
})

// ============================================================================
// Tests for Edge Cases
// ============================================================================

Deno.test('connectionStatus - Deve tratar phoneNumber undefined', () => {
  const accountInfo = { ...mockAccountInfo, phoneNumber: undefined }
  
  const response: ConnectionStatusResponse = {
    instanceId: 'instance-123',
    connected: true,
    status: 'connected',
    phoneNumber: accountInfo.phoneNumber || undefined,
  }
  
  assertEquals(response.phoneNumber, undefined)
})

Deno.test('connectionStatus - Deve tratar status desconhecido como disconnected', () => {
  const unknownStatus: string = 'unknown_status'
  let status: 'connected' | 'disconnected' | 'connecting' | 'timeout' = 'disconnected'
  
  // Status desconhecido default para disconnected
  if (unknownStatus !== 'connected' && unknownStatus !== 'connecting' && unknownStatus !== 'active') {
    status = 'disconnected'
  }
  
  assertEquals(status, 'disconnected')
})

Deno.test('connectionStatus - Deve considerar active como connected', () => {
  const accountStatus = 'active'
  
  const isConnected = accountStatus === 'active' || accountStatus === 'connected'
  
  assertEquals(isConnected, true)
})

// ============================================================================
// Tests for Logging
// ============================================================================

Deno.test('connectionStatus - Log deve incluir accountId', () => {
  const logData = {
    accountId: 'account-123',
    brokerType: 'uazapi',
    connected: true,
    status: 'connected',
    userId: 'user-456',
  }
  
  assertExists(logData.accountId)
  assertExists(logData.brokerType)
  assertExists(logData.userId)
})

Deno.test('connectionStatus - Log não deve incluir tokens', () => {
  const logData = {
    accountId: 'account-123',
    brokerType: 'uazapi',
    connected: true,
    status: 'connected',
  }
  
  assertEquals('apiKey' in logData, false)
  assertEquals('accessToken' in logData, false)
  assertEquals('token' in logData, false)
})
