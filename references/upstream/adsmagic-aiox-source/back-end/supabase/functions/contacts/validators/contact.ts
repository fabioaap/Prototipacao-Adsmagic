/**
 * Validadores Zod para Edge Function de Contatos
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Schema para criação de contato
export const createContactSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  // Identificadores opcionais - pelo menos um deve estar presente (validado via refine)
  phone: z.string().regex(/^[0-9]{8,15}$/, 'Phone must be 8-15 digits').optional().nullable(),
  country_code: z.string().regex(/^[0-9]{1,3}$/, 'Country code must be 1-3 digits').optional().nullable(),
  /** JID (Jabber ID) - identificador único do WhatsApp no formato: "554791662434@s.whatsapp.net" ou "554791662434@c.us" */
  jid: z.string().regex(/^[0-9]+@(s\.whatsapp\.net|c\.us)$/, 'JID must be in format: "number@s.whatsapp.net" or "number@c.us"').optional().nullable(),
  /** LID (Local ID) - identificador local do WhatsApp no formato: "213709100187796@lid" */
  lid: z.string().regex(/^[0-9]+@lid$/, 'LID must be in format: "number@lid"').optional().nullable(),
  /** Identificador canônico normalizado para busca unificada */
  canonical_identifier: z.string().min(1, 'Canonical identifier must not be empty').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  company: z.string().max(100, 'Company must be at most 100 characters').optional().nullable(),
  location: z.string().max(100, 'Location must be at most 100 characters').optional().nullable(),
  notes: z.string().optional().nullable(),
  avatar_url: z.string().url('Invalid URL format').max(500, 'Avatar URL must be at most 500 characters').optional().nullable(),
  is_favorite: z.boolean().optional().default(false),
  main_origin_id: z.string().uuid('Invalid origin ID format'),
  current_stage_id: z.string().uuid('Invalid stage ID format'),
  metadata: z.record(z.unknown()).optional().default({})
}).refine(
  (data) => {
    // Pelo menos um identificador deve estar presente
    return !!(data.phone || data.jid || data.lid || data.canonical_identifier)
  },
  {
    message: 'At least one identifier must be provided: phone, jid, lid, or canonical_identifier',
    path: ['phone'] // Erro será mostrado no campo phone
  }
)

// Schema para atualização de contato
export const updateContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').optional(),
  // Identificadores opcionais
  phone: z.string().regex(/^[0-9]{8,15}$/, 'Phone must be 8-15 digits').optional().nullable(),
  country_code: z.string().regex(/^[0-9]{1,3}$/, 'Country code must be 1-3 digits').optional().nullable(),
  /** JID (Jabber ID) - identificador único do WhatsApp no formato: "554791662434@s.whatsapp.net" ou "554791662434@c.us" */
  jid: z.string().regex(/^[0-9]+@(s\.whatsapp\.net|c\.us)$/, 'JID must be in format: "number@s.whatsapp.net" or "number@c.us"').optional().nullable(),
  /** LID (Local ID) - identificador local do WhatsApp no formato: "213709100187796@lid" */
  lid: z.string().regex(/^[0-9]+@lid$/, 'LID must be in format: "number@lid"').optional().nullable(),
  /** Identificador canônico normalizado para busca unificada */
  canonical_identifier: z.string().min(1, 'Canonical identifier must not be empty').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  company: z.string().max(100, 'Company must be at most 100 characters').optional().nullable(),
  location: z.string().max(100, 'Location must be at most 100 characters').optional().nullable(),
  notes: z.string().optional().nullable(),
  avatar_url: z.string().url('Invalid URL format').max(500, 'Avatar URL must be at most 500 characters').optional().nullable(),
  is_favorite: z.boolean().optional(),
  main_origin_id: z.string().uuid('Invalid origin ID format').optional(),
  current_stage_id: z.string().uuid('Invalid stage ID format').optional(),
  metadata: z.record(z.unknown()).optional()
})

// Schema para query parameters de listagem
export const listContactsQuerySchema = z.object({
  project_id: z.string().uuid('Invalid project ID format').optional(),
  search: z.string().min(1).optional(),
  origin_id: z.string().uuid('Invalid origin ID format').optional(),
  stage_id: z.string().uuid('Invalid stage ID format').optional(),
  is_favorite: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  sort: z.enum(['created_at', 'name_asc', 'name_desc', 'updated_at']).optional(),
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

