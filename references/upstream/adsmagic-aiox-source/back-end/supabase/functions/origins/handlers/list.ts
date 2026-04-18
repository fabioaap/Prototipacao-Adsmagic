/**
 * Handler para listagem de origens (GET /origins)
 * 
 * Lista origens com filtros opcionais.
 * Inclui origens system (project_id NULL) + origens customizadas do projeto.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listOriginsQuerySchema, extractValidationErrors } from '../validators/origin.ts'
import type { Origin, OriginsListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista origens do projeto
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
    const validationResult = listOriginsQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { 
      project_id, 
      is_active,
      type = 'all',
      limit = 50, 
      offset = 0 
    } = validationResult.data

    console.log('[List Origins] Params:', { project_id, is_active, type, limit, offset })

    // Verificar se project_id foi fornecido
    if (!project_id) {
      return errorResponse('project_id is required', 400)
    }

    // Verificar acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[List Origins] Project access denied:', projectError)
      return errorResponse('Project not found or access denied', 403)
    }

    // Buscar origens: system (project_id IS NULL) + custom do projeto
    let query = supabaseClient
      .from('origins')
      .select('*', { count: 'exact' })

    // Filtrar por tipo
    if (type === 'system') {
      query = query.is('project_id', null)
    } else if (type === 'custom') {
      query = query.eq('project_id', project_id)
    } else {
      // 'all' - system + custom do projeto
      query = query.or(`project_id.is.null,project_id.eq.${project_id}`)
    }

    // Aplicar filtro de is_active
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active)
    }

    // Ordenação: system primeiro (por type), depois por created_at
    query = query
      .order('type', { ascending: true }) // 'custom' vem antes de 'system' alfabeticamente, invertemos
      .order('created_at', { ascending: true })

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: origins, error, count } = await query

    if (error) {
      console.error('[List Origins Error]', error)
      return errorResponse('Failed to fetch origins', 500)
    }

    // Reordenar para system primeiro, depois custom
    const sortedOrigins = [...(origins || [])].sort((a, b) => {
      if (a.type === 'system' && b.type !== 'system') return -1
      if (a.type !== 'system' && b.type === 'system') return 1
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    const response: OriginsListResponse = {
      data: sortedOrigins as Origin[],
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Origins Success]', { 
      count: origins?.length || 0, 
      total: count,
      filters: { project_id, is_active, type, limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Origins Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
