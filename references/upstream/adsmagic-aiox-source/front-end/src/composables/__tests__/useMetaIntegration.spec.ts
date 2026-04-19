/**
 * Unit tests for useMetaIntegration composable
 * 
 * Tests for OAuth callback handling covering:
 * - Happy path: valid session, callback processed successfully
 * - Edge case: session lost during OAuth (should reload and retry)
 * - Edge case: 401 error after retry (should show friendly error)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMetaIntegration } from '../useMetaIntegration'
import { ensureSession } from '@/services/api/client'
import { integrationsService } from '@/services/api/integrations'
import { openOAuthPopup } from '../useOAuthPopup'

// Mock dependencies
vi.mock('@/services/api/client', () => ({
  ensureSession: vi.fn(),
  getApiErrorMessage: vi.fn((error: unknown) => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    return 'Erro desconhecido'
  }),
}))

vi.mock('@/services/api/integrations', () => ({
  integrationsService: {
    startOAuth: vi.fn(),
    handleOAuthCallback: vi.fn(),
    getPixels: vi.fn(),
  },
}))

vi.mock('../useOAuthPopup', () => ({
  openOAuthPopup: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: { projectId: 'test-project-id' },
    params: { locale: 'pt' },
  }),
}))

describe('useMetaIntegration - OAuth Callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('DEV', true)
  })

  it('should process callback successfully when session is valid', async () => {
    // Arrange
    const mockSession = {
      access_token: 'valid-token',
      refresh_token: 'refresh-token',
    }
    
    const mockResult = {
      success: true,
      integrationId: 'integration-123',
      accounts: [
        {
          id: 'acc-1',
          name: 'Account 1',
          accountId: 'act_123',
          type: 'ad_account' as const,
          permissions: ['read', 'write'],
        },
      ],
    }

    vi.mocked(ensureSession).mockResolvedValue(mockSession)
    vi.mocked(integrationsService.startOAuth).mockResolvedValue({
      authUrl: 'https://meta.com/auth',
    })
    vi.mocked(integrationsService.handleOAuthCallback).mockResolvedValue(mockResult)
    vi.mocked(integrationsService.getPixels).mockResolvedValue([])
    vi.mocked(openOAuthPopup).mockImplementation(({ onSuccess }) => {
      // Simulate successful OAuth callback
      return Promise.resolve(onSuccess('oauth-token'))
    })

    // Act
    const integration = useMetaIntegration()
    await integration.startOAuth()

    // Assert
    expect(ensureSession).toHaveBeenCalled()
    expect(integrationsService.handleOAuthCallback).toHaveBeenCalledWith('meta', 'oauth-token')
    expect(integration.integrationId.value).toBe('integration-123')
    expect(integration.availableAccounts.value).toHaveLength(1)
  })

  it('should reload session and retry when session is lost during OAuth', async () => {
    // Arrange
    const mockResult = {
      success: true,
      integrationId: 'integration-123',
      accounts: [
        {
          id: 'acc-1',
          name: 'Account 1',
          accountId: 'act_123',
          type: 'ad_account' as const,
          permissions: ['read', 'write'],
        },
      ],
    }

    // First call: no session, second call: session restored
    vi.mocked(ensureSession)
      .mockResolvedValueOnce(null) // First check: no session
      .mockResolvedValueOnce({ access_token: 'restored-token', refresh_token: 'refresh' }) // Retry: session restored

    vi.mocked(integrationsService.startOAuth).mockResolvedValue({
      authUrl: 'https://meta.com/auth',
    })
    vi.mocked(integrationsService.handleOAuthCallback).mockResolvedValue(mockResult)
    vi.mocked(integrationsService.getPixels).mockResolvedValue([])
    vi.mocked(openOAuthPopup).mockImplementation(({ onSuccess }) => {
      return Promise.resolve(onSuccess('oauth-token'))
    })

    // Act
    const integration = useMetaIntegration()
    await integration.startOAuth()

    // Assert
    expect(ensureSession).toHaveBeenCalledTimes(2) // Initial check + retry
    expect(integrationsService.handleOAuthCallback).toHaveBeenCalledWith('meta', 'oauth-token')
    expect(integration.integrationId.value).toBe('integration-123')
  })

  it('should show friendly error when session cannot be restored', async () => {
    // Arrange
    // First call: no session, second call (retry): still no session
    vi.mocked(ensureSession)
      .mockResolvedValueOnce(null) // First check: no session
      .mockResolvedValueOnce(null) // Retry: still no session

    vi.mocked(integrationsService.startOAuth).mockResolvedValue({
      authUrl: 'https://meta.com/auth',
    })
    vi.mocked(openOAuthPopup).mockImplementation(({ onSuccess }) => {
      return Promise.resolve(onSuccess('oauth-token'))
    })

    // Act & Assert
    const integration = useMetaIntegration()
    await expect(integration.startOAuth()).rejects.toThrow('Sessão expirada')
    
    expect(ensureSession).toHaveBeenCalledTimes(2) // Initial check + retry
    expect(integration.error.value).toContain('Sessão expirada')
    expect(integration.integrationId.value).toBeNull()
  })

  it('should retry callback with restored session on 401 error', async () => {
    // Arrange
    const mockSession = { access_token: 'token', refresh_token: 'refresh' }
    const mockResult = {
      success: true,
      integrationId: 'integration-123',
      accounts: [{ 
        id: 'acc-1', 
        name: 'Account 1', 
        accountId: 'act_123',
        type: 'ad_account' as const,
        permissions: ['read', 'write'],
      }],
    }

    vi.mocked(ensureSession).mockResolvedValue(mockSession)
    vi.mocked(integrationsService.startOAuth).mockResolvedValue({
      authUrl: 'https://meta.com/auth',
    })
    
    // First call fails with 401, retry succeeds
    vi.mocked(integrationsService.handleOAuthCallback)
      .mockRejectedValueOnce({
        response: { status: 401 },
        isAxiosError: true,
      } as unknown)
      .mockResolvedValueOnce(mockResult)

    vi.mocked(integrationsService.getPixels).mockResolvedValue([])
    vi.mocked(openOAuthPopup).mockImplementation(({ onSuccess }) => {
      return Promise.resolve(onSuccess('oauth-token'))
    })

    // Act
    const integration = useMetaIntegration()
    await integration.startOAuth()

    // Assert
    expect(integrationsService.handleOAuthCallback).toHaveBeenCalledTimes(2) // Initial + retry
    expect(integration.integrationId.value).toBe('integration-123')
    expect(integration.availableAccounts.value).toHaveLength(1)
  })

  it('should show friendly error when retry fails with 401', async () => {
    // Arrange
    const mockSession = { access_token: 'token', refresh_token: 'refresh' }

    vi.mocked(ensureSession)
      .mockResolvedValueOnce(mockSession) // Initial check
      .mockResolvedValueOnce(mockSession) // Retry check after 401

    vi.mocked(integrationsService.startOAuth).mockResolvedValue({
      authUrl: 'https://meta.com/auth',
    })
    
    // Both calls fail with 401
    const axiosError = {
      response: { status: 401 },
      isAxiosError: true,
      message: 'Unauthorized',
    }
    vi.mocked(integrationsService.handleOAuthCallback).mockRejectedValue(axiosError)

    vi.mocked(openOAuthPopup).mockImplementation(({ onSuccess }) => {
      return Promise.resolve(onSuccess('oauth-token'))
    })

    // Act & Assert
    const integration = useMetaIntegration()
    await expect(integration.startOAuth()).rejects.toThrow('Sessão expirada durante autenticação')

    // Assert
    expect(integrationsService.handleOAuthCallback).toHaveBeenCalledTimes(2) // Initial + retry
    expect(integration.error.value).toContain('Sessão expirada durante autenticação')
    expect(integration.integrationId.value).toBeNull()
  })
})

