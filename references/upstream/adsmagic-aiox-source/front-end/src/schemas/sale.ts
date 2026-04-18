/**
 * Sale Schema - Zod Validations
 *
 * Schemas de validação para formulários de vendas.
 *
 * @module schemas/sale
 */

import { z } from 'zod'

/**
 * Schema para criação de venda
 *
 * Validações:
 * - Contato ID: obrigatório
 * - Valor: número positivo, mínimo 0.01
 */
export const createSaleSchema = z.object({
  contactId: z
    .string({
      message: 'validation.sale.contactRequired'
    })
    .min(1, { message: 'validation.sale.contactRequired' }),

  value: z
    .number({
      message: 'validation.sale.valueRequired'
    })
    .positive({ message: 'validation.sale.valuePositive' })
    .min(0.01, { message: 'validation.sale.valueMin' })
    .max(9999999.99, { message: 'validation.sale.valueMax' }),

  notes: z
    .string()
    .max(500, { message: 'validation.sale.notesMaxLength' })
    .optional()
})

/**
 * Schema para marcar venda como perdida
 *
 * Validações:
 * - Motivo: obrigatório, mínimo 3 caracteres
 * - Observações: opcional, máximo 500 caracteres
 */
export const markSaleLostSchema = z.object({
  reason: z
    .string({
      message: 'validation.sale.reasonRequired'
    })
    .min(3, { message: 'validation.sale.reasonMinLength' })
    .max(100, { message: 'validation.sale.reasonMaxLength' }),

  notes: z
    .string()
    .max(500, { message: 'validation.sale.notesMaxLength' })
    .optional()
})

/**
 * Schema para atualização de venda
 */
export const updateSaleSchema = z.object({
  value: z
    .number()
    .positive({ message: 'validation.sale.valuePositive' })
    .min(0.01, { message: 'validation.sale.valueMin' })
    .max(9999999.99, { message: 'validation.sale.valueMax' })
    .optional(),

  notes: z
    .string()
    .max(500, { message: 'validation.sale.notesMaxLength' })
    .optional()
})

/**
 * Schema para filtros de vendas
 */
export const saleFiltersSchema = z.object({
  origins: z.array(z.string()).optional(),

  dateFrom: z
    .string()
    .datetime({ message: 'validation.sale.dateInvalid' })
    .optional()
    .or(z.literal('')),

  dateTo: z
    .string()
    .datetime({ message: 'validation.sale.dateInvalid' })
    .optional()
    .or(z.literal('')),

  isLost: z.boolean().optional(),

  minValue: z
    .number()
    .nonnegative({ message: 'validation.sale.minValueNegative' })
    .optional(),

  maxValue: z
    .number()
    .positive({ message: 'validation.sale.maxValuePositive' })
    .optional(),

  page: z.number().int().min(1).optional().default(1),

  pageSize: z.number().int().min(1).max(100).optional().default(10)
})

/**
 * TypeScript types inferidos dos schemas
 */
export type CreateSaleFormData = z.infer<typeof createSaleSchema>
export type MarkSaleLostFormData = z.infer<typeof markSaleLostSchema>
export type UpdateSaleFormData = z.infer<typeof updateSaleSchema>
export type SaleFiltersFormData = z.infer<typeof saleFiltersSchema>

/**
 * Helper para validar criação de venda
 */
export function validateCreateSale(data: unknown) {
  return createSaleSchema.safeParse(data)
}

/**
 * Helper para validar marcação como perdida
 */
export function validateMarkSaleLost(data: unknown) {
  return markSaleLostSchema.safeParse(data)
}

/**
 * Helper para validar atualização de venda
 */
export function validateUpdateSale(data: unknown) {
  return updateSaleSchema.safeParse(data)
}

/**
 * Helper para validar filtros de vendas
 */
export function validateSaleFilters(data: unknown) {
  return saleFiltersSchema.safeParse(data)
}
