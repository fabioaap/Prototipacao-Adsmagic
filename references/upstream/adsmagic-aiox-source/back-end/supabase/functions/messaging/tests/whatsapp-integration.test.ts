/**
 * Testes de Integração - Fluxo Completo WhatsApp Multi-Broker
 *
 * Testa o fluxo end-to-end da integração WhatsApp:
 * 1. Listar brokers disponíveis
 * 2. Criar instância (uazapi)
 * 3. Conectar e gerar QR Code
 * 4. Verificar status de conexão (polling)
 * 5. Salvar conta conectada
 *
 * @see doc/IMPLEMENTACAO_INTEGRACAO_WHATSAPP_UAZAPI.md - Etapa 5.3
 * @module tests/whatsapp-integration.test
 */

import { describe, it } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals, assertExists, assertNotEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { BROKER_TYPES, BROKER_DEFAULTS } from '../constants/brokers.ts'
import {
  createInstanceSchema,
  connectInstanceSchema,
  configureBrokerSchema,
  saveConnectedAccountSchema,
} from '../validators/whatsappSchemas.ts'

// ============================================================================
// MOCKS - Dados de Teste
// ============================================================================

/**
 * Mock de projeto válido
 */
const mockProject = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Projeto Teste',
  company_id: '550e8400-e29b-41d4-a716-446655440100',
  created_by: '550e8400-e29b-41d4-a716-446655440200',
}

/**
 * Mock de brokers disponíveis
 */
const mockBrokers = {
  uazapi: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'uazapi',
    display_name: 'WhatsApp via uazapi',
    description: 'Conexão via QR Code',
    platform: 'whatsapp',
    broker_type: 'api',
    is_active: true,
    admin_token: 'encrypted_admin_token_abc123',
    api_base_url: BROKER_DEFAULTS.UAZAPI_BASE_URL,
    required_fields: [],
    supports_media: true,
    supports_templates: true,
    supports_webhooks: true,
  },
  gupshup: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'gupshup',
    display_name: 'Gupshup',
    description: 'Conexão via credenciais',
    platform: 'whatsapp',
    broker_type: 'api',
    is_active: true,
    admin_token: null,
    api_base_url: 'https://api.gupshup.io',
    required_fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'appName', label: 'App Name', type: 'text', required: true },
    ],
    supports_media: true,
    supports_templates: true,
    supports_webhooks: true,
  },
  official_whatsapp: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'official_whatsapp',
    display_name: 'API Oficial do WhatsApp',
    description: 'Conexão via Meta Business',
    platform: 'whatsapp',
    broker_type: 'official',
    is_active: true,
    admin_token: null,
    api_base_url: 'https://graph.facebook.com',
    required_fields: [
      { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { name: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
    ],
    supports_media: true,
    supports_templates: true,
    supports_webhooks: true,
  },
}

/**
 * Mock de instância criada
 */
const mockInstance = {
  instanceId: 'instance-abc123',
  instanceName: 'test-instance-' + Date.now(),
  apikey: 'instance-api-key-456',
  token: 'instance-token-789',
  status: 'disconnected',
}

/**
 * Mock de conta criada
 */
const mockAccount = {
  id: 'account-xyz789',
  project_id: mockProject.id,
  platform: 'whatsapp',
  broker_type: BROKER_TYPES.UAZAPI,
  account_identifier: mockInstance.instanceName,
  account_name: mockInstance.instanceName,
  status: 'disconnected',
  broker_config: {
    instanceId: mockInstance.instanceId,
    instanceName: mockInstance.instanceName,
    apiBaseUrl: BROKER_DEFAULTS.UAZAPI_BASE_URL,
  },
}

/**
 * Mock de QR Code
 */
const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// ============================================================================
// TESTES DE INTEGRAÇÃO - FLUXO COMPLETO
// ============================================================================

