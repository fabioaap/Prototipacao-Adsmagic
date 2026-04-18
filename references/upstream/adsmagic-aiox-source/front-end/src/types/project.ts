import { z } from 'zod'

/**
 * Status de conexão do WhatsApp
 */
export type WhatsAppStatus = 'connected' | 'disconnected'

/**
 * Status do projeto
 */
export type ProjectStatus = 'active' | 'inactive' | 'archived'

/**
 * Tipo de ordenação dos projetos
 */
export type ProjectSortType = 'created_at' | 'name_asc' | 'name_desc'

/**
 * Métricas de comparação de um projeto
 */
export interface ProjectMetrics {
  /** Investimento total */
  investment: number
  /** Número de contatos */
  contacts: number
  /** Número de vendas */
  sales: number
  /** Taxa de conversão de vendas (0-100) */
  conversionRate: number
  /** Ticket médio */
  averageTicket: number
  /** Receita total */
  revenue: number
}

/**
 * Comparativo percentual entre períodos
 */
export interface MetricsComparison {
  /** Variação no investimento (%) */
  investment: number
  /** Variação nos contatos (%) */
  contacts: number
  /** Variação nas vendas (%) */
  sales: number
  /** Variação na taxa de conversão (%) */
  conversionRate: number
  /** Variação no ticket médio (%) */
  averageTicket: number
  /** Variação na receita (%) */
  revenue: number
}

/**
 * Progresso do wizard de criação de projeto
 */
export interface WizardProgress {
  /** Step atual do wizard */
  current_step: number
  /** Dados do projeto sendo criado */
  data: Record<string, unknown>
  /** Data do último salvamento */
  last_saved_at?: string
}

/**
 * Projeto individual
 */
export interface Project {
  /** ID único do projeto */
  id: string
  /** Nome do projeto */
  name: string
  /** Descrição do projeto */
  description?: string | null

  // Campos do backend
  company_id: string
  created_by: string
  company_type: 'franchise' | 'corporate' | 'individual'
  franchise_count?: number | null
  country: string
  language: string
  currency: string
  timezone: string
  attribution_model: 'first_touch' | 'last_touch' | 'conversion'

  // Integrações
  whatsapp_connected: boolean
  meta_ads_connected: boolean
  google_ads_connected: boolean
  tiktok_ads_connected: boolean

  // Status
  status: 'draft' | 'active' | 'paused' | 'archived'

  // Métricas do projeto (sempre presentes, zeradas quando não houver dados)
  /** Investimento total */
  investment?: number
  /** Receita total */
  revenue?: number
  /** Número de contatos */
  contacts_count?: number
  /** Número de vendas */
  sales_count?: number
  /** Taxa de conversão (0-100) */
  conversion_rate?: number
  /** Ticket médio */
  average_ticket?: number

  // Wizard progress fields
  wizard_progress?: WizardProgress | null
  wizard_current_step?: number | null
  wizard_completed_at?: string | null

  // Manter compatibilidade com mock (deprecated)
  whatsappStatus?: WhatsAppStatus // Mapear de whatsapp_connected
  metrics?: ProjectMetrics // Manter temporariamente
  comparison?: MetricsComparison // Manter temporariamente

  created_at: string
  updated_at: string
  createdAt?: Date // Mapear de created_at
  updatedAt?: Date // Mapear de updated_at
}

/**
 * Filtros para listagem de projetos
 */
export interface ProjectFilters {
  /** Termo de busca */
  search?: string
  /** Tipo de ordenação */
  sortBy?: ProjectSortType
  /** Filtrar por status do WhatsApp */
  whatsappStatus?: WhatsAppStatus
  /** Período para métricas (formato YYYY-MM-DD). Se informado, métricas são calculadas apenas neste intervalo. */
  startDate?: string
  /** Data final do período para métricas (formato YYYY-MM-DD). Deve ser informada junto com startDate. */
  endDate?: string
}

/**
 * Schema Zod para validação de projeto
 */
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  status: z.enum(['active', 'inactive', 'archived']),
  whatsappStatus: z.enum(['connected', 'disconnected']),
  metrics: z.object({
    investment: z.number().min(0),
    contacts: z.number().int().min(0),
    sales: z.number().int().min(0),
    conversionRate: z.number().min(0).max(100),
    averageTicket: z.number().min(0),
    revenue: z.number().min(0),
  }),
  comparison: z.object({
    investment: z.number(),
    contacts: z.number(),
    sales: z.number(),
    conversionRate: z.number(),
    averageTicket: z.number(),
    revenue: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Schema para criação de projeto
 */
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
})

/**
 * Schema para atualização de projeto
 */
export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).optional(),
  whatsappStatus: z.enum(['connected', 'disconnected']).optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
})

/**
 * Dados para criação de projeto
 */
export type CreateProjectData = z.infer<typeof createProjectSchema>

/**
 * Dados para atualização de projeto
 */
export type UpdateProjectData = z.infer<typeof updateProjectSchema>

/**
 * DTO para criação de projeto no backend
 */
export interface CreateProjectDTO {
  company_id: string
  name: string
  description?: string
  company_type: 'franchise' | 'corporate' | 'individual'
  franchise_count?: number
  country: string
  language: string
  currency: string
  timezone: string
  attribution_model?: 'first_touch' | 'last_touch' | 'conversion'
  created_by: string
  status?: 'draft' | 'active' | 'paused' | 'archived'
  wizard_progress?: WizardProgress | Record<string, unknown> | null
  wizard_current_step?: number | null
  wizard_completed_at?: string | null
  whatsapp_connected?: boolean
  meta_ads_connected?: boolean
  google_ads_connected?: boolean
  tiktok_ads_connected?: boolean
}

/**
 * DTO para atualização de projeto no backend
 */
export interface UpdateProjectDTO {
  name?: string
  description?: string
  company_type?: 'franchise' | 'corporate' | 'individual'
  franchise_count?: number
  status?: 'draft' | 'active' | 'paused' | 'archived'
}

/**
 * Usuário de um projeto
 */
export interface ProjectUser {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  permissions: Record<string, boolean> | null
  is_active: boolean
  created_at: string
  updated_at: string
}
