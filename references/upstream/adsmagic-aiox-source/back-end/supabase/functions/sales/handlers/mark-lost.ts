/**
 * Handler para marcar venda como perdida (PATCH /sales/:id/lost)
 * 
 * Atualiza o status de uma venda para 'lost' com motivo obrigatório.
 * Também permite recuperar uma venda perdida (revertendo para 'completed').
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { markSaleLostSchema, extractValidationErrors, validateUUID } from '../validators/sale.ts'
import type { Sale, MarkSaleLostDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Marca uma venda como perdida
 */
export async function handleMarkLost(
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

    // Parse do body
    const body = await req.json()
    console.log('[Mark Sale Lost] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = markSaleLostSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Mark Sale Lost] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const lostData: MarkSaleLostDTO = validationResult.data

    // Verificar se a venda existe
    const { data: existingSale, error: fetchError } = await supabaseClient
      .from('sales')
      .select('id, project_id, status')
      .eq('id', saleId)
      .single()

    if (fetchError || !existingSale) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Sale not found', 404)
      }
      return errorResponse('Failed to fetch sale', 500)
    }

    // Verificar se já está perdida
    if (existingSale.status === 'lost') {
      return errorResponse('Sale is already marked as lost', 400)
    }

    // Atualizar venda para perdida
    const { data: sale, error } = await supabaseClient
      .from('sales')
      .update({
        status: 'lost',
        lost_reason: lostData.lost_reason,
        lost_observations: lostData.lost_observations ?? null
      })
      .eq('id', saleId)
      .select()
      .single()

    if (error) {
      console.error('[Mark Sale Lost Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to mark sale as lost: ${error.message}`, 500)
    }

    console.log('[Mark Sale Lost Success]', { 
      saleId: sale.id, 
      reason: lostData.lost_reason 
    })

    return successResponse(sale, 200)

  } catch (error) {
    console.error('[Mark Sale Lost Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}

/**
 * Recupera uma venda perdida (volta para status 'completed')
 * Pode ser chamado via PATCH /sales/:id com body { status: 'completed' }
 */
export async function handleRecoverSale(
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

    // Verificar se a venda existe e está perdida
    const { data: existingSale, error: fetchError } = await supabaseClient
      .from('sales')
      .select('id, project_id, status')
      .eq('id', saleId)
      .single()

    if (fetchError || !existingSale) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Sale not found', 404)
      }
      return errorResponse('Failed to fetch sale', 500)
    }

    if (existingSale.status !== 'lost') {
      return errorResponse('Sale is not marked as lost', 400)
    }

    // Recuperar venda
    const { data: sale, error } = await supabaseClient
      .from('sales')
      .update({
        status: 'completed',
        lost_reason: null,
        lost_observations: null
      })
      .eq('id', saleId)
      .select()
      .single()

    if (error) {
      console.error('[Recover Sale Error]', error)
      return errorResponse(`Failed to recover sale: ${error.message}`, 500)
    }

    console.log('[Recover Sale Success]', { saleId: sale.id })

    return successResponse(sale, 200)

  } catch (error) {
    console.error('[Recover Sale Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
