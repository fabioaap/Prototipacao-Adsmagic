/**
 * Unit tests for projects API service
 *
 * Covers getUserProjects with filters including start_date/end_date for metrics period.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectsApiService } from '../projectsService'

const mockGet = vi.fn()

vi.mock('../client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  getApiErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Erro'),
}))

vi.mock('../supabaseClient', () => ({
  supabase: {},
}))

const mockProjectFromBackend = {
  id: 'project-1',
  name: 'Projeto Teste',
  company_id: 'company-1',
  created_by: 'user-1',
  company_type: 'individual',
  franchise_count: 1,
  country: 'BR',
  language: 'pt',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  attribution_model: 'first_touch',
  whatsapp_connected: true,
  meta_ads_connected: false,
  google_ads_connected: false,
  tiktok_ads_connected: false,
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  revenue: 0,
  contacts_count: 0,
  sales_count: 0,
  conversion_rate: 0,
  average_ticket: 0,
  investment: 0,
  impressions: 0,
  clicks: 0,
}

describe('projectsApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue({
      data: { data: [mockProjectFromBackend], meta: { total: 1, limit: 50, offset: 0 } },
    })
  })

  describe('getUserProjects', () => {
    it('deve enviar start_date e end_date quando filters.startDate e filters.endDate estiverem definidos', async () => {
      await projectsApiService.getUserProjects('company-1', {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      })

      expect(mockGet).toHaveBeenCalledWith('/projects', {
        params: expect.objectContaining({
          with_metrics: 'true',
          start_date: '2025-01-01',
          end_date: '2025-01-31',
        }),
      })
    })

    it('não deve enviar start_date/end_date quando filters não tiver período', async () => {
      await projectsApiService.getUserProjects('company-1', {
        search: 'test',
      })

      const call = mockGet.mock.calls[0]
      const params = call?.[1]?.params as Record<string, unknown>
      expect(params?.start_date).toBeUndefined()
      expect(params?.end_date).toBeUndefined()
      expect(params?.search).toBe('test')
      expect(params?.with_metrics).toBe('true')
    })

    it('não deve enviar start_date/end_date quando apenas um deles estiver definido', async () => {
      await projectsApiService.getUserProjects('company-1', {
        startDate: '2025-01-01',
      })

      const call = mockGet.mock.calls[0]
      const params = call?.[1]?.params as Record<string, unknown>
      expect(params?.start_date).toBeUndefined()
      expect(params?.end_date).toBeUndefined()
    })

    it('deve retornar projetos adaptados no happy path', async () => {
      const result = await projectsApiService.getUserProjects('company-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'project-1',
        name: 'Projeto Teste',
        whatsappStatus: 'connected',
      })
    })
  })
})
