/**
 * Handler para remover tag de contato (DELETE /contacts/:contactId/tags/:tagId)
 * 
 * Remove a associação entre uma tag e um contato.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/tag.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Remove uma tag de um contato
 */
export async function handleRemoveTagFromContact(
  _req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string,
  tagId: string
) {
  try {
    // Validar UUIDs
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    if (!validateUUID(tagId)) {
      return errorResponse('Invalid tag ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    console.log('[Remove Tag from Contact] Removing association:', { contactId, tagId })

    // Verificar se associação existe
    const { data: existing, error: fetchError } = await supabaseClient
      .from('contact_tags')
      .select('id, contact_id, tag_id')
      .eq('contact_id', contactId)
      .eq('tag_id', tagId)
      .single()

    if (fetchError || !existing) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Tag is not associated with this contact', 404)
      }
      return errorResponse('Failed to fetch association', 500)
    }

    // Deletar associação
    const { error } = await supabaseClient
      .from('contact_tags')
      .delete()
      .eq('contact_id', contactId)
      .eq('tag_id', tagId)

    if (error) {
      console.error('[Remove Tag from Contact Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to remove tag from contact: ${error.message}`, 500)
    }

    console.log('[Remove Tag from Contact Success]', { contactId, tagId })

    return successResponse({ 
      message: 'Tag removed from contact successfully', 
      contact_id: contactId,
      tag_id: tagId
    }, 200)

  } catch (error) {
    console.error('[Remove Tag from Contact Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
