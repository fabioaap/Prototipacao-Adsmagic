/**
 * Renew Token via OAuth Handler
 * Renews an expired/invalid token via a new OAuth popup without changing account/pixel config
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { exchangeTokenForLongLived } from '../meta/exchangeToken.ts'
import type { SupabaseDbClient } from '../../types-db.ts'

/**
 * Handle token renewal via OAuth
 * Exchanges a new short-lived token for a long-lived one and updates all active accounts
 */
export async function handleRenewTokenOAuth(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Renew Token OAuth] Processing for integration:', integrationId)

    // Parse request body
    const body = await req.json()
    const { token } = body

    if (!token) {
      return errorResponse('Token is required', 400)
    }

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

    // Create service role client
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // Get integration
    const integrationRepo = new SupabaseIntegrationRepository()
    const integration = await integrationRepo.findById(integrationId, supabaseAdmin)

    if (!integration) {
      return errorResponse('Integration not found', 404)
    }

    // Verify integration belongs to project
    if (integration.project_id !== projectId) {
      return errorResponse('Integration does not belong to this project', 403)
    }

    // Only Meta is supported for now
    const platform = integration.platform as string
    if (platform !== 'meta') {
      return errorResponse(`Token renewal via OAuth not supported for platform: ${platform}`, 400)
    }

    // Exchange short-lived token for long-lived token
    const { accessToken: longLivedToken, expiresIn } = await exchangeTokenForLongLived(token)

    // Encrypt the new token
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    const { data: encryptedToken, error: encryptError } = await supabaseAdmin.rpc('encrypt_token', {
      token_data: longLivedToken,
      encryption_key: encryptionKey,
    })

    if (encryptError || !encryptedToken) {
      console.error('[Renew Token OAuth] Error encrypting token:', encryptError)
      return errorResponse('Failed to encrypt token', 500)
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Update all active accounts with the new token
    const { error: updateError } = await supabaseAdmin
      .from('integration_accounts')
      .update({
        access_token: encryptedToken,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('integration_id', integrationId)
      .eq('status', 'active')

    if (updateError) {
      console.error('[Renew Token OAuth] Error updating accounts:', updateError)
      return errorResponse('Failed to update token on accounts', 500)
    }

    // If integration was in error state, restore to connected
    if (integration.status === 'error') {
      await integrationRepo.updateStatus(integrationId, 'connected', supabaseAdmin)
    }

    // Update last_sync_at on integration
    await supabaseAdmin
      .from('integrations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', integrationId)

    const expiresInDays = Math.floor(expiresIn / 86400)

    console.log('[Renew Token OAuth] Success:', {
      integrationId,
      expiresInDays,
    })

    return successResponse({
      success: true,
      expiresAt: tokenExpiresAt,
      expiresInDays,
    })
  } catch (error) {
    console.error('[Renew Token OAuth] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to renew token',
      500
    )
  }
}
