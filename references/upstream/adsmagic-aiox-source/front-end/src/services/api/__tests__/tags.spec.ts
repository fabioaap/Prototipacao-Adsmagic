/**
 * Unit tests for tags API service
 *
 * Covers getAll (happy path, no project_id, API error) with apiClient mocked.
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

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
  getApiErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Erro de rede'),
}))

// Force API path (not mock) so we exercise the real getAll logic
beforeAll(() => {
  vi.stubEnv('VITE_USE_MOCK', 'false')
})

const backendTag = {
  id: 'tag-uuid-1',
  project_id: 'project-1',
  name: 'VIP',
  color: '#f59e0b',
  description: 'Clientes prioritários',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

describe('tags API service', () => {
  let tagsService: typeof import('../tags').tagsService

  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.setItem('current_project_id', 'project-1')
    const mod = await import('../tags')
    tagsService = mod.tagsService
  })

  describe('getAll', () => {
    it('returns mapped tags when API returns data (happy path)', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [backendTag], meta: { total: 1, limit: 50, offset: 0 } },
      })

      const result = await tagsService.getAll()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'tag-uuid-1',
        projectId: 'project-1',
        name: 'VIP',
        color: '#f59e0b',
        description: 'Clientes prioritários',
        createdAt: '2024-01-01T00:00:00.000Z',
      })
      expect(mockGet).toHaveBeenCalledWith('/tags', {
        params: { project_id: 'project-1', limit: 50, offset: 0 },
      })
    })

    it('returns empty array when no project_id in localStorage', async () => {
      localStorage.removeItem('current_project_id')

      const result = await tagsService.getAll()

      expect(result).toEqual([])
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('throws with API error message when API fails', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'))

      await expect(tagsService.getAll()).rejects.toThrow('Network error')
    })
  })
})
