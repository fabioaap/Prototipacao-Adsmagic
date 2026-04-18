/**
 * Handler para criação de estágios (POST /stages)
 * 
 * Cria um novo estágio.
 * Valida unicidade de tipo 'sale' e 'lost' por projeto.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createStageSchema, extractValidationErrors } from '../validators/stage.ts'
import type { Stage, CreateStageDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Cria um novo estágio
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('[Create Stage] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Stage] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = createStageSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Stage] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const stageData: CreateStageDTO = validationResult.data
    console.log('[Create Stage] Validated data:', JSON.stringify(stageData, null, 2))
    
    // Verificar se o usuário tem acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', stageData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Stage] Project access check failed:', { projectError, projectCheck })
      return errorResponse('Project not found or access denied', 403)
    }

    // Verificar se o usuário tem acesso à empresa do projeto
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('company_id, role')
      .eq('company_id', projectCheck.company_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      console.error('[Create Stage] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company access denied', 403)
    }

    // Validar unicidade de tipo 'sale' e 'lost' por projeto
    if (stageData.type === 'sale' || stageData.type === 'lost') {
      const { data: existingTypeStage, error: typeError } = await supabaseClient
        .from('stages')
        .select('id, name')
        .eq('project_id', stageData.project_id)
        .eq('type', stageData.type)
        .maybeSingle()

      if (typeError) {
        console.error('[Create Stage] Type check error:', typeError)
        return errorResponse('Failed to validate stage type', 500)
      }

      if (existingTypeStage) {
        return errorResponse(
          `A stage with type '${stageData.type}' already exists in this project: "${existingTypeStage.name}"`, 
          400
        )
      }
    }

    // Verificar conflito de display_order e ajustar se necessário
    const { data: existingOrders, error: orderError } = await supabaseClient
      .from('stages')
      .select('display_order')
      .eq('project_id', stageData.project_id)
      .order('display_order', { ascending: false })
      .limit(1)

    if (orderError) {
      console.error('[Create Stage] Order check error:', orderError)
    }

    // Se já existe um estágio com esta ordem, usar MAX + 1
    let finalDisplayOrder = stageData.display_order
    if (existingOrders && existingOrders.length > 0) {
      const maxOrder = existingOrders[0].display_order
      if (stageData.display_order <= maxOrder) {
        // Verificar se há conflito
        const { data: conflictCheck } = await supabaseClient
          .from('stages')
          .select('id')
          .eq('project_id', stageData.project_id)
          .eq('display_order', stageData.display_order)
          .maybeSingle()

        if (conflictCheck) {
          // Usar o próximo número disponível
          finalDisplayOrder = maxOrder + 1
          console.log('[Create Stage] Adjusted display_order:', { 
            requested: stageData.display_order, 
            actual: finalDisplayOrder 
          })
        }
      }
    }

    console.log('[Create Stage] Access verified, creating stage:', { 
      projectId: stageData.project_id,
      type: stageData.type,
      displayOrder: finalDisplayOrder
    })

    // Criar estágio
    const { data: stage, error } = await supabaseClient
      .from('stages')
      .insert({
        project_id: stageData.project_id,
        name: stageData.name,
        display_order: finalDisplayOrder,
        color: stageData.color ?? null,
        tracking_phrase: stageData.tracking_phrase ?? null,
        type: stageData.type,
        is_active: stageData.is_active ?? true,
        event_config: stageData.event_config ?? null
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Stage Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Stage with this name or order already exists', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid project reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create stage: ${error.message}`, 500)
    }

    console.log('[Create Stage Success]', { stageId: stage.id, projectId: stage.project_id, type: stage.type })

    return successResponse(stage as Stage, 201)

  } catch (error) {
    console.error('[Create Stage Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
