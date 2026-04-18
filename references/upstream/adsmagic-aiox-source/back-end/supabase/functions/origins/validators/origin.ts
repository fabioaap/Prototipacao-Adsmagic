/**
 * Validadores Zod para Edge Function de Origens
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Regex para validar cor hexadecimal (#RRGGBB)
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
const utmSourceMatchModeSchema = z.enum(['exact', 'contains'])
const utmSourceMatchValueSchema = z.string()
  .trim()
  .min(1, 'utm_source_match_value cannot be empty')
  .max(100, 'utm_source_match_value must be at most 100 characters')
  .regex(/^\S+$/, 'utm_source_match_value must not contain spaces')

// Schema para criação de origem
export const createOriginSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  color: z.string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)'),
  icon: z.string().max(50, 'Icon must be at most 50 characters').optional().nullable(),
  is_active: z.boolean().optional().default(true),
  utm_source_match_mode: utmSourceMatchModeSchema.optional().nullable(),
  utm_source_match_value: utmSourceMatchValueSchema.optional().nullable(),
}).superRefine((value, ctx) => {
  const mode = value.utm_source_match_mode
  const raw = value.utm_source_match_value
  const hasMode = !!mode
  const hasValue = typeof raw === 'string' && raw.trim().length > 0

  if (hasMode !== hasValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'utm_source_match_mode and utm_source_match_value must be provided together',
      path: hasMode ? ['utm_source_match_value'] : ['utm_source_match_mode'],
    })
  }
})

// Schema para atualização de origem
export const updateOriginSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
  color: z.string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)')
    .optional(),
  icon: z.string().max(50, 'Icon must be at most 50 characters').optional().nullable(),
  is_active: z.boolean().optional(),
  utm_source_match_mode: utmSourceMatchModeSchema.optional().nullable(),
  utm_source_match_value: utmSourceMatchValueSchema.optional().nullable(),
})

// Schema para query parameters de listagem
export const listOriginsQuerySchema = z.object({
  project_id: z.string().uuid('Invalid project ID format').optional(),
  is_active: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  type: z.enum(['system', 'custom', 'all']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional()
})

// Schema para validação de UUID
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Função helper para validar UUID
export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success
}

export function normalizeUtmSourceMatchValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

// Função helper para extrair erros de validação
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
}
