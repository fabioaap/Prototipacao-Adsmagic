/**
 * Handler para criação de evento de conversão (POST /events)
 * 
 * Cria um novo evento de conversão manualmente
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createEventSchema, extractValidationErrors } from '../validators/event.ts'
import type { ConversionEvent, CreateConversionEventDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Json } from '../../../types/database.types.ts'

/**
 * Cria um novo evento de conversão
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Event] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = createEventSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Event] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const eventData: CreateConversionEventDTO = validationResult.data
    console.log('[Create Event] Validated data:', JSON.stringify(eventData, null, 2))
    
    // Verificar se o usuário tem acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', eventData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Event] Project access check failed:', { projectError, projectCheck })
      return errorResponse('Project not found or access denied', 403)
    }

    // Verificar se o usuário tem acesso à empresa do projeto
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('company_id, role')
      .eq('company_id', projectCheck.company_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      console.error('[Create Event] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company access denied', 403)
    }

    // Verificar se integração está ativa para a plataforma
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('id, status')
      .eq('project_id', eventData.project_id)
      .eq('platform', eventData.platform)
      .eq('platform_type', 'advertising')
      .single()

    if (integrationError || !integration || integration.status !== 'connected') {
      console.warn('[Create Event] Integration not connected:', { platform: eventData.platform, integrationError })
      // Não bloquear, apenas avisar que evento pode não ser enviado
    }

    // Criar evento (status = 'pending' para processamento assíncrono)
    const { data: event, error } = await supabaseClient
      .from('conversion_events')
      .insert({
        project_id: eventData.project_id,
        contact_id: eventData.contact_id || null,
        sale_id: eventData.sale_id || null,
        platform: eventData.platform,
        event_type: eventData.event_type,
        status: 'pending',
        payload: (eventData.payload || {}) as Json,
        max_retries: eventData.max_retries || 3,
        retry_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Event Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23503') {
        return errorResponse('Invalid project, contact, or sale reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create event: ${error.message}`, 500)
    }

    console.log('[Create Event Success]', { eventId: event.id, platform: event.platform, eventType: event.event_type })

    return successResponse(event as ConversionEvent, 201)

  } catch (error) {
    console.error('[Create Event Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