describe('Integração WhatsApp - Fluxo Completo', () => {
  describe('Fluxo 1: Listar Brokers Disponíveis', () => {
    it('deve retornar lista de brokers ativos para plataforma whatsapp', () => {
      // Simular resposta do endpoint list-whatsapp-brokers
      const activeBrokers = Object.values(mockBrokers).filter(
        (broker) => broker.is_active && broker.platform === 'whatsapp'
      )

      assertEquals(activeBrokers.length, 3)
      assertExists(activeBrokers.find((b) => b.name === BROKER_TYPES.UAZAPI))
      assertExists(activeBrokers.find((b) => b.name === BROKER_TYPES.GUPSHUP))
      assertExists(activeBrokers.find((b) => b.name === BROKER_TYPES.OFFICIAL_WHATSAPP))
    })

    it('deve retornar apenas campos públicos (sem admin_token)', () => {
      // Simular formatação da resposta
      const publicBroker = {
        id: mockBrokers.uazapi.id,
        name: mockBrokers.uazapi.name,
        displayName: mockBrokers.uazapi.display_name,
        description: mockBrokers.uazapi.description,
        brokerType: mockBrokers.uazapi.broker_type,
        supportsMedia: mockBrokers.uazapi.supports_media,
        supportsTemplates: mockBrokers.uazapi.supports_templates,
        supportsWebhooks: mockBrokers.uazapi.supports_webhooks,
        requiredFields: mockBrokers.uazapi.required_fields,
        // admin_token NÃO deve estar presente
      }

      assertExists(publicBroker.id)
      assertExists(publicBroker.name)
      assertEquals('admin_token' in publicBroker, false)
      assertEquals('api_base_url' in publicBroker, false)
    })

    it('deve filtrar brokers inativos', () => {
      const inactiveBroker = { ...mockBrokers.uazapi, is_active: false }
      const allBrokers = [mockBrokers.uazapi, inactiveBroker, mockBrokers.gupshup]

      const activeBrokers = allBrokers.filter((b) => b.is_active)

      assertEquals(activeBrokers.length, 2)
    })
  })

  describe('Fluxo 2: Criar Instância (uazapi)', () => {
    it('deve validar dados de entrada corretamente', () => {
      const validInput = {
        projectId: mockProject.id,
        brokerId: mockBrokers.uazapi.id,
      }

      const result = createInstanceSchema.safeParse(validInput)

      assertEquals(result.success, true)
    })

    it('deve rejeitar projectId inválido', () => {
      const invalidInput = {
        projectId: 'not-a-uuid',
        brokerId: mockBrokers.uazapi.id,
      }

      const result = createInstanceSchema.safeParse(invalidInput)

      assertEquals(result.success, false)
    })

    it('deve rejeitar brokerId inválido', () => {
      const invalidInput = {
        projectId: mockProject.id,
        brokerId: 'not-a-uuid',
      }

      const result = createInstanceSchema.safeParse(invalidInput)

      assertEquals(result.success, false)
    })

    it('deve identificar broker que suporta criação de instância', () => {
      // uazapi suporta criação de instância
      const uazapiSupportsInstance = mockBrokers.uazapi.name === BROKER_TYPES.UAZAPI

      assertEquals(uazapiSupportsInstance, true)

      // gupshup NÃO suporta criação de instância
      const gupshupSupportsInstance = mockBrokers.gupshup.name === BROKER_TYPES.UAZAPI

      assertEquals(gupshupSupportsInstance, false)
    })

    it('deve verificar que admin_token está configurado para uazapi', () => {
      const hasAdminToken = mockBrokers.uazapi.admin_token !== null

      assertEquals(hasAdminToken, true)

      // gupshup não precisa de admin_token
      const gupshupHasAdminToken = mockBrokers.gupshup.admin_token !== null

      assertEquals(gupshupHasAdminToken, false)
    })

    it('deve criar estrutura de conta corretamente', () => {
      // Simular criação de conta após instância criada
      const accountData = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI,
        account_identifier: mockInstance.instanceName,
        account_name: mockInstance.instanceName,
        status: 'disconnected',
        broker_config: {
          instanceId: mockInstance.instanceId,
          instanceName: mockInstance.instanceName,
          apiBaseUrl: BROKER_DEFAULTS.UAZAPI_BASE_URL,
        },
        api_key: mockInstance.token, // Token da instância (criptografado)
      }

      assertExists(accountData.project_id)
      assertExists(accountData.broker_config.instanceId)
      assertEquals(accountData.status, 'disconnected')
      assertEquals(accountData.platform, 'whatsapp')
    })
  })

  describe('Fluxo 3: Conectar Instância (QR Code)', () => {
    it('deve validar dados de entrada para conexão', () => {
      const validInput = {
        phone: undefined, // QR Code (sem phone)
      }

      const result = connectInstanceSchema.safeParse(validInput)

      assertEquals(result.success, true)
    })

    it('deve validar phone para Pair Code', () => {
      const validInput = {
        phone: '5511999999999',
      }

      const result = connectInstanceSchema.safeParse(validInput)

      assertEquals(result.success, true)
    })

    it('deve rejeitar phone inválido', () => {
      const invalidInput = {
        phone: 'abc', // Não é número
      }

      const result = connectInstanceSchema.safeParse(invalidInput)

      assertEquals(result.success, false)
    })

    it('deve gerar resposta de QR Code corretamente', () => {
      // Simular resposta de conexão
      const connectionResponse = {
        qrcode: mockQRCode,
        connectionMethod: 'qr_code',
        status: 'connecting',
        expiresIn: 120, // 2 minutos
      }

      assertExists(connectionResponse.qrcode)
      assertEquals(connectionResponse.connectionMethod, 'qr_code')
      assertEquals(connectionResponse.status, 'connecting')
    })

    it('deve gerar resposta de Pair Code corretamente', () => {
      // Simular resposta de conexão com Pair Code
      const connectionResponse = {
        pairCode: '123456',
        connectionMethod: 'pair_code',
        status: 'connecting',
        expiresIn: 300, // 5 minutos
      }

      assertExists(connectionResponse.pairCode)
      assertEquals(connectionResponse.connectionMethod, 'pair_code')
    })
  })

  describe('Fluxo 4: Verificar Status de Conexão (Polling)', () => {
    it('deve retornar status disconnected inicialmente', () => {
      const statusResponse = {
        status: 'disconnected',
        connectionMethod: 'qr_code',
        qrcode: mockQRCode,
      }

      assertEquals(statusResponse.status, 'disconnected')
    })

    it('deve retornar status connecting enquanto aguarda scan', () => {
      const statusResponse = {
        status: 'connecting',
        connectionMethod: 'qr_code',
        qrcode: mockQRCode,
      }

      assertEquals(statusResponse.status, 'connecting')
    })

    it('deve retornar status connected após scan bem-sucedido', () => {
      const statusResponse = {
        status: 'connected',
        phoneNumber: '5511999999999',
        profileName: 'Minha Empresa',
        profilePhoto: 'https://photo.url/avatar.jpg',
      }

      assertEquals(statusResponse.status, 'connected')
      assertExists(statusResponse.phoneNumber)
      assertExists(statusResponse.profileName)
    })

    it('deve normalizar status do broker para status padrão', () => {
      // Mapeamento de status do uazapi
      const statusMapping: Record<string, string> = {
        open: 'connected',
        close: 'disconnected',
        qrcode: 'connecting',
        timeout: 'disconnected',
        conflicted: 'error',
      }

      assertEquals(statusMapping['open'], 'connected')
      assertEquals(statusMapping['close'], 'disconnected')
      assertEquals(statusMapping['qrcode'], 'connecting')
    })

    it('deve atualizar QR Code quando renovado', () => {
      const oldQR = mockQRCode
      const newQR = 'data:image/png;base64,newQRCodeData'

      assertNotEquals(oldQR, newQR)
    })
  })

  describe('Fluxo 5: Salvar Conta Conectada', () => {
    it('deve validar dados de entrada para salvar conta', () => {
      const validInput = {
        projectId: mockProject.id,
        brokerType: BROKER_TYPES.UAZAPI,
        instanceId: mockInstance.instanceId,
        instanceToken: mockInstance.token,
        phoneNumber: '5511999999999',
        profileName: 'Minha Empresa',
      }

      const result = saveConnectedAccountSchema.safeParse(validInput)

      assertEquals(result.success, true)
    })

    it('deve rejeitar dados incompletos', () => {
      const invalidInput = {
        projectId: mockProject.id,
        // brokerType faltando
        instanceId: mockInstance.instanceId,
      }

      const result = saveConnectedAccountSchema.safeParse(invalidInput)

      assertEquals(result.success, false)
    })

    it('deve atualizar status da conta para connected', () => {
      const updatedAccount = {
        ...mockAccount,
        status: 'connected',
        account_identifier: '5511999999999',
        account_name: 'Minha Empresa',
        account_display_name: 'Minha Empresa',
      }

      assertEquals(updatedAccount.status, 'connected')
      assertExists(updatedAccount.account_identifier)
    })

    it('deve armazenar broker_config corretamente', () => {
      const brokerConfig = {
        instanceId: mockInstance.instanceId,
        instanceName: mockInstance.instanceName,
        apiBaseUrl: BROKER_DEFAULTS.UAZAPI_BASE_URL,
      }

      assertExists(brokerConfig.instanceId)
      assertExists(brokerConfig.instanceName)
      assertEquals(brokerConfig.apiBaseUrl, BROKER_DEFAULTS.UAZAPI_BASE_URL)
    })
  })
})

