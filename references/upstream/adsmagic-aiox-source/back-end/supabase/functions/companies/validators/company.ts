/**
 * Validadores Zod para Edge Function de Empresas
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Schema para criação de empresa
export const createCompanySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  country: z.string().length(2, 'Country must be 2 characters (ISO 3166-1 alpha-2)'),
  currency: z.string().length(3, 'Currency must be 3 characters (ISO 4217)'),
  timezone: z.string().min(1, 'Timezone is required'),
  industry: z.string().max(100, 'Industry must be at most 100 characters').optional(),
  size: z.string().max(50, 'Size must be at most 50 characters').optional(),
  website: z
    .string()
    .url('Website must be a valid URL')
    .or(z.literal(''))
    .optional()
})

// Schema para atualização de empresa
export const updateCompanySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters').optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  country: z.string().length(2, 'Country must be 2 characters (ISO 3166-1 alpha-2)').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters (ISO 4217)').optional(),
  timezone: z.string().min(1, 'Timezone is required').optional(),
  industry: z.string().max(100, 'Industry must be at most 100 characters').optional(),
  size: z.string().max(50, 'Size must be at most 50 characters').optional(),
  website: z
    .string()
    .url('Website must be a valid URL')
    .or(z.literal(''))
    .optional(),
  logo_url: z
    .string()
    .url('Logo URL must be a valid URL')
    .or(z.literal(''))
    .optional()
})

// Schema para query parameters de listagem
export const listCompaniesQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional()
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
