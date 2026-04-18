/**
 * Tipos TypeScript para Edge Function de Tags
 */

export interface Tag {
  id: string
  project_id: string
  name: string
  color: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ContactTag {
  id: string
  contact_id: string
  tag_id: string
  created_at: string
}

export interface CreateTagDTO {
  project_id: string
  name: string
  color: string
  description?: string | null
}

export interface UpdateTagDTO {
  name?: string
  color?: string
  description?: string | null
}

export interface TagsListResponse {
  data: Tag[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface TagWithContactsCount extends Tag {
  contacts_count?: number
}
