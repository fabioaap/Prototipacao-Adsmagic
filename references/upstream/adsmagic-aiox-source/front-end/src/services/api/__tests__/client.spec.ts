/**
 * Unit tests for API client utilities
 * 
 * Tests for ensureSession() function covering:
 * - Happy path: valid session available
 * - Edge case: expired session with refresh token (should refresh)
 * - Edge case: no session available (should return null)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ensureSession, resetSessionStateForUserSwitch } from '../client'

// Mock do Supabase
const mockGetSession = vi.fn()
const mockRefreshSession = vi.fn()

vi.mock('@/services/api/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      refreshSession: () => mockRefreshSession(),
      onAuthStateChange: (_cb: any) => {
        // Provide a minimal subscription object compatible with client.waitForSessionRestore
        const subscription = { unsubscribe: () => {} }
        return { data: { subscription } }
      },
    },
  },
}))

describe('ensureSession', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Garantir estado limpo entre testes (cache de sessão/in-flight)
    resetSessionStateForUserSwitch()
    // Reset environment
    vi.stubEnv('DEV', true)
  })

  it('should return session when valid session is available', async () => {
    // Arrange
    const mockSession = {
      access_token: 'valid-access-token',
      refresh_token: 'valid-refresh-token',
      user: { id: 'user-123' },
    }

    mockGetSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    // Act
    const result = await ensureSession({ skipRestoreFallback: true })

    // Assert
    expect(result).not.toBeNull()
    expect(result?.access_token).toBe('valid-access-token')
    expect(result?.refresh_token).toBe('valid-refresh-token')
    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(mockRefreshSession).not.toHaveBeenCalled()
  })

  it('should refresh session when expired but refresh token is available', async () => {
    // Arrange
    const expiredSession = {
      access_token: null,
      refresh_token: 'valid-refresh-token',
      user: { id: 'user-123' },
    }

    const refreshedSession = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      user: { id: 'user-123' },
    }

    // Make getSession always return the expired session so refresh is attempted
    mockGetSession.mockResolvedValue({ data: { session: expiredSession }, error: null })
    mockRefreshSession.mockResolvedValue({ data: { session: refreshedSession }, error: null })

    // Act
    const result = await ensureSession({ skipRestoreFallback: true })

    // Assert
    expect(result).not.toBeNull()
    expect(result?.access_token).toBe('new-access-token')
    expect(result?.refresh_token).toBe('new-refresh-token')
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })

  it('should return null when no session is available', async () => {
    // Arrange
    // Session is null (no session object at all, so no refresh_token either)
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: null // No session and no refresh token
      },
      error: null,
    })

    // Act
    const result = await ensureSession({ skipRestoreFallback: true })

    // Assert
    expect(result).toBeNull()
    // ensureSession called getSession (may retry internally)
    expect(mockGetSession).toHaveBeenCalled()
    // Should not try to refresh if there's no session at all
    expect(mockRefreshSession).not.toHaveBeenCalled()
  })

  it('should return null when session error occurs', async () => {
    // Arrange
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Session error' },
    })

    // Act
    const result = await ensureSession({ skipRestoreFallback: true })

    // Assert
    expect(result).toBeNull()
    expect(mockGetSession).toHaveBeenCalled()
  })

  it('should return null when refresh fails', async () => {
    // Arrange
    const expiredSession = {
      access_token: null,
      refresh_token: 'valid-refresh-token',
      user: { id: 'user-123' },
    }

    // Make getSession always return expired session so refresh is attempted
    mockGetSession.mockResolvedValue({ data: { session: expiredSession }, error: null })
    mockRefreshSession.mockResolvedValue({ data: { session: null }, error: { message: 'Refresh failed' } })

    // Act
    const result = await ensureSession({ skipRestoreFallback: true })

    // Assert
    expect(result).toBeNull()
    expect(mockRefreshSession).toHaveBeenCalled()
  })

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    mockGetSession.mockRejectedValueOnce(new Error('Unexpected error'))

    // Act
    const result = await ensureSession({ skipRestoreFallback: true })

    // Assert
    expect(result).toBeNull()
    expect(mockGetSession).toHaveBeenCalledTimes(1)
  })
})

