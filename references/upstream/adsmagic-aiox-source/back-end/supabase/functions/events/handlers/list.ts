/**
 * Handler para listagem de eventos de conversão (GET /events)
 * 
 * Lista eventos de conversão com filtros opcionais
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { eventFiltersSchema, extractValidationErrors } from '../validators/event.ts'
import type { ConversionEvent, EventsListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista eventos de conversão
 */
export async function handleList(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse dos query params
    const url = new URL(req.url)
    const filters: Record<string, unknown> = {}
    
    if (url.searchParams.get('project_id')) filters.project_id = url.searchParams.get('project_id')
    if (url.searchParams.get('platform')) filters.platform = url.searchParams.get('platform')
    if (url.searchParams.get('event_type')) filters.event_type = url.searchParams.get('event_type')
    if (url.searchParams.get('status')) filters.status = url.searchParams.get('status')
    if (url.searchParams.get('contact_id')) filters.contact_id = url.searchParams.get('contact_id')
    if (url.searchParams.get('sale_id')) filters.sale_id = url.searchParams.get('sale_id')
    
    const limit = url.searchParams.get('limit')
    const offset = url.searchParams.get('offset')
    if (limit) filters.limit = parseInt(limit, 10)
    if (offset) filters.offset = parseInt(offset, 10)

    // Validação com Zod
    const validationResult = eventFiltersSchema.safeParse(filters)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const validatedFilters = validationResult.data
    console.log('[List Events] Filters:', validatedFilters)

    // Construir query
    let query = supabaseClient
      .from('conversion_events')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (validatedFilters.project_id) {
      query = query.eq('project_id', validatedFilters.project_id)
    }
    if (validatedFilters.platform) {
      query = query.eq('platform', validatedFilters.platform)
    }
    if (validatedFilters.event_type) {
      query = query.eq('event_type', validatedFilters.event_type)
    }
    if (validatedFilters.status) {
      query = query.eq('status', validatedFilters.status)
    }
    if (validatedFilters.contact_id) {
      query = query.eq('contact_id', validatedFilters.contact_id)
    }
    if (validatedFilters.sale_id) {
      query = query.eq('sale_id', validatedFilters.sale_id)
    }

    // Ordenar por mais recente primeiro
    query = query.order('created_at', { ascending: false })

    // Paginação
    query = query.range(
      validatedFilters.offset,
      validatedFilters.offset + validatedFilters.limit - 1
    )

    // Executar query
    const { data: events, error, count } = await query

    if (error) {
      console.error('[List Events Error]', error)
      return errorResponse(`Failed to list events: ${error.message}`, 500)
    }

    const response: EventsListResponse = {
      data: (events || []) as ConversionEvent[],
      meta: {
        total: count || 0,
        limit: validatedFilters.limit,
        offset: validatedFilters.offset
      }
    }

    return successResponse(response)

  } catch (error) {
    console.error('[List Events Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