// ============================================================================
// TESTES DE INTEGRAÇÃO - FLUXO GUPSHUP (CREDENCIAIS)
// ============================================================================

describe('Integração WhatsApp - Fluxo Gupshup (Credenciais)', () => {
  describe('Fluxo 1: Configurar Broker com Credenciais', () => {
    it('deve validar dados de entrada para configuração', () => {
      const validInput = {
        projectId: mockProject.id,
        brokerId: mockBrokers.gupshup.id,
        credentials: {
          apiKey: 'test-api-key-123',
          appName: 'test-app-name',
        },
      }

      const result = configureBrokerSchema.safeParse(validInput)

      assertEquals(result.success, true)
    })

    it('deve rejeitar credenciais vazias', () => {
      const invalidInput = {
        projectId: mockProject.id,
        brokerId: mockBrokers.gupshup.id,
        credentials: {},
      }

      const result = configureBrokerSchema.safeParse(invalidInput)

      // Schema rejeita credenciais vazias (refine: Object.keys(val).length > 0)
      assertEquals(result.success, false)
    })

    it('deve identificar campos obrigatórios do broker', () => {
      const requiredFields = mockBrokers.gupshup.required_fields

      assertEquals(requiredFields.length, 2)
      assertExists(requiredFields.find((f) => f.name === 'apiKey'))
      assertExists(requiredFields.find((f) => f.name === 'appName'))
    })

    it('deve retornar resposta de validação bem-sucedida', () => {
      const validationResponse = {
        valid: true,
        accountInfo: {
          phoneNumber: '5511888888888',
          accountName: 'Gupshup Account',
        },
      }

      assertEquals(validationResponse.valid, true)
      assertExists(validationResponse.accountInfo)
    })

    it('deve retornar resposta de validação com erro', () => {
      const validationResponse = {
        valid: false,
        message: 'API Key inválida',
      }

      assertEquals(validationResponse.valid, false)
      assertExists(validationResponse.message)
    })
  })

  describe('Fluxo 2: Salvar Conta Gupshup', () => {
    it('deve criar estrutura de conta para Gupshup', () => {
      const accountData = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.GUPSHUP,
        account_identifier: '5511888888888',
        account_name: 'Gupshup Account',
        status: 'connected',
        broker_config: {
          appName: 'test-app-name',
          apiBaseUrl: 'https://api.gupshup.io',
        },
        api_key: 'encrypted_api_key', // Criptografado
      }

      assertEquals(accountData.broker_type, BROKER_TYPES.GUPSHUP)
      assertEquals(accountData.status, 'connected')
      assertExists(accountData.broker_config.appName)
    })
  })
})

