/**
 * Handler para completar wizard de projeto (PATCH /projects/:id/complete)
 * 
 * Finaliza o wizard e ativa o projeto, limpando dados de progresso
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/project.ts'
import type { Project } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Completa o wizard e ativa o projeto
 */
export async function handleComplete(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  projectId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(projectId)) {
      return errorResponse('Invalid project ID format', 400)
    }

    // Parse do body (opcional - pode ter campos adicionais)
    let body: any = {}
    try {
      const text = await req.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch {
      // Body vazio ou inválido - usar defaults
    }

    // Verificar se projeto existe e usuário tem acesso (RLS fará isso automaticamente)
    const { data: existingProject, error: fetchError } = await supabaseClient
      .from('projects')
      .select('id, status, wizard_progress, wizard_current_step')
      .eq('id', projectId)
      .single()

    if (fetchError || !existingProject) {
      return errorResponse('Project not found or access denied', 404)
    }

    // Validar que projeto está em draft
    if (existingProject.status !== 'draft') {
      return errorResponse(
        `Cannot complete project: Project is already ${existingProject.status}. Only draft projects can be completed.`,
        400
      )
    }

    // Preparar dados para atualização
    const updateFields: any = {
      status: 'active',
      wizard_progress: null,
      wizard_current_step: null,
      wizard_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Permitir sobrescrever status se fornecido no body (útil para testes)
    if (body.status && ['active', 'paused'].includes(body.status)) {
      updateFields.status = body.status
    }

    // Atualizar projeto (RLS validará automaticamente se usuário tem permissão)
    const { data: project, error } = await supabaseClient
      .from('projects')
      .update(updateFields)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('[Complete Project Error]', error)
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Project with this name already exists', 409)
      }
      
      return errorResponse('Failed to complete project', 500)
    }

    console.log('[Complete Project Success]', { 
      projectId: project.id, 
      previousStatus: existingProject.status,
      newStatus: project.status,
      wizardCompletedAt: project.wizard_completed_at
    })

    return successResponse(project, 200)

  } catch (error) {
    console.error('[Complete Project Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}

