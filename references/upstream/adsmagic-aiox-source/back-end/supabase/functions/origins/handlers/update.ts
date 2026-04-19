/**
 * Handler para atualização de origens (PATCH /origins/:id)
 * 
 * Atualiza uma origem existente.
 * Origens system (type = 'system') NÃO podem ser alteradas.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import {
  updateOriginSchema,
  extractValidationErrors,
  normalizeUtmSourceMatchValue,
  validateUUID,
} from '../validators/origin.ts'
import type { Origin, UpdateOriginDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Atualiza uma origem
 */
export async function handleUpdate(
  req: Request, 
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

    // Buscar origem existente
    const { data: existingOrigin, error: fetchError } = await supabaseClient
      .from('origins')
      .select('id, project_id, type, name, color, icon, is_active, utm_source_match_mode, utm_source_match_value')
      .eq('id', originId)
      .single()

    if (fetchError || !existingOrigin) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Origin not found', 404)
      }
      return errorResponse('Failed to fetch origin', 500)
    }

    // Bloquear atualização de origens system
    if (existingOrigin.type === 'system') {
      return errorResponse('System origins cannot be modified', 403)
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

    // Parse do body
    const body = await req.json()
    console.log('[Update Origin] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = updateOriginSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Update Origin] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateOriginDTO = validationResult.data

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    const incomingModeProvided = Object.prototype.hasOwnProperty.call(updateData, 'utm_source_match_mode')
    const incomingValueProvided = Object.prototype.hasOwnProperty.call(updateData, 'utm_source_match_value')
    const incomingMode = incomingModeProvided ? (updateData.utm_source_match_mode ?? null) : undefined
    const incomingValue = incomingValueProvided ? normalizeUtmSourceMatchValue(updateData.utm_source_match_value) : undefined

    let nextMode = incomingModeProvided
      ? (incomingMode ?? null)
      : ((existingOrigin as Record<string, unknown>).utm_source_match_mode as 'exact' | 'contains' | null)

    let nextValue = incomingValueProvided
      ? (incomingValue ?? null)
      : normalizeUtmSourceMatchValue((existingOrigin as Record<string, unknown>).utm_source_match_value as string | null)

    // Limpeza automática em updates parciais: se o valor for removido, remove o modo também.
    if (incomingValueProvided && nextValue === null && !incomingModeProvided) {
      nextMode = null
    }

    // Limpeza automática em updates parciais: se o modo for removido, remove o valor também.
    if (incomingModeProvided && nextMode === null && !incomingValueProvided) {
      nextValue = null
    }

    if ((nextMode && !nextValue) || (!nextMode && nextValue)) {
      return validationErrorResponse(
        ['utm_source_match_mode and utm_source_match_value must be provided together'],
        400
      )
    }

    // Construir payload de atualização
    const updatePayload: Partial<Origin> = {}
    
    if (updateData.name !== undefined) updatePayload.name = updateData.name
    if (updateData.color !== undefined) updatePayload.color = updateData.color
    if (updateData.icon !== undefined) updatePayload.icon = updateData.icon
    if (updateData.is_active !== undefined) updatePayload.is_active = updateData.is_active
    if (incomingModeProvided || incomingValueProvided) {
      updatePayload.utm_source_match_mode = nextMode
      updatePayload.utm_source_match_value = nextValue
    }

    console.log('[Update Origin] Updating:', { originId, updatePayload })

    // Atualizar origem
    const { data: origin, error } = await supabaseClient
      .from('origins')
      .update(updatePayload)
      .eq('id', originId)
      .select()
      .single()

    if (error) {
      console.error('[Update Origin Error]', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      if (error.code === '23505') {
        return errorResponse('Origin with this name or utm_source match rule already exists', 409)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to update origin: ${error.message}`, 500)
    }

    console.log('[Update Origin Success]', { originId: origin.id })

    return successResponse(origin as Origin, 200)

  } catch (error) {
    console.error('[Update Origin Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
