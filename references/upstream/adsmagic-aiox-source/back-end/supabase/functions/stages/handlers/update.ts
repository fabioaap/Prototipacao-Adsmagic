/**
 * Handler para atualização de estágios (PATCH /stages/:id)
 * 
 * Atualiza um estágio existente.
 * Valida unicidade de tipo 'sale' e 'lost' se mudando o tipo.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateStageSchema, extractValidationErrors, validateUUID } from '../validators/stage.ts'
import type { Stage, UpdateStageDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Atualiza um estágio
 */
export async function handleUpdate(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  stageId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(stageId)) {
      return errorResponse('Invalid stage ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Buscar estágio existente
    const { data: existingStage, error: fetchError } = await supabaseClient
      .from('stages')
      .select('*')
      .eq('id', stageId)
      .single()

    if (fetchError || !existingStage) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Stage not found', 404)
      }
      return errorResponse('Failed to fetch stage', 500)
    }

    // System stages (project_id = NULL) são imutáveis
    if (!existingStage.project_id) {
      return errorResponse('System stages cannot be modified. Create a project-specific stage instead.', 403)
    }

    // Verificar acesso ao projeto
    if (existingStage.project_id) {
      const { data: projectCheck, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, company_id')
        .eq('id', existingStage.project_id)
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

    // Parse do body
    const body = await req.json()
    console.log('[Update Stage] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = updateStageSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Update Stage] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateStageDTO = validationResult.data

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    // Se está mudando o tipo para 'sale' ou 'lost', validar unicidade
    if (updateData.type && updateData.type !== existingStage.type) {
      if (updateData.type === 'sale' || updateData.type === 'lost') {
        const { data: existingTypeStage, error: typeError } = await supabaseClient
          .from('stages')
          .select('id, name')
          .eq('project_id', existingStage.project_id)
          .eq('type', updateData.type)
          .neq('id', stageId) // Excluir o próprio estágio
          .maybeSingle()

        if (typeError) {
          console.error('[Update Stage] Type check error:', typeError)
          return errorResponse('Failed to validate stage type', 500)
        }

        if (existingTypeStage) {
          return errorResponse(
            `A stage with type '${updateData.type}' already exists in this project: "${existingTypeStage.name}"`, 
            400
          )
        }
      }
    }

    // Construir payload de atualização
    const updatePayload: Partial<Stage> = {}
    
    if (updateData.name !== undefined) updatePayload.name = updateData.name
    if (updateData.display_order !== undefined) updatePayload.display_order = updateData.display_order
    if (updateData.color !== undefined) updatePayload.color = updateData.color
    if (updateData.tracking_phrase !== undefined) updatePayload.tracking_phrase = updateData.tracking_phrase
    if (updateData.type !== undefined) updatePayload.type = updateData.type
    if (updateData.is_active !== undefined) updatePayload.is_active = updateData.is_active
    if (updateData.event_config !== undefined) {
      updatePayload.event_config = updateData.event_config as Record<string, unknown>
    }

    console.log('[Update Stage] Updating:', { stageId, updatePayload })

    // Atualizar estágio
    const { data: stage, error } = await supabaseClient
      .from('stages')
      .update(updatePayload)
      .eq('id', stageId)
      .select()
      .single()

    if (error) {
      console.error('[Update Stage Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '23505') {
        return errorResponse('Stage with this name or order already exists', 409)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to update stage: ${error.message}`, 500)
    }

    console.log('[Update Stage Success]', { stageId: stage.id, type: stage.type })

    return successResponse(stage as Stage, 200)

  } catch (error) {
    console.error('[Update Stage Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
