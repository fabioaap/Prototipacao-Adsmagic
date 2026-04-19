/**
 * Handler para deleção de tags (DELETE /tags/:id)
 * 
 * Deleta uma tag.
 * Remove automaticamente todas as associações com contatos (via CASCADE).
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/tag.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta uma tag
 */
export async function handleDelete(
  _req: Request, 
  supabaseClient: SupabaseDbClient,
  tagId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(tagId)) {
      return errorResponse('Invalid tag ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    console.log('[Delete Tag] Checking tag:', tagId)

    // Buscar tag existente
    const { data: existingTag, error: fetchError } = await supabaseClient
      .from('tags')
      .select('id, project_id, name')
      .eq('id', tagId)
      .single()

    if (fetchError || !existingTag) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Tag not found', 404)
      }
      return errorResponse('Failed to fetch tag', 500)
    }

    // Verificar acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', existingTag.project_id)
      .single()

    if (projectError || !projectCheck) {
      return errorResponse('Project access denied', 403)
    }

    // Verificar acesso à empresa
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('company_id')
      .eq('company_id', projectCheck.company_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      return errorResponse('Company access denied', 403)
    }

    console.log('[Delete Tag] No dependencies to check (CASCADE handles contact_tags), deleting:', tagId)

    // Deletar tag (contact_tags será deletado automaticamente via CASCADE)
    const { error } = await supabaseClient
      .from('tags')
      .delete()
      .eq('id', tagId)

    if (error) {
      console.error('[Delete Tag Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      if (error.code === '23503') {
        return errorResponse('Cannot delete tag: there are dependencies', 409)
      }
      
      return errorResponse(`Failed to delete tag: ${error.message}`, 500)
    }

    console.log('[Delete Tag Success]', { tagId, name: existingTag.name })

    return successResponse({ 
      message: 'Tag deleted successfully', 
      id: tagId,
      name: existingTag.name
    }, 200)

  } catch (error) {
    console.error('[Delete Tag Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
