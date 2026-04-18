/**
 * Handler para listar tags de um contato (GET /contacts/:contactId/tags)
 *
 * Retorna todas as tags associadas a um contato específico.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/tag.ts'
import type { Tag } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista tags de um contato
 */
export async function handleGetContactTags(
  _req: Request,
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID do contato
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    console.log('[Get Contact Tags] Fetching tags for contact:', contactId)

    // Verificar se contato existe e se usuário tem acesso (RLS)
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      if (contactError?.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }

      console.error('[Get Contact Tags] Error fetching contact:', contactError)
      return errorResponse('Failed to fetch contact', 500)
    }

    // Buscar IDs das tags associadas ao contato
    const { data: contactTags, error: contactTagsError } = await supabaseClient
      .from('contact_tags')
      .select('tag_id')
      .eq('contact_id', contactId)

    if (contactTagsError) {
      console.error('[Get Contact Tags] Error fetching contact tags:', contactTagsError)
      return errorResponse('Failed to fetch contact tags', 500)
    }

    const tagIds = (contactTags || []).map((item: { tag_id: string }) => item.tag_id)

    // Sem tags associadas: retorna lista vazia
    if (tagIds.length === 0) {
      return successResponse([], 200)
    }

    // Buscar dados completos das tags
    const { data: tags, error: tagsError } = await supabaseClient
      .from('tags')
      .select('*')
      .in('id', tagIds)
      .eq('project_id', contact.project_id)
      .order('name', { ascending: true })

    if (tagsError) {
      console.error('[Get Contact Tags] Error fetching tags:', tagsError)
      return errorResponse('Failed to fetch tags', 500)
    }

    console.log('[Get Contact Tags Success]', {
      contactId,
      count: tags?.length || 0
    })

    return successResponse((tags || []) as Tag[], 200)

  } catch (error) {
    console.error('[Get Contact Tags Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
