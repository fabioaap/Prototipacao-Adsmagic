/**
 * Handler para deleção de origens (DELETE /origins/:id)
 * 
 * Deleta uma origem customizada.
 * Origens system (type = 'system') NÃO podem ser deletadas.
 * Verifica dependências antes de deletar.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/origin.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta uma origem
 */
export async function handleDelete(
  _req: Request, 
  supabaseClient: SupabaseDbClient,
  originId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(originId)) {
      return errorResponse('Invalid origin ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    console.log('[Delete Origin] Checking origin:', originId)

    // Buscar origem existente
    const { data: existingOrigin, error: fetchError } = await supabaseClient
      .from('origins')
      .select('id, project_id, type, name')
      .eq('id', originId)
      .single()

    if (fetchError || !existingOrigin) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Origin not found', 404)
      }
      return errorResponse('Failed to fetch origin', 500)
    }

    // Bloquear deleção de origens system
    if (existingOrigin.type === 'system') {
      return errorResponse('System origins cannot be deleted', 403)
    }

    // Verificar acesso ao projeto da origem
    if (existingOrigin.project_id) {
      const { data: projectCheck, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, company_id')
        .eq('id', existingOrigin.project_id)
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
    }

    // Verificar dependências: contatos usando esta origem como main_origin_id
    const { count: contactsUsingOrigin, error: contactsError } = await supabaseClient
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('main_origin_id', originId)

    if (contactsError) {
      console.error('[Delete Origin] Error checking contact dependencies:', contactsError)
      return errorResponse('Failed to check dependencies', 500)
    }

    if ((contactsUsingOrigin ?? 0) > 0) {
      return errorResponse(
        `Cannot delete origin: ${contactsUsingOrigin} contact(s) are using this origin as main origin`, 
        409
      )
    }

    // Verificar dependências: histórico de origens (contact_origins)
    const { count: historyCount, error: historyError } = await supabaseClient
      .from('contact_origins')
      .select('id', { count: 'exact', head: true })
      .eq('origin_id', originId)

    if (historyError) {
      console.error('[Delete Origin] Error checking history dependencies:', historyError)
      return errorResponse('Failed to check dependencies', 500)
    }

    if ((historyCount ?? 0) > 0) {
      return errorResponse(
        `Cannot delete origin: ${historyCount} contact history record(s) reference this origin`, 
        409
      )
    }

    // Verificar dependências: vendas usando esta origem
    const { count: salesCount, error: salesError } = await supabaseClient
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .eq('origin_id', originId)

    if (salesError) {
      console.error('[Delete Origin] Error checking sales dependencies:', salesError)
      return errorResponse('Failed to check dependencies', 500)
    }

    if ((salesCount ?? 0) > 0) {
      return errorResponse(
        `Cannot delete origin: ${salesCount} sale(s) are using this origin`, 
        409
      )
    }

    console.log('[Delete Origin] No dependencies found, deleting:', originId)

    // Deletar origem
    const { error } = await supabaseClient
      .from('origins')
      .delete()
      .eq('id', originId)

    if (error) {
      console.error('[Delete Origin Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      if (error.code === '23503') {
        return errorResponse('Cannot delete origin: there are dependencies', 409)
      }
      
      return errorResponse(`Failed to delete origin: ${error.message}`, 500)
    }

    console.log('[Delete Origin Success]', { originId, name: existingOrigin.name })

    return successResponse({ 
      message: 'Origin deleted successfully', 
      id: originId,
      name: existingOrigin.name
    }, 200)

  } catch (error) {
    console.error('[Delete Origin Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
