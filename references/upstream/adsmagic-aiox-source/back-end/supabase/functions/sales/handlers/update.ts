/**
 * Handler para atualização de vendas (PATCH /sales/:id)
 * 
 * Atualiza uma venda existente.
 * Não permite atualizar status diretamente (usar mark-lost para isso).
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateSaleSchema, extractValidationErrors, validateUUID } from '../validators/sale.ts'
import type { Sale, UpdateSaleDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Atualiza uma venda
 */
export async function handleUpdate(
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
    console.log('[Update Sale] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = updateSaleSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Update Sale] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateSaleDTO = validationResult.data

    // Verificar se a venda existe e o usuário tem acesso
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

    // Se está atualizando origin_id, validar que pertence ao projeto
    if (updateData.origin_id) {
      const { data: originCheck, error: originError } = await supabaseClient
        .from('origins')
        .select('id, project_id')
        .eq('id', updateData.origin_id)
        .single()

      if (originError || !originCheck) {
        return errorResponse('Invalid origin ID', 400)
      }

      if (originCheck.project_id !== null && originCheck.project_id !== existingSale.project_id) {
        return errorResponse('Origin does not belong to this project', 400)
      }
    }

    // Construir payload de atualização
    const updatePayload: Partial<Sale> = {}
    
    if (updateData.value !== undefined) updatePayload.value = updateData.value
    if (updateData.currency !== undefined) updatePayload.currency = updateData.currency
    if (updateData.date !== undefined) updatePayload.date = updateData.date
    if (updateData.origin_id !== undefined) updatePayload.origin_id = updateData.origin_id
    if (updateData.notes !== undefined) updatePayload.notes = updateData.notes
    if (updateData.tracking_params !== undefined) updatePayload.tracking_params = updateData.tracking_params
    if (updateData.metadata !== undefined) updatePayload.metadata = updateData.metadata

    // Atualizar venda (RLS validará automaticamente)
    const { data: sale, error } = await supabaseClient
      .from('sales')
      .update(updatePayload)
      .eq('id', saleId)
      .select()
      .single()

    if (error) {
      console.error('[Update Sale Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to update sale: ${error.message}`, 500)
    }

    console.log('[Update Sale Success]', { saleId: sale.id })

    return successResponse(sale, 200)

  } catch (error) {
    console.error('[Update Sale Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
