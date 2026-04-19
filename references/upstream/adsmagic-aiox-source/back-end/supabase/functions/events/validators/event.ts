/**
 * Validadores Zod para Eventos de Conversão
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

/**
 * Schema para criação de evento
 */
export const createEventSchema = z.object({
  project_id: z.string().uuid('project_id must be a valid UUID'),
  contact_id: z.string().uuid('contact_id must be a valid UUID').optional(),
  sale_id: z.string().uuid('sale_id must be a valid UUID').optional(),
  platform: z.enum(['meta', 'google', 'tiktok'], {
    errorMap: () => ({ message: 'platform must be one of: meta, google, tiktok' })
  }),
  event_type: z.enum(['purchase', 'lead', 'add_to_cart', 'initiate_checkout', 'view_content', 'complete_registration'], {
    errorMap: () => ({ message: 'event_type must be a valid event type' })
  }),
  payload: z.record(z.unknown()).optional().default({}),
  max_retries: z.number().int().min(0).max(10).optional().default(3),
}).refine(
  (data) => data.contact_id !== undefined || data.sale_id !== undefined,
  {
    message: 'Either contact_id or sale_id must be provided',
    path: ['contact_id', 'sale_id']
  }
)

/**
 * Schema para filtros de listagem
 */
export const eventFiltersSchema = z.object({
  project_id: z.string().uuid().optional(),
  platform: z.enum(['meta', 'google', 'tiktok']).optional(),
  event_type: z.enum(['purchase', 'lead', 'add_to_cart', 'initiate_checkout', 'view_content', 'complete_registration']).optional(),
  status: z.enum(['pending', 'sent', 'failed', 'cancelled']).optional(),
  contact_id: z.string().uuid().optional(),
  sale_id: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional().default(10),
  offset: z.number().int().min(0).optional().default(0),
})

/**
 * Extrai erros de validação do Zod
 */
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.')
    return `${path}: ${err.message}`
  })
}
