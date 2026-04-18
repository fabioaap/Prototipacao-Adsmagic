/**
 * Get Audit Logs Handler
 * Returns audit logs for an integration
 */

import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseAuditLogRepository } from '../../repositories/AuditLogRepository.ts'
import type { SupabaseDbClient } from '../../types-db.ts'

/**
 * Handle get audit logs request
 * Returns audit logs for the integration
 */
export async function handleGetAuditLogs(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Get Audit Logs] Processing for integration:', integrationId)

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Get project ID from header
    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    // Get limit from query params
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)

    // Get integration
    const integrationRepo = new SupabaseIntegrationRepository()
    const integration = await integrationRepo.findById(integrationId, supabaseClient)

    if (!integration) {
      return errorResponse('Integration not found', 404)
    }

    // Verify integration belongs to project
    if (integration.project_id !== projectId) {
      return errorResponse('Integration does not belong to this project', 403)
    }

    // Get audit logs
    const auditRepo = new SupabaseAuditLogRepository()
    const logs = await auditRepo.findByIntegration(integrationId, supabaseClient, limit)

    console.log('[Get Audit Logs] Success:', { count: logs.length })

    return successResponse({
      logs,
      count: logs.length,
    })
  } catch (error) {
    console.error('[Get Audit Logs] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get audit logs',
      500
    )
  }
}