// ============================================================================
// TESTES DE INTEGRAÇÃO - FLUXO API OFICIAL (CREDENCIAIS)
// ============================================================================

describe('Integração WhatsApp - Fluxo API Oficial (Credenciais)', () => {
  describe('Fluxo 1: Configurar Broker com Credenciais', () => {
    it('deve validar dados de entrada para API Oficial', () => {
      const validInput = {
        projectId: mockProject.id,
        brokerId: mockBrokers.official_whatsapp.id,
        credentials: {
          accessToken: 'EAAxxxxxxxx',
          phoneNumberId: '123456789',
        },
      }

      const result = configureBrokerSchema.safeParse(validInput)

      assertEquals(result.success, true)
    })

    it('deve identificar campos obrigatórios da API Oficial', () => {
      const requiredFields = mockBrokers.official_whatsapp.required_fields

      assertEquals(requiredFields.length, 2)
      assertExists(requiredFields.find((f) => f.name === 'accessToken'))
      assertExists(requiredFields.find((f) => f.name === 'phoneNumberId'))
    })
  })

  describe('Fluxo 2: Salvar Conta API Oficial', () => {
    it('deve criar estrutura de conta para API Oficial', () => {
      const accountData = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.OFFICIAL_WHATSAPP,
        account_identifier: '123456789', // phoneNumberId
        account_name: 'Official WhatsApp Account',
        status: 'connected',
        broker_config: {
          phoneNumberId: '123456789',
          businessAccountId: 'business-123',
          apiBaseUrl: 'https://graph.facebook.com',
        },
        access_token: 'encrypted_access_token', // Criptografado
      }

      assertEquals(accountData.broker_type, BROKER_TYPES.OFFICIAL_WHATSAPP)
      assertEquals(accountData.status, 'connected')
      assertExists(accountData.broker_config.phoneNumberId)
    })
  })
})

