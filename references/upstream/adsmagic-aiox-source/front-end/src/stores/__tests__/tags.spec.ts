/**
 * Unit tests for tags store
 *
 * Covers fetchTags: loading, success, error states.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useTagsStore } from '../tags'

const mockGetAll = vi.fn()

vi.mock('@/services/api/tags', () => ({
  tagsService: {
    getAll: () => mockGetAll(),
    getDefaultColors: () => ['#3b82f6', '#10b981'],
  },
}))

vi.mock('@/composables/useCurrentProjectId', () => ({
  useCurrentProjectId: () => ({
    currentProjectId: ref('project-1'),
  }),
}))

describe('useTagsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.setItem('current_project_id', 'project-1')
  })

  describe('fetchTags', () => {
    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: unknown[]) => void
      mockGetAll.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve
          })
      )

      const store = useTagsStore()
      const fetchPromise = store.fetchTags()

      expect(store.isLoading).toBe(true)

      resolvePromise!([])
      await fetchPromise

      expect(store.isLoading).toBe(false)
    })

    it('sets tags on success', async () => {
      const mockTags = [
        {
          id: 'tag-1',
          projectId: 'project-1',
          name: 'VIP',
          color: '#f59e0b',
          description: 'Clientes prioritários',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ]
      mockGetAll.mockResolvedValueOnce(mockTags)

      const store = useTagsStore()
      await store.fetchTags()

      expect(store.tags).toEqual(mockTags)
      expect(store.error).toBeNull()
    })

    it('sets error state when fetch fails', async () => {
      mockGetAll.mockRejectedValueOnce(new Error('Erro de rede'))

      const store = useTagsStore()
      await store.fetchTags()

      expect(store.tags).toEqual([])
      expect(store.error).toBe('Erro de rede')
      expect(store.isLoading).toBe(false)
    })
  })
})
