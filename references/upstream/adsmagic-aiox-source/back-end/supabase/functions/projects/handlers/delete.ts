/**
 * Handler para deleção de projetos (DELETE /projects/:id)
 * 
 * Deleta um projeto draft com validação de permissões
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/project.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Deleta um projeto
 */
export async function handleDelete(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  projectId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(projectId)) {
      return errorResponse('Invalid project ID format', 400)
    }

    // Verificar se projeto existe e usuário tem acesso (RLS fará isso automaticamente)
    const { data: project, error: fetchError } = await supabaseClient
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return errorResponse('Project not found or access denied', 404)
    }

    // Verificar se projeto está em status 'draft' (apenas drafts podem ser deletados)
    if (project.status !== 'draft') {
      return errorResponse('Only draft projects can be deleted', 400)
    }

    // Deletar projeto (RLS validará automaticamente se usuário tem permissão)
    const { error } = await supabaseClient
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('[Delete Project Error]', error)
      return errorResponse('Failed to delete project', 500)
    }

    console.log('[Delete Project Success]', { projectId })

    // Retornar 204 No Content
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      }
    })

  } catch (error) {
    console.error('[Delete Project Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
