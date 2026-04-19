/**
 * Handler para criação de contatos (POST /contacts)
 * 
 * Cria um novo contato com validação completa
 */

import { createWriteClient } from '../utils/writeClient.ts'
import { insertContactStageHistory } from '../services/contactStageHistory.ts'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createContactSchema, extractValidationErrors } from '../validators/contact.ts'
import type { CreateContactDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
/**
 * Cria um novo contato
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('[Create Contact] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Contact] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod
    const validationResult = createContactSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Contact] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const contactData: CreateContactDTO = validationResult.data
    console.log('[Create Contact] Validated data:', JSON.stringify(contactData, null, 2))
    
    // Verificar se o usuário tem acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', contactData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Contact] Project access check failed:', { projectError, projectCheck })
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
      console.error('[Create Contact] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company access denied', 403)
    }

    // Verificar se origin_id e stage_id existem e pertencem ao projeto
    const { data: originCheck, error: originError } = await supabaseClient
      .from('origins')
      .select('id, project_id')
      .eq('id', contactData.main_origin_id)
      .single()

    if (originError || !originCheck) {
      return errorResponse('Invalid origin ID', 400)
    }

    // Origin deve ser do sistema (project_id IS NULL) ou do projeto
    if (originCheck.project_id !== null && originCheck.project_id !== contactData.project_id) {
      return errorResponse('Origin does not belong to this project', 400)
    }

    const { data: stageCheck, error: stageError } = await supabaseClient
      .from('stages')
      .select('id, project_id, type, name')
      .eq('id', contactData.current_stage_id)
      .single()

    if (stageError || !stageCheck) {
      return errorResponse('Invalid stage ID', 400)
    }

    // Stage deve ser do sistema (project_id IS NULL) ou do projeto
    if (stageCheck.project_id !== null && stageCheck.project_id !== contactData.project_id) {
      return errorResponse('Stage does not belong to this project', 400)
    }

    console.log('[Create Contact] Access verified:', {
      projectId: contactData.project_id,
      originId: contactData.main_origin_id,
      stageId: contactData.current_stage_id
    })

    // Verificar limite de contatos do plano
    const { data: canCreate, error: limitError } = await supabaseClient
      .rpc('check_contact_limit', { p_project_id: contactData.project_id })

    if (limitError) {
      console.error('[Create Contact] Contact limit check failed:', limitError)
      // Não bloquear se a verificação falhar (graceful degradation)
    } else if (canCreate === false) {
      console.log('[Create Contact] Contact limit reached for project:', contactData.project_id)
      return errorResponse('Monthly contact limit reached for this project. Please upgrade or add extra contacts.', 403)
    }

    // Criar contato (RLS validará automaticamente)
    const { data: contact, error } = await supabaseClient
      .from('contacts')
      .insert({
        project_id: contactData.project_id,
        name: contactData.name,
        phone: contactData.phone,
        country_code: contactData.country_code,
        email: contactData.email,
        company: contactData.company,
        location: contactData.location,
        notes: contactData.notes,
        avatar_url: contactData.avatar_url,
        is_favorite: contactData.is_favorite ?? false,
        main_origin_id: contactData.main_origin_id,
        current_stage_id: contactData.current_stage_id,
        metadata: contactData.metadata ?? {}
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Contact Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Contact with this phone already exists', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid project, origin or stage reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create contact: ${error.message}`, 500)
    }

    // Incrementar contador de uso de contatos
    const { error: usageError } = await supabaseClient
      .rpc('increment_contact_usage', { p_project_id: contactData.project_id })

    if (usageError) {
      console.error('[Create Contact] Usage increment failed:', usageError)
      // Não falhar a criação — o contato já foi criado
    }

    const writeClient = createWriteClient(supabaseClient)

    // Registrar origem no histórico
    await writeClient
      .from('contact_origins')
      .insert({
        contact_id: contact.id,
        origin_id: contactData.main_origin_id,
        acquired_at: new Date().toISOString()
      })

    try {
      await insertContactStageHistory(writeClient, {
        contactId: contact.id,
        stageId: contactData.current_stage_id,
        movedBy: `user:${user.id}`
      })
    } catch (stageHistoryError) {
      console.error('[Create Contact] Failed to log stage history:', {
        contactId: contact.id,
        stageId: contactData.current_stage_id,
        error: stageHistoryError instanceof Error ? stageHistoryError.message : stageHistoryError
      })
    }

    // Venda automática quando estágio é "sale": feita pelo trigger create_sale_on_contact_stage_sale (migration 047)

    console.log('[Create Contact Success]', { contactId: contact.id, projectId: contact.project_id })

    return successResponse(contact, 201)

  } catch (error) {
    console.error('[Create Contact Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
