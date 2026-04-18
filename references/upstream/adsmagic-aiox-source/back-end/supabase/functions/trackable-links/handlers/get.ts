/**
 * Handler para obter link específico (GET /trackable-links/:id)
 * 
 * Retorna um link por ID com estatísticas opcionais
 * 
 * @module trackable-links/handlers/get
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/link.ts'
import type { SupabaseDbClient } from '../types-db.ts'

const LINK_SELECT_COLUMNS = 'id, project_id, name, destination_url, tracking_url, initial_message, origin_id, whatsapp_number, whatsapp_message_template, link_type, utm_source, utm_medium, utm_campaign, utm_content, utm_term, is_active, clicks_count, contacts_count, sales_count, revenue, created_at, updated_at'

/**
 * Obtém um link específico por ID
 */
export async function handleGet(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  linkId: string
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Validar UUID
    if (!validateUUID(linkId)) {
      return errorResponse('Invalid link ID format', 400)
    }

    console.log('[Get Link] Fetching link:', { linkId, userId: user.id })

    // Buscar link (RLS garante acesso apenas a links do projeto do usuário)
    const { data: link, error } = await supabaseClient
      .from('trackable_links')
      .select(LINK_SELECT_COLUMNS)
      .eq('id', linkId)
      .single()

    if (error) {
      console.error('[Get Link Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === 'PGRST116') {
        return errorResponse('Link not found', 404)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to get link: ${error.message}`, 500)
    }

    console.log('[Get Link Success]', { linkId: link.id })

    return successResponse(link)

  } catch (error) {
    console.error('[Get Link Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
