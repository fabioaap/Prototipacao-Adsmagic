/**
 * Handler para criação de tags (POST /tags)
 * 
 * Cria uma nova tag no projeto.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createTagSchema, extractValidationErrors } from '../validators/tag.ts'
import type { Tag, CreateTagDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Cria uma nova tag
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('[Create Tag] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Tag] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = createTagSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Tag] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const tagData: CreateTagDTO = validationResult.data
    console.log('[Create Tag] Validated data:', JSON.stringify(tagData, null, 2))
    
    // Verificar se o usuário tem acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', tagData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Tag] Project access check failed:', { projectError, projectCheck })
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
      console.error('[Create Tag] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company access denied', 403)
    }

    console.log('[Create Tag] Access verified, creating tag:', { 
      projectId: tagData.project_id
    })

    // Criar tag
    const { data: tag, error } = await supabaseClient
      .from('tags')
      .insert({
        project_id: tagData.project_id,
        name: tagData.name,
        color: tagData.color,
        description: tagData.description ?? null
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Tag Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Tag with this name already exists in this project', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid project reference', 400)
      }
      
      if (error.code === '23514') {
        return errorResponse('Invalid color format', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create tag: ${error.message}`, 500)
    }

    console.log('[Create Tag Success]', { tagId: tag.id, projectId: tag.project_id })

    return successResponse(tag as Tag, 201)

  } catch (error) {
    console.error('[Create Tag Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
