/**
 * Testes unitários para whatsappAdapter
 *
 * Testa normalização de dados entre backend (snake_case) e frontend (camelCase)
 * para a integração WhatsApp Multi-Broker.
 *
 * Cobertura:
 * - Type guards para validação de dados
 * - Normalização de brokers
 * - Normalização de instâncias
 * - Normalização de status de conexão
 * - Normalização de contas conectadas
 * - Métodos auxiliares (getConnectionMethod, supportsInstanceCreation, formatPhoneNumber)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { whatsappAdapter } from '../whatsappAdapter'
import { WHATSAPP_BROKER_TYPES } from '@/types/whatsapp'
import type {
  BackendWhatsAppBroker,
  BackendWhatsAppInstance,
  BackendConnectionStatus,
  BackendConnectedAccount,
  WhatsAppBroker,
} from '@/types/whatsapp'

// Mock console.warn para evitar poluir output dos testes
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

// ============================================================================
// DADOS DE MOCK
// ============================================================================

const createMockBackendBroker = (overrides?: Partial<BackendWhatsAppBroker>): BackendWhatsAppBroker => ({
  id: 'broker-uuid-123',
  name: 'uazapi',
  display_name: 'WhatsApp via uazapi',
  description: 'Integração WhatsApp via uazapi',
  broker_type: 'api',
  supports_media: true,
  supports_templates: true,
  supports_webhooks: true,
  documentation_url: 'https://docs.uazapi.com',
  required_fields: [
    {
      name: 'apiKey',
      label: 'API Key',
      type: 'password',
      placeholder: 'Sua API Key',
      description: 'API Key do uazapi',
      required: true,
    },
  ],
  ...overrides,
})

const createMockBackendInstance = (overrides?: Partial<BackendWhatsAppInstance>): BackendWhatsAppInstance => ({
  instance_id: 'instance-123',
  instance_name: 'Minha Instância',
  broker_type: 'uazapi',
  status: 'disconnected',
  account_id: 'account-uuid-456',
  broker_specific_data: { key: 'value' },
  ...overrides,
})

const createMockBackendConnectionStatus = (overrides?: Partial<BackendConnectionStatus>): BackendConnectionStatus => ({
  status: 'connecting',
  connection_method: 'qr_code',
  qrcode: 'base64-qr-code-data',
  phone_number: '5511999999999',
  profile_name: 'Minha Empresa',
  profile_photo: 'https://photo.url/photo.jpg',
  error_message: undefined,
  last_checked_at: '2025-01-20T10:00:00Z',
  ...overrides,
})

const createMockBackendConnectedAccount = (overrides?: Partial<BackendConnectedAccount>): BackendConnectedAccount => ({
  account_id: 'account-uuid-789',
  phone_number: '5511999999999',
  profile_name: 'Empresa WhatsApp',
  broker_type: 'uazapi',
  status: 'connected',
  profile_photo: 'https://photo.url/avatar.jpg',
  connected_at: '2025-01-20T15:30:00Z',
  ...overrides,
})

// ============================================================================
// TESTES - normalizeBrokerList
// ============================================================================

describe('whatsappAdapter', () => {
  describe('normalizeBrokerList', () => {
    it('should normalize valid backend broker list', () => {
      const backendBrokers = [
        createMockBackendBroker(),
        createMockBackendBroker({ id: 'broker-2', name: 'gupshup', display_name: 'Gupshup' }),
      ]

      const result = whatsappAdapter.normalizeBrokerList(backendBrokers)

      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('broker-uuid-123')
      expect(result[0]?.name).toBe('uazapi')
      expect(result[0]?.displayName).toBe('WhatsApp via uazapi')
      expect(result[0]?.description).toBe('Integração WhatsApp via uazapi')
      expect(result[0]?.brokerType).toBe('api')
      expect(result[0]?.supportsMedia).toBe(true)
      expect(result[0]?.supportsTemplates).toBe(true)
      expect(result[0]?.supportsWebhooks).toBe(true)
      expect(result[0]?.documentationUrl).toBe('https://docs.uazapi.com')
    })

    it('should normalize required_fields correctly', () => {
      const backendBroker = createMockBackendBroker()
      const result = whatsappAdapter.normalizeBrokerList([backendBroker])

      expect(result[0]?.requiredFields).toHaveLength(1)
      expect(result[0]?.requiredFields?.[0]).toEqual({
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Sua API Key',
        description: 'API Key do uazapi',
        required: true,
      })
    })

    it('should use name as displayName if display_name is not provided', () => {
      const backendBroker = createMockBackendBroker({
        display_name: undefined as unknown as string,
      })

      const result = whatsappAdapter.normalizeBrokerList([backendBroker])

      expect(result[0]?.displayName).toBe('uazapi')
    })

    it('should return empty array when input is not an array', () => {
      expect(whatsappAdapter.normalizeBrokerList(null)).toEqual([])
      expect(whatsappAdapter.normalizeBrokerList(undefined)).toEqual([])
      expect(whatsappAdapter.normalizeBrokerList('not an array')).toEqual([])
      expect(whatsappAdapter.normalizeBrokerList({})).toEqual([])
      expect(whatsappAdapter.normalizeBrokerList(123)).toEqual([])
    })

    it('should filter out invalid brokers', () => {
      const mixedData = [
        createMockBackendBroker(),
        { id: '', name: 'invalid' }, // id vazio
        { id: 'valid-id', name: '' }, // name vazio
        { id: 'valid-id' }, // sem name
        { name: 'valid-name' }, // sem id
        null,
        undefined,
        'string',
        123,
      ]

      const result = whatsappAdapter.normalizeBrokerList(mixedData)

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('broker-uuid-123')
    })

    it('should return empty array for empty input array', () => {
      expect(whatsappAdapter.normalizeBrokerList([])).toEqual([])
    })

    it('should handle broker without optional fields', () => {
      const minimalBroker = {
        id: 'minimal-broker',
        name: 'minimal',
        display_name: 'Minimal Broker',
        broker_type: 'api',
        supports_media: false,
        supports_templates: false,
        supports_webhooks: false,
      }

      const result = whatsappAdapter.normalizeBrokerList([minimalBroker])

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('minimal-broker')
      expect(result[0]?.description).toBeUndefined()
      expect(result[0]?.documentationUrl).toBeUndefined()
      expect(result[0]?.requiredFields).toBeUndefined()
    })
  })

  // ============================================================================
  // TESTES - normalizeInstanceData
  // ============================================================================

  describe('normalizeInstanceData', () => {
    it('should normalize valid backend instance for uazapi', () => {
      const backendInstance = createMockBackendInstance()

      const result = whatsappAdapter.normalizeInstanceData('uazapi', backendInstance)

      expect(result.instanceId).toBe('instance-123')
      expect(result.instanceName).toBe('Minha Instância')
      expect(result.brokerType).toBe('uazapi')
      expect(result.status).toBe('disconnected')
      expect(result.accountId).toBe('account-uuid-456')
      expect(result.brokerSpecificData).toEqual({ key: 'value' })
    })

    it('should normalize broker type correctly', () => {
      const instance = createMockBackendInstance({ broker_type: 'gupshup' })

      const result = whatsappAdapter.normalizeInstanceData('gupshup', instance)

      expect(result.brokerType).toBe('gupshup')
    })

    it('should normalize unknown broker type to uazapi', () => {
      const instance = createMockBackendInstance({ broker_type: 'unknown_broker' })

      const result = whatsappAdapter.normalizeInstanceData('unknown_broker', instance)

      expect(result.brokerType).toBe('uazapi')
    })

    it('should map "official" to "official_whatsapp"', () => {
      const instance = createMockBackendInstance({ broker_type: 'official' })

      const result = whatsappAdapter.normalizeInstanceData('official', instance)

      expect(result.brokerType).toBe('official_whatsapp')
    })

    it('should return default instance when data is invalid', () => {
      const invalidData = { invalid: 'data' }

      const result = whatsappAdapter.normalizeInstanceData('uazapi', invalidData)

      expect(result.instanceId).toBe('')
      expect(result.instanceName).toBe('')
      expect(result.brokerType).toBe('uazapi')
      expect(result.status).toBe('disconnected')
    })

    it('should return default instance when data is null', () => {
      const result = whatsappAdapter.normalizeInstanceData('uazapi', null)

      expect(result.instanceId).toBe('')
      expect(result.instanceName).toBe('')
      expect(result.status).toBe('disconnected')
    })

    it('should return default instance when data is undefined', () => {
      const result = whatsappAdapter.normalizeInstanceData('uazapi', undefined)

      expect(result.instanceId).toBe('')
      expect(result.instanceName).toBe('')
    })
  })

  // ============================================================================
  // TESTES - normalizeConnectionStatus
  // ============================================================================

  describe('normalizeConnectionStatus', () => {
    describe('common fields', () => {
      it('should normalize basic connection status', () => {
        const backendStatus = createMockBackendConnectionStatus()

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.status).toBe('connecting')
        expect(result.phoneNumber).toBe('5511999999999')
        expect(result.profileName).toBe('Minha Empresa')
        expect(result.lastCheckedAt).toBe('2025-01-20T10:00:00Z')
      })

      it('should normalize error message', () => {
        const backendStatus = createMockBackendConnectionStatus({
          status: 'error',
          error_message: 'Connection timeout',
        })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.status).toBe('error')
        expect(result.errorMessage).toBe('Connection timeout')
      })
    })

    describe('status normalization', () => {
      it.each([
        ['disconnected', 'disconnected'],
        ['connecting', 'connecting'],
        ['connected', 'connected'],
        ['error', 'error'],
        ['open', 'connected'],
        ['close', 'disconnected'],
        ['qrcode', 'connecting'],
        ['timeout', 'disconnected'],
        ['conflicted', 'error'],
        ['OPEN', 'connected'],
        ['CLOSE', 'disconnected'],
      ])('should normalize status "%s" to "%s"', (input, expected) => {
        const backendStatus = createMockBackendConnectionStatus({ status: input as any })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.status).toBe(expected)
      })

      it('should default to disconnected for unknown status', () => {
        const backendStatus = createMockBackendConnectionStatus({ status: 'unknown_status' as any })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.status).toBe('disconnected')
      })
    })

    describe('uazapi broker', () => {
      it('should include QR code for uazapi', () => {
        const backendStatus = createMockBackendConnectionStatus({ qrcode: 'qr-code-base64' })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.connectionMethod).toBe('qr_code')
        expect(result.qrcode).toBe('qr-code-base64')
      })

      it('should include pair code for uazapi', () => {
        const backendStatus = createMockBackendConnectionStatus({
          connection_method: 'pair_code',
          pair_code: '123456',
        })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.connectionMethod).toBe('pair_code')
        expect(result.pairCode).toBe('123456')
      })

      it('should include profile photo for uazapi', () => {
        const backendStatus = createMockBackendConnectionStatus({
          profile_photo: 'https://photo.url/avatar.jpg',
        })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.profilePhoto).toBe('https://photo.url/avatar.jpg')
      })
    })

    describe('gupshup broker', () => {
      it('should use credentials as connection method for gupshup', () => {
        const backendStatus = createMockBackendConnectionStatus()

        const result = whatsappAdapter.normalizeConnectionStatus('gupshup', backendStatus)

        expect(result.connectionMethod).toBe('credentials')
      })

      it('should not include QR code for gupshup', () => {
        const backendStatus = createMockBackendConnectionStatus({ qrcode: 'qr-code' })

        const result = whatsappAdapter.normalizeConnectionStatus('gupshup', backendStatus)

        expect(result.qrcode).toBeUndefined()
      })
    })

    describe('official_whatsapp broker', () => {
      it('should include oauth_url for official_whatsapp', () => {
        const backendStatus = createMockBackendConnectionStatus({
          connection_method: 'oauth',
          oauth_url: 'https://facebook.com/oauth',
        })

        const result = whatsappAdapter.normalizeConnectionStatus('official_whatsapp', backendStatus)

        expect(result.connectionMethod).toBe('oauth')
        expect(result.oauthUrl).toBe('https://facebook.com/oauth')
      })

      it('should default to credentials for official_whatsapp', () => {
        const backendStatus = createMockBackendConnectionStatus({
          connection_method: undefined,
        })

        const result = whatsappAdapter.normalizeConnectionStatus('official_whatsapp', backendStatus)

        expect(result.connectionMethod).toBe('credentials')
      })

      it('should include profile photo for official_whatsapp', () => {
        const backendStatus = createMockBackendConnectionStatus({
          profile_photo: 'https://photo.url/avatar.jpg',
        })

        const result = whatsappAdapter.normalizeConnectionStatus('official_whatsapp', backendStatus)

        expect(result.profilePhoto).toBe('https://photo.url/avatar.jpg')
      })
    })

    describe('invalid data handling', () => {
      it('should return default status when data is invalid', () => {
        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', { invalid: 'data' })

        expect(result.status).toBe('disconnected')
      })

      it('should return default status when data is null', () => {
        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', null)

        expect(result.status).toBe('disconnected')
      })

      it('should return default status when data is undefined', () => {
        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', undefined)

        expect(result.status).toBe('disconnected')
      })
    })

    describe('connection method normalization', () => {
      it.each([
        ['qr_code', 'qr_code'],
        ['oauth', 'oauth'],
        ['credentials', 'credentials'],
        ['pair_code', 'pair_code'],
        ['qrcode', 'qr_code'],
        ['qr', 'qr_code'],
        ['paircode', 'pair_code'],
        ['pair', 'pair_code'],
      ])('should normalize connection method "%s" to "%s"', (input, expected) => {
        const backendStatus = createMockBackendConnectionStatus({
          connection_method: input as any,
        })

        const result = whatsappAdapter.normalizeConnectionStatus('uazapi', backendStatus)

        expect(result.connectionMethod).toBe(expected)
      })
    })
  })

  // ============================================================================
  // TESTES - normalizeAccountData
  // ============================================================================

  describe('normalizeAccountData', () => {
    it('should normalize valid connected account', () => {
      const backendAccount = createMockBackendConnectedAccount()

      const result = whatsappAdapter.normalizeAccountData('uazapi', backendAccount)

      expect(result.accountId).toBe('account-uuid-789')
      expect(result.phoneNumber).toBe('5511999999999')
      expect(result.profileName).toBe('Empresa WhatsApp')
      expect(result.brokerType).toBe('uazapi')
      expect(result.status).toBe('connected')
      expect(result.profilePhoto).toBe('https://photo.url/avatar.jpg')
      expect(result.connectedAt).toBe('2025-01-20T15:30:00Z')
    })

    it('should normalize disconnected account', () => {
      const backendAccount = createMockBackendConnectedAccount({ status: 'disconnected' })

      const result = whatsappAdapter.normalizeAccountData('uazapi', backendAccount)

      expect(result.status).toBe('disconnected')
    })

    it('should use broker_type from data if available', () => {
      const backendAccount = createMockBackendConnectedAccount({ broker_type: 'gupshup' })

      const result = whatsappAdapter.normalizeAccountData('uazapi', backendAccount)

      expect(result.brokerType).toBe('gupshup')
    })

    it('should return default account when data is invalid', () => {
      const result = whatsappAdapter.normalizeAccountData('uazapi', { invalid: 'data' })

      expect(result.accountId).toBe('')
      expect(result.phoneNumber).toBe('')
      expect(result.brokerType).toBe('uazapi')
      expect(result.status).toBe('disconnected')
    })

    it('should return default account when data is null', () => {
      const result = whatsappAdapter.normalizeAccountData('uazapi', null)

      expect(result.accountId).toBe('')
      expect(result.phoneNumber).toBe('')
    })

    it('should handle missing optional fields', () => {
      const minimalAccount = {
        account_id: 'account-123',
        phone_number: '5511999999999',
        status: 'connected' as const,
      }

      const result = whatsappAdapter.normalizeAccountData('uazapi', minimalAccount)

      expect(result.accountId).toBe('account-123')
      expect(result.phoneNumber).toBe('5511999999999')
      expect(result.profileName).toBeUndefined()
      expect(result.profilePhoto).toBeUndefined()
      expect(result.connectedAt).toBeUndefined()
    })
  })

  // ============================================================================
  // TESTES - getConnectionMethod
  // ============================================================================

  describe('getConnectionMethod', () => {
    it('should return connectionMethod from broker if defined', () => {
      const broker: WhatsAppBroker = {
        id: 'broker-1',
        name: 'custom',
        displayName: 'Custom Broker',
        brokerType: 'api',
        supportsMedia: true,
        supportsTemplates: false,
        supportsWebhooks: false,
        connectionMethod: 'oauth',
      }

      const result = whatsappAdapter.getConnectionMethod(broker)

      expect(result).toBe('oauth')
    })

    it('should return qr_code for uazapi broker', () => {
      const broker: WhatsAppBroker = {
        id: 'broker-1',
        name: 'uazapi',
        displayName: 'uazapi',
        brokerType: 'api',
        supportsMedia: true,
        supportsTemplates: false,
        supportsWebhooks: false,
      }

      const result = whatsappAdapter.getConnectionMethod(broker)

      expect(result).toBe('qr_code')
    })

    it('should return credentials for gupshup broker', () => {
      const broker: WhatsAppBroker = {
        id: 'broker-1',
        name: 'gupshup',
        displayName: 'Gupshup',
        brokerType: 'api',
        supportsMedia: true,
        supportsTemplates: true,
        supportsWebhooks: true,
      }

      const result = whatsappAdapter.getConnectionMethod(broker)

      expect(result).toBe('credentials')
    })

    it('should return credentials for official_whatsapp broker', () => {
      const broker: WhatsAppBroker = {
        id: 'broker-1',
        name: 'official_whatsapp',
        displayName: 'API Oficial',
        brokerType: 'official',
        supportsMedia: true,
        supportsTemplates: true,
        supportsWebhooks: true,
      }

      const result = whatsappAdapter.getConnectionMethod(broker)

      expect(result).toBe('credentials')
    })

    it('should default to qr_code for unknown broker', () => {
      const broker: WhatsAppBroker = {
        id: 'broker-1',
        name: 'unknown_broker',
        displayName: 'Unknown',
        brokerType: 'api',
        supportsMedia: false,
        supportsTemplates: false,
        supportsWebhooks: false,
      }

      const result = whatsappAdapter.getConnectionMethod(broker)

      expect(result).toBe('qr_code')
    })
  })

  // ============================================================================
  // TESTES - supportsInstanceCreation
  // ============================================================================

  describe('supportsInstanceCreation', () => {
    it('should return true for uazapi', () => {
      expect(whatsappAdapter.supportsInstanceCreation(WHATSAPP_BROKER_TYPES.UAZAPI)).toBe(true)
    })

    it('should return false for gupshup', () => {
      expect(whatsappAdapter.supportsInstanceCreation(WHATSAPP_BROKER_TYPES.GUPSHUP)).toBe(false)
    })

    it('should return false for official_whatsapp', () => {
      expect(whatsappAdapter.supportsInstanceCreation(WHATSAPP_BROKER_TYPES.OFFICIAL_WHATSAPP)).toBe(false)
    })

    it('should return false for unknown broker type', () => {
      // Casting para simular valor runtime inválido
      const unknownType = 'unknown_type' as 'uazapi'
      expect(whatsappAdapter.supportsInstanceCreation(unknownType)).toBe(false)
    })
  })

  // ============================================================================
  // TESTES - formatPhoneNumber
  // ============================================================================

  describe('formatPhoneNumber', () => {
    describe('Brazilian phone numbers', () => {
      it('should format Brazilian mobile with 9 digits (55 + DDD + 9 + XXXXXXXX)', () => {
        const result = whatsappAdapter.formatPhoneNumber('5511999999999')

        expect(result).toBe('+55 (11) 99999-9999')
      })

      it('should format Brazilian landline (55 + DDD + XXXXXXXX)', () => {
        const result = whatsappAdapter.formatPhoneNumber('551133333333')

        expect(result).toBe('+55 (11) 3333-3333')
      })

      it('should handle phone with + prefix', () => {
        const result = whatsappAdapter.formatPhoneNumber('+5511999999999')

        expect(result).toBe('+55 (11) 99999-9999')
      })

      it('should handle phone with spaces and dashes', () => {
        const result = whatsappAdapter.formatPhoneNumber('+55 11 99999-9999')

        expect(result).toBe('+55 (11) 99999-9999')
      })
    })

    describe('international phone numbers', () => {
      it('should add + prefix to international number without it', () => {
        const result = whatsappAdapter.formatPhoneNumber('14155551234')

        expect(result).toBe('+14155551234')
      })

      it('should preserve + prefix on international number', () => {
        const result = whatsappAdapter.formatPhoneNumber('+14155551234')

        expect(result).toBe('+14155551234')
      })
    })

    describe('edge cases', () => {
      it('should return empty string for null', () => {
        expect(whatsappAdapter.formatPhoneNumber(null)).toBe('')
      })

      it('should return empty string for undefined', () => {
        expect(whatsappAdapter.formatPhoneNumber(undefined)).toBe('')
      })

      it('should return empty string for empty string', () => {
        expect(whatsappAdapter.formatPhoneNumber('')).toBe('')
      })

      it('should handle short Brazilian number', () => {
        const result = whatsappAdapter.formatPhoneNumber('5511999')

        expect(result).toBe('+5511999')
      })
    })
  })
})
