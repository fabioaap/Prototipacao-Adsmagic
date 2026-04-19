/**
 * Handler para obter estágio específico (GET /stages/:id)
 * 
 * Retorna um estágio específico por ID
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/stage.ts'
import type { StageWithCount } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém um estágio específico
 */
export async function handleGet(
  _req: Request, 
  supabaseClient: SupabaseDbClient,
  stageId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(stageId)) {
      return errorResponse('Invalid stage ID format', 400)
    }

    console.log('[Get Stage] stageId:', stageId)

    // Buscar estágio
    const { data: stage, error } = await supabaseClient
      .from('stages')
      .select('*')
      .eq('id', stageId)
      .single()

    if (error) {
      console.error('[Get Stage Error]', error)
      
      if (error.code === 'PGRST116') {
        return errorResponse('Stage not found', 404)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse('Failed to fetch stage', 500)
    }

    // Verificar acesso ao projeto
    if (stage.project_id) {
      const { data: projectCheck, error: projectError } = await supabaseClient
        .from('projects')
        .select('id')
        .eq('id', stage.project_id)
        .single()

      if (projectError || !projectCheck) {
        console.error('[Get Stage] Project access denied:', projectError)
        return errorResponse('Stage not found or access denied', 404)
      }
    }

    // Buscar contagem de contatos neste estágio
    const { count: contactsCount } = await supabaseClient
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('current_stage_id', stageId)

    const stageWithCount: StageWithCount = {
      ...stage,
      contacts_count: contactsCount || 0
    }

    console.log('[Get Stage Success]', { stageId: stage.id, type: stage.type, contactsCount })

    return successResponse(stageWithCount, 200)

  } catch (error) {
    console.error('[Get Stage Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
