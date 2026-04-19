/**
 * Handler para listagem de vendas (GET /sales)
 * 
 * Lista vendas com filtros opcionais e paginação.
 * Suporta filtros por projeto, contato, origem, status, data e valor.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listSalesQuerySchema, extractValidationErrors } from '../validators/sale.ts'
import type { Sale, SalesListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista vendas do usuário
 */
export async function handleList(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Validação dos query parameters
    const validationResult = listSalesQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { 
      project_id, 
      contact_id,
      origin_id,
      status,
      date_from,
      date_to,
      min_value,
      max_value,
      search,
      sort = 'created_at', 
      limit = 50, 
      offset = 0 
    } = validationResult.data

    // Construir query base (RLS automaticamente filtra por projeto do usuário)
    // Inclui dados do contato via join para evitar N+1 queries no frontend
    let query = supabaseClient
      .from('sales')
      .select(`
        id,
        project_id,
        contact_id,
        value,
        currency,
        date,
        status,
        origin_id,
        lost_reason,
        lost_observations,
        notes,
        tracking_params,
        metadata,
        created_at,
        updated_at,
        contacts (
          name,
          phone,
          country_code,
          main_origin_id
        )
      `, { count: 'exact' })

    // Aplicar filtro de projeto
    if (project_id) {
      query = query.eq('project_id', project_id)
    }

    // Aplicar filtro de contato
    if (contact_id) {
      query = query.eq('contact_id', contact_id)
    }

    // Aplicar filtro de origem
    if (origin_id) {
      query = query.eq('origin_id', origin_id)
    }

    // Aplicar filtro de status
    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar filtros de data
    if (date_from) {
      query = query.gte('date', date_from)
    }
    if (date_to) {
      query = query.lte('date', date_to)
    }

    // Aplicar filtros de valor
    if (min_value !== undefined) {
      query = query.gte('value', min_value)
    }
    if (max_value !== undefined) {
      query = query.lte('value', max_value)
    }

    // Aplicar busca (busca em notes por enquanto)
    if (search) {
      query = query.ilike('notes', `%${search}%`)
    }

    // Aplicar ordenação dinâmica
    switch (sort) {
      case 'date_asc':
        query = query.order('date', { ascending: true })
        break
      case 'date_desc':
        query = query.order('date', { ascending: false })
        break
      case 'value_asc':
        query = query.order('value', { ascending: true })
        break
      case 'value_desc':
        query = query.order('value', { ascending: false })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: sales, error, count } = await query

    if (error) {
      console.error('[List Sales Error]', error)
      return errorResponse('Failed to fetch sales', 500)
    }

    const response: SalesListResponse = {
      data: sales || [],
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Sales Success]', { 
      count: sales?.length || 0, 
      total: count,
      filters: { project_id, contact_id, origin_id, status, sort, limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Sales Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
