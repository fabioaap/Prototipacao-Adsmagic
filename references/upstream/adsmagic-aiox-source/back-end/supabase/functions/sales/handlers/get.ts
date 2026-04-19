/**
 * Handler para obter venda específica (GET /sales/:id)
 * 
 * Retorna uma venda pelo ID.
 * RLS garante que o usuário só acessa vendas dos seus projetos.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/sale.ts'
import type { Sale } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém uma venda pelo ID
 */
export async function handleGet(
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

    // Buscar venda (RLS automaticamente filtra por projeto do usuário)
    const { data: sale, error } = await supabaseClient
      .from('sales')
      .select(`
        id,
        project_id,
        contact_id,
        value,
        currency,
        date,
        status,
        origin_id,
        lost_reason,
        lost_observations,
        notes,
        tracking_params,
        metadata,
        created_at,
        updated_at
      `)
      .eq('id', saleId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Sale not found', 404)
      }
      console.error('[Get Sale Error]', error)
      return errorResponse('Failed to fetch sale', 500)
    }

    console.log('[Get Sale Success]', { saleId: sale.id })

    return successResponse(sale, 200)

  } catch (error) {
    console.error('[Get Sale Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
