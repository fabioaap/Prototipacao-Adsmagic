/**
 * Sales Adapter
 * 
 * Converte entre o contrato snake_case do backend
 * e o formato camelCase usado no frontend.
 * 
 * Segue o mesmo padrão de contactsAdapter.ts
 * 
 * @module services/api/adapters/salesAdapter
 */

import type { Sale, CreateSaleDTO, UpdateSaleDTO, MarkSaleLostDTO, TrackingParams } from '@/types'

// ============================================================================
// TIPOS DO BACKEND (snake_case)
// ============================================================================

/**
 * Entidade Sale como retornada pelo backend (snake_case)
 */
export interface BackendSale {
  id: string
  project_id: string
  contact_id: string
  value: number
  currency: string
  date: string
  status: 'completed' | 'lost'
  origin_id: string | null
  lost_reason: string | null
  lost_observations: string | null
  notes: string | null
  tracking_params: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  /** Dados do contato via join (retornado pelo backend na listagem) */
  contacts?: {
    name: string | null
    phone: string | null
    country_code: string | null
  } | null
}

/**
 * DTO para criação de venda (backend snake_case)
 */
export interface BackendCreateSaleDTO {
  project_id: string
  contact_id: string
  value: number
  currency?: string
  date: string
  origin_id?: string | null
  notes?: string | null
  tracking_params?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * DTO para atualização de venda (backend snake_case)
 */
export interface BackendUpdateSaleDTO {
  value?: number
  currency?: string
  date?: string
  origin_id?: string | null
  notes?: string | null
  tracking_params?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * DTO para marcar venda como perdida (backend snake_case)
 */
export interface BackendMarkSaleLostDTO {
  lost_reason: string
  lost_observations?: string | null
}

/**
 * Resposta de listagem do backend
 */
export interface BackendSalesListResponse {
  data: BackendSale[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

// ============================================================================
// FUNÇÕES DE ADAPTAÇÃO: BACKEND → FRONTEND
// ============================================================================

/**
 * Converte uma Sale do backend (snake_case) para o frontend (camelCase)
 */
export function adaptSaleFromBackend(backend: BackendSale): Sale {
  return {
    id: backend.id,
    projectId: backend.project_id,
    contactId: backend.contact_id,
    value: backend.value,
    currency: backend.currency,
    date: backend.date,
    status: backend.status,
    origin: backend.origin_id ?? undefined,
    lostReason: backend.lost_reason ?? undefined,
    lostObservations: backend.lost_observations ?? undefined,
    notes: backend.notes ?? undefined,
    trackingParams: adaptTrackingParamsFromBackend(backend.tracking_params),
    // Extrair campos de metadata se existirem
    city: (backend.metadata?.city as string) ?? undefined,
    country: (backend.metadata?.country as string) ?? undefined,
    device: (backend.metadata?.device as 'mobile' | 'desktop' | 'tablet') ?? undefined,
    // UTMs como convenience accessors
    utmSource: (backend.tracking_params?.utm_source as string) ?? undefined,
    utmMedium: (backend.tracking_params?.utm_medium as string) ?? undefined,
    utmCampaign: (backend.tracking_params?.utm_campaign as string) ?? undefined,
    utmContent: (backend.tracking_params?.utm_content as string) ?? undefined,
    utmTerm: (backend.tracking_params?.utm_term as string) ?? undefined,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    // Dados do contato via join (evita lookup no contacts store)
    contactName: backend.contacts?.name ?? undefined,
    contactPhone: backend.contacts
      ? (backend.contacts.country_code
          ? `+${backend.contacts.country_code} ${backend.contacts.phone || ''}`
          : backend.contacts.phone ?? undefined)
      : undefined,
  }
}

/**
 * Converte lista de Sales do backend para frontend
 */
export function adaptSalesListFromBackend(backendList: BackendSale[]): Sale[] {
  return backendList.map(adaptSaleFromBackend)
}

/**
 * Adapta tracking_params do backend para o frontend
 */
function adaptTrackingParamsFromBackend(params: Record<string, unknown>): TrackingParams | undefined {
  if (!params || Object.keys(params).length === 0) {
    return undefined
  }
  
  return {
    gclid: params.gclid as string | undefined,
    gbraid: params.gbraid as string | undefined,
    wbraid: params.wbraid as string | undefined,
    fbclid: params.fbclid as string | undefined,
    ttclid: params.ttclid as string | undefined,
    ttpclid: params.ttpclid as string | undefined,
    utm_source: params.utm_source as string | undefined,
    utm_medium: params.utm_medium as string | undefined,
    utm_campaign: params.utm_campaign as string | undefined,
    utm_content: params.utm_content as string | undefined,
    utm_term: params.utm_term as string | undefined
  }
}

// ============================================================================
// FUNÇÕES DE ADAPTAÇÃO: FRONTEND → BACKEND
// ============================================================================

/**
 * Converte CreateSaleDTO do frontend (camelCase) para backend (snake_case)
 */
export function adaptCreateSaleToBackend(dto: CreateSaleDTO): BackendCreateSaleDTO {
  const backendDTO: BackendCreateSaleDTO = {
    project_id: dto.projectId ?? '',
    contact_id: dto.contactId,
    value: dto.value,
    currency: dto.currency || 'BRL',
    date: dto.date
  }

  // Campos opcionais
  if (dto.origin) {
    backendDTO.origin_id = dto.origin
  }

  // Tracking params
  if (dto.trackingParams) {
    backendDTO.tracking_params = {
      ...(dto.trackingParams.gclid && { gclid: dto.trackingParams.gclid }),
      ...(dto.trackingParams.gbraid && { gbraid: dto.trackingParams.gbraid }),
      ...(dto.trackingParams.wbraid && { wbraid: dto.trackingParams.wbraid }),
      ...(dto.trackingParams.fbclid && { fbclid: dto.trackingParams.fbclid }),
      ...(dto.trackingParams.ttclid && { ttclid: dto.trackingParams.ttclid }),
      ...(dto.trackingParams.ttpclid && { ttpclid: dto.trackingParams.ttpclid }),
      ...(dto.trackingParams.utm_source && { utm_source: dto.trackingParams.utm_source }),
      ...(dto.trackingParams.utm_medium && { utm_medium: dto.trackingParams.utm_medium }),
      ...(dto.trackingParams.utm_campaign && { utm_campaign: dto.trackingParams.utm_campaign }),
      ...(dto.trackingParams.utm_content && { utm_content: dto.trackingParams.utm_content }),
      ...(dto.trackingParams.utm_term && { utm_term: dto.trackingParams.utm_term })
    }
  }

  return backendDTO
}

/**
 * Converte UpdateSaleDTO do frontend (camelCase) para backend (snake_case)
 */
export function adaptUpdateSaleToBackend(dto: UpdateSaleDTO): BackendUpdateSaleDTO {
  const backendDTO: BackendUpdateSaleDTO = {}

  if (dto.value !== undefined) backendDTO.value = dto.value
  if (dto.currency !== undefined) backendDTO.currency = dto.currency
  if (dto.date !== undefined) backendDTO.date = dto.date
  if (dto.origin !== undefined) backendDTO.origin_id = dto.origin || null

  return backendDTO
}

/**
 * Converte MarkSaleLostDTO do frontend para backend
 */
export function adaptMarkLostToBackend(dto: MarkSaleLostDTO): BackendMarkSaleLostDTO {
  return {
    lost_reason: dto.lostReason || dto.reason || '',
    lost_observations: dto.lostObservations ?? null
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Converte parâmetros de filtro do frontend para query params do backend
 */
export function adaptSaleFiltersToParams(filters: Record<string, unknown>): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.projectId) params.project_id = String(filters.projectId)
  if (filters.contactId) params.contact_id = String(filters.contactId)
  if (filters.originId) params.origin_id = String(filters.originId)
  if (filters.status) params.status = String(filters.status)
  if (filters.dateFrom) params.date_from = String(filters.dateFrom)
  if (filters.dateTo) params.date_to = String(filters.dateTo)
  if (filters.minValue !== undefined) params.min_value = String(filters.minValue)
  if (filters.maxValue !== undefined) params.max_value = String(filters.maxValue)
  if (filters.search) params.search = String(filters.search)
  if (filters.page) params.offset = String(((filters.page as number) - 1) * ((filters.pageSize as number) || 10))
  if (filters.pageSize) params.limit = String(filters.pageSize)

  return params
}
