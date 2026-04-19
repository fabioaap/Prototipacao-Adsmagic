/**
 * Handler para retentar envio de evento (POST /events/:id/retry)
 * 
 * Retenta envio de um evento que falhou ou está pendente
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { sendEventToPlatform } from '../integrations/platform-sender.ts'
import type { ConversionEvent } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Json } from '../../../types/database.types.ts'

/**
 * Retenta envio de um evento
 */
export async function handleRetry(
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
      console.error('[Retry Event Error]', fetchError)
      
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Event not found', 404)
      }
      
      return errorResponse(`Failed to fetch event: ${fetchError.message}`, 500)
    }

    const eventData = event as ConversionEvent

    // Validar que evento pode ser retentado
    if (eventData.status === 'sent') {
      return errorResponse('Event already sent successfully', 400)
    }

    const isCancelled = eventData.status === 'cancelled'

    if (!isCancelled && eventData.retry_count >= eventData.max_retries) {
      return errorResponse(`Maximum retry attempts (${eventData.max_retries}) reached`, 400)
    }

    // Para eventos cancelados (nonRetryable), resetar retry_count para dar nova chance
    const newRetryCount = isCancelled ? 1 : eventData.retry_count + 1

    // Atualizar contador de retry
    const { data: updatedEvent, error: updateError } = await supabaseClient
      .from('conversion_events')
      .update({
        retry_count: newRetryCount,
        last_retry_at: new Date().toISOString(),
        status: 'pending'
      })
      .eq('id', eventId)
      .select()
      .single()

    if (updateError) {
      console.error('[Retry Event Update Error]', updateError)
      return errorResponse(`Failed to update event: ${updateError.message}`, 500)
    }

    // Tentar enviar para a plataforma
    try {
      const sendResult = await sendEventToPlatform(
        updatedEvent as ConversionEvent,
        supabaseClient
      )

      // Atualizar com resultado do envio
      const finalStatus = sendResult.success
        ? 'sent'
        : (sendResult.nonRetryable ? 'cancelled' : 'failed')
      const { data: finalEvent, error: finalUpdateError } = await supabaseClient
        .from('conversion_events')
        .update({
          status: finalStatus,
          sent_at: sendResult.success ? new Date().toISOString() : null,
          processed_at: new Date().toISOString(),
          response: (sendResult.response || (sendResult.errorCode
            ? { error_code: sendResult.errorCode }
            : null)) as Json | null,
          error_message: sendResult.error || null
        })
        .eq('id', eventId)
        .select()
        .single()

      if (finalUpdateError) {
        console.error('[Retry Event Final Update Error]', finalUpdateError)
      }

      return successResponse(finalEvent || updatedEvent)

    } catch (sendError) {
      // Atualizar status como failed
      const { data: failedEvent, error: failUpdateError } = await supabaseClient
        .from('conversion_events')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: sendError instanceof Error ? sendError.message : 'Unknown error'
        })
        .eq('id', eventId)
        .select()
        .single()

      if (failUpdateError) {
        console.error('[Retry Event Fail Update Error]', failUpdateError)
      }

      return errorResponse(`Failed to send event: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`, 500)
    }

  } catch (error) {
    console.error('[Retry Event Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
