/**
 * Handler para registro de acesso (POST /trackable-links/:id/register-access)
 * 
 * Registra um acesso a um link para tracking
 * 
 * @module trackable-links/handlers/access
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { registerAccessSchema, extractValidationErrors, validateUUID } from '../validators/link.ts'
import type { RegisterAccessDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Registra um acesso a um link
 * 
 * Este endpoint é público (sem autenticação) para permitir que o sistema
 * de redirecionamento registre acessos de visitantes anônimos.
 * 
 * O trigger no banco incrementará automaticamente clicks_count no link.
 */
export async function handleRegisterAccess(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  linkId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(linkId)) {
      return errorResponse('Invalid link ID format', 400)
    }

    // Parse do body
    const body = await req.json()
    
    // Validação com Zod
    const validationResult = registerAccessSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Register Access] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const accessData: RegisterAccessDTO = validationResult.data

    // Buscar link para obter project_id
    const { data: link, error: linkError } = await supabaseClient
      .from('trackable_links')
      .select('id, project_id, is_active')
      .eq('id', linkId)
      .single()

    if (linkError) {
      if (linkError.code === 'PGRST116') {
        return errorResponse('Link not found', 404)
      }
      return errorResponse(`Failed to fetch link: ${linkError.message}`, 500)
    }

    // Verificar se link está ativo
    if (!link.is_active) {
      return errorResponse('Link is not active', 400)
    }

    // Verificar se já existe acesso com este event_id para o mesmo link
    const { data: existingAccess, error: existingAccessError } = await supabaseClient
      .from('link_accesses')
      .select('id')
      .eq('link_id', linkId)
      .eq('event_id', accessData.event_id)
      .maybeSingle()

    if (existingAccessError) {
      return errorResponse(`Failed to check duplicate event: ${existingAccessError.message}`, 500)
    }

    if (existingAccess) {
      // Acesso já registrado, retornar sucesso sem criar duplicata
      console.log('[Register Access] Access already registered:', { 
        linkId,
        eventId: accessData.event_id,
        existingId: existingAccess.id 
      })
      return successResponse({ 
        message: 'Access already registered',
        access_id: existingAccess.id,
        duplicate: true
      })
    }

    // Registrar acesso
    const { data: access, error } = await supabaseClient
      .from('link_accesses')
      .insert({
        event_id: accessData.event_id,
        link_id: linkId,
        project_id: link.project_id,
        access_uuid: accessData.access_uuid,
        whatsapp_protocol: accessData.whatsapp_protocol,
        user_agent: accessData.user_agent,
        ip_address: accessData.ip_address,
        city: accessData.city,
        country: accessData.country,
        state: accessData.state,
        device: accessData.device,
        fbclid: accessData.fbclid,
        gclid: accessData.gclid,
        msclkid: accessData.msclkid,
        gbraid: accessData.gbraid,
        wbraid: accessData.wbraid,
        yclid: accessData.yclid,
        ttclid: accessData.ttclid,
        utm_source: accessData.utm_source,
        utm_medium: accessData.utm_medium,
        utm_campaign: accessData.utm_campaign,
        utm_content: accessData.utm_content,
        utm_term: accessData.utm_term,
        campaign_id: accessData.campaign_id,
        adgroup_id: accessData.adgroup_id,
        ad_id: accessData.ad_id,
        referrer: accessData.referrer,
        landing_page: accessData.landing_page
      })
      .select()
      .single()

    if (error) {
      console.error('[Register Access Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '23505') {
        // Idempotência por (link_id, event_id)
        return successResponse({ 
          message: 'Access already registered',
          duplicate: true
        })
      }
      
      return errorResponse(`Failed to register access: ${error.message}`, 500)
    }

    console.log('[Register Access Success]', { 
      accessId: access.id, 
      linkId,
      eventId: accessData.event_id
    })

    return successResponse({ 
      message: 'Access registered successfully',
      access_id: access.id,
      duplicate: false
    }, 201)

  } catch (error) {
    console.error('[Register Access Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
