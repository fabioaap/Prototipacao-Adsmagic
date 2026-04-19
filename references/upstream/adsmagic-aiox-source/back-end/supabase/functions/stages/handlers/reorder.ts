/**
 * Handler para reordenação de estágios (POST /stages/reorder)
 * 
 * Reordena estágios em lote.
 * Atualiza display_order de todos os estágios fornecidos.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { reorderStagesSchema, extractValidationErrors } from '../validators/stage.ts'
import type { Stage } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Reordena estágios
 */
export async function handleReorder(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Reorder Stages] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = reorderStagesSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Reorder Stages] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { stage_ids } = validationResult.data

    if (stage_ids.length === 0) {
      return errorResponse('No stages to reorder', 400)
    }

    console.log('[Reorder Stages] Stage IDs:', stage_ids)

    // Buscar todos os estágios para verificar se existem e pertencem ao mesmo projeto
    const { data: stages, error: fetchError } = await supabaseClient
      .from('stages')
      .select('id, project_id, name')
      .in('id', stage_ids)

    if (fetchError) {
      console.error('[Reorder Stages] Fetch error:', fetchError)
      return errorResponse('Failed to fetch stages', 500)
    }

    if (!stages || stages.length !== stage_ids.length) {
      const foundIds = new Set(stages?.map(s => s.id) || [])
      const missingIds = stage_ids.filter(id => !foundIds.has(id))
      return errorResponse(
        `Some stages not found: ${missingIds.join(', ')}`, 
        404
      )
    }

    // Verificar se todos os estágios pertencem ao mesmo projeto
    const projectIds = new Set(stages.map(s => s.project_id))
    if (projectIds.size > 1) {
      return errorResponse('All stages must belong to the same project', 400)
    }

    const projectId = stages[0].project_id

    // Verificar acesso ao projeto
    if (projectId) {
      const { data: projectCheck, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, company_id')
        .eq('id', projectId)
        .single()

      if (projectError || !projectCheck) {
        return errorResponse('Project access denied', 403)
      }

      // Verificar acesso à empresa
      const { data: companyCheck, error: companyError } = await supabaseClient
        .from('company_users')
        .select('company_id')
        .eq('company_id', projectCheck.company_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (companyError || !companyCheck) {
        return errorResponse('Company access denied', 403)
      }
    }

    console.log('[Reorder Stages] Updating order for', stage_ids.length, 'stages')

    // Atualizar display_order de cada estágio
    // Usamos a posição no array como nova ordem (0, 1, 2, ...)
    const updatePromises = stage_ids.map((stageId, index) => 
      supabaseClient
        .from('stages')
        .update({ display_order: index })
        .eq('id', stageId)
        .select()
        .single()
    )

    const results = await Promise.all(updatePromises)

    // Verificar se houve erros
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('[Reorder Stages] Some updates failed:', errors.map(e => e.error))
      return errorResponse('Failed to reorder some stages', 500)
    }

    // Buscar estágios atualizados ordenados
    const { data: updatedStages, error: listError } = await supabaseClient
      .from('stages')
      .select('*')
      .in('id', stage_ids)
      .order('display_order', { ascending: true })

    if (listError) {
      console.error('[Reorder Stages] Error fetching updated stages:', listError)
      return errorResponse('Failed to fetch updated stages', 500)
    }

    console.log('[Reorder Stages Success]', { 
      count: stage_ids.length,
      projectId,
      newOrder: updatedStages?.map(s => ({ id: s.id, name: s.name, order: s.display_order }))
    })

    return successResponse({
      message: 'Stages reordered successfully',
      data: updatedStages as Stage[]
    }, 200)

  } catch (error) {
    console.error('[Reorder Stages Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
