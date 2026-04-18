/**
 * Handler para obter evento específico (GET /events/:id)
 * 
 * Retorna um evento de conversão pelo ID
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { ConversionEvent } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém um evento de conversão por ID
 */
export async function handleGet(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  eventId: string
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(eventId)) {
      return errorResponse('Invalid event ID format', 400)
    }

    // Buscar evento
    const { data: event, error } = await supabaseClient
      .from('conversion_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('[Get Event Error]', error)
      
      if (error.code === 'PGRST116') {
        return errorResponse('Event not found', 404)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to get event: ${error.message}`, 500)
    }

    return successResponse(event as ConversionEvent)

  } catch (error) {
    console.error('[Get Event Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
