/**
 * Handler para exclusão de empresa (DELETE /companies/:id)
 * 
 * Deleta uma empresa (soft delete) com validação de permissão
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/company.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta uma empresa (soft delete)
 */
export async function handleDelete(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  companyId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(companyId)) {
      return errorResponse('Invalid company ID format', 400)
    }

    const userId = (await supabaseClient.auth.getUser()).data.user?.id

    if (!userId) {
      return errorResponse('User not found', 401)
    }

    // Verificar se empresa existe e usuário tem acesso
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('role, companies(id, name)')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      console.error('[Delete Company] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company not found or access denied', 404)
    }

    // Verificar permissão (apenas owner)
    if (companyCheck.role !== 'owner') {
      console.error('[Delete Company] Insufficient permissions:', { role: companyCheck.role })
      return errorResponse('Only company owners can delete companies', 403)
    }

    console.log('[Delete Company] Company access verified:', { companyId, role: companyCheck.role })

    // Soft delete: marcar como inativo
    const { error: deleteError } = await supabaseClient
      .from('companies')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)

    if (deleteError) {
      console.error('[Delete Company] Delete failed:', deleteError)
      return errorResponse('Failed to delete company', 500)
    }

    const company = Array.isArray(companyCheck.companies)
      ? companyCheck.companies[0]
      : companyCheck.companies

    console.log(
      '[Delete Company] Company deleted successfully:',
      company?.name ?? companyId
    )

    return successResponse({ message: 'Company deleted successfully' }, 200)

  } catch (error) {
    console.error('[Delete Company Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
