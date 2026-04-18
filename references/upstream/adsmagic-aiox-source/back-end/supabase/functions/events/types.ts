/**
 * Tipos TypeScript para Edge Function de Eventos de Conversão
 */

export type Platform = 'meta' | 'google' | 'tiktok'
export type EventStatus = 'pending' | 'sent' | 'failed' | 'cancelled'
export type EventType = 'purchase' | 'lead' | 'add_to_cart' | 'initiate_checkout' | 'view_content' | 'complete_registration'

export interface ConversionEvent {
  id: string
  project_id: string
  contact_id: string | null
  sale_id: string | null
  platform: Platform
  event_type: EventType
  status: EventStatus
  payload: Record<string, unknown>
  response: Record<string, unknown> | null
  error_message: string | null
  retry_count: number
  last_retry_at: string | null
  max_retries: number
  processed_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateConversionEventDTO {
  project_id: string
  contact_id?: string
  sale_id?: string
  platform: Platform
  event_type: EventType
  payload?: Record<string, unknown>
  max_retries?: number
}

export interface EventsListResponse {
  data: ConversionEvent[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface EventFilters {
  project_id?: string
  platform?: Platform
  event_type?: EventType
  status?: EventStatus
  contact_id?: string
  sale_id?: string
  limit?: number
  offset?: number
}
