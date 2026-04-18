/**
 * Backend Contact Schemas - Zod Validations
 *
 * Schemas de validação que espelham os validators do backend Edge Function.
 * Usados para validar dados ANTES de enviar para a API.
 *
 * @see back-end/supabase/functions/contacts/validators/contact.ts
 * @module schemas/contacts.backend
 */

import { z } from 'zod'

// ============================================================================
// REGEX PATTERNS (matching backend validators)
// ============================================================================

/** Phone: 8-15 digits only */
const PHONE_REGEX = /^[0-9]{8,15}$/

/** Country code: 1-3 digits */
const COUNTRY_CODE_REGEX = /^[0-9]{1,3}$/

/** WhatsApp JID: number@s.whatsapp.net or number@c.us */
const JID_REGEX = /^[0-9]+@(s\.whatsapp\.net|c\.us)$/

/** WhatsApp LID: number@lid */
const LID_REGEX = /^[0-9]+@lid$/

/** UUID v4 format */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// ============================================================================
// BACKEND CREATE CONTACT SCHEMA
// ============================================================================

/**
 * Schema for creating a contact via backend API
 *
 * Required fields:
 * - project_id (UUID)
 * - name (2-100 chars)
 * - main_origin_id (UUID)
 * - current_stage_id (UUID)
 * - At least one identifier: phone, jid, lid, or canonical_identifier
 */
export const backendCreateContactSchema = z.object({
  project_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid project ID format' }),

  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' }),

  phone: z
    .string()
    .regex(PHONE_REGEX, { message: 'Phone must be 8-15 digits' })
    .optional()
    .nullable(),

  country_code: z
    .string()
    .regex(COUNTRY_CODE_REGEX, { message: 'Country code must be 1-3 digits' })
    .optional()
    .nullable(),

  jid: z
    .string()
    .regex(JID_REGEX, { message: 'JID must be in format: "number@s.whatsapp.net" or "number@c.us"' })
    .optional()
    .nullable(),

  lid: z
    .string()
    .regex(LID_REGEX, { message: 'LID must be in format: "number@lid"' })
    .optional()
    .nullable(),

  canonical_identifier: z
    .string()
    .min(1, { message: 'Canonical identifier must not be empty' })
    .optional()
    .nullable(),

  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .optional()
    .nullable(),

  company: z
    .string()
    .max(100, { message: 'Company must be at most 100 characters' })
    .optional()
    .nullable(),

  location: z
    .string()
    .max(100, { message: 'Location must be at most 100 characters' })
    .optional()
    .nullable(),

  notes: z
    .string()
    .optional()
    .nullable(),

  avatar_url: z
    .string()
    .url({ message: 'Invalid URL format' })
    .max(500, { message: 'Avatar URL must be at most 500 characters' })
    .optional()
    .nullable(),

  is_favorite: z
    .boolean()
    .optional()
    .default(false),

  main_origin_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid origin ID format' }),

  current_stage_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid stage ID format' }),

  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .default({})
}).refine(
  (data) => {
    // At least one identifier must be present
    return !!(data.phone || data.jid || data.lid || data.canonical_identifier)
  },
  {
    message: 'At least one identifier must be provided: phone, jid, lid, or canonical_identifier',
    path: ['phone']
  }
)

// ============================================================================
// BACKEND UPDATE CONTACT SCHEMA
// ============================================================================

/**
 * Schema for updating a contact via backend API (PATCH)
 *
 * All fields are optional - only send what needs to be updated.
 */
export const backendUpdateContactSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' })
    .optional(),

  phone: z
    .string()
    .regex(PHONE_REGEX, { message: 'Phone must be 8-15 digits' })
    .optional()
    .nullable(),

  country_code: z
    .string()
    .regex(COUNTRY_CODE_REGEX, { message: 'Country code must be 1-3 digits' })
    .optional()
    .nullable(),

  jid: z
    .string()
    .regex(JID_REGEX, { message: 'JID must be in format: "number@s.whatsapp.net" or "number@c.us"' })
    .optional()
    .nullable(),

  lid: z
    .string()
    .regex(LID_REGEX, { message: 'LID must be in format: "number@lid"' })
    .optional()
    .nullable(),

  canonical_identifier: z
    .string()
    .min(1, { message: 'Canonical identifier must not be empty' })
    .optional()
    .nullable(),

  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .optional()
    .nullable(),

  company: z
    .string()
    .max(100, { message: 'Company must be at most 100 characters' })
    .optional()
    .nullable(),

  location: z
    .string()
    .max(100, { message: 'Location must be at most 100 characters' })
    .optional()
    .nullable(),

  notes: z
    .string()
    .optional()
    .nullable(),

  avatar_url: z
    .string()
    .url({ message: 'Invalid URL format' })
    .max(500, { message: 'Avatar URL must be at most 500 characters' })
    .optional()
    .nullable(),

  is_favorite: z
    .boolean()
    .optional(),

  main_origin_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid origin ID format' })
    .optional(),

  current_stage_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid stage ID format' })
    .optional(),

  metadata: z
    .record(z.string(), z.unknown())
    .optional()
})

// ============================================================================
// BACKEND LIST CONTACTS QUERY SCHEMA
// ============================================================================

/**
 * Schema for validating query parameters for listing contacts
 */
export const backendListContactsQuerySchema = z.object({
  project_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid project ID format' })
    .optional(),

  search: z
    .string()
    .min(1)
    .optional(),

  origin_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid origin ID format' })
    .optional(),

  stage_id: z
    .string()
    .regex(UUID_REGEX, { message: 'Invalid stage ID format' })
    .optional(),

  is_favorite: z
    .boolean()
    .optional(),

  sort: z
    .enum(['created_at', 'name_asc', 'name_desc', 'updated_at'])
    .optional(),

  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional(),

  offset: z
    .number()
    .int()
    .min(0)
    .optional()
})

// ============================================================================
// TYPES
// ============================================================================

/** Inferred type for backend create contact data */
export type BackendCreateContactData = z.infer<typeof backendCreateContactSchema>

/** Inferred type for backend update contact data */
export type BackendUpdateContactData = z.infer<typeof backendUpdateContactSchema>

/** Inferred type for backend list query params */
export type BackendListContactsQueryData = z.infer<typeof backendListContactsQuerySchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates data for creating a contact via backend API
 *
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateBackendCreateContact(data: unknown) {
  return backendCreateContactSchema.safeParse(data)
}

/**
 * Validates data for updating a contact via backend API
 *
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateBackendUpdateContact(data: unknown) {
  return backendUpdateContactSchema.safeParse(data)
}

/**
 * Validates query parameters for listing contacts
 *
 * @param params - Query params to validate
 * @returns Validation result
 */
export function validateBackendListContactsQuery(params: unknown) {
  return backendListContactsQuerySchema.safeParse(params)
}

/**
 * Checks if a string is a valid UUID
 *
 * @param id - String to check
 * @returns True if valid UUID
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id)
}
