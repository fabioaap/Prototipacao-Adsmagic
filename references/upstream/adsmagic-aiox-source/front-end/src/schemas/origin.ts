/**
 * Origin Schema - Zod Validations
 *
 * Schemas de validação para formulários de origens de tráfego.
 *
 * @module schemas/origin
 */

import { z } from 'zod'

const utmSourceMatchModeSchema = z.enum(['exact', 'contains'])
const utmSourceMatchValueSchema = z
  .string()
  .trim()
  .max(100, { message: 'UTM Source deve ter no máximo 100 caracteres' })
  .regex(/^\S+$/, { message: 'UTM Source não pode conter espaços' })

/**
 * Schema para criação de origem customizada
 *
 * Validações:
 * - Nome: obrigatório, 3-50 caracteres
 * - Cor: hex color válida
 * - Apenas origens customizadas podem ser criadas
 */
export const createOriginSchema = z.object({
  name: z
    .string({
      message: 'validation.origin.nameRequired'
    })
    .min(3, { message: 'validation.origin.nameMinLength' })
    .max(50, { message: 'validation.origin.nameMaxLength' })
    .trim(),

  description: z
    .string()
    .max(200, { message: 'validation.origin.descriptionMaxLength' })
    .optional(),

  color: z
    .string({
      message: 'validation.origin.colorRequired'
    })
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'validation.origin.colorInvalid' }),

  icon: z
    .string()
    .max(50, { message: 'validation.origin.iconMaxLength' })
    .optional(),

  utmSourceMatchMode: utmSourceMatchModeSchema
    .optional(),

  utmSourceMatchValue: utmSourceMatchValueSchema
    .optional()
}).superRefine((value, ctx) => {
  const hasMode = !!value.utmSourceMatchMode
  const hasValue = typeof value.utmSourceMatchValue === 'string' && value.utmSourceMatchValue.trim().length > 0

  if (hasMode !== hasValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Defina modo e valor de UTM Source juntos',
      path: hasMode ? ['utmSourceMatchValue'] : ['utmSourceMatchMode']
    })
  }
})

/**
 * Schema para atualização de origem
 */
export const updateOriginSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'validation.origin.nameMinLength' })
    .max(50, { message: 'validation.origin.nameMaxLength' })
    .trim()
    .optional(),

  description: z
    .string()
    .max(200, { message: 'validation.origin.descriptionMaxLength' })
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'validation.origin.colorInvalid' })
    .optional(),

  icon: z
    .string()
    .max(50, { message: 'validation.origin.iconMaxLength' })
    .optional(),

  isActive: z.boolean().optional(),

  utmSourceMatchMode: utmSourceMatchModeSchema
    .nullable()
    .optional(),

  utmSourceMatchValue: utmSourceMatchValueSchema
    .nullable()
    .optional()
}).superRefine((value, ctx) => {
  const hasModeField = value.utmSourceMatchMode !== undefined
  const hasValueField = value.utmSourceMatchValue !== undefined

  if (hasModeField !== hasValueField) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Atualize modo e valor de UTM Source juntos',
      path: hasModeField ? ['utmSourceMatchValue'] : ['utmSourceMatchMode']
    })
  }
})

/**
 * TypeScript types inferidos dos schemas
 */
export type CreateOriginFormData = z.infer<typeof createOriginSchema>
export type UpdateOriginFormData = z.infer<typeof updateOriginSchema>

/**
 * Helper para validar criação de origem
 */
export function validateCreateOrigin(data: unknown) {
  return createOriginSchema.safeParse(data)
}

/**
 * Helper para validar atualização de origem
 */
export function validateUpdateOrigin(data: unknown) {
  return updateOriginSchema.safeParse(data)
}
