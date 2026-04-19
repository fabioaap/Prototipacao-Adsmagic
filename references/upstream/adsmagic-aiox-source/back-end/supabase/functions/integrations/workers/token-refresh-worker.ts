/**
 * Token Refresh Worker
 * Endpoint for QStash to refresh tokens automatically
 * 
 * This worker:
 * - Finds integrations with tokens expiring soon (7 days)
 * - Refreshes tokens automatically
 * - Logs results
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../utils/cors.ts'
import { errorResponse, successResponse } from '../utils/response.ts'
import { refreshMetaToken } from '../services/platform/meta/token-refresh.ts'
import { refreshGoogleToken } from '../services/platform/google/token-refresh.ts'
import { logOAuthOperation } from '../utils/audit-logger.ts'
import type { Database } from '../../../types/database.types.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify QStash signature (optional but recommended)
    const qstashSecret = Deno.env.get('QSTASH_SECRET')
    if (qstashSecret) {
      const signature = req.headers.get('Upstash-Signature')
      if (!signature) {
        return errorResponse('Missing QStash signature', 401)
      }
      // TODO: Verify signature if needed
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

    // Find integrations with tokens expiring soon (7 days)
    const daysBeforeExpiry = 7
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + daysBeforeExpiry)

    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('integration_accounts')
      .select(`
        id,
        integration_id,
        project_id,
        access_token,
        token_expires_at,
        integrations!inner(platform, status, platform_config)
      `)
      .eq('integrations.status', 'connected')
      .eq('status', 'active')
      .not('token_expires_at', 'is', null)
      .lte('token_expires_at', cutoffDate.toISOString())

    if (accountsError) {
      console.error('[Token Refresh Worker] Error fetching accounts:', accountsError)
      return errorResponse('Failed to fetch accounts', 500)
    }

    if (!accounts || accounts.length === 0) {
      console.log('[Token Refresh Worker] No tokens need refreshing')
      return successResponse({ refreshed: 0, message: 'No tokens need refreshing' })
    }

    const eligibleAccounts = accounts.filter((account) => {
      const integration = account.integrations as { platform?: string }
      return integration.platform === 'meta' || integration.platform === 'google'
    })

    if (eligibleAccounts.length === 0) {
      console.log('[Token Refresh Worker] No supported platform tokens need refreshing')
      return successResponse({ refreshed: 0, message: 'No supported platform tokens need refreshing' })
    }

    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    let refreshed = 0
    let failed = 0

    // Group by integration_id to avoid refreshing same token multiple times
    const integrationMap = new Map<string, typeof eligibleAccounts[0]>()
    for (const account of eligibleAccounts) {
      if (!integrationMap.has(account.integration_id)) {
        integrationMap.set(account.integration_id, account)
      }
    }

    // Refresh tokens
    for (const [integrationId, account] of integrationMap) {
      try {
        const integration = account.integrations as {
          platform: string
          platform_config?: Record<string, unknown>
        }

        let newToken: string
        let expiresIn: number
        let maybeNewRefreshToken: string | null = null

        if (integration.platform === 'meta') {
          const { data: decryptedToken, error: decryptError } = await supabaseAdmin.rpc('decrypt_token', {
            encrypted_data: account.access_token,
            encryption_key: encryptionKey,
          })

          if (decryptError || !decryptedToken) {
            console.error('[Token Refresh Worker] Error decrypting Meta token:', decryptError)
            failed++
            continue
          }

          const refreshed = await refreshMetaToken(decryptedToken)
          newToken = refreshed.accessToken
          expiresIn = refreshed.expiresIn
        } else if (integration.platform === 'google') {
          const platformConfig = integration.platform_config || {}
          const encryptedRefreshToken = platformConfig.encrypted_refresh_token as string | undefined

          if (!encryptedRefreshToken) {
            console.warn('[Token Refresh Worker] Google integration without refresh token:', integrationId)
            failed++
            continue
          }

          const { data: decryptedRefreshToken, error: decryptRefreshError } = await supabaseAdmin.rpc('decrypt_token', {
            encrypted_data: encryptedRefreshToken,
            encryption_key: encryptionKey,
          })

          if (decryptRefreshError || !decryptedRefreshToken) {
            console.error('[Token Refresh Worker] Error decrypting Google refresh token:', decryptRefreshError)
            failed++
            continue
          }

          const refreshed = await refreshGoogleToken(decryptedRefreshToken)
          newToken = refreshed.accessToken
          expiresIn = refreshed.expiresIn
          maybeNewRefreshToken = refreshed.refreshToken || null
        } else {
          console.warn('[Token Refresh Worker] Unsupported platform for refresh:', integration.platform)
          failed++
          continue
        }

        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        // Encrypt new token
        const { data: encryptedToken, error: encryptError } = await supabaseAdmin.rpc('encrypt_token', {
          token_data: newToken,
          encryption_key: encryptionKey,
        })

        if (encryptError || !encryptedToken) {
          console.error('[Token Refresh Worker] Error encrypting token:', encryptError)
          failed++
          continue
        }

        // Update all accounts for this integration
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
          console.error('[Token Refresh Worker] Error updating accounts:', updateError)
          failed++
          continue
        }

        if (integration.platform === 'google' && maybeNewRefreshToken) {
          const { data: encryptedRefreshToken, error: encryptRefreshError } = await supabaseAdmin.rpc('encrypt_token', {
            token_data: maybeNewRefreshToken,
            encryption_key: encryptionKey,
          })

          if (encryptRefreshError || !encryptedRefreshToken) {
            console.error('[Token Refresh Worker] Error encrypting Google refresh token:', encryptRefreshError)
          } else {
            await supabaseAdmin
              .from('integrations')
              .update({
                platform_config: {
                  ...(integration.platform_config || {}),
                  encrypted_refresh_token: encryptedRefreshToken,
                  token_expires_at: tokenExpiresAt,
                },
                updated_at: new Date().toISOString(),
              })
              .eq('id', integrationId)
          }
        }

        // Invalidate summary caches so fresh metrics are recomputed
        await supabaseAdmin
          .from('dashboard_cache')
          .delete()
          .eq('project_id', account.project_id)
          .eq('endpoint', 'summary')

        // Log success
        await logOAuthOperation({
          integration_id: integrationId,
          project_id: account.project_id,
          action: 'token_refresh',
          status: 'success',
          metadata: {
            platform: integration.platform,
            expiresAt: tokenExpiresAt,
            expiresInDays: Math.floor(expiresIn / 86400),
          },
        }, supabaseAdmin)

        refreshed++
        console.log('[Token Refresh Worker] Refreshed token for integration:', integrationId)
      } catch (error) {
        console.error('[Token Refresh Worker] Error refreshing token:', error)
        
        // Log error
        await logOAuthOperation({
          integration_id: integrationId,
          project_id: account.project_id,
          action: 'token_refresh',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        }, supabaseAdmin)

        failed++
      }
    }

    console.log('[Token Refresh Worker] Complete:', { refreshed, failed, total: integrationMap.size })

    return successResponse({
      refreshed,
      failed,
      total: integrationMap.size,
    })
  } catch (error) {
    console.error('[Token Refresh Worker] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Worker error',
      500
    )
  }
})
