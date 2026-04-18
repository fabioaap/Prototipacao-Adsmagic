/**
 * Handler para obter contato específico (GET /contacts/:id)
 * 
 * Retorna um contato específico por ID
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/contact.ts'
import type { Contact } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém um contato específico
 */
export async function handleGet(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    // Buscar contato (RLS automaticamente valida acesso)
    const { data: contact, error } = await supabaseClient
      .from('contacts')
      .select(`
        id,
        project_id,
        name,
        phone,
        country_code,
        email,
        company,
        location,
        notes,
        avatar_url,
        is_favorite,
        main_origin_id,
        current_stage_id,
        metadata,
        created_at,
        updated_at
      `)
      .eq('id', contactId)
      .single()

    if (error) {
      console.error('[Get Contact Error]', error)
      
      if (error.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse('Failed to fetch contact', 500)
    }

    console.log('[Get Contact Success]', { contactId: contact.id })

    return successResponse(contact, 200)

  } catch (error) {
    console.error('[Get Contact Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}

