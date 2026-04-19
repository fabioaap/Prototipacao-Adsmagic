/**
 * Validadores Zod para Edge Function de Projetos
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Schema para wizard progress
export const wizardProgressSchema = z.object({
  current_step: z.number().int().min(1).max(6),
  data: z.any(),
  last_saved_at: z.string().datetime()
}).or(z.any()) // Permitir qualquer estrutura para wizard_progress

// Schema para criação de projeto
export const createProjectSchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  created_by: z.string().uuid('Invalid user ID format'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  company_type: z.enum(['franchise', 'corporate', 'individual']),
  franchise_count: z.number().int().min(1).max(999).optional(),
  country: z.string().length(2, 'Country must be 2 characters (ISO 3166-1 alpha-2)'),
  language: z.string().length(2, 'Language must be 2 characters (ISO 639-1)'),
  currency: z.string().length(3, 'Currency must be 3 characters (ISO 4217)'),
  timezone: z.string().min(1, 'Timezone is required'),
  attribution_model: z.enum(['first_touch', 'last_touch', 'conversion']),
  whatsapp_connected: z.boolean().optional().default(false),
  meta_ads_connected: z.boolean().optional().default(false),
  google_ads_connected: z.boolean().optional().default(false),
  tiktok_ads_connected: z.boolean().optional().default(false),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional().default('draft'),
  wizard_progress: wizardProgressSchema.optional(),
  wizard_current_step: z.number().int().min(1).max(6).optional()
})

// Schema para atualização de projeto
export const updateProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters').optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
  wizard_progress: wizardProgressSchema.optional(),
  wizard_current_step: z.number().int().min(1).max(6).optional(),
  wizard_completed_at: z.string().datetime().optional(),
  whatsapp_connected: z.boolean().optional(),
  meta_ads_connected: z.boolean().optional(),
  google_ads_connected: z.boolean().optional(),
  tiktok_ads_connected: z.boolean().optional()
})

// Schema para query parameters de listagem
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use AAAA-MM-DD.').optional()

export const listProjectsQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().min(1).optional(),
  sort: z.enum(['created_at', 'name_asc', 'name_desc']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional(),
  with_metrics: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  start_date: isoDateSchema,
  end_date: isoDateSchema
}).refine(
  (data) => {
    const hasStart = data.start_date != null && data.start_date !== ''
    const hasEnd = data.end_date != null && data.end_date !== ''
    if (hasStart !== hasEnd) return false
    if (!hasStart) return true
    return new Date(data.start_date!) <= new Date(data.end_date!)
  },
  { message: 'start_date e end_date devem ser informados juntos; start_date deve ser anterior ou igual a end_date.', path: ['start_date'] }
)

// Schema para validação de UUID
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Função helper para validar UUID
export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success
}

// Função helper para extrair erros de validação
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
}
