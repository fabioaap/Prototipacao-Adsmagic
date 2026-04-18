/**
 * Handler para atualização de contatos (PATCH /contacts/:id)
 * 
 * Atualiza um contato existente
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateContactSchema, extractValidationErrors, validateUUID } from '../validators/contact.ts'
import type { Contact, UpdateContactDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
/**
 * Valida se um recurso (origin ou stage) pertence ao projeto
 * 
 * @param supabaseClient - Cliente Supabase
 * @param resourceId - ID do recurso a validar
 * @param projectId - ID do projeto
 * @param tableName - Nome da tabela ('origins' ou 'stages')
 * @param resourceName - Nome do recurso para mensagens de erro ('origin' ou 'stage')
 * @returns Resultado da validação com indicador de sucesso e mensagem de erro opcional
 */
async function validateResourceBelongsToProject(
  supabaseClient: SupabaseDbClient,
  resourceId: string,
  projectId: string,
  tableName: 'origins' | 'stages',
  resourceName: 'origin' | 'stage'
): Promise<{ valid: boolean; error?: string }> {
  const { data: resourceCheck, error: resourceError } = await supabaseClient
    .from(tableName)
    .select('id, project_id')
    .eq('id', resourceId)
    .single()

  if (resourceError || !resourceCheck) {
    return { valid: false, error: `Invalid ${resourceName} ID` }
  }

  if (resourceCheck.project_id !== null && resourceCheck.project_id !== projectId) {
    return { valid: false, error: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} does not belong to this project` }
  }

  return { valid: true }
}

/**
 * Valida se origin_id pertence ao projeto do contato
 */
async function validateOriginBelongsToProject(
  supabaseClient: SupabaseDbClient,
  originId: string,
  projectId: string
): Promise<{ valid: boolean; error?: string }> {
  return validateResourceBelongsToProject(supabaseClient, originId, projectId, 'origins', 'origin')
}

/**
 * Valida se stage_id pertence ao projeto do contato
 */
async function validateStageBelongsToProject(
  supabaseClient: SupabaseDbClient,
  stageId: string,
  projectId: string
): Promise<{ valid: boolean; error?: string }> {
  return validateResourceBelongsToProject(supabaseClient, stageId, projectId, 'stages', 'stage')
}

/**
 * Verifica se o usuário tem permissão para atualizar contatos no projeto
 */
async function verifyProjectAccess(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  userId: string
): Promise<{ hasAccess: boolean; error?: string; role?: string }> {
  const { data: projectUser, error: projectUserError } = await supabaseClient
    .from('project_users')
    .select('role, is_active')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (projectUserError || !projectUser) {
    return { hasAccess: false, error: 'Permission denied. Check your access to this project.' }
  }

  if (!projectUser.is_active) {
    return { hasAccess: false, error: 'Permission denied. Your access to this project is inactive.' }
  }

  const allowedRoles = ['owner', 'admin', 'manager', 'member']
  if (!allowedRoles.includes(projectUser.role)) {
    return { hasAccess: false, error: 'Permission denied. Insufficient role to update contacts.' }
  }

  return { hasAccess: true, role: projectUser.role }
}

/**
 * Constrói o payload de atualização a partir dos dados validados
 * Apenas inclui campos que foram fornecidos (não undefined)
 * 
 * @param updateData - Dados validados para atualização
 * @returns Payload parcial com apenas campos definidos
 */
function buildUpdatePayload(updateData: UpdateContactDTO): Partial<Contact> {
  const payload: Partial<Contact> = {}
  
  // Lista de campos que podem ser atualizados (mapeamento direto)
  const updatableFields: Array<keyof UpdateContactDTO> = [
    'name',
    'phone',
    'country_code',
    'email',
    'company',
    'location',
    'notes',
    'avatar_url',
    'is_favorite',
    'main_origin_id',
    'current_stage_id'
  ]

  // Adicionar campos simples (mapeamento direto)
  for (const field of updatableFields) {
    if (updateData[field] !== undefined) {
      payload[field as keyof Contact] = updateData[field] as never
    }
  }

  // Tratar metadata separadamente (requer cast específico)
  if (updateData.metadata !== undefined) {
    payload.metadata = updateData.metadata as Record<string, unknown>
  }

  return payload
}

/**
 * Cria cliente Supabase com service_role se disponível, senão usa o cliente fornecido
 */
function createUpdateClient(
  supabaseClient: SupabaseDbClient
): SupabaseDbClient {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey)
  }
  
  return supabaseClient
}

/**
 * Atualiza um contato
 */
export async function handleUpdate(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID
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
    console.log('[Update Contact] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = updateContactSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Update Contact] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateContactDTO = validationResult.data

    // Verificar se o contato existe e o usuário tem acesso
    const { data: existingContact, error: fetchError } = await supabaseClient
      .from('contacts')
      .select('id, project_id, main_origin_id, current_stage_id')
      .eq('id', contactId)
      .single()

    if (fetchError || !existingContact) {
      console.error('[Update Contact] Fetch error:', {
        code: fetchError?.code,
        message: fetchError?.message,
        details: fetchError?.details
      })
      
      if (fetchError?.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }
      
      if (fetchError?.code === '42501') {
        return errorResponse('Permission denied - cannot read contact', 403)
      }
      
      return errorResponse('Failed to fetch contact', 500)
    }

    console.log('[Update Contact] Existing contact found:', {
      contactId: existingContact.id,
      projectId: existingContact.project_id,
      userId: user.id
    })

    // Validar que origin_id e stage_id pertencem ao projeto (se fornecidos)
    if (updateData.main_origin_id) {
      const originValidation = await validateOriginBelongsToProject(
        supabaseClient,
        updateData.main_origin_id,
        existingContact.project_id
      )
      
      if (!originValidation.valid) {
        return errorResponse(originValidation.error!, 400)
      }
    }

    if (updateData.current_stage_id) {
      const stageValidation = await validateStageBelongsToProject(
        supabaseClient,
        updateData.current_stage_id,
        existingContact.project_id
      )
      
      if (!stageValidation.valid) {
        return errorResponse(stageValidation.error!, 400)
      }
    }

    // Verificar permissões do usuário no projeto
    const accessCheck = await verifyProjectAccess(
      supabaseClient,
      existingContact.project_id,
      user.id
    )

    if (!accessCheck.hasAccess) {
      console.error('[Update Contact] Project access check failed:', {
        projectId: existingContact.project_id,
        userId: user.id,
        error: accessCheck.error
      })
      return errorResponse(accessCheck.error!, 403)
    }

    // Construir payload de atualização
    const updatePayload = buildUpdatePayload(updateData)

    // Validar que há campos para atualizar
    if (Object.keys(updatePayload).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    console.log('[Update Contact] Access verified:', {
      contactId,
      projectId: existingContact.project_id,
      userId: user.id,
      role: accessCheck.role,
      updatePayload: Object.keys(updatePayload)
    })

    // Criar cliente para UPDATE (usa service_role se disponível)
    const updateClient = createUpdateClient(supabaseClient)
    console.log('[Update Contact] Using service_role:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

    // Atualizar contato
    const { data: contact, error } = await updateClient
      .from('contacts')
      .update(updatePayload)
      .eq('id', contactId)
      .select()
      .single()

    if (error) {
      console.error('[Update Contact Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        updatePayload: JSON.stringify(updatePayload),
        contactId
      })
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      // Erros específicos do PostgreSQL
      if (error.code === '23505') {
        return errorResponse('Contact with this phone already exists in this project', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid reference: origin or stage does not exist', 400)
      }
      
      if (error.code === '23502') {
        return errorResponse('Required field is missing', 400)
      }
      
      return errorResponse(`Failed to update contact: ${error.message}`, 500)
    }

    // Registrar mudança de origem no histórico (se houver)
    if (updateData.main_origin_id && updateData.main_origin_id !== existingContact.main_origin_id) {
      try {
        const { error: originHistoryError } = await updateClient
          .from('contact_origins')
          .insert({
            contact_id: contact.id,
            origin_id: updateData.main_origin_id,
            acquired_at: new Date().toISOString()
          })

        if (originHistoryError) {
          // Log mas não falha a operação se o histórico não puder ser registrado
          console.error('[Update Contact] Failed to log origin change:', {
            error: originHistoryError.message,
            code: originHistoryError.code,
            contactId: contact.id,
            originId: updateData.main_origin_id
          })
        } else {
          console.log('[Update Contact] Origin change logged successfully')
        }
      } catch (error) {
        // Log mas não falha a operação se o histórico não puder ser registrado
        console.error('[Update Contact] Exception while logging origin change:', error)
      }
    }

    // Venda automática quando estágio muda para "sale": feita pelo trigger create_sale_on_contact_stage_sale (migration 047)

    console.log('[Update Contact Success]', { contactId: contact.id })

    return successResponse(contact, 200)

  } catch (error) {
    console.error('[Update Contact Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
