/**
 * Handler para criação de vendas (POST /sales)
 * 
 * Cria uma nova venda com validação completa.
 * Verifica acesso ao projeto e existência do contato.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createSaleSchema, extractValidationErrors } from '../validators/sale.ts'
import type { Sale, CreateSaleDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/** Opções opcionais para criação (ex.: chamada interna com service role). */
export interface HandleCreateOptions {
  isInternalCall?: boolean
}

/**
 * Cria uma nova venda
 */
export async function handleCreate(
  req: Request,
  supabaseClient: SupabaseDbClient,
  options?: HandleCreateOptions
) {
  const isInternalCall = options?.isInternalCall === true
  let userId: string | null = null

  try {
    if (!isInternalCall) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
      console.log('[Create Sale] Auth check:', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message
      })
      if (authError || !user) {
        return errorResponse('Authentication required', 401)
      }
      userId = user.id
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Sale] Request body:', JSON.stringify(body, null, 2))

    // Validação com Zod
    const validationResult = createSaleSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Sale] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const saleData: CreateSaleDTO = validationResult.data
    console.log('[Create Sale] Validated data:', JSON.stringify(saleData, null, 2))

    // Verificar se o projeto existe
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', saleData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Sale] Project access check failed:', { projectError, projectCheck })
      return errorResponse('Project not found or access denied', 403)
    }

    // Chamadas internas (service role) não têm user; pular checagem de company_users
    if (!isInternalCall && userId) {
      const { data: companyCheck, error: companyError } = await supabaseClient
        .from('company_users')
        .select('company_id, role')
        .eq('company_id', projectCheck.company_id)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (companyError || !companyCheck) {
        console.error('[Create Sale] Company access check failed:', { companyError, companyCheck })
        return errorResponse('Company access denied', 403)
      }
    }

    // Verificar se o contato existe e pertence ao projeto
    const { data: contactCheck, error: contactError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', saleData.contact_id)
      .single()

    if (contactError || !contactCheck) {
      return errorResponse('Contact not found', 404)
    }

    if (contactCheck.project_id !== saleData.project_id) {
      return errorResponse('Contact does not belong to this project', 400)
    }

    // Verificar origin_id se fornecido
    if (saleData.origin_id) {
      const { data: originCheck, error: originError } = await supabaseClient
        .from('origins')
        .select('id, project_id')
        .eq('id', saleData.origin_id)
        .single()

      if (originError || !originCheck) {
        return errorResponse('Invalid origin ID', 400)
      }

      // Origin deve ser do sistema (project_id IS NULL) ou do projeto
      if (originCheck.project_id !== null && originCheck.project_id !== saleData.project_id) {
        return errorResponse('Origin does not belong to this project', 400)
      }
    }

    console.log('[Create Sale] Access verified:', { 
      projectId: saleData.project_id, 
      contactId: saleData.contact_id,
      originId: saleData.origin_id
    })

    // Criar venda (RLS validará automaticamente)
    const { data: sale, error } = await supabaseClient
      .from('sales')
      .insert({
        project_id: saleData.project_id,
        contact_id: saleData.contact_id,
        value: saleData.value,
        currency: saleData.currency ?? 'BRL',
        date: saleData.date,
        status: 'completed',
        origin_id: saleData.origin_id ?? null,
        notes: saleData.notes ?? null,
        tracking_params: saleData.tracking_params ?? {},
        metadata: saleData.metadata ?? {}
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Sale Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23503') {
        return errorResponse('Invalid project, contact or origin reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create sale: ${error.message}`, 500)
    }

    console.log('[Create Sale Success]', { saleId: sale.id, projectId: sale.project_id })

    return successResponse(sale, 201)

  } catch (error) {
    console.error('[Create Sale Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