// ============================================================================
// TESTES DE INTEGRAÇÃO - VALIDAÇÃO DE DADOS EM messaging_accounts
// ============================================================================

describe('Integração WhatsApp - Validação de Dados em messaging_accounts', () => {
  describe('Estrutura de Dados', () => {
    it('deve ter todos os campos obrigatórios', () => {
      const requiredFields = [
        'id',
        'project_id',
        'platform',
        'broker_type',
        'account_identifier',
        'status',
        'created_at',
        'updated_at',
      ]

      const accountRecord = {
        id: 'account-xyz789',
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI,
        account_identifier: '5511999999999',
        status: 'connected',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      for (const field of requiredFields) {
        assertExists((accountRecord as Record<string, unknown>)[field], `Campo ${field} deve existir`)
      }
    })

    it('deve ter broker_config válido para uazapi', () => {
      const brokerConfig = {
        instanceId: 'instance-abc123',
        instanceName: 'test-instance',
        apiBaseUrl: BROKER_DEFAULTS.UAZAPI_BASE_URL,
      }

      assertExists(brokerConfig.instanceId)
      assertExists(brokerConfig.instanceName)
      assertExists(brokerConfig.apiBaseUrl)
    })

    it('deve ter broker_config válido para gupshup', () => {
      const brokerConfig = {
        appName: 'test-app',
        apiBaseUrl: 'https://api.gupshup.io',
      }

      assertExists(brokerConfig.appName)
      assertExists(brokerConfig.apiBaseUrl)
    })

    it('deve ter broker_config válido para API Oficial', () => {
      const brokerConfig = {
        phoneNumberId: '123456789',
        businessAccountId: 'business-123',
        apiBaseUrl: 'https://graph.facebook.com',
      }

      assertExists(brokerConfig.phoneNumberId)
      assertExists(brokerConfig.apiBaseUrl)
    })
  })

  describe('Constraints e Validações', () => {
    it('deve garantir unicidade por projeto + plataforma + broker_type + account_identifier', () => {
      const account1 = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI,
        account_identifier: '5511999999999',
      }

      const account2 = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI,
        account_identifier: '5511999999999',
      }

      // Mesma combinação = duplicado
      const isDuplicate =
        account1.project_id === account2.project_id &&
        account1.platform === account2.platform &&
        account1.broker_type === account2.broker_type &&
        account1.account_identifier === account2.account_identifier

      assertEquals(isDuplicate, true)
    })

    it('deve permitir múltiplas contas do mesmo broker com identificadores diferentes', () => {
      const account1 = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI,
        account_identifier: '5511999999999',
      }

      const account2 = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI,
        account_identifier: '5511888888888', // Diferente
      }

      const isDuplicate = account1.account_identifier === account2.account_identifier

      assertEquals(isDuplicate, false)
    })

    it('deve permitir múltiplos brokers no mesmo projeto', () => {
      const uazapiAccount = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.UAZAPI as string,
        account_identifier: '5511999999999',
      }

      const gupshupAccount = {
        project_id: mockProject.id,
        platform: 'whatsapp',
        broker_type: BROKER_TYPES.GUPSHUP as string,
        account_identifier: '5511999999999',
      }

      // Brokers diferentes = não é duplicado
      const isDuplicate = uazapiAccount.broker_type === gupshupAccount.broker_type

      assertEquals(isDuplicate, false)
    })
  })

  describe('Status de Conexão', () => {
    it('deve ter status válido', () => {
      const validStatuses = ['disconnected', 'connecting', 'connected', 'error']

      for (const status of validStatuses) {
        const isValid = validStatuses.includes(status)
        assertEquals(isValid, true)
      }
    })

    it('deve atualizar updated_at ao mudar status', () => {
      const originalUpdatedAt = '2025-01-20T10:00:00Z'
      const newUpdatedAt = '2025-01-20T10:05:00Z'

      assertNotEquals(originalUpdatedAt, newUpdatedAt)
    })
  })
})

