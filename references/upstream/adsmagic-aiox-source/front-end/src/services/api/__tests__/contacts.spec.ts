import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()
const mockGetContactTags = vi.fn()

vi.mock('../client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

vi.mock('../tags', () => ({
  tagsService: {
    getContactTags: (...args: unknown[]) => mockGetContactTags(...args),
  },
}))

describe('contacts API service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('current_project_id', 'project-1')
  })

  it('maps tag filters to backend params in real API mode', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_USE_MOCK', 'false')
    mockGet.mockResolvedValueOnce({
      data: {
        data: [],
        meta: { total: 0, limit: 10, offset: 0 },
      },
    })

    const { getContacts } = await import('../contacts')

    await getContacts({
      tags: [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ],
      page: 1,
      pageSize: 10,
    })

    expect(mockGet).toHaveBeenCalledWith('/contacts', {
      params: expect.objectContaining({
        project_id: 'project-1',
        tag_ids: '11111111-1111-1111-1111-111111111111,22222222-2222-2222-2222-222222222222',
      }),
    })
  })

  it('filters mock contacts by selected tags', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_USE_MOCK', 'true')
    mockGetContactTags.mockImplementation(async (contactId: string) => {
      if (contactId === 'contact-001') {
        return [{ id: 'tag-a' }]
      }

      return [{ id: 'tag-b' }]
    })

    const { getContacts } = await import('../contacts')

    const result = await getContacts({
      tags: ['tag-a'],
      page: 1,
      pageSize: 20,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.data.length).toBeGreaterThan(0)
    expect(result.value.data.every((contact) => contact.id === 'contact-001')).toBe(true)
  })
})