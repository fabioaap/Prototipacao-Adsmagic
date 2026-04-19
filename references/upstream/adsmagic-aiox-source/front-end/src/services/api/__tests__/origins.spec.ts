/**
 * Unit tests for origins API service
 *
 * Covers getOrigins, getOriginById, createOrigin, updateOrigin, deleteOrigin
 * with apiClient mocked (happy path + edge/error).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as originsApi from '../origins'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock('../client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Erro'),
}))

vi.mock('../supabaseClient', () => ({
  supabaseEnabled: true,
}))

const backendOrigin = {
  id: 'origin-uuid-1',
  project_id: null,
  name: 'Google Ads',
  type: 'system' as const,
  color: '#4285F4',
  icon: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00.000Z',
}

describe('origins API service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('current_project_id', 'project-1')
  })

  describe('getOrigins', () => {
    it('returns mapped origins when API returns data (happy path)', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [backendOrigin], meta: { total: 1, limit: 50, offset: 0 } },
      })

      const result = await originsApi.getOrigins()

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0]).toMatchObject({
          id: 'origin-uuid-1',
          name: 'Google Ads',
          type: 'system',
          color: '#4285F4',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        })
      }
      expect(mockGet).toHaveBeenCalledWith('/origins', {
        params: { project_id: 'project-1', limit: 50, offset: 0 },
      })
    })

    it('returns empty array when no project_id in localStorage', async () => {
      localStorage.removeItem('current_project_id')

      const result = await originsApi.getOrigins()

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toEqual([])
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('returns error when API fails', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'))

      const result = await originsApi.getOrigins()

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.message).toBe('Network error')
    })
  })

  describe('getOriginById', () => {
    it('returns mapped origin when found', async () => {
      mockGet.mockResolvedValueOnce({ data: backendOrigin })

      const result = await originsApi.getOriginById('origin-uuid-1')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).not.toBeNull()
        expect(result.value).toMatchObject({ id: 'origin-uuid-1', name: 'Google Ads' })
      }
    })

    it('returns null when 404', async () => {
      const err = new Error('Not found') as Error & { response?: { status?: number } }
      err.response = { status: 404 }
      mockGet.mockRejectedValueOnce(err)

      const result = await originsApi.getOriginById('missing-id')

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toBeNull()
    })
  })

  describe('createOrigin', () => {
    it('sends snake_case body and returns mapped origin', async () => {
      const custom = {
        ...backendOrigin,
        id: 'custom-1',
        project_id: 'project-1',
        type: 'custom' as const,
        name: 'Minha Campanha',
        color: '#10B981',
      }
      mockPost.mockResolvedValueOnce({ data: custom })

      const result = await originsApi.createOrigin({
        name: 'Minha Campanha',
        color: '#10B981',
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.name).toBe('Minha Campanha')
      expect(mockPost).toHaveBeenCalledWith(
        '/origins',
        expect.objectContaining({
          project_id: 'project-1',
          name: 'Minha Campanha',
          type: 'custom',
          color: '#10B981',
          is_active: true,
        })
      )
    })

    it('returns error when no project selected', async () => {
      localStorage.removeItem('current_project_id')

      const result = await originsApi.createOrigin({ name: 'Test', color: '#000' })

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.message).toMatch(/projeto/i)
    })
  })

  describe('updateOrigin', () => {
    it('sends partial snake_case body and returns mapped origin', async () => {
      mockPatch.mockResolvedValueOnce({ data: { ...backendOrigin, name: 'Updated' } })

      const result = await originsApi.updateOrigin('origin-uuid-1', { name: 'Updated' })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.name).toBe('Updated')
      expect(mockPatch).toHaveBeenCalledWith('/origins/origin-uuid-1', { name: 'Updated' })
    })
  })

  describe('deleteOrigin', () => {
    it('calls DELETE and returns ok', async () => {
      mockDelete.mockResolvedValueOnce(undefined)

      const result = await originsApi.deleteOrigin('origin-uuid-1')

      expect(result.ok).toBe(true)
      expect(mockDelete).toHaveBeenCalledWith('/origins/origin-uuid-1')
    })
  })
})
