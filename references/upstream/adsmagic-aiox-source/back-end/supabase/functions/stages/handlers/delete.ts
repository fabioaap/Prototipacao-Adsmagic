/**
 * Handler para deleção de estágios (DELETE /stages/:id)
 * 
 * Deleta um estágio.
 * Verifica dependências (contatos) antes de deletar.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/stage.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta um estágio
 */
export async function handleDelete(
  _req: Request, 
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

    console.log('[Delete Stage] Checking stage:', stageId)

    // Buscar estágio existente
    const { data: existingStage, error: fetchError } = await supabaseClient
      .from('stages')
      .select('id, project_id, type, name')
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
      return errorResponse('System stages cannot be deleted', 403)
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

    // Verificar dependências: contatos neste estágio
    const { count: contactsInStage, error: contactsError } = await supabaseClient
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('current_stage_id', stageId)

    if (contactsError) {
      console.error('[Delete Stage] Error checking contact dependencies:', contactsError)
      return errorResponse('Failed to check dependencies', 500)
    }

    if ((contactsInStage ?? 0) > 0) {
      return errorResponse(
        `Cannot delete stage: ${contactsInStage} contact(s) are currently in this stage. Move them to another stage first.`, 
        409
      )
    }

    // Verificar dependências: histórico de estágios
    const { count: historyCount, error: historyError } = await supabaseClient
      .from('contact_stage_history')
      .select('id', { count: 'exact', head: true })
      .eq('stage_id', stageId)

    if (historyError) {
      console.error('[Delete Stage] Error checking history dependencies:', historyError)
      return errorResponse('Failed to check dependencies', 500)
    }

    if ((historyCount ?? 0) > 0) {
      return errorResponse(
        `Cannot delete stage: ${historyCount} contact history record(s) reference this stage`, 
        409
      )
    }

    console.log('[Delete Stage] No dependencies found, deleting:', stageId)

    // Deletar estágio
    const { error } = await supabaseClient
      .from('stages')
      .delete()
      .eq('id', stageId)

    if (error) {
      console.error('[Delete Stage Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      if (error.code === '23503') {
        return errorResponse('Cannot delete stage: there are dependencies', 409)
      }
      
      return errorResponse(`Failed to delete stage: ${error.message}`, 500)
    }

    console.log('[Delete Stage Success]', { stageId, name: existingStage.name })

    return successResponse({ 
      message: 'Stage deleted successfully', 
      id: stageId,
      name: existingStage.name
    }, 200)

  } catch (error) {
    console.error('[Delete Stage Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
