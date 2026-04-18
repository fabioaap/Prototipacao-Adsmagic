/**
 * Validadores Zod para Edge Function de Tags
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Regex para validar cor hexadecimal (#RRGGBB)
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// Schema para criação de tag
export const createTagSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  name: z.string()
    .min(1, 'Name must be at least 1 character')
    .max(50, 'Name must be at most 50 characters'),
  color: z.string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable()
})

// Schema para atualização de tag
export const updateTagSchema = z.object({
  name: z.string()
    .min(1, 'Name must be at least 1 character')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
  color: z.string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)')
    .optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable()
})

// Schema para query parameters de listagem
export const listTagsQuerySchema = z.object({
  project_id: z.string().uuid('Invalid project ID format').optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional()
})

// Schema para adicionar tag a contato
export const addTagToContactSchema = z.object({
  tag_id: z.string().uuid('Invalid tag ID format')
})

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
