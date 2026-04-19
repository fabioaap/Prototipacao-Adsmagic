/**
 * Tipos TypeScript para Edge Function de Contatos
 */

export interface Contact {
  id: string
  project_id: string
  name: string
  phone: string
  country_code: string
  email?: string | null
  company?: string | null
  location?: string | null
  notes?: string | null
  avatar_url?: string | null
  is_favorite: boolean
  main_origin_id: string
  current_stage_id: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateContactDTO {
  project_id: string
  name: string
  phone?: string | null
  country_code?: string | null
  jid?: string | null
  lid?: string | null
  canonical_identifier?: string | null
  email?: string | null
  company?: string | null
  location?: string | null
  notes?: string | null
  avatar_url?: string | null
  is_favorite?: boolean
  main_origin_id: string
  current_stage_id: string
  metadata?: Record<string, unknown>
}

export interface UpdateContactDTO {
  name?: string
  phone?: string | null
  country_code?: string | null
  jid?: string | null
  lid?: string | null
  canonical_identifier?: string | null
  email?: string | null
  company?: string | null
  location?: string | null
  notes?: string | null
  avatar_url?: string | null
  is_favorite?: boolean
  main_origin_id?: string
  current_stage_id?: string
  metadata?: Record<string, unknown>
}

export interface ContactsListResponse {
  data: Contact[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}
