/**
 * Handler para deleção de vendas (DELETE /sales/:id)
 * 
 * Deleta uma venda existente.
 * Apenas usuários com role owner, admin ou manager podem deletar.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/sale.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta uma venda
 */
export async function handleDelete(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  saleId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(saleId)) {
      return errorResponse('Invalid sale ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Verificar se a venda existe e o usuário tem acesso
    const { data: existingSale, error: fetchError } = await supabaseClient
      .from('sales')
      .select('id, project_id')
      .eq('id', saleId)
      .single()

    if (fetchError || !existingSale) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Sale not found', 404)
      }
      return errorResponse('Failed to fetch sale', 500)
    }

    // Deletar venda (RLS validará automaticamente)
    const { error } = await supabaseClient
      .from('sales')
      .delete()
      .eq('id', saleId)

    if (error) {
      console.error('[Delete Sale Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to delete sale: ${error.message}`, 500)
    }

    console.log('[Delete Sale Success]', { saleId })

    return successResponse({ message: 'Sale deleted successfully', id: saleId }, 200)

  } catch (error) {
    console.error('[Delete Sale Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
