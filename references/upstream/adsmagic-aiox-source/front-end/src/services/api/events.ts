/**
 * Events API Service
 *
 * Gerencia todas as operações relacionadas a eventos de rastreamento.
 * Segue o padrão "Mock First, API Ready" para desenvolvimento.
 *
 * @module services/api/events
 */

import { apiClient } from './client'
import type { Event, EventFilters, PaginatedResponse, PaginationInfo } from '@/types'
import { adaptEvent, adaptEvents } from './adapters/eventsAdapter'

// Mock data para desenvolvimento
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    projectId: 'mock-project-001',
    platform: 'meta',
    type: 'purchase',
    contactId: '1',
    saleId: '1',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-10-20T10:01:00Z',
    sentAt: '2025-10-20T10:01:00Z',
    payload: {
      event_name: 'Purchase',
      value: 1000,
      currency: 'BRL',
      fbclid: 'abc123',
      name: 'João Silva',
      phone: '+5511999887766'
    },
    response: {
      success: true,
      event_id: 'fb_123456'
    },
    metadata: {
      contactName: 'João Silva',
      contactPhone: '+5511999887766'
    }
  },
  {
    id: '2',
    projectId: 'mock-project-001',
    platform: 'google',
    type: 'conversion',
    contactId: '2',
    saleId: '2',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-19T14:30:00Z',
    updatedAt: '2025-10-19T14:31:00Z',
    sentAt: '2025-10-19T14:31:00Z',
    payload: {
      event_name: 'purchase',
      value: 500,
      currency: 'BRL',
      gclid: 'def456',
      name: 'Maria Santos',
      phone: '+5511988776655'
    },
    response: {
      success: true,
      event_id: 'ga_789012'
    },
    metadata: {
      contactName: 'Maria Santos',
      contactPhone: '+5511988776655'
    }
  },
  {
    id: '3',
    projectId: 'mock-project-001',
    platform: 'tiktok',
    type: 'purchase',
    contactId: '3',
    saleId: '3',
    status: 'failed',
    retryCount: 2,
    lastRetryAt: '2025-10-18T09:15:00Z',
    errorMessage: 'Invalid API key',
    createdAt: '2025-10-18T09:00:00Z',
    updatedAt: '2025-10-18T09:15:00Z',
    payload: {
      event_name: 'CompletePayment',
      value: 750,
      currency: 'BRL',
      ttpclid: 'tiktok123',
      name: 'Carlos Oliveira',
      phone: '+5511977665544'
    },
    metadata: {
      contactName: 'Carlos Oliveira',
      contactPhone: '+5511977665544'
    }
  },
  {
    id: '4',
    projectId: 'mock-project-001',
    platform: 'meta',
    type: 'page_view',
    contactId: '4',
    status: 'pending',
    retryCount: 0,
    createdAt: '2025-10-17T16:45:00Z',
    updatedAt: '2025-10-17T16:45:00Z',
    payload: {
      event_name: 'PageView',
      page_url: 'https://example.com/product',
      fbclid: 'xyz789',
      name: 'Ana Costa',
      phone: '+5511966554433'
    },
    metadata: {
      contactName: 'Ana Costa',
      contactPhone: '+5511966554433'
    }
  },
  {
    id: '5',
    projectId: 'mock-project-001',
    platform: 'google',
    type: 'purchase',
    contactId: '5',
    saleId: '5',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-16T11:20:00Z',
    updatedAt: '2025-10-16T11:21:00Z',
    sentAt: '2025-10-16T11:21:00Z',
    payload: {
      event_name: 'purchase',
      value: 1500,
      currency: 'BRL',
      gclid: 'ghi789',
      name: 'Pedro Almeida',
      phone: '+5511955443322'
    },
    response: {
      success: true,
      event_id: 'ga_456789'
    },
    metadata: {
      contactName: 'Pedro Almeida',
      contactPhone: '+5511955443322'
    }
  },
  {
    id: '6',
    projectId: 'mock-project-001',
    platform: 'tiktok',
    type: 'add_to_cart',
    contactId: '6',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-15T15:30:00Z',
    updatedAt: '2025-10-15T15:31:00Z',
    sentAt: '2025-10-15T15:31:00Z',
    payload: {
      event_name: 'AddToCart',
      value: 299,
      currency: 'BRL',
      ttpclid: 'ttk456',
      name: 'Juliana Ferreira',
      phone: '+5511944332211'
    },
    response: {
      success: true,
      event_id: 'ttk_789012'
    },
    metadata: {
      contactName: 'Juliana Ferreira',
      contactPhone: '+5511944332211'
    }
  },
  {
    id: '7',
    projectId: 'mock-project-001',
    platform: 'meta',
    type: 'lead',
    contactId: '7',
    status: 'failed',
    retryCount: 1,
    lastRetryAt: '2025-10-14T08:45:00Z',
    errorMessage: 'Network timeout',
    createdAt: '2025-10-14T08:30:00Z',
    updatedAt: '2025-10-14T08:45:00Z',
    payload: {
      event_name: 'Lead',
      fbclid: 'fb999',
      name: 'Roberto Costa',
      phone: '+5511933221100'
    },
    metadata: {
      contactName: 'Roberto Costa',
      contactPhone: '+5511933221100'
    }
  },
  {
    id: '8',
    projectId: 'mock-project-001',
    platform: 'google',
    type: 'page_view',
    contactId: '8',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-13T19:15:00Z',
    updatedAt: '2025-10-13T19:16:00Z',
    sentAt: '2025-10-13T19:16:00Z',
    payload: {
      event_name: 'page_view',
      page_url: 'https://example.com/landing',
      gclid: 'gcl777',
      name: 'Fernanda Lima',
      phone: '+5511922110099'
    },
    response: {
      success: true,
      event_id: 'ga_111222'
    },
    metadata: {
      contactName: 'Fernanda Lima',
      contactPhone: '+5511922110099'
    }
  },
  {
    id: '9',
    projectId: 'mock-project-001',
    platform: 'meta',
    type: 'purchase',
    contactId: '9',
    saleId: '9',
    status: 'pending',
    retryCount: 0,
    createdAt: '2025-10-12T14:00:00Z',
    updatedAt: '2025-10-12T14:00:00Z',
    payload: {
      event_name: 'Purchase',
      value: 899,
      currency: 'BRL',
      fbclid: 'fb888',
      name: 'Lucas Mendes',
      phone: '+5511911009988'
    },
    metadata: {
      contactName: 'Lucas Mendes',
      contactPhone: '+5511911009988'
    }
  },
  {
    id: '10',
    projectId: 'mock-project-001',
    platform: 'tiktok',
    type: 'purchase',
    contactId: '10',
    saleId: '10',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-11T10:30:00Z',
    updatedAt: '2025-10-11T10:31:00Z',
    sentAt: '2025-10-11T10:31:00Z',
    payload: {
      event_name: 'CompletePayment',
      value: 2100,
      currency: 'BRL',
      ttpclid: 'ttk222',
      name: 'Beatriz Rocha',
      phone: '+5511900998877'
    },
    response: {
      success: true,
      event_id: 'ttk_333444'
    },
    metadata: {
      contactName: 'Beatriz Rocha',
      contactPhone: '+5511900998877'
    }
  },
  {
    id: '11',
    projectId: 'mock-project-001',
    platform: 'google',
    type: 'add_to_cart',
    contactId: '11',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-10T16:45:00Z',
    updatedAt: '2025-10-10T16:46:00Z',
    sentAt: '2025-10-10T16:46:00Z',
    payload: {
      event_name: 'add_to_cart',
      value: 450,
      currency: 'BRL',
      gclid: 'gcl555',
      name: 'Marcos Silva',
      phone: '+5511899887766'
    },
    response: {
      success: true,
      event_id: 'ga_555666'
    },
    metadata: {
      contactName: 'Marcos Silva',
      contactPhone: '+5511899887766'
    }
  },
  {
    id: '12',
    projectId: 'mock-project-001',
    platform: 'meta',
    type: 'lead',
    contactId: '12',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-09T09:00:00Z',
    updatedAt: '2025-10-09T09:01:00Z',
    sentAt: '2025-10-09T09:01:00Z',
    payload: {
      event_name: 'Lead',
      fbclid: 'fb444',
      name: 'Carla Souza',
      phone: '+5511888776655'
    },
    response: {
      success: true,
      event_id: 'fb_777888'
    },
    metadata: {
      contactName: 'Carla Souza',
      contactPhone: '+5511888776655'
    }
  },
  {
    id: '13',
    projectId: 'mock-project-001',
    platform: 'tiktok',
    type: 'page_view',
    contactId: '13',
    status: 'failed',
    retryCount: 3,
    lastRetryAt: '2025-10-08T12:30:00Z',
    errorMessage: 'Rate limit exceeded',
    createdAt: '2025-10-08T12:00:00Z',
    updatedAt: '2025-10-08T12:30:00Z',
    payload: {
      event_name: 'ViewContent',
      page_url: 'https://example.com/promo',
      ttpclid: 'ttk999',
      name: 'Ricardo Gomes',
      phone: '+5511877665544'
    },
    metadata: {
      contactName: 'Ricardo Gomes',
      contactPhone: '+5511877665544'
    }
  },
  {
    id: '14',
    projectId: 'mock-project-001',
    platform: 'google',
    type: 'lead',
    contactId: '14',
    status: 'sent',
    retryCount: 0,
    createdAt: '2025-10-07T13:20:00Z',
    updatedAt: '2025-10-07T13:21:00Z',
    sentAt: '2025-10-07T13:21:00Z',
    payload: {
      event_name: 'generate_lead',
      gclid: 'gcl333',
      name: 'Patrícia Oliveira',
      phone: '+5511866554433'
    },
    response: {
      success: true,
      event_id: 'ga_999000'
    },
    metadata: {
      contactName: 'Patrícia Oliveira',
      contactPhone: '+5511866554433'
    }
  },
  {
    id: '15',
    projectId: 'mock-project-001',
    platform: 'meta',
    type: 'add_to_cart',
    contactId: '15',
    status: 'pending',
    retryCount: 0,
    createdAt: '2025-10-06T17:00:00Z',
    updatedAt: '2025-10-06T17:00:00Z',
    payload: {
      event_name: 'AddToCart',
      value: 680,
      currency: 'BRL',
      fbclid: 'fb111',
      name: 'Amanda Martins',
      phone: '+5511855443322'
    },
    metadata: {
      contactName: 'Amanda Martins',
      contactPhone: '+5511855443322'
    }
  }
]

