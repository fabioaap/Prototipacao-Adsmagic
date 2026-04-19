import { successResponse, errorResponse } from '../../utils/response.ts'
import {
  createSupabaseAdminClient,
  ensureProjectAccess,
  getProjectIdHeader,
} from './utils.ts'
import type { SupabaseDbClient } from '../../types-db.ts'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function handleGetTagVerificationStatus(
  req: Request,
  supabaseClient: SupabaseDbClient,
  verificationId: string
): Promise<Response> {
  try {
    if (!UUID_REGEX.test(verificationId)) {
      return errorResponse('Invalid verification ID format', 400)
    }

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

    const { data: verification, error } = await supabaseAdmin
      .from('tag_verifications')
      .select('id, status, expires_at, verified_at, error_message, updated_at, site_url, verified_page_url')
      .eq('id', verificationId)
      .eq('project_id', projectId)
      .maybeSingle()

    if (error) {
      console.error('[Tag Verification] Error loading status:', error)
      return errorResponse('Failed to load verification status', 500)
    }

    if (!verification) {
      return errorResponse('Verification not found', 404)
    }

    let status = verification.status
    const isExpired = status === 'pending' && new Date(verification.expires_at).getTime() < Date.now()

    if (isExpired) {
      const { error: expireError } = await supabaseAdmin
        .from('tag_verifications')
        .update({
          status: 'expired',
          error_message: 'Verification window expired',
          consumed_at: new Date().toISOString(),
        })
        .eq('id', verificationId)
        .eq('status', 'pending')

      if (expireError) {
        console.error('[Tag Verification] Error expiring verification:', expireError)
      } else {
        status = 'expired'
      }
    }

    return successResponse({
      verificationId: verification.id,
      status,
      expiresAt: verification.expires_at,
      verifiedAt: verification.verified_at,
      siteUrl: verification.site_url,
      verifiedPageUrl: verification.verified_page_url,
      errorMessage: verification.error_message,
      lastUpdatedAt: verification.updated_at,
    })
  } catch (error) {
    console.error('[Tag Verification] Status error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to load verification status',
      500
    )
  }
}
