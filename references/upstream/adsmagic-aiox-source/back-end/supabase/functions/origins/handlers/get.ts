/**
 * Handler para obter origem específica (GET /origins/:id)
 * 
 * Retorna uma origem específica por ID
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/origin.ts'
import type { Origin } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém uma origem específica
 */
export async function handleGet(
  _req: Request, 
  supabaseClient: SupabaseDbClient,
  originId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(originId)) {
      return errorResponse('Invalid origin ID format', 400)
    }

    console.log('[Get Origin] originId:', originId)

    // Buscar origem
    const { data: origin, error } = await supabaseClient
      .from('origins')
      .select('*')
      .eq('id', originId)
      .single()

    if (error) {
      console.error('[Get Origin Error]', error)
      
      if (error.code === 'PGRST116') {
        return errorResponse('Origin not found', 404)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse('Failed to fetch origin', 500)
    }

    // Se a origem é customizada, verificar acesso ao projeto
    if (origin.project_id) {
      const { data: projectCheck, error: projectError } = await supabaseClient
        .from('projects')
        .select('id')
        .eq('id', origin.project_id)
        .single()

      if (projectError || !projectCheck) {
        console.error('[Get Origin] Project access denied:', projectError)
        return errorResponse('Origin not found or access denied', 404)
      }
    }

    console.log('[Get Origin Success]', { originId: origin.id, type: origin.type })

    return successResponse(origin as Origin, 200)

  } catch (error) {
    console.error('[Get Origin Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
