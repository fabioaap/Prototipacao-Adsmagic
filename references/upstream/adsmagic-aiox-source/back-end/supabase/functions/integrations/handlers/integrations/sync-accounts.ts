/**
 * Sync Accounts Handler
 * Synchronizes accounts from Meta API
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { syncMetaAccounts } from '../../services/platform/meta/account-sync.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle account sync request
 * Syncs accounts from Meta API and updates database
 */
export async function handleSyncAccounts(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Sync Accounts] Processing for integration:', integrationId)

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

    // Get existing accounts
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const existingAccounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)

    // Get decrypted token
    const decryptedToken = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)

    if (!decryptedToken) {
      return errorResponse('Token not found or could not be decrypted', 400)
    }

    // Sync accounts from Meta
    const syncResult = await syncMetaAccounts(
      decryptedToken,
      existingAccounts.map(acc => ({
        external_account_id: acc.external_account_id,
        account_name: acc.account_name,
        id: acc.id,
      }))
    )

    // Get encrypted token from first account (all accounts share same token)
    const primaryAccount = existingAccounts.find(acc => acc.is_primary) || existingAccounts[0]
    const encryptedToken = primaryAccount?.access_token
    const tokenExpiresAt = primaryAccount?.token_expires_at

    if (!encryptedToken || !tokenExpiresAt) {
      return errorResponse('Token information not found', 400)
    }

    // Update or create accounts
    for (const account of syncResult.accounts) {
      const existing = existingAccounts.find(
        acc => acc.external_account_id === account.accountId
      )

      if (existing) {
        // Update existing account
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
        // Create new account
        await accountRepo.saveAccounts(
          integrationId,
          projectId,
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
      .eq('id', integrationId)

    console.log('[Sync Accounts] Success:', syncResult)

    return successResponse({
      success: true,
      ...syncResult,
    })
  } catch (error) {
    console.error('[Sync Accounts] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to sync accounts',
      500
    )
  }
}

