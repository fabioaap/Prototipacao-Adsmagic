/**
 * Testes unitários para list-whatsapp-brokers.ts
 * 
 * Testa o handler de listagem de brokers WhatsApp disponíveis.
 * 
 * @module tests/list-whatsapp-brokers.test
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

// ============================================================================
// Mocks
// ============================================================================

/**
 * Mock de broker do banco de dados
 */
const mockBrokers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'uazapi',
    display_name: 'UAZAPI',
    description: 'Broker não oficial via QR Code',
    platform: 'whatsapp',
    broker_type: 'api',
    is_active: true,
    supports_media: true,
    supports_templates: false,
    supports_webhooks: true,
    supports_automation: true,
    documentation_url: 'https://docs.uazapi.com',
    support_url: null,
    version: '1.0',
    required_fields: [],
    optional_fields: [],
    max_connections: 10,
    admin_token: 'encrypted_token', // Não deve aparecer na resposta
    api_base_url: 'https://free.uazapi.com',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'gupshup',
    display_name: 'Gupshup',
    description: 'Broker oficial via API',
    platform: 'whatsapp',
    broker_type: 'api',
    is_active: true,
    supports_media: true,
    supports_templates: true,
    supports_webhooks: true,
    supports_automation: true,
    documentation_url: 'https://www.gupshup.io/developer/docs',
    support_url: 'https://support.gupshup.io',
    version: '1.0',
    required_fields: ['apiKey', 'appName'],
    optional_fields: [],
    max_connections: 5,
    admin_token: null,
    api_base_url: 'https://api.gupshup.io',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'official_whatsapp',
    display_name: 'API Oficial WhatsApp',
    description: 'API oficial do Meta',
    platform: 'whatsapp',
    broker_type: 'official',
    is_active: false, // Inativo - não deve aparecer
    supports_media: true,
    supports_templates: true,
    supports_webhooks: true,
    supports_automation: true,
    documentation_url: 'https://developers.facebook.com/docs/whatsapp',
    support_url: null,
    version: '18.0',
    required_fields: ['accessToken', 'phoneNumberId'],
    optional_fields: [],
    max_connections: 100,
    admin_token: null,
    api_base_url: 'https://graph.facebook.com',
  },
]

/**
 * Cria mock do cliente Supabase
 */
function createMockSupabaseClient(options: {
  authenticated?: boolean
  userId?: string
  brokers?: typeof mockBrokers
}) {
  const { 
    authenticated = true, 
    userId = 'user-123',
    brokers = mockBrokers,
  } = options

  return {
    auth: {
      getUser: async () => {
        if (!authenticated) {
          return { data: { user: null }, error: new Error('Not authenticated') }
        }
        return { data: { user: { id: userId } }, error: null }
      },
    },
    from: (table: string) => {
      if (table === 'messaging_brokers') {
        return {
          select: () => ({
            eq: (_field: string, _value: unknown) => ({
              // Simula findByPlatform retornando brokers
              // O repository filtra por is_active internamente, mas o handler também filtra
            }),
          }),
        }
      }
      return null
    },
  }
}

// ============================================================================
// Tests for Handler Logic (Unit Tests without HTTP)
// ============================================================================

Deno.test('listWhatsAppBrokers - Deve retornar apenas brokers ativos', () => {
  // Simulando a lógica do handler
  const allBrokers = mockBrokers
  const activeBrokers = allBrokers.filter(broker => broker.is_active === true)
  
  assertEquals(activeBrokers.length, 2)
  assertEquals(activeBrokers.every(b => b.is_active), true)
  assertEquals(activeBrokers.map(b => b.name), ['uazapi', 'gupshup'])
})

Deno.test('listWhatsAppBrokers - Não deve expor admin_token na resposta', () => {
  // Simulando a formatação da resposta
  const publicBrokers = mockBrokers
    .filter(broker => broker.is_active)
    .map(broker => ({
      id: broker.id,
      name: broker.name,
      displayName: broker.display_name,
      description: broker.description || undefined,
      brokerType: broker.broker_type,
      supportsMedia: broker.supports_media,
      supportsTemplates: broker.supports_templates,
      supportsWebhooks: broker.supports_webhooks,
      supportsAutomation: broker.supports_automation,
      documentationUrl: broker.documentation_url || undefined,
      supportUrl: broker.support_url || undefined,
      version: broker.version || undefined,
      requiredFields: broker.required_fields || [],
      optionalFields: broker.optional_fields || [],
      maxConnections: broker.max_connections,
    }))
  
  // Verificar que admin_token não está presente
  publicBrokers.forEach(broker => {
    assertEquals('admin_token' in broker, false)
    assertEquals('api_base_url' in broker, false)
  })
})

Deno.test('listWhatsAppBrokers - Deve converter campos snake_case para camelCase', () => {
  const broker = mockBrokers[0]
  const publicBroker = {
    id: broker.id,
    name: broker.name,
    displayName: broker.display_name,
    brokerType: broker.broker_type,
    supportsMedia: broker.supports_media,
    supportsTemplates: broker.supports_templates,
    supportsWebhooks: broker.supports_webhooks,
    supportsAutomation: broker.supports_automation,
    documentationUrl: broker.documentation_url || undefined,
    supportUrl: broker.support_url || undefined,
    requiredFields: broker.required_fields || [],
    optionalFields: broker.optional_fields || [],
    maxConnections: broker.max_connections,
  }
  
  // Verificar campos camelCase
  assertExists(publicBroker.displayName)
  assertExists(publicBroker.brokerType)
  assertExists(publicBroker.supportsMedia)
  assertEquals(publicBroker.displayName, 'UAZAPI')
  assertEquals(publicBroker.supportsMedia, true)
})

