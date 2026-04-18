/**
 * Tipos TypeScript para Edge Function de Empresas
 * 
 * Tipos compartilhados entre handlers e validators
 */

// Tipos do banco de dados (baseados em front-end/src/types/index.ts)
export interface Company {
  id: string
  name: string
  description: string | null
  country: string
  currency: string
  timezone: string
  industry: string | null
  size: string | null
  website: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyUser {
  id: string
  company_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  permissions: Record<string, boolean> | null
  is_active: boolean
  invited_by: string | null
  invited_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  id: string
  company_id: string
  theme: string | null
  language: string | null
  timezone: string | null
  date_format: string | null
  time_format: string | null
  decimal_separator: string | null
  thousands_separator: string | null
  notifications_enabled: boolean
  notification_email: string | null
  digest_frequency: string | null
  digest_time: string | null
  default_attribution_model: string | null
  auto_track_events: boolean
  include_company_info: boolean
  include_contact_info: boolean
  report_timezone: string | null
  created_at: string
  updated_at: string
}

// DTOs para criação e atualização
export interface CreateCompanyDTO {
  name: string
  description?: string
  country: string
  currency: string
  timezone: string
  industry?: string
  size?: string
  website?: string
}

export interface UpdateCompanyDTO {
  name?: string
  description?: string
  country?: string
  currency?: string
  timezone?: string
  industry?: string
  size?: string
  website?: string
  logo_url?: string
}

// Tipos para query parameters
export interface ListCompaniesQuery {
  limit?: number
  offset?: number
}

// Tipos para respostas da API
export interface CompanyResponse {
  data: Company & {
    userRole: string
    permissions: Record<string, boolean> | null
  }
}

export interface CompaniesListResponse {
  data: (Company & {
    userRole: string
    permissions: Record<string, boolean> | null
  })[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}