// Flag para alternar entre mock e API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Normaliza objeto de paginação, garantindo que sempre tenha estrutura válida
 * 
 * @param pagination - Objeto de paginação (pode ser undefined ou incompleto)
 * @param dataLength - Tamanho do array de dados
 * @param filters - Filtros com valores padrão de page e pageSize
 * @returns Objeto de paginação normalizado
 */
function normalizePagination(
  pagination: PaginationInfo | undefined,
  dataLength: number,
  filters?: EventFilters
): PaginationInfo {
  const page = pagination?.page || filters?.page || 1
  const pageSize = pagination?.pageSize || filters?.pageSize || 20
  const total = pagination?.total ?? dataLength
  const totalPages = pagination?.totalPages ?? Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    total,
    totalPages
  }
}

/**
 * Interface da resposta do backend (com meta ao invés de pagination)
 */
interface BackendEventsResponse {
  data: Event[]
  meta?: {
    total: number
    limit: number
    offset: number
  }
  pagination?: PaginationInfo
}

/**
 * Converte resposta do backend (meta) para formato esperado pelo frontend (pagination)
 * 
 * @param backendResponse - Resposta do backend com meta
 * @param filters - Filtros aplicados
 * @returns Resposta no formato PaginatedResponse
 */
function convertBackendResponseToPaginated(
  backendResponse: BackendEventsResponse,
  filters?: EventFilters
): PaginatedResponse<Event> {
  const events = adaptEvents((backendResponse.data || []) as unknown as Record<string, unknown>[])
  
  // Se já tem pagination, usar diretamente
  if (backendResponse.pagination) {
    return {
      data: events,
      pagination: backendResponse.pagination
    }
  }
  
  // Converter meta (limit/offset) para pagination (page/pageSize)
  if (backendResponse.meta) {
    const { total, limit, offset } = backendResponse.meta
    const DEFAULT_PAGE_SIZE = 20
    const pageSize = limit || filters?.pageSize || DEFAULT_PAGE_SIZE
    
    // Calcular página baseado em offset: page = (offset / pageSize) + 1
    const page = pageSize > 0 && offset !== undefined
      ? Math.floor(offset / pageSize) + 1
      : filters?.page || 1
    
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
    
    return {
      data: events,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    }
  }
  
  // Fallback: criar pagination padrão quando não há meta nem pagination
  const DEFAULT_PAGE = 1
  const DEFAULT_PAGE_SIZE = 20
  const page = filters?.page || DEFAULT_PAGE
  const pageSize = filters?.pageSize || DEFAULT_PAGE_SIZE
  const total = events.length
  
  return {
    data: events,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Valida e normaliza resposta paginada da API
 * 
 * @param data - Dados da resposta (pode ser undefined ou incompleto)
 * @param filters - Filtros aplicados
 * @returns Resposta paginada normalizada
 * @throws {Error} Se a resposta estiver completamente inválida
 */
function normalizePaginatedResponse(
  data: PaginatedResponse<Event> | BackendEventsResponse | undefined,
  filters?: EventFilters
): PaginatedResponse<Event> {
  if (!data) {
    throw new Error('Resposta da API de eventos está vazia')
  }

  // Se já está no formato correto (com pagination), usar diretamente
  if ('pagination' in data && data.pagination) {
    const events = adaptEvents((data.data || []) as unknown as Record<string, unknown>[])
    const pagination = normalizePagination(data.pagination, events.length, filters)
    
    return {
      data: events,
      pagination
    }
  }

  // Converter formato do backend (meta) para formato do frontend (pagination)
  const converted = convertBackendResponseToPaginated(data as BackendEventsResponse, filters)
  
  // Log apenas em desenvolvimento se foi necessário converter
  if ('meta' in data && !('pagination' in data) && import.meta.env.DEV) {
  }

  return converted
}

export interface CreateEventInput {
  name: string
  platform: string
  type: string
  defaultValue?: number
  allowMultiplePurchases?: boolean
}

export const eventsService = {
  /**
   * Criar um novo evento de conversão
   */
  async create(input: CreateEventInput): Promise<Event> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newEvent: Event = {
        id: `event_${Date.now()}`,
        projectId: localStorage.getItem('current_project_id') || '',
        platform: input.platform as Event['platform'],
        type: input.type as Event['type'],
        contactId: '',
        status: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payload: {
          event_name: input.name,
          value: input.defaultValue || 0,
          currency: 'BRL',
        },
        metadata: {}
      }
      return newEvent
    }

    const response = await apiClient.post<Record<string, unknown>>('/events', input)
    return adaptEvent(response.data)
  },

  /**
   * Buscar todos os eventos com filtros
   */
  async getAll(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))

      // Aplica filtros nos dados mock
      let filtered = [...MOCK_EVENTS]

      // Filter by current project ID
      const currentProjectId = localStorage.getItem('current_project_id')
      if (currentProjectId) {
        filtered = filtered.filter(event => event.projectId === currentProjectId)
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(event =>
          event.type.toLowerCase().includes(search) ||
          event.platform.toLowerCase().includes(search) ||
          event.contactId.toLowerCase().includes(search)
        )
      }

      if (filters?.platform) {
        filtered = filtered.filter(event => event.platform === filters.platform)
      }

      if (filters?.status) {
        filtered = filtered.filter(event => event.status === filters.status)
      }

      if (filters?.type) {
        filtered = filtered.filter(event => event.type === filters.type)
      }

      if (filters?.dateFrom) {
        filtered = filtered.filter(event =>
          new Date(event.createdAt) >= new Date(filters.dateFrom!)
        )
      }

      if (filters?.dateTo) {
        filtered = filtered.filter(event =>
          new Date(event.createdAt) <= new Date(filters.dateTo!)
        )
      }

      // Paginação
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 20
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filtered.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize)
        }
      }
    }

    // API real: converter page/pageSize (frontend) → limit/offset (backend)
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 10
    const backendParams: Record<string, unknown> = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }
    if (filters?.platform) backendParams.platform = filters.platform
    if (filters?.status) backendParams.status = filters.status
    if (filters?.eventType || filters?.type) backendParams.event_type = filters.eventType || filters.type
    if (filters?.contactId) backendParams.contact_id = filters.contactId
    if (filters?.projectId) backendParams.project_id = filters.projectId

    const response = await apiClient.get<PaginatedResponse<Event>>('/events', {
      params: backendParams
    })

    // Normaliza resposta garantindo estrutura válida (SRP: responsabilidade única)
    return normalizePaginatedResponse(response.data, filters)
  },

  /**
   * Buscar evento por ID
   */
  async getById(id: string): Promise<Event | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_EVENTS.find(event => event.id === id) || null
    }

    const response = await apiClient.get<Record<string, unknown>>(`/events/${id}`)
    return response.data ? adaptEvent(response.data) : null
  },

  /**
   * Reenviar evento falhado
   */
  async retry(id: string): Promise<Event> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = MOCK_EVENTS.findIndex(event => event.id === id)
      if (index === -1) throw new Error('Evento não encontrado')

      // Simula retry
      const existingEvent = MOCK_EVENTS[index]!
      const success = Math.random() > 0.3 // 70% de chance de sucesso

      MOCK_EVENTS[index] = {
        ...existingEvent,
        status: success ? 'sent' : 'failed',
        retryCount: (existingEvent.retryCount ?? 0) + 1,
        lastRetryAt: new Date().toISOString(),
        sentAt: success ? new Date().toISOString() : undefined,
        errorMessage: success ? undefined : 'API timeout',
        updatedAt: new Date().toISOString()
      }

      return MOCK_EVENTS[index]!
    }

    const response = await apiClient.post<Record<string, unknown>>(`/events/${id}/retry`)
    return adaptEvent(response.data)
  },

  /**
   * Buscar eventos por contato
   */
  async getByContact(contactId: string): Promise<Event[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_EVENTS.filter(event => event.contactId === contactId)
    }

    const response = await apiClient.get<Record<string, unknown>[]>(`/events/contact/${contactId}`)
    return adaptEvents(response.data)
  },

  /**
   * Buscar eventos por venda
   */
  async getBySale(saleId: string): Promise<Event[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_EVENTS.filter(event => event.saleId === saleId)
    }

    const response = await apiClient.get<Record<string, unknown>[]>(`/events/sale/${saleId}`)
    return adaptEvents(response.data)
  },

  /**
   * Buscar métricas de eventos
   */
  async getMetrics(filters?: EventFilters): Promise<{
    total: number
    sent: number
    pending: number
    failed: number
    successRate: number
  }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      const events = MOCK_EVENTS
      const total = events.length
      const sent = events.filter(e => e.status === 'sent').length
      const pending = events.filter(e => e.status === 'pending').length
      const failed = events.filter(e => e.status === 'failed').length
      const successRate = total > 0 ? (sent / total) * 100 : 0

      return {
        total,
        sent,
        pending,
        failed,
        successRate
      }
    }

    const response = await apiClient.get('/events/metrics', {
      params: filters
    })
    return response.data
  },

  /**
   * Exportar eventos
   */
  async export(filters?: EventFilters): Promise<Blob> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simula export CSV
      const csvData = MOCK_EVENTS.map(event =>
        `${event.id},${event.platform},${event.type},${event.status},${event.createdAt}`
      ).join('\n')

      return new Blob([csvData], { type: 'text/csv' })
    }

    const response = await apiClient.get('/events/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  }
}
