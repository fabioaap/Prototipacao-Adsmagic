/**
 * Handler para deleção de contatos (DELETE /contacts/:id)
 * 
 * Deleta um contato existente
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/contact.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta um contato
 */
export async function handleDelete(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Verificar se o contato existe e o usuário tem acesso
    const { data: existingContact, error: fetchError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', contactId)
      .single()

    if (fetchError || !existingContact) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }
      return errorResponse('Failed to fetch contact', 500)
    }

    // Deletar contato (RLS validará automaticamente e CASCADE deletará histórico)
    const { error } = await supabaseClient
      .from('contacts')
      .delete()
      .eq('id', contactId)

    if (error) {
      console.error('[Delete Contact Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to delete contact: ${error.message}`, 500)
    }

    console.log('[Delete Contact Success]', { contactId })

    return successResponse({ message: 'Contact deleted successfully', id: contactId }, 200)

  } catch (error) {
    console.error('[Delete Contact Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}