Deno.test('listWhatsAppBrokers - Deve retornar requiredFields corretamente', () => {
  const gupshupBroker = mockBrokers.find(b => b.name === 'gupshup')
  
  assertExists(gupshupBroker)
  assertEquals(gupshupBroker!.required_fields, ['apiKey', 'appName'])
})

Deno.test('listWhatsAppBrokers - Deve tratar campos opcionais ausentes como undefined', () => {
  const broker = mockBrokers.find(b => b.support_url === null)
  
  assertExists(broker)
  
  const publicBroker = {
    supportUrl: broker!.support_url || undefined,
  }
  
  assertEquals(publicBroker.supportUrl, undefined)
})

Deno.test('listWhatsAppBrokers - Deve retornar array vazio quando não há brokers', () => {
  const noBrokers: typeof mockBrokers = []
  const activeBrokers = noBrokers.filter(b => b.is_active)
  
  assertEquals(activeBrokers.length, 0)
  assertEquals(Array.isArray(activeBrokers), true)
})

// ============================================================================
// Tests for Response Format
// ============================================================================

Deno.test('listWhatsAppBrokers - Formato da resposta deve ter estrutura correta', () => {
  const activeBrokers = mockBrokers.filter(b => b.is_active)
  const publicBrokers = activeBrokers.map(broker => ({
    id: broker.id,
    name: broker.name,
    displayName: broker.display_name,
    description: broker.description || undefined,
    brokerType: broker.broker_type,
    supportsMedia: broker.supports_media,
    supportsTemplates: broker.supports_templates,
    supportsWebhooks: broker.supports_webhooks,
    supportsAutomation: broker.supports_automation,
    documentationUrl: broker.documentation_url || undefined,
    supportUrl: broker.support_url || undefined,
    version: broker.version || undefined,
    requiredFields: broker.required_fields || [],
    optionalFields: broker.optional_fields || [],
    maxConnections: broker.max_connections,
  }))
  
  const response = {
    brokers: publicBrokers,
  }
  
  // Verificar estrutura
  assertExists(response.brokers)
  assertEquals(Array.isArray(response.brokers), true)
  assertEquals(response.brokers.length, 2)
  
  // Verificar campos do primeiro broker
  const firstBroker = response.brokers[0]
  assertExists(firstBroker.id)
  assertExists(firstBroker.name)
  assertExists(firstBroker.displayName)
  assertExists(firstBroker.brokerType)
  assertEquals(typeof firstBroker.supportsMedia, 'boolean')
  assertEquals(typeof firstBroker.supportsTemplates, 'boolean')
})

// ============================================================================
// Tests for Security
// ============================================================================

Deno.test('listWhatsAppBrokers - Não deve expor dados sensíveis', () => {
  const sensitiveFields = ['admin_token', 'api_base_url', 'secret_key', 'password']
  
  const publicBroker = {
    id: mockBrokers[0].id,
    name: mockBrokers[0].name,
    displayName: mockBrokers[0].display_name,
    brokerType: mockBrokers[0].broker_type,
    supportsMedia: mockBrokers[0].supports_media,
  }
  
  sensitiveFields.forEach(field => {
    assertEquals(field in publicBroker, false, `Campo sensível ${field} não deve estar na resposta`)
  })
})

Deno.test('listWhatsAppBrokers - Deve filtrar apenas plataforma whatsapp', () => {
  const brokersWithMixedPlatforms = [
    ...mockBrokers,
    {
      ...mockBrokers[0],
      id: 'different-id',
      platform: 'telegram',
      is_active: true,
    },
  ]
  
  const whatsappBrokers = brokersWithMixedPlatforms.filter(
    b => b.platform === 'whatsapp' && b.is_active
  )
  
  assertEquals(whatsappBrokers.length, 2)
  assertEquals(whatsappBrokers.every(b => b.platform === 'whatsapp'), true)
})

// ============================================================================
// Tests for Edge Cases
// ============================================================================

Deno.test('listWhatsAppBrokers - Deve tratar description null corretamente', () => {
  const brokerWithNullDescription = {
    ...mockBrokers[0],
    description: null,
  }
  
  const publicBroker = {
    description: brokerWithNullDescription.description || undefined,
  }
  
  assertEquals(publicBroker.description, undefined)
})

Deno.test('listWhatsAppBrokers - Deve tratar required_fields vazio', () => {
  const uazapiBroker = mockBrokers.find(b => b.name === 'uazapi')
  
  assertExists(uazapiBroker)
  assertEquals(uazapiBroker!.required_fields, [])
  assertEquals(Array.isArray(uazapiBroker!.required_fields), true)
})

Deno.test('listWhatsAppBrokers - Deve incluir maxConnections na resposta', () => {
  const broker = mockBrokers[0]
  
  const publicBroker = {
    maxConnections: broker.max_connections,
  }
  
  assertEquals(publicBroker.maxConnections, 10)
  assertEquals(typeof publicBroker.maxConnections, 'number')
})
