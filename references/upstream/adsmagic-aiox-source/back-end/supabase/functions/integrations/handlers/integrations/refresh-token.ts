/**
 * Refresh Token Handler
 * Refreshes integration token before expiration
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { refreshMetaToken } from '../../services/platform/meta/token-refresh.ts'
import { refreshGoogleToken } from '../../services/platform/google/token-refresh.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle token refresh request
 * Refreshes token and updates all accounts with new token
 */
export async function handleRefreshToken(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Refresh Token] Processing for integration:', integrationId)

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

    // Get accounts with tokens
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)

    if (accounts.length === 0) {
      return errorResponse('No accounts found for this integration', 400)
    }

    const integrationPlatform = integration.platform as string
    let newToken: string
    let expiresIn: number
    let newRefreshToken: string | null = null

    if (integrationPlatform === 'meta') {
      // Meta flow: refresh using current long-lived access token
      const decryptedToken = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)
      if (!decryptedToken) {
        return errorResponse('Token not found or could not be decrypted', 400)
      }

      const refreshed = await refreshMetaToken(decryptedToken)
      newToken = refreshed.accessToken
      expiresIn = refreshed.expiresIn
    } else if (integrationPlatform === 'google') {
      // Google flow: refresh using encrypted refresh token stored in platform_config
      const platformConfig = (integration.platform_config || {}) as Record<string, unknown>
      const encryptedRefreshToken = platformConfig.encrypted_refresh_token as string | undefined

      if (!encryptedRefreshToken) {
        return errorResponse('Google refresh token not configured for this integration', 400)
      }

      const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
      const { data: decryptedRefreshToken, error: decryptRefreshError } = await supabaseAdmin.rpc(
        'decrypt_token',
        {
          encrypted_data: encryptedRefreshToken,
          encryption_key: encryptionKey,
        }
      )

      if (decryptRefreshError || !decryptedRefreshToken) {
        console.error('[Refresh Token] Error decrypting Google refresh token:', decryptRefreshError)
        return errorResponse('Failed to decrypt Google refresh token', 500)
      }

      const refreshed = await refreshGoogleToken(decryptedRefreshToken)
      newToken = refreshed.accessToken
      expiresIn = refreshed.expiresIn
      newRefreshToken = refreshed.refreshToken || null
    } else {
      return errorResponse(`Platform ${integrationPlatform} does not support token refresh`, 400)
    }

    // Calculate new expiration date
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Encrypt new token
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    const { data: encryptedToken, error: encryptError } = await supabaseAdmin.rpc('encrypt_token', {
      token_data: newToken,
      encryption_key: encryptionKey,
    })

    if (encryptError || !encryptedToken) {
      console.error('[Refresh Token] Error encrypting new token:', encryptError)
      return errorResponse('Failed to encrypt new token', 500)
    }

    // Update all accounts with new token
    for (const account of accounts) {
      const { error: updateError } = await supabaseAdmin
        .from('integration_accounts')
        .update({
          access_token: encryptedToken,
          token_expires_at: tokenExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id)

      if (updateError) {
        console.error('[Refresh Token] Error updating account:', account.id, updateError)
        // Continue with other accounts
      }
    }

    // Update integration config for Google when a new refresh token is returned
    if (integrationPlatform === 'google') {
      const platformConfig = (integration.platform_config || {}) as Record<string, unknown>
      let encryptedRefreshTokenForConfig = platformConfig.encrypted_refresh_token

      if (newRefreshToken) {
        const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
        const { data: encryptedRefreshToken, error: encryptRefreshError } = await supabaseAdmin.rpc(
          'encrypt_token',
          {
            token_data: newRefreshToken,
            encryption_key: encryptionKey,
          }
        )

        if (encryptRefreshError || !encryptedRefreshToken) {
          console.error('[Refresh Token] Error encrypting new Google refresh token:', encryptRefreshError)
        } else {
          encryptedRefreshTokenForConfig = encryptedRefreshToken
        }
      }

      await integrationRepo.updateConfig(
        integrationId,
        {
          ...platformConfig,
          encrypted_refresh_token: encryptedRefreshTokenForConfig,
          token_expires_at: tokenExpiresAt,
        },
        supabaseAdmin
      )
    }

    // Update integration status if it was expired
    if (integration.status === 'expired') {
      await integrationRepo.updateStatus(integrationId, 'connected', supabaseAdmin)
    }

    // Invalidate summary caches to avoid stale zero metrics after token refresh
    await supabaseAdmin
      .from('dashboard_cache')
      .delete()
      .eq('project_id', projectId)
      .eq('endpoint', 'summary')

    console.log('[Refresh Token] Success:', {
      integrationId,
      platform: integrationPlatform,
      accountsUpdated: accounts.length,
      expiresAt: tokenExpiresAt,
    })

    return successResponse({
      success: true,
      expiresAt: tokenExpiresAt,
      expiresInDays: Math.floor(expiresIn / 86400),
    })
  } catch (error) {
    console.error('[Refresh Token] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to refresh token',
      500
    )
  }
}
