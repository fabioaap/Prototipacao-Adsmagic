/**
 * Contact Schema - Zod Validations
 *
 * Schemas de validação para formulários de contatos.
 * Usa Zod para validação type-safe com mensagens i18n.
 *
 * @module schemas/contact
 */

import { z } from 'zod'

/**
 * Schema para criação de contato
 *
 * Validações:
 * - Nome: mínimo 2 caracteres, máximo 100
 * - Telefone: apenas números, 8-15 dígitos
 * - Código do país: 1-3 dígitos
 * - Origem: obrigatória
 * - Etapa: obrigatória
 */
export const createContactSchema = z.object({
  name: z
    .string({
      message: 'validation.contact.nameRequired'
    })
    .min(2, { message: 'validation.contact.nameMinLength' })
    .max(100, { message: 'validation.contact.nameMaxLength' })
    .trim(),

  phone: z
    .string({
      message: 'validation.contact.phoneRequired'
    })
    .regex(/^\d+$/, { message: 'validation.contact.phoneOnlyNumbers' })
    .min(8, { message: 'validation.contact.phoneMinLength' })
    .max(15, { message: 'validation.contact.phoneMaxLength' }),

  countryCode: z
    .string({
      message: 'validation.contact.countryCodeRequired'
    })
    .min(1, { message: 'validation.contact.countryCodeRequired' })
    .max(3, { message: 'validation.contact.countryCodeMaxLength' }),

  origin: z
    .string({
      message: 'validation.contact.originRequired'
    })
    .min(1, { message: 'validation.contact.originRequired' }),

  stage: z
    .string({
      message: 'validation.contact.stageRequired'
    })
    .min(1, { message: 'validation.contact.stageRequired' }),

  email: z
    .string()
    .email({ message: 'validation.contact.emailInvalid' })
    .optional()
    .or(z.literal('')),

  company: z
    .string()
    .max(100, { message: 'validation.contact.companyMaxLength' })
    .optional()
    .or(z.literal('')),

  location: z
    .string()
    .max(100, { message: 'validation.contact.locationMaxLength' })
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(1000, { message: 'validation.contact.notesMaxLength' })
    .optional()
    .or(z.literal(''))
})

/**
 * Schema para atualização de contato
 * Todos os campos são opcionais
 */
export const updateContactSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'validation.contact.nameMinLength' })
    .max(100, { message: 'validation.contact.nameMaxLength' })
    .trim()
    .optional(),

  phone: z
    .string()
    .regex(/^\d+$/, { message: 'validation.contact.phoneOnlyNumbers' })
    .min(8, { message: 'validation.contact.phoneMinLength' })
    .max(15, { message: 'validation.contact.phoneMaxLength' })
    .optional(),

  countryCode: z
    .string()
    .min(1, { message: 'validation.contact.countryCodeRequired' })
    .max(3, { message: 'validation.contact.countryCodeMaxLength' })
    .optional(),

  origin: z.string().min(1).optional(),

  stage: z.string().min(1).optional(),

  email: z
    .string()
    .email({ message: 'validation.contact.emailInvalid' })
    .optional()
    .or(z.literal('')),

  company: z
    .string()
    .max(100, { message: 'validation.contact.companyMaxLength' })
    .optional()
    .or(z.literal('')),

  location: z
    .string()
    .max(100, { message: 'validation.contact.locationMaxLength' })
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(1000, { message: 'validation.contact.notesMaxLength' })
    .optional()
    .or(z.literal(''))
})

/**
 * Schema para busca/filtro de contatos
 */
export const contactFiltersSchema = z.object({
  search: z.string().optional(),

  origins: z.array(z.string()).optional(),

  stages: z.array(z.string()).optional(),

  dateFrom: z
    .string()
    .datetime({ message: 'validation.contact.dateInvalid' })
    .optional()
    .or(z.literal('')),

  dateTo: z
    .string()
    .datetime({ message: 'validation.contact.dateInvalid' })
    .optional()
    .or(z.literal('')),

  hasSales: z.boolean().optional(),

  page: z.number().int().min(1).optional().default(1),

  pageSize: z.number().int().min(1).max(100).optional().default(10)
})

/**
 * TypeScript types inferidos dos schemas
 */
export type CreateContactFormData = z.infer<typeof createContactSchema>
export type UpdateContactFormData = z.infer<typeof updateContactSchema>
export type ContactFiltersFormData = z.infer<typeof contactFiltersSchema>

/**
 * Helper para validar dados de contato
 *
 * @param data - Dados a validar
 * @returns Resultado da validação
 *
 * @example
 * ```typescript
 * const result = validateCreateContact({
 *   name: 'João Silva',
 *   phone: '11987654321',
 *   countryCode: '55',
 *   origin: 'origin-google',
 *   stage: 'stage-new'
 * })
 *
 * if (result.success) {
 *   // Dados válidos
 *   console.log(result.data)
 * } else {
 *   // Erros de validação
 *   console.log(result.error.errors)
 * }
 * ```
 */
export function validateCreateContact(data: unknown) {
  return createContactSchema.safeParse(data)
}

/**
 * Helper para validar atualização de contato
 */
export function validateUpdateContact(data: unknown) {
  return updateContactSchema.safeParse(data)
}

/**
 * Helper para validar filtros de contato
 */
export function validateContactFilters(data: unknown) {
  return contactFiltersSchema.safeParse(data)
}