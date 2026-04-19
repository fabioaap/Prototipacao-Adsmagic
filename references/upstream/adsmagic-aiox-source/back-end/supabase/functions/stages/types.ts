/**
 * Tipos TypeScript para Edge Function de Estágios
 */

export interface Stage {
  id: string
  project_id: string | null
  name: string
  display_order: number
  color: string | null
  tracking_phrase: string | null
  type: 'normal' | 'sale' | 'lost'
  is_active: boolean
  event_config: Record<string, unknown> | null
  created_at: string
}

export interface CreateStageDTO {
  project_id: string
  name: string
  display_order: number
  color?: string | null
  tracking_phrase?: string | null
  type: 'normal' | 'sale' | 'lost'
  is_active?: boolean
  event_config?: Record<string, unknown> | null
}

export interface UpdateStageDTO {
  name?: string
  display_order?: number
  color?: string | null
  tracking_phrase?: string | null
  type?: 'normal' | 'sale' | 'lost'
  is_active?: boolean
  event_config?: Record<string, unknown> | null
}

export interface ReorderStagesDTO {
  stage_ids: string[]
}

export interface StagesListResponse {
  data: StageWithCount[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface StageWithCount extends Stage {
  contacts_count?: number
}