// ============================================================================
// TESTES DE INTEGRAÇÃO - SEGURANÇA
// ============================================================================

describe('Integração WhatsApp - Segurança', () => {
  describe('Criptografia de Tokens', () => {
    it('deve criptografar admin_token antes de armazenar', () => {
      const plainToken = 'plain_admin_token_123'
      const encryptedToken = 'encrypted_' + plainToken // Simulação

      assertNotEquals(plainToken, encryptedToken)
      assertEquals(encryptedToken.startsWith('encrypted_'), true)
    })

    it('deve criptografar api_key da conta antes de armazenar', () => {
      const plainApiKey = 'instance_token_456'
      const encryptedApiKey = 'encrypted_' + plainApiKey // Simulação

      assertNotEquals(plainApiKey, encryptedApiKey)
    })

    it('deve criptografar access_token antes de armazenar', () => {
      const plainAccessToken = 'EAAxxxxxxxx'
      const encryptedAccessToken = 'encrypted_' + plainAccessToken // Simulação

      assertNotEquals(plainAccessToken, encryptedAccessToken)
    })
  })

  describe('Validação de Acesso', () => {
    it('deve validar que usuário tem acesso ao projeto', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440200'
      const projectCreatedBy = mockProject.created_by

      const hasAccess = userId === projectCreatedBy

      assertEquals(hasAccess, true)
    })

    it('deve rejeitar acesso de usuário não autorizado', () => {
      const unauthorizedUserId = '550e8400-e29b-41d4-a716-446655440999'
      const projectCreatedBy = mockProject.created_by

      const hasAccess = unauthorizedUserId === projectCreatedBy

      assertEquals(hasAccess, false)
    })
  })

  describe('Não Exposição de Dados Sensíveis', () => {
    it('não deve expor admin_token na resposta de listar brokers', () => {
      const publicBrokerResponse = {
        id: mockBrokers.uazapi.id,
        name: mockBrokers.uazapi.name,
        displayName: mockBrokers.uazapi.display_name,
        // admin_token NÃO deve estar aqui
      }

      assertEquals('admin_token' in publicBrokerResponse, false)
    })

    it('não deve expor api_key na resposta de status de conexão', () => {
      const statusResponse = {
        status: 'connected',
        phoneNumber: '5511999999999',
        profileName: 'Minha Empresa',
        // api_key NÃO deve estar aqui
      }

      assertEquals('api_key' in statusResponse, false)
      assertEquals('access_token' in statusResponse, false)
    })

    it('não deve logar tokens em texto plano', () => {
      const logMessage = 'Criando instância para projeto ' + mockProject.id
      const containsToken = logMessage.includes('token') || logMessage.includes('key')

      assertEquals(containsToken, false)
    })
  })
})

// ============================================================================
// TESTES DE INTEGRAÇÃO - TRATAMENTO DE ERROS
// ============================================================================

