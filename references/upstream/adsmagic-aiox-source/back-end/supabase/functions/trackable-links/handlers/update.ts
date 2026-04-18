/**
 * Handler para atualização de links rastreáveis (PATCH /trackable-links/:id)
 * 
 * Atualiza um link existente com validação
 * 
 * @module trackable-links/handlers/update
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateLinkSchema, extractValidationErrors, validateUUID } from '../validators/link.ts'
import type { UpdateTrackableLinkDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

const LINK_SELECT_COLUMNS = 'id, project_id, name, destination_url, tracking_url, initial_message, origin_id, whatsapp_number, whatsapp_message_template, link_type, utm_source, utm_medium, utm_campaign, utm_content, utm_term, is_active, clicks_count, contacts_count, sales_count, revenue, created_at, updated_at'

/**
 * Atualiza um link rastreável
 */
export async function handleUpdate(
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

    // Parse do body
    const body = await req.json()
    
    // Validação com Zod
    const validationResult = updateLinkSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Update Link] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateTrackableLinkDTO = validationResult.data
    
    // Verificar se há dados para atualizar
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No data provided for update', 400)
    }

    console.log('[Update Link] Validated fields:', {
      linkId,
      fields: Object.keys(updateData)
    })

    // Verificar se o link existe e obter dados atuais
    const { data: existingLink, error: fetchError } = await supabaseClient
      .from('trackable_links')
      .select('id, project_id, link_type, whatsapp_number, destination_url')
      .eq('id', linkId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Link not found', 404)
      }
      return errorResponse(`Failed to fetch link: ${fetchError.message}`, 500)
    }

    // Verificar se origin_id existe e pertence ao projeto (se fornecido)
    if (updateData.origin_id) {
      const { data: originCheck, error: originError } = await supabaseClient
        .from('origins')
        .select('id, project_id')
        .eq('id', updateData.origin_id)
        .single()

      if (originError || !originCheck) {
        return errorResponse('Invalid origin ID', 400)
      }

      // Origin deve ser do sistema (project_id IS NULL) ou do projeto
      if (originCheck.project_id !== null && originCheck.project_id !== existingLink.project_id) {
        return errorResponse('Origin does not belong to this project', 400)
      }
    }

    // Validar consistência de link_type com campos obrigatórios
    const newLinkType = updateData.link_type || existingLink.link_type
    const newWhatsappNumber = updateData.whatsapp_number !== undefined 
      ? updateData.whatsapp_number 
      : existingLink.whatsapp_number
    const newDestinationUrl = updateData.destination_url !== undefined 
      ? updateData.destination_url 
      : existingLink.destination_url

    if (newLinkType === 'whatsapp' && !newWhatsappNumber) {
      return errorResponse('WhatsApp number is required for whatsapp link type', 400)
    }

    if (newLinkType !== 'whatsapp' && !newDestinationUrl) {
      return errorResponse('Destination URL is required for landing_page and direct link types', 400)
    }

    // Atualizar link (RLS validará automaticamente)
    const { data: link, error } = await supabaseClient
      .from('trackable_links')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .select(LINK_SELECT_COLUMNS)
      .single()

    if (error) {
      console.error('[Update Link Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      if (error.code === '23505') {
        if (error.message.includes('name')) {
          return errorResponse('Link with this name already exists in this project', 409)
        }
        return errorResponse('Link already exists', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid origin reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to update link: ${error.message}`, 500)
    }

    console.log('[Update Link Success]', { linkId: link.id })

    return successResponse(link)

  } catch (error) {
    console.error('[Update Link Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
