import { successResponse, errorResponse } from '../../utils/response.ts'
import {
  createSupabaseAdminClient,
  ensureProjectAccess,
  getProjectIdHeader,
} from './utils.ts'
import type { SupabaseDbClient } from '../../types-db.ts'

export async function handleCheckTagInstallation(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    const projectId = getProjectIdHeader(req)
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const { data: authData, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !authData.user) {
      return errorResponse('Unauthorized', 401)
    }

    const supabaseAdmin = createSupabaseAdminClient()
    if (!supabaseAdmin) {
      return errorResponse('Server configuration error: missing service role key', 500)
    }

    const canAccessProject = await ensureProjectAccess(
      supabaseAdmin,
      projectId,
      authData.user.id
    )
    if (!canAccessProject) {
      return errorResponse('Project not found or access denied', 403)
    }

    const { data: statusRow, error } = await supabaseAdmin
      .from('tag_installation_status')
      .select('is_installed, last_verified_at, verification_count, last_verified_url')
      .eq('project_id', projectId)
      .maybeSingle()

    if (error) {
      console.error('[Tag Verification] Error checking installation:', error)
      return errorResponse('Failed to check tag installation', 500)
    }

    const isInstalled = statusRow?.is_installed ?? false

    return successResponse({
      projectId,
      scriptCode: '',
      isInstalled,
      status: isInstalled ? 'active' : 'inactive',
      lastPing: statusRow?.last_verified_at || undefined,
      eventsReceived: statusRow?.verification_count ?? 0,
      lastVerifiedUrl: statusRow?.last_verified_url || undefined,
    })
  } catch (error) {
    console.error('[Tag Verification] Check installation error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to check tag installation',
      500
    )
  }
}
