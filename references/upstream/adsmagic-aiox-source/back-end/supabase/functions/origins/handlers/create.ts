/**
 * Handler para criação de origens (POST /origins)
 * 
 * Cria uma nova origem customizada (type = 'custom')
 * Origens system não podem ser criadas via API
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import {
  createOriginSchema,
  extractValidationErrors,
  normalizeUtmSourceMatchValue,
} from '../validators/origin.ts'
import type { Origin, CreateOriginDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

// Limite máximo de origens customizadas por projeto
const MAX_CUSTOM_ORIGINS_PER_PROJECT = 20

/**
 * Cria uma nova origem customizada
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('[Create Origin] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Origin] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = createOriginSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Origin] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const originData: CreateOriginDTO = validationResult.data
    const normalizedUtmSourceMatchValue = normalizeUtmSourceMatchValue(originData.utm_source_match_value)
    const normalizedUtmSourceMatchMode = normalizedUtmSourceMatchValue
      ? (originData.utm_source_match_mode ?? null)
      : null

    if ((normalizedUtmSourceMatchMode && !normalizedUtmSourceMatchValue)
      || (!normalizedUtmSourceMatchMode && normalizedUtmSourceMatchValue)) {
      return validationErrorResponse(
        ['utm_source_match_mode and utm_source_match_value must be provided together'],
        400
      )
    }

    console.log('[Create Origin] Validated data:', JSON.stringify(originData, null, 2))
    
    // Verificar se o usuário tem acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', originData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Origin] Project access check failed:', { projectError, projectCheck })
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
      console.error('[Create Origin] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company access denied', 403)
    }

    // Verificar limite de origens customizadas por projeto
    const { count: existingCount, error: countError } = await supabaseClient
      .from('origins')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', originData.project_id)
      .eq('type', 'custom')

    if (countError) {
      console.error('[Create Origin] Count error:', countError)
      return errorResponse('Failed to check origin limit', 500)
    }

    if ((existingCount ?? 0) >= MAX_CUSTOM_ORIGINS_PER_PROJECT) {
      return errorResponse(
        `Maximum of ${MAX_CUSTOM_ORIGINS_PER_PROJECT} custom origins per project reached`, 
        400
      )
    }

    console.log('[Create Origin] Access verified, creating origin:', { 
      projectId: originData.project_id,
      existingCount
    })

    // Criar origem customizada
    const { data: origin, error } = await supabaseClient
      .from('origins')
      .insert({
        project_id: originData.project_id,
        name: originData.name,
        type: 'custom', // Sempre 'custom' para origens criadas via API
        color: originData.color,
        icon: originData.icon ?? null,
        is_active: originData.is_active ?? true,
        utm_source_match_mode: normalizedUtmSourceMatchMode,
        utm_source_match_value: normalizedUtmSourceMatchValue,
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Origin Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Origin with this name or utm_source match rule already exists', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid project reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create origin: ${error.message}`, 500)
    }

    console.log('[Create Origin Success]', { originId: origin.id, projectId: origin.project_id })

    return successResponse(origin as Origin, 201)

  } catch (error) {
    console.error('[Create Origin Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
