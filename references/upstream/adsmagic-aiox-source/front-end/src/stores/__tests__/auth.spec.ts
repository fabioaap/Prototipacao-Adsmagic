import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

const mockUpsert = vi.fn()
const mockUpsertResolve = vi.fn()

// Mock do Supabase
vi.mock('@/services/api/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn((_table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      upsert: (...args: unknown[]) => {
        mockUpsert(...args)
        return mockUpsertResolve()
      }
    }))
  },
  supabaseEnabled: true,
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with null user', () => {
    const authStore = useAuthStore()
    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should set user on successful login', async () => {
    const authStore = useAuthStore()

    // Mock successful login
    // Note: Requires mocking Supabase responses
    // This test is a placeholder for future implementation
    expect(authStore).toBeDefined()
  })

  it('should clear user on logout', async () => {
    const authStore = useAuthStore()

    // Set user first
    authStore.user = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    } as any

    // Note: isAuthenticated is computed based on user, so we test the user directly
    expect(authStore.user).not.toBeNull()

    await authStore.logout()

    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  describe('markOnboardingCompleted', () => {
    beforeEach(() => {
      mockUpsert.mockClear()
      mockUpsertResolve.mockReset()
      mockUpsertResolve.mockResolvedValue({ error: null })
    })

    it('should throw when user is not authenticated', async () => {
      const authStore = useAuthStore()
      expect(authStore.user).toBeNull()

      await expect(authStore.markOnboardingCompleted()).rejects.toThrow('Usuário não autenticado')
      expect(mockUpsert).not.toHaveBeenCalled()
    })

    it('should call supabase upsert with user_id, is_completed, completed_at and onConflict user_id', async () => {
      const authStore = useAuthStore()
      authStore.token = 'mock-jwt-token'
      authStore.user = {
        id: 'user-onboarding-456',
        email: 'onboarding@example.com',
        name: 'Onboarding User'
      } as any

      await authStore.markOnboardingCompleted()

      expect(mockUpsert).toHaveBeenCalledTimes(1)
      const call = mockUpsert.mock.calls[0]
      expect(call).toBeDefined()
      const [payload, options] = call!
      expect(payload).toMatchObject({
        user_id: 'user-onboarding-456',
        is_completed: true
      })
      expect(typeof payload.completed_at).toBe('string')
      expect(options).toEqual({ onConflict: 'user_id' })
      expect(authStore.onboardingStatus.isCompleted).toBe(true)
      expect(authStore.onboardingStatus.completedAt).toBeInstanceOf(Date)
    })

    it('should set error and throw when upsert fails', async () => {
      mockUpsertResolve.mockResolvedValueOnce({ error: { message: 'RLS policy violation' } })
      const authStore = useAuthStore()
      authStore.token = 'mock-jwt-token'
      authStore.user = { id: 'user-789', email: 'u@e.com', name: 'User' } as any

      await expect(authStore.markOnboardingCompleted()).rejects.toThrow('Erro ao marcar onboarding')
      expect(authStore.error).toBe('Erro ao marcar onboarding')
    })
  })
})
