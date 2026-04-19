/**
 * List Integrations Handler
 * Returns all integrations for a project
 * 
 * ✅ Conformidade:
 * - SRP: Apenas lista integrações
 * - Type-safe: Tipos explícitos
 * - Error handling: Try-catch específico
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

export interface ListIntegrationsResponse {
  integrations: Array<{
    id: string
    project_id: string
    platform: string
    platform_type: string
    status: string
    platform_config: Record<string, unknown>
    created_at: string
    updated_at: string
  }>
}

/**
 * Handle list integrations request
 * Returns all integrations for a project
 */
export async function handleListIntegrations(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    console.log('[List Integrations] Processing request')

    // ✅ Autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('[List Integrations] Auth error:', authError)
      return errorResponse('Unauthorized', 401)
    }

    // ✅ Validação: Project ID
    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    // ✅ Service role client (para contornar RLS se necessário)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // ✅ Buscar integrações do projeto
    const { data: integrations, error: fetchError } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[List Integrations] Error fetching integrations:', fetchError)
      return errorResponse(`Failed to fetch integrations: ${fetchError.message}`, 500)
    }

    // ✅ Mapear resposta (apenas campos necessários)
    const response: ListIntegrationsResponse = {
      integrations: (integrations || []).map(integration => ({
        id: integration.id,
        project_id: integration.project_id,
        platform: integration.platform,
        platform_type: integration.platform_type,
        status: integration.status,
        platform_config: integration.platform_config || {},
        created_at: integration.created_at,
        updated_at: integration.updated_at,
      })),
    }

    console.log('[List Integrations] Success:', {
      projectId,
      count: response.integrations.length,
    })

    return successResponse(response.integrations) // Retornar array diretamente para compatibilidade com frontend
  } catch (error) {
    console.error('[List Integrations] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to list integrations',
      500
    )
  }
}

