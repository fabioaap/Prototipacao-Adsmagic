/**
 * Handler público para tracking de eventos web (POST /events/track)
 *
 * Não requer autenticação — usa SUPABASE_SERVICE_ROLE_KEY para inserir.
 * Validação: project_id deve existir na tabela projects.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'
import { trackEventSchema } from '../validators/track.ts'
import { extractValidationErrors } from '../validators/event.ts'

export async function handleTrack(req: Request): Promise<Response> {
  try {
    const body = await req.json()

    const parsed = trackEventSchema.safeParse(body)
    if (!parsed.success) {
      const errors = extractValidationErrors(parsed.error)
      return errorResponse(`Validation failed: ${errors.join(', ')}`, 400)
    }

    const input = parsed.data

    // Cliente com service role (bypass RLS, como redirect/index.ts)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validar que o project_id existe
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', input.project_id)
      .maybeSingle()

    if (projectError) {
      console.error('[Events Track] Error validating project:', projectError)
      return errorResponse('Internal server error', 500)
    }

    if (!project) {
      return errorResponse('Invalid project_id: project not found', 400)
    }

    // Montar payload para conversion_events
    const payload: Record<string, unknown> = {
      ...input.event_data,
      event_name: input.event_name,
      page_url: input.page_url,
      page_title: input.page_title,
      referrer: input.referrer,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_content: input.utm_content,
      utm_term: input.utm_term,
      fbclid: input.fbclid,
      gclid: input.gclid,
      ttclid: input.ttclid,
    }

    // Inserir em conversion_events
    const { error: insertError } = await supabaseClient
      .from('conversion_events')
      .insert({
        project_id: input.project_id,
        platform: 'web',
        event_type: input.event_type,
        payload,
        status: 'sent', // Eventos web não precisam de envio posterior
      })

    if (insertError) {
      console.error('[Events Track] Error inserting event:', insertError)
      return errorResponse('Failed to record event', 500)
    }

    console.log('[Events Track] Event recorded', {
      projectId: input.project_id,
      eventName: input.event_name,
      eventType: input.event_type,
    })

    return successResponse({ success: true }, 201)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', 400)
    }
    console.error('[Events Track] Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
