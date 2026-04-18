/**
 * Validadores Zod para Edge Function de Sales
 * 
 * Schemas de validação para todos os endpoints.
 * Segue o mesmo padrão de contacts/validators/contact.ts
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

/**
 * Schema para criação de venda (POST /sales)
 */
export const createSaleSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  contact_id: z.string().uuid('Invalid contact ID format'),
  value: z.number()
    .nonnegative('Value must be non-negative')
    .max(99999999.99, 'Value exceeds maximum allowed (99,999,999.99)'),
  currency: z.string()
    .length(3, 'Currency must be 3 characters (ISO 4217)')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional()
    .default('BRL'),
  date: z.string().datetime({ message: 'Invalid date format (ISO 8601 required)' }),
  origin_id: z.string().uuid('Invalid origin ID format').optional().nullable(),
  notes: z.string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional()
    .nullable(),
  tracking_params: z.record(z.unknown()).optional().default({}),
  metadata: z.record(z.unknown()).optional().default({})
})

/**
 * Schema para atualização de venda (PATCH /sales/:id)
 */
export const updateSaleSchema = z.object({
  value: z.number()
    .nonnegative('Value must be non-negative')
    .max(99999999.99, 'Value exceeds maximum allowed')
    .optional(),
  currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional(),
  date: z.string().datetime({ message: 'Invalid date format' }).optional(),
  origin_id: z.string().uuid('Invalid origin ID format').optional().nullable(),
  notes: z.string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional()
    .nullable(),
  tracking_params: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional()
})

/**
 * Schema para marcar venda como perdida (PATCH /sales/:id/lost)
 */
export const markSaleLostSchema = z.object({
  lost_reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(100, 'Reason must be at most 100 characters'),
  lost_observations: z.string()
    .max(500, 'Observations must be at most 500 characters')
    .optional()
    .nullable()
})

/**
 * Schema para query parameters de listagem (GET /sales)
 */
export const listSalesQuerySchema = z.object({
  project_id: z.string().uuid('Invalid project ID format').optional(),
  contact_id: z.string().uuid('Invalid contact ID format').optional(),
  origin_id: z.string().uuid('Invalid origin ID format').optional(),
  status: z.enum(['completed', 'lost']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  min_value: z.string()
    .transform(val => parseFloat(val))
    .pipe(z.number().nonnegative('min_value must be non-negative'))
    .optional(),
  max_value: z.string()
    .transform(val => parseFloat(val))
    .pipe(z.number().positive('max_value must be positive'))
    .optional(),
  search: z.string().min(1).optional(),
  sort: z.enum(['date_asc', 'date_desc', 'value_asc', 'value_desc', 'created_at']).optional(),
  limit: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  offset: z.string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .optional()
})

/**
 * Schema para validação de UUID
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * Valida se uma string é um UUID válido
 */
export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success
}

/**
 * Extrai mensagens de erro de um ZodError
 */
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
}