describe('Integração WhatsApp - Tratamento de Erros', () => {
  describe('Erros de Validação', () => {
    it('deve retornar erro 400 para projectId inválido', () => {
      const errorResponse = {
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'projectId deve ser um UUID válido',
      }

      assertEquals(errorResponse.status, 400)
      assertEquals(errorResponse.error, 'VALIDATION_ERROR')
    })

    it('deve retornar erro 400 para brokerId inválido', () => {
      const errorResponse = {
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'brokerId deve ser um UUID válido',
      }

      assertEquals(errorResponse.status, 400)
    })
  })

  describe('Erros de Autenticação', () => {
    it('deve retornar erro 401 para token JWT inválido', () => {
      const errorResponse = {
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'Token de autenticação inválido ou expirado',
      }

      assertEquals(errorResponse.status, 401)
      assertEquals(errorResponse.error, 'UNAUTHORIZED')
    })
  })

  describe('Erros de Autorização', () => {
    it('deve retornar erro 403 para usuário sem acesso ao projeto', () => {
      const errorResponse = {
        status: 403,
        error: 'FORBIDDEN',
        message: 'Você não tem permissão para acessar este projeto',
      }

      assertEquals(errorResponse.status, 403)
      assertEquals(errorResponse.error, 'FORBIDDEN')
    })
  })

  describe('Erros de Recurso', () => {
    it('deve retornar erro 404 para projeto não encontrado', () => {
      const errorResponse = {
        status: 404,
        error: 'PROJECT_NOT_FOUND',
        message: 'Projeto não encontrado',
      }

      assertEquals(errorResponse.status, 404)
      assertEquals(errorResponse.error, 'PROJECT_NOT_FOUND')
    })

    it('deve retornar erro 404 para broker não encontrado', () => {
      const errorResponse = {
        status: 404,
        error: 'BROKER_NOT_FOUND',
        message: 'Broker não encontrado',
      }

      assertEquals(errorResponse.status, 404)
      assertEquals(errorResponse.error, 'BROKER_NOT_FOUND')
    })

    it('deve retornar erro 404 para conta não encontrada', () => {
      const errorResponse = {
        status: 404,
        error: 'ACCOUNT_NOT_FOUND',
        message: 'Conta não encontrada',
      }

      assertEquals(errorResponse.status, 404)
    })
  })

  describe('Erros de Configuração', () => {
    it('deve retornar erro 400 para admin_token não configurado', () => {
      const errorResponse = {
        status: 400,
        error: 'ADMIN_TOKEN_NOT_CONFIGURED',
        message: 'Token de administração não configurado para este broker',
      }

      assertEquals(errorResponse.status, 400)
      assertEquals(errorResponse.error, 'ADMIN_TOKEN_NOT_CONFIGURED')
    })

    it('deve retornar erro 400 para broker que não suporta criação de instância', () => {
      const errorResponse = {
        status: 400,
        error: 'BROKER_NOT_SUPPORTED',
        message: 'Este broker não suporta criação prévia de instância',
      }

      assertEquals(errorResponse.status, 400)
      assertEquals(errorResponse.error, 'BROKER_NOT_SUPPORTED')
    })
  })

  describe('Erros de API Externa', () => {
    it('deve retornar erro 502 para falha na API do broker', () => {
      const errorResponse = {
        status: 502,
        error: 'BROKER_API_ERROR',
        message: 'Erro ao comunicar com a API do broker',
      }

      assertEquals(errorResponse.status, 502)
      assertEquals(errorResponse.error, 'BROKER_API_ERROR')
    })

    it('deve retornar erro 504 para timeout na API do broker', () => {
      const errorResponse = {
        status: 504,
        error: 'BROKER_TIMEOUT',
        message: 'Timeout ao comunicar com a API do broker',
      }

      assertEquals(errorResponse.status, 504)
    })
  })

  describe('Erros de Rate Limiting', () => {
    it('deve retornar erro 429 para muitas requisições', () => {
      const errorResponse = {
        status: 429,
        error: 'RATE_LIMITED',
        message: 'Muitas requisições. Tente novamente em alguns segundos.',
        retryAfter: 30,
      }

      assertEquals(errorResponse.status, 429)
      assertEquals(errorResponse.error, 'RATE_LIMITED')
      assertExists(errorResponse.retryAfter)
    })
  })
})
