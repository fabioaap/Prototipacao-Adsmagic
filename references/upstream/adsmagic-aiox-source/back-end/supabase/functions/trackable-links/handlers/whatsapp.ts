/**
 * Handler para geração de link WhatsApp (POST /trackable-links/:id/generate-whatsapp)
 * 
 * Gera protocolo único e URL do WhatsApp para tracking
 * 
 * @module trackable-links/handlers/whatsapp
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/link.ts'
import { generateWhatsAppProtocol, buildWhatsAppUrl, buildTrackingUrl } from '../utils/slug.ts'
import { resolveTrackingBaseUrl } from '../utils/tracking-base-url.ts'
import type { GenerateWhatsAppResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/** URL base para links de tracking */
const TRACKING_BASE_URL = resolveTrackingBaseUrl()

/**
 * Gera link WhatsApp com protocolo único para tracking
 * 
 * Este endpoint é usado pelo sistema de redirecionamento para gerar
 * um link WhatsApp com protocolo único que permite rastrear a conversão.
 */
export async function handleGenerateWhatsApp(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  linkId: string
) {
  try {
    // Este endpoint pode ser chamado sem autenticação (pelo redirect)
    // mas vamos verificar se o link existe e está ativo

    // Validar UUID
    if (!validateUUID(linkId)) {
      return errorResponse('Invalid link ID format', 400)
    }

    console.log('[Generate WhatsApp] Generating for link:', { linkId })

    // Buscar link
    const { data: link, error: linkError } = await supabaseClient
      .from('trackable_links')
      .select('id, project_id, whatsapp_number, whatsapp_message_template, initial_message, link_type, is_active, utm_source, utm_medium, utm_campaign, utm_content, utm_term')
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

    // Verificar se é um link WhatsApp
    if (link.link_type !== 'whatsapp') {
      return errorResponse('Link is not a WhatsApp link', 400)
    }

    // Verificar se tem número WhatsApp
    if (!link.whatsapp_number) {
      return errorResponse('Link does not have a WhatsApp number configured', 400)
    }

    // Gerar protocolo único
    const protocol = generateWhatsAppProtocol()

    // Usar template de mensagem ou mensagem inicial
    const message = link.whatsapp_message_template || link.initial_message || ''

    // Montar URL do WhatsApp com protocolo
    const whatsappUrl = buildWhatsAppUrl(link.whatsapp_number, message, protocol)

    // Montar URL de tracking
    const urlTracker = buildTrackingUrl(TRACKING_BASE_URL, link.id, {
      utm_source: link.utm_source,
      utm_medium: link.utm_medium,
      utm_campaign: link.utm_campaign,
      utm_content: link.utm_content,
      utm_term: link.utm_term
    })

    const response: GenerateWhatsAppResponse = {
      protocol,
      url_tracker: urlTracker,
      whatsapp_url: whatsappUrl
    }

    console.log('[Generate WhatsApp Success]', { 
      linkId, 
      protocol,
      whatsappNumber: link.whatsapp_number.substring(0, 4) + '****'
    })

    return successResponse(response)

  } catch (error) {
    console.error('[Generate WhatsApp Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
