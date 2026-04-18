import { successResponse, errorResponse } from '../../utils/response.ts'
import {
  buildVerificationUrl,
  createSupabaseAdminClient,
  createVerificationToken,
  ensureProjectAccess,
  getPingEndpointUrl,
  getProjectIdHeader,
  getVerificationExpirationIso,
  hashToken,
  invalidPayloadResponse,
  parseHttpUrl,
} from './utils.ts'
import type { SupabaseDbClient } from '../../types-db.ts'

interface StartVerificationBody {
  siteUrl?: string
}

export async function handleStartTagVerification(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    const projectId = getProjectIdHeader(req)
    if (!projectId) {
      return invalidPayloadResponse('Project ID is required')
    }

    const { data: authData, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !authData.user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = (await req.json()) as StartVerificationBody
    const siteUrl = body.siteUrl?.trim()
    if (!siteUrl) {
      return invalidPayloadResponse('siteUrl is required')
    }

    const parsedSiteUrl = parseHttpUrl(siteUrl)
    if (!parsedSiteUrl) {
      return invalidPayloadResponse('siteUrl must be a valid http(s) URL')
    }

    const pingEndpoint = getPingEndpointUrl()
    if (!pingEndpoint) {
      return errorResponse('Server configuration error: missing SUPABASE_URL', 500)
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

    const token = createVerificationToken()
    const tokenHash = await hashToken(token)
    const expiresAt = getVerificationExpirationIso()

    const { data: verification, error: insertError } = await supabaseAdmin
      .from('tag_verifications')
      .insert({
        project_id: projectId,
        site_url: parsedSiteUrl.toString(),
        token_hash: tokenHash,
        status: 'pending',
        created_by: authData.user.id,
        expires_at: expiresAt,
      })
      .select('id, expires_at')
      .single()

    if (insertError || !verification) {
      console.error('[Tag Verification] Error creating verification:', insertError)
      return errorResponse('Failed to start tag verification', 500)
    }

    const verificationUrl = buildVerificationUrl(
      parsedSiteUrl.toString(),
      token,
      pingEndpoint,
      projectId
    )

    return successResponse({
      verificationId: verification.id,
      verificationUrl,
      expiresAt: verification.expires_at,
      status: 'pending',
    })
  } catch (error) {
    console.error('[Tag Verification] Start error:', error)
    if (error instanceof SyntaxError) {
      return invalidPayloadResponse('Invalid JSON body')
    }
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to start tag verification',
      500
    )
  }
}
