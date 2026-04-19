/**
 * Handler para adicionar tag a contato (POST /contacts/:contactId/tags)
 * 
 * Associa uma tag a um contato.
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { addTagToContactSchema, extractValidationErrors, validateUUID } from '../validators/tag.ts'
import type { ContactTag } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Adiciona uma tag a um contato
 */
export async function handleAddTagToContact(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID do contato
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Add Tag to Contact] Request body:', JSON.stringify(body, null, 2))

    // Validação com Zod
    const validationResult = addTagToContactSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Add Tag to Contact] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { tag_id } = validationResult.data
    console.log('[Add Tag to Contact] Validated data:', { contactId, tagId: tag_id })

    // Verificar se contato existe e usuário tem acesso
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      if (contactError?.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }
      return errorResponse('Failed to fetch contact', 500)
    }

    // Verificar se tag existe e pertence ao mesmo projeto
    const { data: tag, error: tagError } = await supabaseClient
      .from('tags')
      .select('id, project_id')
      .eq('id', tag_id)
      .single()

    if (tagError || !tag) {
      if (tagError?.code === 'PGRST116') {
        return errorResponse('Tag not found', 404)
      }
      return errorResponse('Failed to fetch tag', 500)
    }

    // Verificar se tag e contato pertencem ao mesmo projeto
    if (tag.project_id !== contact.project_id) {
      return errorResponse('Tag and contact must belong to the same project', 400)
    }

    // Verificar se associação já existe
    const { data: existing, error: existingError } = await supabaseClient
      .from('contact_tags')
      .select('id')
      .eq('contact_id', contactId)
      .eq('tag_id', tag_id)
      .single()

    if (existing) {
      return errorResponse('Tag is already associated with this contact', 409)
    }

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('[Add Tag to Contact] Error checking existing association:', existingError)
      return errorResponse('Failed to check existing association', 500)
    }

    console.log('[Add Tag to Contact] Creating association:', { contactId, tagId: tag_id })

    // Criar associação
    const { data: contactTag, error } = await supabaseClient
      .from('contact_tags')
      .insert({
        contact_id: contactId,
        tag_id: tag_id
      })
      .select()
      .single()

    if (error) {
      console.error('[Add Tag to Contact Error]', {
        code: error.code,
        message: error.message
      })
      
      if (error.code === '23505') {
        return errorResponse('Tag is already associated with this contact', 409)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to add tag to contact: ${error.message}`, 500)
    }

    console.log('[Add Tag to Contact Success]', { contactId, tagId: tag_id })

    return successResponse(contactTag as ContactTag, 201)

  } catch (error) {
    console.error('[Add Tag to Contact Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
