/**
 * Validadores Zod para Edge Function de Estágios
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Regex para validar cor hexadecimal (#RRGGBB)
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// Tipos de estágio permitidos
const stageTypes = ['normal', 'sale', 'lost'] as const
const stageEventChannels = ['meta', 'google', 'tiktok'] as const

const stageEventRouteSchema = z.object({
  eventType: z.string()
    .trim()
    .min(1, 'event_config.routes[].eventType is required')
    .max(50, 'event_config.routes[].eventType must be at most 50 characters')
    .optional(),
  event_type: z.string()
    .trim()
    .min(1, 'event_config.routes[].event_type is required')
    .max(50, 'event_config.routes[].event_type must be at most 50 characters')
    .optional(),
  channel: z.enum(stageEventChannels).optional(),
  platform: z.enum(stageEventChannels).optional(),
  sourceOriginId: z.string().uuid('event_config.routes[].sourceOriginId must be a valid UUID').optional(),
  source_origin_id: z.string().uuid('event_config.routes[].source_origin_id must be a valid UUID').optional(),
  integrationId: z.string().uuid('event_config.routes[].integrationId must be a valid UUID').optional(),
  integration_id: z.string().uuid('event_config.routes[].integration_id must be a valid UUID').optional(),
  integrationAccountId: z.string().uuid('event_config.routes[].integrationAccountId must be a valid UUID').optional(),
  integration_account_id: z.string().uuid('event_config.routes[].integration_account_id must be a valid UUID').optional()
}).passthrough()
  .superRefine((route, ctx) => {
    const eventType = route.eventType ?? route.event_type
    if (typeof eventType !== 'string' || eventType.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventType'],
        message: 'event_config.routes[].eventType is required'
      })
    }
  })

const stageEventConfigSchema = z.record(z.unknown())
  .superRefine((eventConfig, ctx) => {
    const routes = eventConfig.routes

    if (routes === undefined || routes === null) {
      return
    }

    if (!Array.isArray(routes)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['routes'],
        message: 'event_config.routes must be an array'
      })
      return
    }

    for (const [index, route] of routes.entries()) {
      const routeResult = stageEventRouteSchema.safeParse(route)
      if (routeResult.success) {
        continue
      }

      for (const issue of routeResult.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['routes', index, ...issue.path],
          message: issue.message
        })
      }
    }
  })

// Schema para criação de estágio
export const createStageSchema = z.object({
  project_id: z.string().uuid('Invalid project ID format'),
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  display_order: z.number().int().min(0, 'Display order must be >= 0'),
  color: z.string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)')
    .optional()
    .nullable(),
  tracking_phrase: z.string()
    .max(200, 'Tracking phrase must be at most 200 characters')
    .optional()
    .nullable(),
  type: z.enum(stageTypes).default('normal'),
  is_active: z.boolean().optional().default(true),
  event_config: stageEventConfigSchema.optional().nullable()
})

// Schema para atualização de estágio
export const updateStageSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
  display_order: z.number().int().min(0, 'Display order must be >= 0').optional(),
  color: z.string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)')
    .optional()
    .nullable(),
  tracking_phrase: z.string()
    .max(200, 'Tracking phrase must be at most 200 characters')
    .optional()
    .nullable(),
  type: z.enum(stageTypes).optional(),
  is_active: z.boolean().optional(),
  event_config: stageEventConfigSchema.optional().nullable()
})

// Schema para reordenação de estágios
export const reorderStagesSchema = z.object({
  stage_ids: z.array(z.string().uuid('Invalid stage ID format'))
    .min(1, 'At least one stage ID is required')
    .max(50, 'Maximum 50 stages can be reordered at once')
})

// Schema para query parameters de listagem
export const listStagesQuerySchema = z.object({
  project_id: z.string().uuid('Invalid project ID format').optional(),
  is_active: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  type: z.enum(['normal', 'sale', 'lost', 'all']).optional(),
  include_count: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
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
