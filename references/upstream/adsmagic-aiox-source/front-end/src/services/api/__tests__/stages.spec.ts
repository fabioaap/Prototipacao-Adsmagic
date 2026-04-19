/**
 * Unit tests for stages API service
 *
 * Covers getStages, getStageById, createStage, updateStage, deleteStage, reorderStages
 * with apiClient mocked (happy path + edge/error).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as stagesApi from '../stages'

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

const backendStage = {
  id: 'stage-uuid-1',
  project_id: 'project-1',
  name: 'Contato Iniciado',
  display_order: 0,
  color: null,
  tracking_phrase: 'oi',
  type: 'normal' as const,
  is_active: true,
  event_config: null,
  created_at: '2024-01-01T00:00:00.000Z',
}

describe('stages API service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('current_project_id', 'project-1')
  })

  describe('getStages', () => {
    it('returns mapped stages when API returns data (happy path)', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [backendStage], meta: { total: 1, limit: 50, offset: 0 } },
      })

      const result = await stagesApi.getStages()

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0]).toMatchObject({
          id: 'stage-uuid-1',
          name: 'Contato Iniciado',
          order: 0,
          trackingPhrase: 'oi',
          type: 'normal',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        })
      }
      expect(mockGet).toHaveBeenCalledWith('/stages', {
        params: { project_id: 'project-1', limit: 50, offset: 0 },
      })
    })

    it('returns empty array when no project_id in localStorage', async () => {
      localStorage.removeItem('current_project_id')

      const result = await stagesApi.getStages()

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toEqual([])
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('returns error when API fails', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'))

      const result = await stagesApi.getStages()

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.message).toBe('Network error')
    })
  })

  describe('getStageById', () => {
    it('returns mapped stage when found', async () => {
      mockGet.mockResolvedValueOnce({ data: backendStage })

      const result = await stagesApi.getStageById('stage-uuid-1')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).not.toBeNull()
        expect(result.value).toMatchObject({ id: 'stage-uuid-1', name: 'Contato Iniciado', order: 0 })
      }
      expect(mockGet).toHaveBeenCalledWith('/stages/stage-uuid-1')
    })

    it('returns null when 404', async () => {
      const err = new Error('Not found') as Error & { response?: { status?: number } }
      err.response = { status: 404 }
      mockGet.mockRejectedValueOnce(err)

      const result = await stagesApi.getStageById('missing-id')

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toBeNull()
    })
  })

  describe('createStage', () => {
    it('sends snake_case body and returns mapped stage', async () => {
      mockPost.mockResolvedValueOnce({ data: backendStage })

      const result = await stagesApi.createStage({
        name: 'Contato Iniciado',
        type: 'normal',
        trackingPhrase: 'oi',
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.name).toBe('Contato Iniciado')
      expect(mockPost).toHaveBeenCalledWith(
        '/stages',
        expect.objectContaining({
          project_id: 'project-1',
          name: 'Contato Iniciado',
          display_order: 0,
          tracking_phrase: 'oi',
          type: 'normal',
          is_active: true,
        })
      )
    })

    it('returns error when no project selected', async () => {
      localStorage.removeItem('current_project_id')

      const result = await stagesApi.createStage({ name: 'Test', type: 'normal' })

      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.message).toMatch(/projeto/i)
    })
  })

  describe('updateStage', () => {
    it('sends partial snake_case body and returns mapped stage', async () => {
      mockPatch.mockResolvedValueOnce({ data: { ...backendStage, name: 'Updated' } })

      const result = await stagesApi.updateStage('stage-uuid-1', { name: 'Updated' })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.name).toBe('Updated')
      expect(mockPatch).toHaveBeenCalledWith('/stages/stage-uuid-1', { name: 'Updated' })
    })
  })

  describe('deleteStage', () => {
    it('calls DELETE and returns ok', async () => {
      mockDelete.mockResolvedValueOnce(undefined)

      const result = await stagesApi.deleteStage('stage-uuid-1')

      expect(result.ok).toBe(true)
      expect(mockDelete).toHaveBeenCalledWith('/stages/stage-uuid-1')
    })
  })

  describe('reorderStages', () => {
    it('sends stage_ids and returns mapped list', async () => {
      mockPost.mockResolvedValueOnce({
        data: { data: [backendStage], message: 'ok' },
      })

      const result = await stagesApi.reorderStages(['stage-uuid-1'])

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toHaveLength(1)
      expect(mockPost).toHaveBeenCalledWith('/stages/reorder', { stage_ids: ['stage-uuid-1'] })
    })
  })
})
