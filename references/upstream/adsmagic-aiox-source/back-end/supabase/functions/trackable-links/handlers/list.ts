/**
 * Handler para listagem de links rastreáveis (GET /trackable-links)
 * 
 * Lista links com filtros, busca e paginação
 * 
 * @module trackable-links/handlers/list
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listLinksQuerySchema, extractValidationErrors } from '../validators/link.ts'
import type { TrackableLinksListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

const LINK_SELECT_COLUMNS = 'id, project_id, name, destination_url, tracking_url, initial_message, origin_id, whatsapp_number, whatsapp_message_template, link_type, utm_source, utm_medium, utm_campaign, utm_content, utm_term, is_active, clicks_count, contacts_count, sales_count, revenue, created_at, updated_at'

/**
 * Lista links rastreáveis com filtros
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

    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Validação com Zod
    const validationResult = listLinksQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      console.error('[List Links] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const filters = validationResult.data
    const limit = filters.limit ?? 20
    const offset = filters.offset ?? 0

    // Construir query base
    let query = supabaseClient
      .from('trackable_links')
      .select(LINK_SELECT_COLUMNS, { count: 'exact' })

    // Filtro por projeto (obrigatório se fornecido)
    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id)
    }

    // Filtro por tipo de link
    if (filters.link_type) {
      query = query.eq('link_type', filters.link_type)
    }

    // Filtro por status ativo
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    // Filtro por origem
    if (filters.origin_id) {
      query = query.eq('origin_id', filters.origin_id)
    }

    // Busca por nome
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    // Ordenação
    switch (filters.sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'clicks_count':
        query = query.order('clicks_count', { ascending: false })
        break
      case 'contacts_count':
        query = query.order('contacts_count', { ascending: false })
        break
      case 'revenue':
        query = query.order('revenue', { ascending: false })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Paginação
    query = query.range(offset, offset + limit - 1)

    // Executar query
    const { data: links, error, count } = await query

    if (error) {
      console.error('[List Links Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to list links: ${error.message}`, 500)
    }

    const response: TrackableLinksListResponse = {
      data: links || [],
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Links Success]', { 
      count: links?.length, 
      total: count,
      userId: user.id
    })

    return successResponse(response)

  } catch (error) {
    console.error('[List Links Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
