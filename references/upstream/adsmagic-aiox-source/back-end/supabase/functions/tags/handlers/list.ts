/**
 * Handler para listagem de tags (GET /tags)
 * 
 * Lista tags com filtros opcionais por projeto.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listTagsQuerySchema, extractValidationErrors } from '../validators/tag.ts'
import type { Tag, TagsListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista tags do projeto
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
    const validationResult = listTagsQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { 
      project_id, 
      limit = 50, 
      offset = 0 
    } = validationResult.data

    console.log('[List Tags] Params:', { project_id, limit, offset })

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
      console.error('[List Tags] Project access denied:', projectError)
      return errorResponse('Project not found or access denied', 403)
    }

    // Buscar tags do projeto
    let query = supabaseClient
      .from('tags')
      .select('*', { count: 'exact' })
      .eq('project_id', project_id)

    // Ordenação: por nome
    query = query.order('name', { ascending: true })

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: tags, error, count } = await query

    if (error) {
      console.error('[List Tags Error]', error)
      return errorResponse('Failed to fetch tags', 500)
    }

    const response: TagsListResponse = {
      data: (tags || []) as Tag[],
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Tags Success]', { 
      count: tags?.length || 0, 
      total: count,
      filters: { project_id, limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Tags Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
