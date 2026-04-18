/**
 * Tipos TypeScript para Edge Function de Projetos
 * 
 * Tipos compartilhados entre handlers e validators
 */

// Tipos do banco de dados (importados do database.types.ts)
export interface Project {
  id: string
  company_id: string
  created_by: string
  name: string
  description?: string | null
  company_type: 'franchise' | 'corporate' | 'individual'
  franchise_count?: number | null
  country: string
  language: string
  currency: string
  timezone: string
  attribution_model: 'first_touch' | 'last_touch' | 'conversion'
  whatsapp_connected: boolean
  meta_ads_connected: boolean
  google_ads_connected: boolean
  tiktok_ads_connected: boolean
  status: 'draft' | 'active' | 'paused' | 'archived'
  wizard_progress?: any | null
  wizard_current_step?: number | null
  wizard_completed_at?: string | null
  created_at: string
  updated_at: string
}

// DTOs para criação e atualização
export interface CreateProjectDTO {
  company_id: string
  created_by: string
  name: string
  description?: string
  company_type: 'franchise' | 'corporate' | 'individual'
  franchise_count?: number
  country: string
  language: string
  currency: string
  timezone: string
  attribution_model: 'first_touch' | 'last_touch' | 'conversion'
  whatsapp_connected?: boolean
  meta_ads_connected?: boolean
  google_ads_connected?: boolean
  tiktok_ads_connected?: boolean
  status?: 'draft' | 'active' | 'paused' | 'archived'
  wizard_progress?: any
  wizard_current_step?: number
}

export interface UpdateProjectDTO {
  name?: string
  description?: string
  status?: 'draft' | 'active' | 'paused' | 'archived'
  wizard_progress?: any
  wizard_current_step?: number
  wizard_completed_at?: string
  whatsapp_connected?: boolean
  meta_ads_connected?: boolean
  google_ads_connected?: boolean
  tiktok_ads_connected?: boolean
}

// Tipos para wizard progress
export interface WizardProgress {
  current_step: number
  data: any
  last_saved_at: string
}

// Tipos para query parameters
export interface ListProjectsQuery {
  status?: string
  limit?: number
  offset?: number
}

// Tipo para projeto com métricas calculadas
export interface ProjectWithMetrics extends Project {
  revenue: number
  contacts_count: number
  sales_count: number
  conversion_rate: number
  average_ticket: number
  /** Investimento em ads (Meta/Google) - spend agregado das integrações */
  investment?: number
  /** Impressões das campanhas de ads */
  impressions?: number
  /** Cliques das campanhas de ads */
  clicks?: number
}

// Tipos para respostas da API
export interface ProjectResponse {
  data: Project
}

export interface ProjectsListResponse {
  data: Project[] | ProjectWithMetrics[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}
