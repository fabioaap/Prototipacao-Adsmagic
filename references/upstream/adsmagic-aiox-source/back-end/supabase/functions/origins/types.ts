/**
 * Tipos TypeScript para Edge Function de Origens
 */

export interface Origin {
  id: string
  project_id: string | null
  name: string
  type: 'system' | 'custom'
  color: string
  icon: string | null
  is_active: boolean
  utm_source_match_mode: 'exact' | 'contains' | null
  utm_source_match_value: string | null
  created_at: string
}

export interface CreateOriginDTO {
  project_id: string
  name: string
  color: string
  icon?: string | null
  is_active?: boolean
  utm_source_match_mode?: 'exact' | 'contains' | null
  utm_source_match_value?: string | null
}

export interface UpdateOriginDTO {
  name?: string
  color?: string
  icon?: string | null
  is_active?: boolean
  utm_source_match_mode?: 'exact' | 'contains' | null
  utm_source_match_value?: string | null
}

export interface OriginsListResponse {
  data: Origin[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}
