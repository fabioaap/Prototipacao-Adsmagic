/**
 * Handler para obter tag específica (GET /tags/:id)
 * 
 * Retorna uma tag específica com contagem de contatos associados.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/tag.ts'
import type { Tag, TagWithContactsCount } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém uma tag específica
 */
export async function handleGet(
  _req: Request, 
  supabaseClient: SupabaseDbClient,
  tagId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(tagId)) {
      return errorResponse('Invalid tag ID format', 400)
    }

    console.log('[Get Tag] Fetching tag:', tagId)

    // Buscar tag
    const { data: tag, error } = await supabaseClient
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Tag not found', 404)
      }
      console.error('[Get Tag Error]', error)
      return errorResponse('Failed to fetch tag', 500)
    }

    if (!tag) {
      return errorResponse('Tag not found', 404)
    }

    // Contar contatos associados
    const { count: contactsCount, error: countError } = await supabaseClient
      .from('contact_tags')
      .select('id', { count: 'exact', head: true })
      .eq('tag_id', tagId)

    if (countError) {
      console.error('[Get Tag] Error counting contacts:', countError)
      // Não falhar se não conseguir contar, apenas não incluir o campo
    }

    const tagWithCount: TagWithContactsCount = {
      ...(tag as Tag),
      contacts_count: contactsCount ?? 0
    }

    console.log('[Get Tag Success]', { tagId, contactsCount })

    return successResponse(tagWithCount, 200)

  } catch (error) {
    console.error('[Get Tag Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
