/**
 * Sales Backend Schema
 * 
 * Schemas Zod para validação dos contratos da API de Sales.
 * Usado para validar respostas do backend antes de usar no frontend.
 * 
 * Segue o mesmo padrão de contacts.backend.schema.ts
 * 
 * @module schemas/sales.backend.schema
 */

import { z } from 'zod'

// ============================================================================
// SCHEMAS BASE
// ============================================================================

/**
 * Schema para tracking_params (JSONB do backend)
 */
export const trackingParamsSchema = z.object({
  gclid: z.string().optional(),
  gbraid: z.string().optional(),
  wbraid: z.string().optional(),
  fbclid: z.string().optional(),
  ttclid: z.string().optional(),
  ttpclid: z.string().optional(),
  ctwaClid: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional()
}).passthrough() // Permite campos adicionais

/**
 * Schema para metadata (JSONB do backend)
 */
export const saleMetadataSchema = z.object({
  device: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  ip: z.string().optional()
}).passthrough() // Permite campos adicionais

// ============================================================================
// SCHEMA PRINCIPAL: BackendSale
// ============================================================================

/**
 * Schema para validar uma Sale retornada pelo backend
 */
export const backendSaleSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  contact_id: z.string().uuid(),
  value: z.number().nonnegative(),
  currency: z.string().length(3),
  date: z.string(), // ISO 8601 datetime
  status: z.enum(['completed', 'lost']),
  origin_id: z.string().uuid().nullable(),
  lost_reason: z.string().max(100).nullable(),
  lost_observations: z.string().max(500).nullable(),
  notes: z.string().max(1000).nullable(),
  tracking_params: trackingParamsSchema.default({}),
  metadata: saleMetadataSchema.default({}),
  created_at: z.string(),
  updated_at: z.string()
})

/**
 * Type inferido do schema BackendSale
 */
export type BackendSaleFromSchema = z.infer<typeof backendSaleSchema>

// ============================================================================
// SCHEMAS DE RESPOSTA
// ============================================================================

/**
 * Schema para meta de paginação
 */
export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative()
})

/**
 * Schema para resposta de listagem de vendas
 */
export const backendSalesListResponseSchema = z.object({
  data: z.array(backendSaleSchema),
  meta: paginationMetaSchema
})

/**
 * Schema para resposta de erro do backend
 */
export const backendErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.string()).optional()
})

/**
 * Schema para resposta de deleção
 */
export const backendDeleteResponseSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
})

// ============================================================================
// SCHEMAS DE REQUEST (para validar antes de enviar)
// ============================================================================

/**
 * Schema para criar venda (request ao backend)
 */
export const backendCreateSaleSchema = z.object({
  project_id: z.string().uuid(),
  contact_id: z.string().uuid(),
  value: z.number().nonnegative().max(99999999.99),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/).default('BRL'),
  date: z.string().datetime(),
  origin_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  tracking_params: trackingParamsSchema.optional(),
  metadata: saleMetadataSchema.optional()
})

/**
 * Schema para atualizar venda (request ao backend)
 */
export const backendUpdateSaleSchema = z.object({
  value: z.number().nonnegative().max(99999999.99).optional(),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/).optional(),
  date: z.string().datetime().optional(),
  origin_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  tracking_params: trackingParamsSchema.optional(),
  metadata: saleMetadataSchema.optional()
})

/**
 * Schema para marcar venda como perdida
 */
export const backendMarkSaleLostSchema = z.object({
  lost_reason: z.string().min(3).max(100),
  lost_observations: z.string().max(500).optional().nullable()
})

/**
 * Schema para parâmetros de listagem (query params)
 */
export const backendSalesListParamsSchema = z.object({
  project_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  origin_id: z.string().uuid().optional(),
  status: z.enum(['completed', 'lost']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  min_value: z.string().optional(), // Convertido para number no backend
  max_value: z.string().optional(), // Convertido para number no backend
  search: z.string().min(1).optional(),
  sort: z.enum(['date_asc', 'date_desc', 'value_asc', 'value_desc', 'created_at']).optional(),
  limit: z.string().optional(), // Convertido para number no backend
  offset: z.string().optional() // Convertido para number no backend
})

// ============================================================================
// HELPERS DE VALIDAÇÃO
// ============================================================================

/**
 * Valida uma resposta de Sale do backend
 */
export function validateBackendSale(data: unknown): BackendSaleFromSchema | null {
  const result = backendSaleSchema.safeParse(data)
  if (result.success) {
    return result.data
  }
  console.error('[Sales Schema] Validation failed:', result.error)
  return null
}

/**
 * Valida uma resposta de listagem de vendas do backend
 */
export function validateBackendSalesList(data: unknown) {
  const result = backendSalesListResponseSchema.safeParse(data)
  if (result.success) {
    return result.data
  }
  console.error('[Sales Schema] List validation failed:', result.error)
  return null
}

/**
 * Valida um request de criação de venda antes de enviar
 */
export function validateCreateSaleRequest(data: unknown) {
  return backendCreateSaleSchema.safeParse(data)
}

/**
 * Valida um request de marcar como perdida antes de enviar
 */
export function validateMarkLostRequest(data: unknown) {
  return backendMarkSaleLostSchema.safeParse(data)
}
