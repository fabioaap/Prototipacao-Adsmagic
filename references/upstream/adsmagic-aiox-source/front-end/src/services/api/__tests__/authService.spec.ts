/**
 * Unit tests for authService
 *
 * Covers:
 * - resendVerificationEmail: happy path, empty email, Supabase error, Supabase disabled
 * - getSessionForConfirmation: session present, no session, error
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resendVerificationEmail, getSessionForConfirmation, buildEmailConfirmationRedirect } from '../authService'

const mockResend = vi.fn()
const mockGetSession = vi.fn()

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      resend: (...args: unknown[]) => mockResend(...args),
      getSession: () => mockGetSession(),
    },
  },
  supabaseEnabled: true,
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('resendVerificationEmail', () => {
    it('should resolve when Supabase resend succeeds', async () => {
      mockResend.mockResolvedValueOnce({ error: null })

      await expect(resendVerificationEmail('user@example.com')).resolves.toBeUndefined()
      expect(mockResend).toHaveBeenCalledTimes(1)
      const firstCallArgs = mockResend.mock.calls[0]?.[0]
      expect(firstCallArgs?.type).toBe('signup')
      expect(firstCallArgs?.email).toBe('user@example.com')
      expect(firstCallArgs?.options?.emailRedirectTo).toMatch(/\/pt\/email-confirmation$/)
    })

    it('should trim email before sending', async () => {
      mockResend.mockResolvedValueOnce({ error: null })

      await resendVerificationEmail('  user@example.com  ')
      const firstCallArgs = mockResend.mock.calls[0]?.[0]
      expect(firstCallArgs?.type).toBe('signup')
      expect(firstCallArgs?.email).toBe('user@example.com')
    })

    it('should use provided locale when sending redirect url', async () => {
      mockResend.mockResolvedValueOnce({ error: null })

      await resendVerificationEmail('user@example.com', 'en')
      const firstCallArgs = mockResend.mock.calls[0]?.[0]
      expect(firstCallArgs?.options?.emailRedirectTo).toMatch(/\/en\/email-confirmation$/)
    })

    it('should throw when email is empty', async () => {
      await expect(resendVerificationEmail('')).rejects.toThrow('Email é obrigatório')
      await expect(resendVerificationEmail('   ')).rejects.toThrow('Email é obrigatório')
      expect(mockResend).not.toHaveBeenCalled()
    })

    it('should throw with message when Supabase returns error', async () => {
      mockResend.mockResolvedValueOnce({ error: { message: 'Rate limit exceeded' } })

      await expect(resendVerificationEmail('user@example.com')).rejects.toThrow('Rate limit exceeded')
      expect(mockResend).toHaveBeenCalledTimes(1)
    })

  })

  describe('buildEmailConfirmationRedirect', () => {
    it('should fallback to pt when locale is invalid', () => {
      const redirectUrl = buildEmailConfirmationRedirect('invalid-locale')
      expect(redirectUrl).toMatch(/\/pt\/email-confirmation$/)
    })
  })

  describe('getSessionForConfirmation', () => {
    it('should return session when getSession returns data', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'user-1', email: 'u@e.com' },
      }
      mockGetSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      const resultPromise = getSessionForConfirmation()
      await vi.advanceTimersByTimeAsync(700)
      const result = await resultPromise

      expect(result.error).toBeNull()
      expect(result.session).not.toBeNull()
      expect(result.session?.access_token).toBe('token')
      expect(result.session?.user.id).toBe('user-1')
      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })

    it('should return null session when getSession returns no session', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const resultPromise = getSessionForConfirmation()
      await vi.advanceTimersByTimeAsync(700)
      const result = await resultPromise

      expect(result.error).toBeNull()
      expect(result.session).toBeNull()
      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })

    it('should return error when getSession fails', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Network error' },
      })

      const resultPromise = getSessionForConfirmation()
      await vi.advanceTimersByTimeAsync(700)
      const result = await resultPromise

      expect(result.session).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error?.message).toBe('Network error')
      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })
  })
})
