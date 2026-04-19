/**
 * Unit tests for onboardingApiService
 *
 * Covers:
 * - completeOnboarding: happy path (upsert), payload and onConflict, null data uses {},
 *   error propagation (record inexistente coberto pelo upsert)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { onboardingApiService } from '../onboardingService'

const mockUpsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: (...args: unknown[]) => {
        mockUpsert(...args)
        return { select: mockSelect }
      },
    })),
  },
}))

describe('onboardingApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ single: mockSingle })
  })

  describe('completeOnboarding', () => {
    it('should call upsert with user_id, onboarding_data, is_completed, completed_at and onConflict user_id', async () => {
      const userId = 'user-uuid-123'
      const onboardingData = {
        companyType: 'ecommerce' as const,
        franchiseCount: '1' as const,
        franchiseName: 'Loja Teste',
        completedAt: new Date('2025-01-15'),
      }
      const row = {
        id: 'progress-uuid',
        user_id: userId,
        onboarding_data: onboardingData,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }
      mockSingle.mockResolvedValueOnce({ data: row, error: null })

      const result = await onboardingApiService.completeOnboarding(userId, onboardingData)

      expect(mockUpsert).toHaveBeenCalledTimes(1)
      const call = mockUpsert.mock.calls[0]
      expect(call).toBeDefined()
      const [payload, options] = call!
      expect(payload).toMatchObject({
        user_id: userId,
        onboarding_data: onboardingData,
        is_completed: true,
      })
      expect(payload.completed_at).toBeDefined()
      expect(typeof payload.completed_at).toBe('string')
      expect(options).toEqual({ onConflict: 'user_id' })
      expect(mockSelect).toHaveBeenCalledWith()
      expect(mockSingle).toHaveBeenCalledWith()
      expect(result).toEqual(row)
    })

    it('should use empty object when onboardingData is null (upsert creates/updates row)', async () => {
      const userId = 'user-uuid-456'
      const row = {
        id: 'progress-uuid-2',
        user_id: userId,
        onboarding_data: {},
        is_completed: true,
        completed_at: new Date().toISOString(),
      }
      mockSingle.mockResolvedValueOnce({ data: row, error: null })

      const result = await onboardingApiService.completeOnboarding(userId, null)

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          onboarding_data: {},
          is_completed: true,
        }),
        { onConflict: 'user_id' }
      )
      expect(result).toEqual(row)
    })

    it('should throw when Supabase returns error', async () => {
      const userId = 'user-uuid-789'
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'RLS policy violation' },
      })

      await expect(
        onboardingApiService.completeOnboarding(userId, { franchiseName: 'Test' })
      ).rejects.toEqual({ message: 'RLS policy violation' })

      expect(mockUpsert).toHaveBeenCalledTimes(1)
    })
  })
})
