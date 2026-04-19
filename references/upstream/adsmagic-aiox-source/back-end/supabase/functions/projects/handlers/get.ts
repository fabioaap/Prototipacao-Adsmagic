/**
 * Handler para obtenção de projeto específico (GET /projects/:id)
 * 
 * Retorna um projeto específico com validação de acesso
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/project.ts'
import type { Project } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém um projeto específico
 */
export async function handleGet(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  projectId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(projectId)) {
      return errorResponse('Invalid project ID format', 400)
    }

    // Buscar projeto (RLS validará automaticamente se usuário tem acesso)
    const { data: project, error } = await supabaseClient
      .from('projects')
      .select(`
        id,
        company_id,
        created_by,
        name,
        description,
        company_type,
        franchise_count,
        country,
        language,
        currency,
        timezone,
        attribution_model,
        whatsapp_connected,
        meta_ads_connected,
        google_ads_connected,
        tiktok_ads_connected,
        status,
        wizard_progress,
        wizard_current_step,
        wizard_completed_at,
        created_at,
        updated_at
      `)
      .eq('id', projectId)
      .single()

    if (error || !project) {
      console.error('[Get Project Error]', error)
      return errorResponse('Project not found or access denied', 404)
    }

    console.log('[Get Project Success]', { projectId: project.id, companyId: project.company_id })

    return successResponse(project, 200)

  } catch (error) {
    console.error('[Get Project Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
