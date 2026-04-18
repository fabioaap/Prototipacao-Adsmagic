/**
 * Handler para deleção de links rastreáveis (DELETE /trackable-links/:id)
 * 
 * Deleta um link existente verificando dependências
 * 
 * @module trackable-links/handlers/delete
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/link.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta um link rastreável
 */
export async function handleDelete(
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

    console.log('[Delete Link] Deleting link:', { linkId, userId: user.id })

    // Verificar se o link existe
    const { data: existingLink, error: fetchError } = await supabaseClient
      .from('trackable_links')
      .select('id, name, clicks_count, contacts_count, sales_count')
      .eq('id', linkId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Link not found', 404)
      }
      return errorResponse(`Failed to fetch link: ${fetchError.message}`, 500)
    }

    // Verificar se há acessos registrados (informativo)
    const { count: accessCount } = await supabaseClient
      .from('link_accesses')
      .select('id', { count: 'exact', head: true })
      .eq('link_id', linkId)

    if (accessCount && accessCount > 0) {
      console.log('[Delete Link] Warning: Link has accesses that will be deleted', { 
        linkId, 
        accessCount 
      })
    }

    // Deletar link (CASCADE deletará link_accesses automaticamente)
    const { error } = await supabaseClient
      .from('trackable_links')
      .delete()
      .eq('id', linkId)

    if (error) {
      console.error('[Delete Link Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - only managers can delete links', 403)
      }
      
      return errorResponse(`Failed to delete link: ${error.message}`, 500)
    }

    console.log('[Delete Link Success]', { 
      linkId, 
      name: existingLink.name,
      deletedAccesses: accessCount 
    })

    return successResponse({ 
      message: 'Link deleted successfully',
      deleted: {
        link_id: linkId,
        name: existingLink.name,
        accesses_deleted: accessCount || 0
      }
    })

  } catch (error) {
    console.error('[Delete Link Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
