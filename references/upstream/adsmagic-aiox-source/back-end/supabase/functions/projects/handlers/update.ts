/**
 * Handler para atualização de projetos (PATCH /projects/:id)
 * 
 * Atualiza um projeto existente com validação
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateProjectSchema, extractValidationErrors, validateUUID } from '../validators/project.ts'
import type { Project, UpdateProjectDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Atualiza um projeto existente
 */
export async function handleUpdate(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  projectId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(projectId)) {
      return errorResponse('Invalid project ID format', 400)
    }

    // Parse do body
    const body = await req.json()
    
    // Validação com Zod
    const validationResult = updateProjectSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateProjectDTO = validationResult.data

    // Verificar se projeto existe e usuário tem acesso (RLS fará isso automaticamente)
    const { data: existingProject, error: fetchError } = await supabaseClient
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single()

    if (fetchError || !existingProject) {
      return errorResponse('Project not found or access denied', 404)
    }

    // Preparar dados para atualização
    const updateFields: any = {
      updated_at: new Date().toISOString()
    }

    // Adicionar apenas campos que foram fornecidos
    if (updateData.name !== undefined) updateFields.name = updateData.name
    if (updateData.description !== undefined) updateFields.description = updateData.description
    if (updateData.status !== undefined) updateFields.status = updateData.status
    if (updateData.wizard_progress !== undefined) updateFields.wizard_progress = updateData.wizard_progress
    if (updateData.wizard_current_step !== undefined) updateFields.wizard_current_step = updateData.wizard_current_step
    if (updateData.wizard_completed_at !== undefined) updateFields.wizard_completed_at = updateData.wizard_completed_at
    if (updateData.whatsapp_connected !== undefined) updateFields.whatsapp_connected = updateData.whatsapp_connected
    if (updateData.meta_ads_connected !== undefined) updateFields.meta_ads_connected = updateData.meta_ads_connected
    if (updateData.google_ads_connected !== undefined) updateFields.google_ads_connected = updateData.google_ads_connected
    if (updateData.tiktok_ads_connected !== undefined) updateFields.tiktok_ads_connected = updateData.tiktok_ads_connected

    // Atualizar projeto (RLS validará automaticamente se usuário tem permissão)
    const { data: project, error } = await supabaseClient
      .from('projects')
      .update(updateFields)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('[Update Project Error]', error)
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return errorResponse('Project with this name already exists', 409)
      }
      
      return errorResponse('Failed to update project', 500)
    }

    console.log('[Update Project Success]', { projectId: project.id, updatedFields: Object.keys(updateFields) })

    return successResponse(project, 200)

  } catch (error) {
    console.error('[Update Project Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
