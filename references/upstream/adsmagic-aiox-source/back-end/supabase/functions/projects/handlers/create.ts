/**
 * Handler para criação de projetos (POST /projects)
 * 
 * Cria um novo projeto draft com validação completa
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createProjectSchema, extractValidationErrors } from '../validators/project.ts'
import type { Project, CreateProjectDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Database } from '../../../types/database.types.ts'

/**
 * Cria um novo projeto
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    console.log('[Create Project] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body
    const body = await req.json()
    console.log('[Create Project] Request body:', JSON.stringify(body, null, 2))
    
    // Validação com Zod - mais permissiva para wizard_progress
    const validationResult = createProjectSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Project] Validation failed:', validationResult.error)
      console.error('[Create Project] Validation errors details:', validationResult.error.issues)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const projectData: CreateProjectDTO = validationResult.data
    console.log('[Create Project] Validated data:', JSON.stringify(projectData, null, 2))
    
    // Sanitizar wizard_progress se necessário
    if (projectData.wizard_progress && typeof projectData.wizard_progress === 'object') {
      projectData.wizard_progress = JSON.stringify(projectData.wizard_progress)
    }

    // Verificar se o usuário autenticado (do JWT) tem acesso à empresa
    // IMPORTANTE: Usar user.id do JWT verificado, não o created_by do payload
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('company_id, role')
      .eq('company_id', projectData.company_id)
      .eq('user_id', user.id) // Usar user.id do JWT, não projectData.created_by
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      console.error('[Create Project] Company access check failed:', { 
        companyError, 
        companyCheck,
        userId: user.id,
        companyId: projectData.company_id
      })
      return errorResponse('Company not found or access denied', 403)
    }

    if (!['owner', 'admin'].includes(companyCheck.role)) {
      console.error('[Create Project] Insufficient permissions:', { role: companyCheck.role })
      return errorResponse('Insufficient permissions to create project', 403)
    }

    console.log('[Create Project] Company access verified:', { 
      companyId: projectData.company_id, 
      role: companyCheck.role,
      userId: user.id
    })

    // Usar service_role para INSERT pois a verificação manual já foi feita
    // Isso evita problemas com políticas RLS em subqueries
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    
    // Se service_role não disponível, usar cliente normal (pode falhar com RLS)
    const insertClient = serviceRoleKey 
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabaseClient

    console.log('[Create Project] Using service_role:', !!serviceRoleKey)

    // Criar projeto
    // IMPORTANTE: Usar user.id do JWT verificado para created_by
    console.log('[Create Project] Inserting project with data:', {
      company_id: projectData.company_id,
      created_by: user.id,
      name: projectData.name,
      description: projectData.description,
      company_type: projectData.company_type,
      franchise_count: projectData.franchise_count,
      country: projectData.country,
      language: projectData.language,
      currency: projectData.currency,
      timezone: projectData.timezone,
      attribution_model: projectData.attribution_model,
      status: projectData.status ?? 'draft',
      wizard_current_step: projectData.wizard_current_step
    })
    
    const { data: project, error } = await insertClient
      .from('projects')
      .insert({
        company_id: projectData.company_id,
        created_by: user.id, // Usar user.id do JWT verificado
        name: projectData.name,
        description: projectData.description,
        company_type: projectData.company_type,
        franchise_count: projectData.franchise_count,
        country: projectData.country,
        language: projectData.language,
        currency: projectData.currency,
        timezone: projectData.timezone,
        attribution_model: projectData.attribution_model,
        whatsapp_connected: projectData.whatsapp_connected ?? false,
        meta_ads_connected: projectData.meta_ads_connected ?? false,
        google_ads_connected: projectData.google_ads_connected ?? false,
        tiktok_ads_connected: projectData.tiktok_ads_connected ?? false,
        status: projectData.status ?? 'draft',
        wizard_progress: projectData.wizard_progress,
        wizard_current_step: projectData.wizard_current_step
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Project Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      })
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Project with this name already exists', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid company or user reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create project: ${error.message}`, 500)
    }

    console.log('[Create Project Success]', { projectId: project.id, companyId: project.company_id })

    // Adicionar usuário como owner do projeto em project_users
    // Isso é necessário para que o usuário possa acessar o projeto (política RLS de SELECT)
    const { error: projectUserError } = await insertClient
      .from('project_users')
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: 'owner',
        is_active: true
      })

    if (projectUserError) {
      console.error('[Create Project] Failed to add user to project:', projectUserError)
      // Não falhar a criação, mas logar o erro
      // O usuário ainda pode não ter acesso ao projeto
    } else {
      console.log('[Create Project] User added to project as owner')
    }

    return successResponse(project, 201)

  } catch (error) {
    console.error('[Create Project Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
