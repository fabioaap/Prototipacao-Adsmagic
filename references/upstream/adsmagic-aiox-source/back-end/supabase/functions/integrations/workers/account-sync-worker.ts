/**
 * Account Sync Worker
 * Endpoint for QStash to sync accounts periodically
 * 
 * This worker:
 * - Finds all connected Meta integrations
 * - Syncs accounts from Meta API
 * - Updates database
 * - Logs results
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../utils/cors.ts'
import { errorResponse, successResponse } from '../utils/response.ts'
import { syncMetaAccounts } from '../services/platform/meta/account-sync.ts'
import { logOAuthOperation } from '../utils/audit-logger.ts'
import { SupabaseIntegrationAccountRepository } from '../repositories/IntegrationAccountRepository.ts'
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

    // Find all connected Meta integrations
    const { data: integrations, error: integrationsError } = await supabaseAdmin
      .from('integrations')
      .select('id, project_id')
      .eq('platform', 'meta')
      .eq('status', 'connected')

    if (integrationsError) {
      console.error('[Account Sync Worker] Error fetching integrations:', integrationsError)
      return errorResponse('Failed to fetch integrations', 500)
    }

    if (!integrations || integrations.length === 0) {
      console.log('[Account Sync Worker] No integrations to sync')
      return successResponse({ synced: 0, message: 'No integrations to sync' })
    }

    const accountRepo = new SupabaseIntegrationAccountRepository()
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    let synced = 0
    let failed = 0

    // Sync each integration
    for (const integration of integrations) {
      try {
        // Get existing accounts
        const existingAccounts = await accountRepo.findByIntegration(integration.id, supabaseAdmin)

        if (existingAccounts.length === 0) {
          console.log('[Account Sync Worker] No accounts found for integration:', integration.id)
          continue
        }

        // Get decrypted token
        const decryptedToken = await accountRepo.getDecryptedToken(integration.id, supabaseAdmin)

        if (!decryptedToken) {
          console.error('[Account Sync Worker] Token not found for integration:', integration.id)
          failed++
          continue
        }

        // Sync accounts
        const syncResult = await syncMetaAccounts(
          decryptedToken,
          existingAccounts.map(acc => ({
            external_account_id: acc.external_account_id,
            account_name: acc.account_name,
            id: acc.id,
          }))
        )

        // Get encrypted token and expiration from first account
        const primaryAccount = existingAccounts.find(acc => acc.is_primary) || existingAccounts[0]
        const encryptedToken = primaryAccount.access_token
        const tokenExpiresAt = primaryAccount.token_expires_at

        if (!encryptedToken || !tokenExpiresAt) {
          console.error('[Account Sync Worker] Token info not found for integration:', integration.id)
          failed++
          continue
        }

        // Update or create accounts
        for (const account of syncResult.accounts) {
          const existing = existingAccounts.find(
            acc => acc.external_account_id === account.accountId
          )

          if (existing) {
            // Update existing
            await supabaseAdmin
              .from('integration_accounts')
              .update({
                account_name: account.name,
                external_account_name: account.name,
                account_metadata: {
                  ...existing.account_metadata,
                  currency: account.currency,
                },
                last_sync_at: new Date().toISOString(),
                sync_status: 'success',
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
          } else {
            // Create new
            await accountRepo.saveAccounts(
              integration.id,
              integration.project_id,
              [{
                externalAccountId: account.accountId,
                accountName: account.name,
                externalAccountName: account.name,
                currency: account.currency,
                metadata: {
                  currency: account.currency,
                },
                isPrimary: false,
              }],
              encryptedToken,
              tokenExpiresAt,
              supabaseAdmin
            )
          }
        }

        // Mark removed accounts as inactive
        const metaAccountIds = new Set(syncResult.accounts.map(acc => acc.accountId))
        for (const existing of existingAccounts) {
          if (!metaAccountIds.has(existing.external_account_id)) {
            await supabaseAdmin
              .from('integration_accounts')
              .update({
                status: 'inactive',
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
          }
        }

        // Update integration last_sync_at
        await supabaseAdmin
          .from('integrations')
          .update({
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id)

        // Log success
        await logOAuthOperation({
          integration_id: integration.id,
          project_id: integration.project_id,
          action: 'account_sync',
          status: 'success',
          metadata: {
            added: syncResult.added,
            updated: syncResult.updated,
            removed: syncResult.removed,
          },
        }, supabaseAdmin)

        synced++
        console.log('[Account Sync Worker] Synced integration:', integration.id, syncResult)
      } catch (error) {
        console.error('[Account Sync Worker] Error syncing integration:', integration.id, error)
        
        // Log error
        await logOAuthOperation({
          integration_id: integration.id,
          project_id: integration.project_id,
          action: 'account_sync',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        }, supabaseAdmin)

        failed++
      }
    }

    console.log('[Account Sync Worker] Complete:', { synced, failed, total: integrations.length })

    return successResponse({
      synced,
      failed,
      total: integrations.length,
    })
  } catch (error) {
    console.error('[Account Sync Worker] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Worker error',
      500
    )
  }
})

