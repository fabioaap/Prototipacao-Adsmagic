/**
 * Handler para cancelar evento (POST /events/:id/cancel)
 * 
 * Cancela um evento pendente
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { ConversionEvent } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Cancela um evento pendente
 */
export async function handleCancel(
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
    const { data: event, error: fetchError } = await supabaseClient
      .from('conversion_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('[Cancel Event Error]', fetchError)
      
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Event not found', 404)
      }
      
      return errorResponse(`Failed to fetch event: ${fetchError.message}`, 500)
    }

    const eventData = event as ConversionEvent

    // Validar que evento pode ser cancelado
    if (eventData.status === 'sent') {
      return errorResponse('Cannot cancel event that was already sent', 400)
    }

    if (eventData.status === 'cancelled') {
      return successResponse(eventData, 200) // Já está cancelado
    }

    // Cancelar evento
    const { data: cancelledEvent, error: updateError } = await supabaseClient
      .from('conversion_events')
      .update({
        status: 'cancelled',
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single()

    if (updateError) {
      console.error('[Cancel Event Update Error]', updateError)
      return errorResponse(`Failed to cancel event: ${updateError.message}`, 500)
    }

    console.log('[Cancel Event Success]', { eventId: cancelledEvent.id, status: cancelledEvent.status })

    return successResponse(cancelledEvent as ConversionEvent)

  } catch (error) {
    console.error('[Cancel Event Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
