/**
 * Handler para contar atividades de um contato (GET /contacts/:id/activities/count)
 * 
 * Retorna o total de atividades de um contato específico
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/contact.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Conta atividades de um contato
 * 
 * Retorna o total de atividades de um contato específico do banco de dados
 */
export async function handleCountActivities(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    // Verificar se o contato existe e o usuário tem acesso (RLS)
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', contactId)
      .single()

    if (contactError) {
      console.error('[Count Activities - Contact Check Error]', contactError)
      
      if (contactError.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }
      
      if (contactError.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse('Failed to verify contact access', 500)
    }

    // Contar atividades do banco
    const { count, error: countError } = await supabaseClient
      .from('contact_activities')
      .select('*', { count: 'exact', head: true })
      .eq('contact_id', contactId)

    if (countError) {
      console.error('[Count Activities - Database Error]', countError)
      return errorResponse('Failed to count activities', 500)
    }

    console.log('[Count Activities Success]', { 
      contactId, 
      count: count || 0
    })

    return successResponse({ count: count || 0 }, 200)

  } catch (error) {
    console.error('[Count Activities Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
