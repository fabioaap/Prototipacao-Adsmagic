/**
 * On-demand Google token refresh for conversion event sending.
 *
 * When the stored access token has expired (Google returns 401),
 * this utility decrypts the refresh token, exchanges it for a new
 * access token via Google OAuth, persists the updated credentials
 * in the database and returns the fresh access token so the caller
 * can retry the API call immediately.
 *
 * Pattern taken from dashboard/services/ad-metrics.ts.
 */

import type { SupabaseDbClient } from '../types-db.ts'

interface GoogleRefreshResponse {
  access_token?: string
  expires_in?: number
  refresh_token?: string
  error?: string
  error_description?: string
}

/**
 * Exchanges a Google refresh token for a new access token.
 * Mirrors integrations/services/platform/google/token-refresh.ts
 * (duplicated because Supabase Edge Functions bundle independently).
 */
async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number; refreshToken?: string | null }> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  const data = (await response.json().catch(() => ({}))) as GoogleRefreshResponse

  if (!response.ok || !data.access_token) {
    const reason =
      data.error_description ||
      data.error ||
      `Google refresh failed with status ${response.status}`
    throw new Error(reason)
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 3600,
    refreshToken: data.refresh_token || null,
  }
}

/**
 * Attempts an on-demand token refresh for a Google integration.
 *
 * @returns The new plaintext access token, or null if refresh failed.
 */
export async function refreshGoogleAccessTokenOnDemand(
  supabaseClient: SupabaseDbClient,
  integrationId: string,
  platformConfig: Record<string, unknown>
): Promise<string | null> {
  const encryptedRefreshToken = platformConfig.encrypted_refresh_token
  if (typeof encryptedRefreshToken !== 'string' || encryptedRefreshToken.length === 0) {
    console.warn('[Google Token Refresh] No encrypted_refresh_token found for integration:', integrationId)
    return null
  }

  const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'

  try {
    // 1. Decrypt refresh token
    const { data: decryptedRefreshToken, error: decryptError } = await supabaseClient.rpc('decrypt_token', {
      encrypted_data: encryptedRefreshToken,
      encryption_key: encryptionKey,
    })

    if (decryptError || !decryptedRefreshToken) {
      console.error('[Google Token Refresh] Failed to decrypt refresh token:', decryptError)
      return null
    }

    // 2. Exchange for new access token
    const refreshResult = await refreshGoogleToken(decryptedRefreshToken)
    const tokenExpiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000).toISOString()

    // 3. Encrypt new access token
    const { data: encryptedAccessToken, error: encryptError } = await supabaseClient.rpc('encrypt_token', {
      token_data: refreshResult.accessToken,
      encryption_key: encryptionKey,
    })

    if (encryptError || !encryptedAccessToken) {
      console.error('[Google Token Refresh] Failed to encrypt new access token:', encryptError)
      return refreshResult.accessToken // Still return the token even if DB update fails
    }

    // 4. Update all active accounts for this integration
    const { error: updateAccountError } = await supabaseClient
      .from('integration_accounts')
      .update({
        access_token: encryptedAccessToken,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('integration_id', integrationId)
      .eq('status', 'active')

    if (updateAccountError) {
      console.error('[Google Token Refresh] Failed to update integration_accounts:', updateAccountError)
    }

    // 5. If Google issued a new refresh token, persist it
    if (refreshResult.refreshToken) {
      const { data: encryptedNewRefresh, error: encryptRefreshError } = await supabaseClient.rpc('encrypt_token', {
        token_data: refreshResult.refreshToken,
        encryption_key: encryptionKey,
      })

      if (!encryptRefreshError && encryptedNewRefresh) {
        await supabaseClient
          .from('integrations')
          .update({
            platform_config: {
              ...platformConfig,
              encrypted_refresh_token: encryptedNewRefresh,
              token_expires_at: tokenExpiresAt,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', integrationId)
      }
    } else {
      // Update token_expires_at in platform_config even without new refresh token
      await supabaseClient
        .from('integrations')
        .update({
          platform_config: {
            ...platformConfig,
            token_expires_at: tokenExpiresAt,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', integrationId)
    }

    console.log('[Google Token Refresh] Successfully refreshed token for integration:', integrationId)
    return refreshResult.accessToken
  } catch (error) {
    console.error('[Google Token Refresh] Refresh failed for integration:', integrationId, error)
    return null
  }
}
