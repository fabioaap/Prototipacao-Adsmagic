import { successResponse, errorResponse } from '../../utils/response.ts'
import {
  createSupabaseAdminClient,
  hashToken,
  invalidPayloadResponse,
  normalizeHost,
  parseHttpUrl,
} from './utils.ts'

interface VerificationPingBody {
  token?: string
  projectId?: string
  pageUrl?: string
  runtimeVersion?: string
}

export async function handleTagVerificationPing(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as VerificationPingBody
    const token = body.token?.trim()
    const projectId = body.projectId?.trim()
    const pageUrl = body.pageUrl?.trim()
    const runtimeVersion = body.runtimeVersion?.trim()

    if (!token || token.length < 32) {
      return invalidPayloadResponse('token is required')
    }

    if (!projectId) {
      return invalidPayloadResponse('projectId is required')
    }

    if (!pageUrl) {
      return invalidPayloadResponse('pageUrl is required')
    }

    const parsedPageUrl = parseHttpUrl(pageUrl)
    if (!parsedPageUrl) {
      return invalidPayloadResponse('pageUrl must be a valid http(s) URL')
    }

    const supabaseAdmin = createSupabaseAdminClient()
    if (!supabaseAdmin) {
      return errorResponse('Server configuration error: missing service role key', 500)
    }

    const tokenHash = await hashToken(token)

    const { data: verification, error: loadError } = await supabaseAdmin
      .from('tag_verifications')
      .select('id, project_id, status, site_url, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (loadError) {
      console.error('[Tag Verification] Error loading verification by token:', loadError)
      return errorResponse('Failed to process verification ping', 500)
    }

    if (!verification) {
      return errorResponse('Verification token not found', 404)
    }

    if (verification.project_id !== projectId) {
      return errorResponse('Verification token does not match project', 403)
    }

    if (verification.status === 'verified') {
      return successResponse({ verified: true })
    }

    const isExpired = new Date(verification.expires_at).getTime() < Date.now()
    if (isExpired || verification.status === 'expired') {
      await supabaseAdmin
        .from('tag_verifications')
        .update({
          status: 'expired',
          error_message: 'Verification window expired',
          consumed_at: new Date().toISOString(),
        })
        .eq('id', verification.id)
        .eq('status', 'pending')

      return errorResponse('Verification expired', 410)
    }

    if (verification.status !== 'pending') {
      return errorResponse('Verification is not pending', 409)
    }

    const requestedHost = normalizeHost(new URL(verification.site_url).host)
    const verifiedHost = normalizeHost(parsedPageUrl.host)
    if (requestedHost !== verifiedHost) {
      await supabaseAdmin
        .from('tag_verifications')
        .update({
          status: 'failed',
          error_message: 'Ping host does not match requested site URL',
          consumed_at: new Date().toISOString(),
          verified_page_url: parsedPageUrl.toString(),
          runtime_version: runtimeVersion || null,
        })
        .eq('id', verification.id)
        .eq('status', 'pending')

      return errorResponse('Ping host does not match requested site URL', 409)
    }

    const verifiedAt = new Date().toISOString()
    const resolvedPageUrl = parsedPageUrl.toString()

    const {
      data: updatedVerification,
      error: updateVerificationError,
    } = await supabaseAdmin
      .from('tag_verifications')
      .update({
        status: 'verified',
        verified_at: verifiedAt,
        consumed_at: verifiedAt,
        verified_page_url: resolvedPageUrl,
        runtime_version: runtimeVersion || null,
        error_message: null,
      })
      .eq('id', verification.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateVerificationError) {
      console.error('[Tag Verification] Error marking verification as verified:', updateVerificationError)
      return errorResponse('Failed to finalize verification', 500)
    }

    if (!updatedVerification) {
      return successResponse({ verified: true }, 200)
    }

    const { data: currentStatus, error: loadStatusError } = await supabaseAdmin
      .from('tag_installation_status')
      .select('verification_count')
      .eq('project_id', projectId)
      .maybeSingle()

    if (loadStatusError) {
      console.error('[Tag Verification] Error loading current status:', loadStatusError)
      return errorResponse('Failed to update installation status', 500)
    }

    if (currentStatus) {
      const { error: updateStatusError } = await supabaseAdmin
        .from('tag_installation_status')
        .update({
          is_installed: true,
          last_verified_at: verifiedAt,
          last_verified_url: resolvedPageUrl,
          runtime_version: runtimeVersion || null,
          verification_count: (currentStatus.verification_count || 0) + 1,
        })
        .eq('project_id', projectId)

      if (updateStatusError) {
        console.error('[Tag Verification] Error updating installation status:', updateStatusError)
        return errorResponse('Failed to update installation status', 500)
      }
    } else {
      const { error: insertStatusError } = await supabaseAdmin
        .from('tag_installation_status')
        .insert({
          project_id: projectId,
          is_installed: true,
          last_verified_at: verifiedAt,
          last_verified_url: resolvedPageUrl,
          runtime_version: runtimeVersion || null,
          verification_count: 1,
        })

      if (insertStatusError) {
        console.error('[Tag Verification] Error inserting installation status:', insertStatusError)
        return errorResponse('Failed to update installation status', 500)
      }
    }

    return successResponse({ verified: true }, 200)
  } catch (error) {
    console.error('[Tag Verification] Ping error:', error)
    if (error instanceof SyntaxError) {
      return invalidPayloadResponse('Invalid JSON body')
    }
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to process verification ping',
      500
    )
  }
}
