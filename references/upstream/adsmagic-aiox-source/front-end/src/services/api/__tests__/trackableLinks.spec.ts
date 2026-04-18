import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  getApiErrorMessage: () => 'api-error',
}))

vi.mock('../supabaseClient', () => ({
  supabaseEnabled: true,
}))

import {
  getTrackableLinks,
  createTrackableLink,
  getTrackableLinkStats,
} from '../trackableLinks'

describe('trackableLinks service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps list response from snake_case to frontend link model', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: '848cae3d-9853-4e7f-a9f0-175b5a6dd8a1',
            project_id: 'project-1',
            name: 'Mensagem principal',
            destination_url: null,
            tracking_url: 'https://r.adsmagic.com.br/848cae3d-9853-4e7f-a9f0-175b5a6dd8a1',
            initial_message: 'Olá',
            whatsapp_number: '5511999999999',
            origin_id: 'origin-1',
            is_active: true,
            clicks_count: 10,
            contacts_count: 4,
            sales_count: 2,
            revenue: 500,
            created_at: '2026-02-25T00:00:00.000Z',
            updated_at: '2026-02-25T00:00:00.000Z',
          }
        ],
        meta: { total: 1, limit: 100, offset: 0 }
      }
    })

    const result = await getTrackableLinks('project-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toHaveLength(1)
      expect(result.value[0]).toMatchObject({
        id: '848cae3d-9853-4e7f-a9f0-175b5a6dd8a1',
        projectId: 'project-1',
        originId: 'origin-1',
        whatsappNumber: '5511999999999',
        isActive: true,
        stats: {
          clicks: 10,
          contacts: 4,
          sales: 2,
          revenue: 500
        }
      })
    }
  })

  it('creates whatsapp link with expected payload', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        id: '24d7fdad-3a89-4f1a-ab6f-650cbca545b6',
        project_id: 'project-1',
        name: 'Nova mensagem',
        destination_url: null,
        tracking_url: 'https://r.adsmagic.com.br/24d7fdad-3a89-4f1a-ab6f-650cbca545b6',
        initial_message: 'Oi',
        whatsapp_number: '5511888888888',
        origin_id: 'origin-1',
        is_active: true,
        clicks_count: 0,
        contacts_count: 0,
        sales_count: 0,
        revenue: 0,
        created_at: '2026-02-25T00:00:00.000Z',
        updated_at: '2026-02-25T00:00:00.000Z',
      }
    })

    const result = await createTrackableLink('project-1', {
      name: 'Nova mensagem',
      initialMessage: 'Oi',
      whatsappNumber: '5511888888888'
    })

    expect(result.ok).toBe(true)
    expect(mockPost).toHaveBeenCalledWith('/trackable-links', {
      project_id: 'project-1',
      name: 'Nova mensagem',
      initial_message: 'Oi',
      whatsapp_number: '5511888888888',
      link_type: 'whatsapp',
      destination_url: null
    })
  })

  it('maps stats response to frontend stats model', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        link_id: 'link-1',
        clicks_count: 100,
        contacts_count: 50,
        sales_count: 20,
        revenue: 2000,
        conversion_rate: 50,
        avg_ticket: 100,
        accesses_by_day: [{ date: '2026-02-25', count: 10 }],
        accesses_by_device: [{ device: 'mobile', count: 70 }],
        accesses_by_country: [{ country: 'BR', count: 90 }],
        top_utm_sources: [{ utm_source: 'meta', count: 60 }]
      }
    })

    const result = await getTrackableLinkStats('link-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual({
        linkId: 'link-1',
        clicksCount: 100,
        contactsCount: 50,
        salesCount: 20,
        revenue: 2000,
        conversionRate: 50,
        avgTicket: 100,
        accessesByDay: [{ date: '2026-02-25', count: 10 }],
        accessesByDevice: [{ device: 'mobile', count: 70 }],
        accessesByCountry: [{ country: 'BR', count: 90 }],
        topUtmSources: [{ utmSource: 'meta', count: 60 }]
      })
    }
  })
})
