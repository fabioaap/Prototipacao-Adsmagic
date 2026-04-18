/**
 * Validadores Zod para Edge Function de Links Rastreáveis
 * 
 * Schemas de validação para todos os endpoints
 * 
 * @module trackable-links/validators
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

/** Tipos de link válidos */
const linkTypeEnum = z.enum(['whatsapp', 'landing_page', 'direct'])

/**
 * Schema para criação de link
 */
export const createLinkSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  destination_url: z.string()
    .url('Invalid destination URL format')
    .max(2000, 'Destination URL must be at most 2000 characters')
    .optional()
    .nullable(),
  initial_message: z.string()
    .max(1000, 'Initial message must be at most 1000 characters')
    .optional()
    .nullable(),
  origin_id: z.string().uuid('Invalid origin ID format').optional().nullable(),
  whatsapp_number: z.string()
    .regex(/^[0-9]{10,15}$/, 'WhatsApp number must be 10-15 digits')
    .optional()
    .nullable(),
  whatsapp_message_template: z.string()
    .max(1000, 'WhatsApp message template must be at most 1000 characters')
    .optional()
    .nullable(),
  link_type: linkTypeEnum,
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(100).optional().nullable(),
  utm_content: z.string().max(100).optional().nullable(),
  utm_term: z.string().max(100).optional().nullable()
}).refine(
  (data) => {
    // WhatsApp number é obrigatório quando link_type = 'whatsapp'
    if (data.link_type === 'whatsapp') {
      return !!data.whatsapp_number
    }
    return true
  },
  {
    message: 'WhatsApp number is required for whatsapp link type',
    path: ['whatsapp_number']
  }
).refine(
  (data) => {
    // Destination URL é obrigatório quando link_type != 'whatsapp'
    if (data.link_type !== 'whatsapp') {
      return !!data.destination_url
    }
    return true
  },
  {
    message: 'Destination URL is required for landing_page and direct link types',
    path: ['destination_url']
  }
)

/**
 * Schema para atualização de link
 */
export const updateLinkSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  destination_url: z.string()
    .url('Invalid destination URL format')
    .max(2000, 'Destination URL must be at most 2000 characters')
    .optional()
    .nullable(),
  initial_message: z.string()
    .max(1000, 'Initial message must be at most 1000 characters')
    .optional()
    .nullable(),
  origin_id: z.string().uuid('Invalid origin ID format').optional().nullable(),
  whatsapp_number: z.string()
    .regex(/^[0-9]{10,15}$/, 'WhatsApp number must be 10-15 digits')
    .optional()
    .nullable(),
  whatsapp_message_template: z.string()
    .max(1000, 'WhatsApp message template must be at most 1000 characters')
    .optional()
    .nullable(),
  link_type: linkTypeEnum.optional(),
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(100).optional().nullable(),
  utm_content: z.string().max(100).optional().nullable(),
  utm_term: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional()
})

/**
 * Schema para query parameters de listagem
 */
export const listLinksQuerySchema = z.object({
  project_id: z.string().uuid('Invalid project ID format').optional(),
  search: z.string().min(1).optional(),
  link_type: linkTypeEnum.optional(),
  is_active: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  origin_id: z.string().uuid('Invalid origin ID format').optional(),
  sort: z.enum(['created_at', 'name_asc', 'name_desc', 'clicks_count', 'contacts_count', 'revenue']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional()
})

/**
 * Schema para registro de acesso
 */
export const registerAccessSchema = z.object({
  event_id: z.string().uuid('Invalid event ID format'),
  access_uuid: z.string()
    .min(1, 'Access UUID is required')
    .max(36, 'Access UUID must be at most 36 characters'),
  whatsapp_protocol: z.string().max(100).optional().nullable(),
  user_agent: z.string().max(500).optional().nullable(),
  ip_address: z.string().max(45).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(2).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  device: z.string().max(50).optional().nullable(),
  fbclid: z.string().max(255).optional().nullable(),
  gclid: z.string().max(255).optional().nullable(),
  msclkid: z.string().max(255).optional().nullable(),
  gbraid: z.string().max(255).optional().nullable(),
  wbraid: z.string().max(255).optional().nullable(),
  yclid: z.string().max(255).optional().nullable(),
  ttclid: z.string().max(255).optional().nullable(),
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(100).optional().nullable(),
  utm_content: z.string().max(100).optional().nullable(),
  utm_term: z.string().max(100).optional().nullable(),
  campaign_id: z.string().max(100).optional().nullable(),
  adgroup_id: z.string().max(100).optional().nullable(),
  ad_id: z.string().max(100).optional().nullable(),
  referrer: z.string().max(2000).optional().nullable(),
  landing_page: z.string().max(2000).optional().nullable()
})

/**
 * Schema para validação de UUID
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * Função helper para validar UUID
 */
export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success
}

/**
 * Função helper para extrair erros de validação
 */
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
}
