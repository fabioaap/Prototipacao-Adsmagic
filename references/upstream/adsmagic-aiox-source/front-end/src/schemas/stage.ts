/**
 * Stage Schema - Zod Validations
 *
 * Schemas de validação para formulários de etapas do funil.
 *
 * @module schemas/stage
 */

import { z } from 'zod'

const stageEventRouteSchema = z.object({
  id: z.string().min(1),
  channel: z.enum(['meta', 'google', 'tiktok']),
  eventType: z.string().trim().min(1).max(50),
  sourceOriginId: z.string().uuid().optional(),
  integrationId: z.string().uuid().optional(),
  integrationAccountId: z.string().uuid().optional(),
  conversionActionId: z.string().optional(),
  conversionActionName: z.string().optional(),
  pixelId: z.string().optional(),
  pixelName: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean()
})

/**
 * Schema para criação de etapa
 *
 * Validações:
 * - Nome: obrigatório, 3-50 caracteres
 * - Tipo: normal, sale ou lost
 * - Cor: hex color válida
 * - Ordem: número inteiro não-negativo
 */
export const createStageSchema = z.object({
  name: z
    .string({
      message: 'validation.stage.nameRequired'
    })
    .min(3, { message: 'validation.stage.nameMinLength' })
    .max(50, { message: 'validation.stage.nameMaxLength' })
    .trim(),

  trackingPhrase: z
    .string()
    .max(100, { message: 'validation.stage.trackingPhraseMaxLength' })
    .optional(),

  type: z
    .enum(['normal', 'sale', 'lost'], {
      message: 'validation.stage.typeRequired'
    })
    .default('normal'),

  eventConfig: z
    .object({
      meta: z.object({
        eventType: z.string(),
        active: z.boolean()
      }).optional(),
      google: z.object({
        eventType: z.string(),
        active: z.boolean()
      }).optional(),
      tiktok: z.object({
        eventType: z.string(),
        active: z.boolean()
      }).optional(),
      routes: z.array(stageEventRouteSchema).optional(),
      defaultValue: z.number().optional(),
      defaultCurrency: z.string().optional()
    })
    .optional()
})

/**
 * Schema para atualização de etapa
 */
export const updateStageSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'validation.stage.nameMinLength' })
    .max(50, { message: 'validation.stage.nameMaxLength' })
    .trim()
    .optional(),

  trackingPhrase: z
    .string()
    .max(100, { message: 'validation.stage.trackingPhraseMaxLength' })
    .optional(),

  type: z
    .enum(['normal', 'sale', 'lost'])
    .optional(),

  eventConfig: z
    .object({
      meta: z.object({
        eventType: z.string(),
        active: z.boolean()
      }).optional(),
      google: z.object({
        eventType: z.string(),
        active: z.boolean()
      }).optional(),
      tiktok: z.object({
        eventType: z.string(),
        active: z.boolean()
      }).optional(),
      routes: z.array(stageEventRouteSchema).optional(),
      defaultValue: z.number().optional(),
      defaultCurrency: z.string().optional()
    })
    .optional(),

  isActive: z.boolean().optional()
})

/**
 * Schema para reordenação de etapas
 */
export const reorderStagesSchema = z.object({
  stageIds: z
    .array(z.string())
    .min(1, { message: 'validation.stage.reorderMinStages' })
})

/**
 * TypeScript types inferidos dos schemas
 */
export type CreateStageFormData = z.infer<typeof createStageSchema>
export type UpdateStageFormData = z.infer<typeof updateStageSchema>
export type ReorderStagesFormData = z.infer<typeof reorderStagesSchema>

/**
 * Helper para validar criação de etapa
 */
export function validateCreateStage(data: unknown) {
  return createStageSchema.safeParse(data)
}

/**
 * Helper para validar atualização de etapa
 */
export function validateUpdateStage(data: unknown) {
  return updateStageSchema.safeParse(data)
}

/**
 * Helper para validar reordenação de etapas
 */
export function validateReorderStages(data: unknown) {
  return reorderStagesSchema.safeParse(data)
}
