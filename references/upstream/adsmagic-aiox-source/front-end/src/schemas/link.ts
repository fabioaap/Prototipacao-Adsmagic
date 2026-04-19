/**
 * Link Schema - Zod Validations
 *
 * Schemas de validação para formulários de links de rastreamento.
 *
 * @module schemas/link
 */

import { z } from 'zod'

/**
 * Schema para criação de link
 *
 * Validações:
 * - Nome: obrigatório, 3-100 caracteres
 * - URL destino: URL válida
 * - Origem: obrigatória
 */
export const createLinkSchema = z.object({
  name: z
    .string({
      message: 'validation.link.nameRequired'
    })
    .min(3, { message: 'validation.link.nameMinLength' })
    .max(100, { message: 'validation.link.nameMaxLength' })
    .trim(),

  originId: z
    .string({
      message: 'validation.link.originRequired'
    })
    .min(1, { message: 'validation.link.originRequired' }),

  destinationUrl: z
    .string({
      message: 'validation.link.destinationUrlRequired'
    })
    .url({ message: 'validation.link.destinationUrlInvalid' }),

  description: z
    .string()
    .max(200, { message: 'validation.link.descriptionMaxLength' })
    .optional()
})

/**
 * Schema para atualização de link
 */
export const updateLinkSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'validation.link.nameMinLength' })
    .max(100, { message: 'validation.link.nameMaxLength' })
    .trim()
    .optional(),

  destinationUrl: z
    .string()
    .url({ message: 'validation.link.destinationUrlInvalid' })
    .optional(),

  description: z
    .string()
    .max(200, { message: 'validation.link.descriptionMaxLength' })
    .optional(),

  isActive: z.boolean().optional()
})

/**
 * TypeScript types inferidos dos schemas
 */
export type CreateLinkFormData = z.infer<typeof createLinkSchema>
export type UpdateLinkFormData = z.infer<typeof updateLinkSchema>

/**
 * Helper para validar criação de link
 */
export function validateCreateLink(data: unknown) {
  return createLinkSchema.safeParse(data)
}

/**
 * Helper para validar atualização de link
 */
export function validateUpdateLink(data: unknown) {
  return updateLinkSchema.safeParse(data)
}
