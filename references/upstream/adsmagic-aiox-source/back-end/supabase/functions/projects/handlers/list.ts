/**
 * Handler para listagem de projetos (GET /projects)
 * 
 * Lista projetos do usuário com filtros opcionais
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listProjectsQuerySchema, extractValidationErrors } from '../validators/project.ts'
import type { Project, ProjectsListResponse } from '../types.ts'
import { handleListWithMetrics } from './list-with-metrics.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista projetos do usuário
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
    const validationResult = listProjectsQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { with_metrics, status, search, sort = 'created_at', limit = 50, offset = 0 } = validationResult.data

    // Se with_metrics=true, usar handler específico
    if (with_metrics) {
      return await handleListWithMetrics(req, supabaseClient)
    }

    // Construir query base (RLS automaticamente filtra por empresa do usuário)
    let query = supabaseClient
      .from('projects')
      .select(`
        id,
        company_id,
        created_by,
        name,
        description,
        company_type,
        franchise_count,
        country,
        language,
        currency,
        timezone,
        attribution_model,
        whatsapp_connected,
        meta_ads_connected,
        google_ads_connected,
        tiktok_ads_connected,
        status,
        wizard_progress,
        wizard_current_step,
        wizard_completed_at,
        created_at,
        updated_at
      `, { count: 'exact' })

    // Aplicar filtro de status
    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar filtro de pesquisa (busca case-insensitive em name e description)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Aplicar ordenação dinâmica
    switch (sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: projects, error, count } = await query

    if (error) {
      console.error('[List Projects Error]', error)
      return errorResponse('Failed to fetch projects', 500)
    }

    const response: ProjectsListResponse = {
      data: projects || [],
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Projects Success]', { 
      count: projects?.length || 0, 
      total: count,
      filters: { status, search, sort, limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Projects Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
