/**
 * Testes unitários para whatsappIntegrationService
 *
 * Testa a camada de comunicação com a API de integração WhatsApp Multi-Broker.
 *
 * Cobertura:
 * - Todos os métodos do serviço
 * - Mapeamento de erros HTTP para erros tipados
 * - Retry automático com backoff exponencial
 * - Normalização de dados via adapter
 * - Tratamento de erros de rede
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { whatsappIntegrationService } from '../whatsappIntegrationService'
import type {
  BackendWhatsAppBroker,
  BackendWhatsAppInstance,
  BackendConnectionStatus,
  WhatsAppIntegrationError,
} from '@/types/whatsapp'

// ============================================================================
// HELPER TYPE PARA RESULTADOS DE ERRO
// ============================================================================

type ErrorResult = { success: false; error: WhatsAppIntegrationError }

// ============================================================================
// MOCKS
// ============================================================================

// Mock do apiClient
const mockGet = vi.fn()
const mockPost = vi.fn()

vi.mock('../client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  getApiErrorMessage: (error: unknown) => {
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message
    }
    return 'Unknown error'
  },
}))

// Mock do whatsappAdapter
const mockNormalizeBrokerList = vi.fn()
const mockNormalizeInstanceData = vi.fn()
const mockNormalizeConnectionStatus = vi.fn()
const mockNormalizeAccountData = vi.fn()

vi.mock('@/services/adapters/whatsappAdapter', () => ({
  whatsappAdapter: {
    normalizeBrokerList: (...args: unknown[]) => mockNormalizeBrokerList(...args),
    normalizeInstanceData: (...args: unknown[]) => mockNormalizeInstanceData(...args),
    normalizeConnectionStatus: (...args: unknown[]) => mockNormalizeConnectionStatus(...args),
    normalizeAccountData: (...args: unknown[]) => mockNormalizeAccountData(...args),
  },
}))

// Mock console para evitar poluição
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.clearAllMocks()

  // Setup timers for retry tests
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ============================================================================
// DADOS DE MOCK
// ============================================================================

const mockBackendBrokers: BackendWhatsAppBroker[] = [
  {
    id: 'broker-1',
    name: 'uazapi',
    display_name: 'WhatsApp via uazapi',
    description: 'Integração via uazapi',
    broker_type: 'api',
    supports_media: true,
    supports_templates: true,
    supports_webhooks: true,
  },
]

const mockNormalizedBrokers = [
  {
    id: 'broker-1',
    name: 'uazapi',
    displayName: 'WhatsApp via uazapi',
    description: 'Integração via uazapi',
    brokerType: 'api',
    supportsMedia: true,
    supportsTemplates: true,
    supportsWebhooks: true,
  },
]

const mockBackendInstance: BackendWhatsAppInstance = {
  instance_id: 'instance-123',
  instance_name: 'Test Instance',
  broker_type: 'uazapi',
  status: 'disconnected',
  account_id: 'account-456',
}

const mockNormalizedInstance = {
  instanceId: 'instance-123',
  instanceName: 'Test Instance',
  brokerType: 'uazapi',
  status: 'disconnected',
  accountId: 'account-456',
}

const mockBackendConnectionStatus: BackendConnectionStatus = {
  status: 'connecting',
  connection_method: 'qr_code',
  qrcode: 'base64-qr-code',
  phone_number: '5511999999999',
  profile_name: 'Test Profile',
}

const mockNormalizedConnectionStatus = {
  status: 'connecting',
  connectionMethod: 'qr_code',
  qrcode: 'base64-qr-code',
  phoneNumber: '5511999999999',
  profileName: 'Test Profile',
}

// ============================================================================
// HELPERS
// ============================================================================

function createAxiosError(status: number, code?: string) {
  return {
    response: {
      status,
      data: { code, message: `Error ${status}` },
    },
    message: `Request failed with status code ${status}`,
  }
}

function createNetworkError() {
  return {
    message: 'Network Error',
    code: 'ERR_NETWORK',
  }
}

// ============================================================================
// TESTES - listAvailableBrokers
// ============================================================================

describe('whatsappIntegrationService', () => {
  describe('listAvailableBrokers', () => {
    it('should return list of brokers on success', async () => {
      mockGet.mockResolvedValueOnce({
        data: { brokers: mockBackendBrokers },
      })
      mockNormalizeBrokerList.mockReturnValueOnce(mockNormalizedBrokers)

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockNormalizedBrokers)
      }
      expect(mockGet).toHaveBeenCalledWith('/messaging/brokers', { timeout: 10000 })
      expect(mockNormalizeBrokerList).toHaveBeenCalledWith(mockBackendBrokers)
    })

    it('should return error on API failure', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(500))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNKNOWN_ERROR')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should handle 401 unauthorized error', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(401))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNAUTHORIZED')
      expect(errorResult.error.message).toContain('Sessão expirada')
      expect(errorResult.error.recoverable).toBe(false)
    })

    it('should handle 404 error with BROKER_NOT_FOUND code', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(404, 'BROKER_NOT_FOUND'))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('BROKER_NOT_FOUND')
    })

    it('should handle 429 rate limited error', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(429))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('RATE_LIMITED')
      expect(errorResult.error.message).toContain('Limite de requisições')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should handle network error', async () => {
      mockGet.mockRejectedValueOnce(createNetworkError())

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('NETWORK_ERROR')
      expect(errorResult.error.message).toContain('conexão')
      expect(errorResult.error.recoverable).toBe(true)
    })
  })

  // ============================================================================
  // TESTES - createInstance
  // ============================================================================

  describe('createInstance', () => {
    const createInstanceParams = {
      projectId: 'project-123',
      brokerId: 'broker-456',
    }

    it('should create instance successfully', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          instance: mockBackendInstance,
          qrcode: 'initial-qr-code',
          account_id: 'account-789',
        },
      })
      mockNormalizeInstanceData.mockReturnValueOnce(mockNormalizedInstance)

      const result = await whatsappIntegrationService.createInstance(createInstanceParams)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.instance).toEqual(mockNormalizedInstance)
        expect(result.data.qrcode).toBe('initial-qr-code')
        expect(result.data.accountId).toBe('account-789')
      }
      expect(mockPost).toHaveBeenCalledWith(
        '/messaging/instances',
        {
          projectId: 'project-123',
          brokerId: 'broker-456',
        },
        { timeout: 10000 }
      )
    })

    it('should retry on recoverable error', async () => {
      // First call fails, second succeeds
      mockPost
        .mockRejectedValueOnce(createAxiosError(500))
        .mockResolvedValueOnce({
          data: {
            instance: mockBackendInstance,
            account_id: 'account-789',
          },
        })
      mockNormalizeInstanceData.mockReturnValueOnce(mockNormalizedInstance)

      const resultPromise = whatsappIntegrationService.createInstance(createInstanceParams)

      // Advance timers to allow retry
      await vi.advanceTimersByTimeAsync(1000) // First retry delay

      const result = await resultPromise

      expect(result.success).toBe(true)
      expect(mockPost).toHaveBeenCalledTimes(2)
    })

    it('should not retry on non-recoverable error (401)', async () => {
      mockPost.mockRejectedValueOnce(createAxiosError(401))

      const result = await whatsappIntegrationService.createInstance(createInstanceParams)

      expect(result.success).toBe(false)
      expect(mockPost).toHaveBeenCalledTimes(1)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNAUTHORIZED')
    })

    it('should handle 400 INVALID_CREDENTIALS error', async () => {
      // Mock all 3 retry attempts to fail
      mockPost
        .mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))
        .mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))
        .mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))

      const resultPromise = whatsappIntegrationService.createInstance(createInstanceParams)

      // Advance through all retry delays
      await vi.advanceTimersByTimeAsync(1000 + 2000 + 3000)

      const result = await resultPromise

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('INVALID_CREDENTIALS')
      expect(errorResult.error.message).toContain('Credenciais inválidas')
    })

    it('should handle 400 QR_CODE_EXPIRED error', async () => {
      // Mock all 3 retry attempts to fail
      mockPost
        .mockRejectedValueOnce(createAxiosError(400, 'QR_CODE_EXPIRED'))
        .mockRejectedValueOnce(createAxiosError(400, 'QR_CODE_EXPIRED'))
        .mockRejectedValueOnce(createAxiosError(400, 'QR_CODE_EXPIRED'))

      const resultPromise = whatsappIntegrationService.createInstance(createInstanceParams)

      // Advance through all retry delays
      await vi.advanceTimersByTimeAsync(1000 + 2000 + 3000)

      const result = await resultPromise

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('QR_CODE_EXPIRED')
      expect(errorResult.error.recoverable).toBe(true)
    })
  })

  // ============================================================================
  // TESTES - connectInstance
  // ============================================================================

  describe('connectInstance', () => {
    it('should connect instance and get QR code', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          type: 'qrcode',
          data: {
            qrCode: 'new-qr-code',
            status: 'connecting',
          },
        },
      })

      const result = await whatsappIntegrationService.connectInstance({
        accountId: 'account-123',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.qrcode).toBe('new-qr-code')
        expect(result.data.connectionMethod).toBe('qr_code')
        expect(result.data.status).toBe('connecting')
      }
      expect(mockPost).toHaveBeenCalledWith(
        '/messaging/connect/account-123',
        {},
        { timeout: 10000 }
      )
    })

    it('should connect instance with phone for pair code', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          type: 'paircode',
          data: {
            code: '123456',
            status: 'connecting',
          },
        },
      })

      const result = await whatsappIntegrationService.connectInstance({
        accountId: 'account-123',
        phone: '5511999999999',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.pairCode).toBe('123456')
        expect(result.data.connectionMethod).toBe('pair_code')
      }
      expect(mockPost).toHaveBeenCalledWith(
        '/messaging/connect/account-123',
        { phone: '5511999999999' },
        { timeout: 10000 }
      )
    })

    it('should handle connection error', async () => {
      mockPost.mockRejectedValueOnce(createAxiosError(500))

      const result = await whatsappIntegrationService.connectInstance({
        accountId: 'account-123',
      })

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.recoverable).toBe(true)
    })
  })

  // ============================================================================
  // TESTES - checkConnectionStatus
  // ============================================================================

  describe('checkConnectionStatus', () => {
    it('should check connection status successfully', async () => {
      mockGet.mockResolvedValueOnce({
        data: mockBackendConnectionStatus,
      })
      mockNormalizeConnectionStatus.mockReturnValueOnce(mockNormalizedConnectionStatus)

      const result = await whatsappIntegrationService.checkConnectionStatus('account-123')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockNormalizedConnectionStatus)
      }
      expect(mockGet).toHaveBeenCalledWith(
        '/messaging/connection-status/account-123',
        { timeout: 10000 }
      )
      expect(mockNormalizeConnectionStatus).toHaveBeenCalledWith('uazapi', mockBackendConnectionStatus)
    })

    it('should handle status check error', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(500))

      const result = await whatsappIntegrationService.checkConnectionStatus('account-123')

      expect(result.success).toBe(false)
    })
  })

  // ============================================================================
  // TESTES - configureBroker
  // ============================================================================

  describe('configureBroker', () => {
    const configureParams = {
      projectId: 'project-123',
      brokerId: 'broker-456',
      credentials: {
        apiKey: 'test-api-key',
        appName: 'test-app',
      },
    }

    it('should configure broker with valid credentials', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          valid: true,
          account_info: {
            phone_number: '5511999999999',
            account_name: 'Test Account',
          },
        },
      })

      const result = await whatsappIntegrationService.configureBroker(configureParams)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.valid).toBe(true)
        expect(result.data.accountInfo?.phoneNumber).toBe('5511999999999')
        expect(result.data.accountInfo?.accountName).toBe('Test Account')
      }
      expect(mockPost).toHaveBeenCalledWith(
        '/messaging/configure-broker',
        {
          projectId: 'project-123',
          brokerId: 'broker-456',
          credentials: {
            apiKey: 'test-api-key',
            appName: 'test-app',
          },
        },
        { timeout: 10000 }
      )
    })

    it('should handle invalid credentials response', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          valid: false,
          message: 'Invalid API key',
        },
      })

      const result = await whatsappIntegrationService.configureBroker(configureParams)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.valid).toBe(false)
        expect(result.data.message).toBe('Invalid API key')
        expect(result.data.accountInfo).toBeUndefined()
      }
    })

    it('should handle configuration error', async () => {
      mockPost.mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))

      const result = await whatsappIntegrationService.configureBroker(configureParams)

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('INVALID_CREDENTIALS')
    })
  })

  // ============================================================================
  // TESTES - saveConnectedAccount
  // ============================================================================

  describe('saveConnectedAccount', () => {
    const saveParams = {
      projectId: 'project-123',
      brokerType: 'uazapi' as const,
      instanceId: 'instance-456',
      instanceToken: 'token-789',
      phoneNumber: '5511999999999',
      profileName: 'Test Profile',
    }

    it('should save connected account successfully', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          account_id: 'account-new-123',
          phone_number: '5511999999999',
          profile_name: 'Test Profile',
          status: 'connected',
        },
      })

      const result = await whatsappIntegrationService.saveConnectedAccount(saveParams)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.accountId).toBe('account-new-123')
        expect(result.data.phoneNumber).toBe('5511999999999')
        expect(result.data.profileName).toBe('Test Profile')
        expect(result.data.status).toBe('connected')
      }
    })

    it('should retry on failure', async () => {
      mockPost
        .mockRejectedValueOnce(createAxiosError(500))
        .mockResolvedValueOnce({
          data: {
            account_id: 'account-new-123',
            phone_number: '5511999999999',
            status: 'connected',
          },
        })

      const resultPromise = whatsappIntegrationService.saveConnectedAccount(saveParams)

      await vi.advanceTimersByTimeAsync(1000)

      const result = await resultPromise

      expect(result.success).toBe(true)
      expect(mockPost).toHaveBeenCalledTimes(2)
    })

    it('should handle save error', async () => {
      // Fail all retries
      mockPost
        .mockRejectedValueOnce(createAxiosError(500))
        .mockRejectedValueOnce(createAxiosError(500))
        .mockRejectedValueOnce(createAxiosError(500))

      const resultPromise = whatsappIntegrationService.saveConnectedAccount(saveParams)

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(1000 + 2000 + 3000)

      const result = await resultPromise

      expect(result.success).toBe(false)
    })
  })

  // ============================================================================
  // TESTES - getConnectedAccount
  // ============================================================================

  describe('getConnectedAccount', () => {
    const mockBackendAccount = {
      account_id: 'account-123',
      phone_number: '5511999999999',
      profile_name: 'Test Account',
      broker_type: 'uazapi',
      status: 'connected' as const,
      profile_photo: 'https://photo.url/avatar.jpg',
      connected_at: '2025-01-20T10:00:00Z',
    }

    const mockNormalizedAccount = {
      accountId: 'account-123',
      phoneNumber: '5511999999999',
      profileName: 'Test Account',
      brokerType: 'uazapi',
      status: 'connected',
      profilePhoto: 'https://photo.url/avatar.jpg',
      connectedAt: '2025-01-20T10:00:00Z',
    }

    it('should get connected account successfully', async () => {
      mockGet.mockResolvedValueOnce({
        data: mockBackendAccount,
      })
      mockNormalizeAccountData.mockReturnValueOnce(mockNormalizedAccount)

      const result = await whatsappIntegrationService.getConnectedAccount('account-123')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockNormalizedAccount)
      }
      expect(mockGet).toHaveBeenCalledWith(
        '/messaging/accounts/account-123',
        { timeout: 10000 }
      )
    })

    it('should handle 404 error', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(404))

      const result = await whatsappIntegrationService.getConnectedAccount('account-nonexistent')

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNKNOWN_ERROR')
    })
  })

  // ============================================================================
  // TESTES - disconnectAccount
  // ============================================================================

  describe('disconnectAccount', () => {
    it('should disconnect account successfully', async () => {
      mockPost.mockResolvedValueOnce({ data: {} })

      const result = await whatsappIntegrationService.disconnectAccount('account-123')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeUndefined()
      }
      expect(mockPost).toHaveBeenCalledWith(
        '/messaging/disconnect/account-123',
        {},
        { timeout: 10000 }
      )
    })

    it('should handle disconnect error', async () => {
      mockPost.mockRejectedValueOnce(createAxiosError(500))

      const result = await whatsappIntegrationService.disconnectAccount('account-123')

      expect(result.success).toBe(false)
    })
  })

  // ============================================================================
  // TESTES - Mapeamento de Erros
  // ============================================================================

  describe('error mapping', () => {
    it('should map 401 to UNAUTHORIZED', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(401))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNAUTHORIZED')
      expect(errorResult.error.recoverable).toBe(false)
    })

    it('should map 404 with BROKER_NOT_FOUND code', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(404, 'BROKER_NOT_FOUND'))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('BROKER_NOT_FOUND')
    })

    it('should map 429 to RATE_LIMITED', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(429))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('RATE_LIMITED')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should map 5xx errors to UNKNOWN_ERROR with recoverable=true', async () => {
      mockGet.mockRejectedValueOnce(createAxiosError(503))

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNKNOWN_ERROR')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should map network errors to NETWORK_ERROR', async () => {
      mockGet.mockRejectedValueOnce({ message: 'Network Error' })

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('NETWORK_ERROR')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should map connection errors to NETWORK_ERROR', async () => {
      mockGet.mockRejectedValueOnce({ message: 'Erro de conexão' })

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('NETWORK_ERROR')
    })

    it('should map 400 INVALID_CREDENTIALS', async () => {
      // Mock all 3 retry attempts
      mockPost
        .mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))
        .mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))
        .mockRejectedValueOnce(createAxiosError(400, 'INVALID_CREDENTIALS'))

      const resultPromise = whatsappIntegrationService.createInstance({
        projectId: 'p1',
        brokerId: 'b1',
      })

      // Advance through all retry delays
      await vi.advanceTimersByTimeAsync(1000 + 2000 + 3000)

      const result = await resultPromise

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('INVALID_CREDENTIALS')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should map 400 QR_CODE_EXPIRED', async () => {
      mockPost.mockRejectedValueOnce(createAxiosError(400, 'QR_CODE_EXPIRED'))

      const result = await whatsappIntegrationService.connectInstance({
        accountId: 'a1',
      })

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('QR_CODE_EXPIRED')
      expect(errorResult.error.message).toContain('QR Code expirado')
      expect(errorResult.error.recoverable).toBe(true)
    })

    it('should handle unknown errors gracefully', async () => {
      mockGet.mockRejectedValueOnce({ unknownField: 'unknown' })

      const result = await whatsappIntegrationService.listAvailableBrokers()

      expect(result.success).toBe(false)
      const errorResult = result as ErrorResult
      expect(errorResult.error.code).toBe('UNKNOWN_ERROR')
      expect(errorResult.error.recoverable).toBe(true)
    })
  })
})
