/**
 * Tracking Schema - Zod Validations
 *
 * Schemas de validação para formulários de links de rastreamento.
 * Links de tracking são gerados automaticamente pelo sistema e capturam
 * dados de origem quando novos contatos são criados.
 *
 * @module schemas/tracking
 */

import { z } from 'zod'

/**
 * Schema para criação de link de rastreamento
 *
 * Validações:
 * - Nome: obrigatório, 3-100 caracteres
 * - URL de destino: obrigatório, formato URL válido (http/https)
 * - Short code: obrigatório, 3-20 caracteres alfanuméricos
 * - Descrição: opcional, máximo 500 caracteres
 * - Mensagem inicial: opcional, máximo 500 caracteres
 * - Parâmetros UTM: opcionais, máximo 100 caracteres cada
 *
 * @example
 * ```typescript
 * const formData = {
 *   name: 'Campanha Facebook Q1',
 *   url: 'https://meusite.com/landing',
 *   shortCode: 'fb-q1-2024',
 *   initialMessage: 'Olá! Vim do Facebook e gostaria de saber mais sobre seus produtos.'
 * }
 * 
 * const result = createTrackingLinkSchema.safeParse(formData)
 * if (result.success) {
 *   // Dados válidos - pode enviar para API
 *   await createTrackingLink(result.data)
 * }
 * ```
 */
export const createTrackingLinkSchema = z.object({
  name: z
    .string({
      message: 'validation.tracking.nameRequired'
    })
    .min(3, { message: 'validation.tracking.nameMinLength' })
    .max(100, { message: 'validation.tracking.nameMaxLength' })
    .trim(),

  url: z
    .string({ message: 'validation.tracking.urlRequired' })
    .url({ message: 'validation.tracking.urlInvalid' })
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      { message: 'validation.tracking.urlProtocol' }
    ),

  shortCode: z
    .string({ message: 'validation.tracking.shortCodeRequired' })
    .min(3, { message: 'validation.tracking.shortCodeMinLength' })
    .max(20, { message: 'validation.tracking.shortCodeMaxLength' })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: 'validation.tracking.shortCodeFormat' }),

  description: z
    .string()
    .max(500, { message: 'validation.tracking.descriptionMaxLength' })
    .optional(),

  initialMessage: z
    .string()
    .max(500, { message: 'validation.tracking.initialMessageMaxLength' })
    .optional(),

  isActive: z.boolean().default(true),

  utmSource: z
    .string()
    .max(100, { message: 'validation.tracking.utmMaxLength' })
    .optional(),

  utmMedium: z
    .string()
    .max(100, { message: 'validation.tracking.utmMaxLength' })
    .optional(),

  utmCampaign: z
    .string()
    .max(100, { message: 'validation.tracking.utmMaxLength' })
    .optional(),

  utmTerm: z
    .string()
    .max(100, { message: 'validation.tracking.utmMaxLength' })
    .optional(),

  utmContent: z
    .string()
    .max(100, { message: 'validation.tracking.utmMaxLength' })
    .optional()
})

/**
 * Schema para atualização de link de rastreamento
 *
 * Todos os campos são opcionais para permitir atualizações parciais.
 * O campo `isActive` permite ativar/desativar links sem afetar outros dados.
 *
 * @example
 * ```typescript
 * const updateData = {
 *   name: 'Campanha Facebook Q1 - Atualizada',
 *   isActive: false
 * }
 * 
 * const result = updateTrackingLinkSchema.safeParse(updateData)
 * ```
 */
export const updateTrackingLinkSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'validation.tracking.nameMinLength' })
    .max(100, { message: 'validation.tracking.nameMaxLength' })
    .trim()
    .optional(),

  initialMessage: z
    .string()
    .max(500, { message: 'validation.tracking.initialMessageMaxLength' })
    .optional(),

  isActive: z.boolean().optional()
})

/**
 * TypeScript types inferidos dos schemas
 * 
 * Estes tipos são gerados automaticamente pelo Zod e garantem
 * type safety em toda a aplicação.
 */
export type CreateTrackingLinkFormData = z.infer<typeof createTrackingLinkSchema>
export type UpdateTrackingLinkFormData = z.infer<typeof updateTrackingLinkSchema>

/**
 * Helper para validar criação de link de rastreamento
 * 
 * @param data - Dados a serem validados
 * @returns Resultado da validação com sucesso/erro
 * 
 * @example
 * ```typescript
 * const result = validateCreateTrackingLink(formData)
 * 
 * if (result.success) {
 *   // Dados válidos
 *   console.log('Link válido:', result.data)
 * } else {
 *   // Mostrar erros para o usuário
 *   result.error.errors.forEach(err => {
 *     console.log(err.path, err.message)
 *   })
 * }
 * ```
 */
export function validateCreateTrackingLink(data: unknown) {
  return createTrackingLinkSchema.safeParse(data)
}

/**
 * Helper para validar atualização de link de rastreamento
 * 
 * @param data - Dados a serem validados
 * @returns Resultado da validação com sucesso/erro
 * 
 * @example
 * ```typescript
 * const result = validateUpdateTrackingLink(updateData)
 * 
 * if (result.success) {
 *   // Dados válidos
 *   await updateTrackingLink(linkId, result.data)
 * } else {
 *   // Tratar erros de validação
 *   handleValidationErrors(result.error.errors)
 * }
 * ```
 */
export function validateUpdateTrackingLink(data: unknown) {
  return updateTrackingLinkSchema.safeParse(data)
}

/**
 * Mensagens de erro i18n necessárias
 * 
 * Adicione estas chaves aos arquivos de tradução:
 * 
 * ```json
 * {
 *   "validation": {
 *     "tracking": {
 *       "nameRequired": "Nome do link é obrigatório",
 *       "nameMinLength": "Nome deve ter no mínimo 3 caracteres",
 *       "nameMaxLength": "Nome deve ter no máximo 100 caracteres",
 *       "urlRequired": "URL de destino é obrigatória",
 *       "urlInvalid": "URL inválida. Informe uma URL válida",
 *       "urlProtocol": "URL deve começar com http:// ou https://",
 *       "shortCodeRequired": "Código curto é obrigatório",
 *       "shortCodeMinLength": "Código curto deve ter no mínimo 3 caracteres",
 *       "shortCodeMaxLength": "Código curto deve ter no máximo 20 caracteres",
 *       "shortCodeFormat": "Código curto deve conter apenas letras, números, hífen ou underscore",
 *       "descriptionMaxLength": "Descrição deve ter no máximo 500 caracteres",
 *       "initialMessageMaxLength": "Mensagem inicial deve ter no máximo 500 caracteres",
 *       "utmMaxLength": "Parâmetro UTM deve ter no máximo 100 caracteres"
 *     }
 *   }
 * }
 * ```
 */
