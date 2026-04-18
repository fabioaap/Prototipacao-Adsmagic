/**
 * Handler para atualização de tags (PATCH /tags/:id)
 * 
 * Atualiza uma tag existente.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateTagSchema, extractValidationErrors, validateUUID } from '../validators/tag.ts'
import type { Tag, UpdateTagDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Atualiza uma tag
 */
export async function handleUpdate(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  tagId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(tagId)) {
      return errorResponse('Invalid tag ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Update Tag] Request body:', JSON.stringify(body, null, 2))

    // Validação com Zod
    const validationResult = updateTagSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Update Tag] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateTagDTO = validationResult.data
    console.log('[Update Tag] Validated data:', JSON.stringify(updateData, null, 2))

    // Verificar se tag existe e usuário tem acesso
    const { data: existingTag, error: fetchError } = await supabaseClient
      .from('tags')
      .select('id, project_id')
      .eq('id', tagId)
      .single()

    if (fetchError || !existingTag) {
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Tag not found', 404)
      }
      return errorResponse('Failed to fetch tag', 500)
    }

    // Verificar acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', existingTag.project_id)
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

    // Preparar dados de atualização (remover undefined)
    const updatePayload: Record<string, unknown> = {}
    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name
    }
    if (updateData.color !== undefined) {
      updatePayload.color = updateData.color
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description
    }

    if (Object.keys(updatePayload).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    console.log('[Update Tag] Updating tag:', { tagId, updatePayload })

    // Atualizar tag
    const { data: tag, error } = await supabaseClient
      .from('tags')
      .update(updatePayload)
      .eq('id', tagId)
      .select()
      .single()

    if (error) {
      console.error('[Update Tag Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '23505') {
        return errorResponse('Tag with this name already exists in this project', 409)
      }
      
      if (error.code === '23514') {
        return errorResponse('Invalid color format', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to update tag: ${error.message}`, 500)
    }

    console.log('[Update Tag Success]', { tagId, name: tag.name })

    return successResponse(tag as Tag, 200)

  } catch (error) {
    console.error('[Update Tag Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
