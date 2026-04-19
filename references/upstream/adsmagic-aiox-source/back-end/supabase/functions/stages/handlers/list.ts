/**
 * Handler para listagem de estágios (GET /stages)
 * 
 * Lista estágios com filtros opcionais.
 * Sempre ordenado por display_order ASC.
 * Opcionalmente inclui contagem de contatos em cada estágio.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listStagesQuerySchema, extractValidationErrors } from '../validators/stage.ts'
import type { Stage, StageWithCount, StagesListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista estágios do projeto
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
    const validationResult = listStagesQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { 
      project_id, 
      is_active,
      type,
      include_count = false,
      limit = 50, 
      offset = 0 
    } = validationResult.data

    console.log('[List Stages] Params:', { project_id, is_active, type, include_count, limit, offset })

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
      console.error('[List Stages] Project access denied:', projectError)
      return errorResponse('Project not found or access denied', 403)
    }

    // Buscar etapas sistema (project_id IS NULL) + etapas do projeto (project_id = project_id)
    let query = supabaseClient
      .from('stages')
      .select('*', { count: 'exact' })
      .or(`project_id.is.null,project_id.eq.${project_id}`)

    // Aplicar filtro de tipo
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    // Aplicar filtro de is_active
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active)
    }

    // Ordenação: etapas sistema primeiro (nulls first em project_id), depois display_order ASC
    query = query
      .order('project_id', { ascending: true, nullsFirst: true })
      .order('display_order', { ascending: true })

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: stages, error, count } = await query

    if (error) {
      console.error('[List Stages Error]', error)
      return errorResponse('Failed to fetch stages', 500)
    }

    let stagesWithCount: StageWithCount[] = stages || []

    // Se include_count=true, buscar contagem de contatos em cada estágio
    if (include_count && stages && stages.length > 0) {
      const stageIds = stages.map(s => s.id)
      
      // Buscar contagem de contatos por estágio
      const { data: contactCounts, error: countError } = await supabaseClient
        .from('contacts')
        .select('current_stage_id')
        .in('current_stage_id', stageIds)

      if (!countError && contactCounts) {
        // Contar contatos por estágio
        const countMap = new Map<string, number>()
        contactCounts.forEach(c => {
          const currentCount = countMap.get(c.current_stage_id) || 0
          countMap.set(c.current_stage_id, currentCount + 1)
        })

        // Adicionar contagem aos estágios
        stagesWithCount = stages.map(stage => ({
          ...stage,
          contacts_count: countMap.get(stage.id) || 0
        })) as StageWithCount[]
      }
    }

    const response: StagesListResponse = {
      data: stagesWithCount,
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Stages Success]', { 
      count: stages?.length || 0, 
      total: count,
      filters: { project_id, is_active, type, include_count, limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Stages Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
