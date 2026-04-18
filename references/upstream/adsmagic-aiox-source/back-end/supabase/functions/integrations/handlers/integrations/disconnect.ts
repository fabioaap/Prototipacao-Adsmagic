/**
 * Disconnect Handler
 * Disconnects integration and revokes tokens
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { revokeMetaToken } from '../../services/platform/meta/disconnect.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle disconnect request
 * Revokes token in Meta and updates integration status
 */
export async function handleDisconnect(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Disconnect] Processing for integration:', integrationId)

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

    // Get platform config for user ID
    const platformConfig = integration.platform_config as any
    const metaUserId = platformConfig?.user_id

    // Get decrypted token for revocation
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const decryptedToken = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)

    // Revoke token in Meta (if we have token and user ID)
    if (decryptedToken && metaUserId) {
      try {
        await revokeMetaToken(decryptedToken, metaUserId)
      } catch (error) {
        console.warn('[Disconnect] Failed to revoke token in Meta, continuing with disconnect:', error)
        // Continue with disconnect even if revocation fails
      }
    }

    // Update all accounts to inactive
    const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)
    for (const account of accounts) {
      await supabaseAdmin
        .from('integration_accounts')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id)
    }

    // Update integration status
    await integrationRepo.updateStatus(integrationId, 'disconnected', supabaseAdmin)

    // Update project meta_ads_connected flag
    await supabaseAdmin
      .from('projects')
      .update({ meta_ads_connected: false })
      .eq('id', projectId)

    console.log('[Disconnect] Success:', { integrationId })

    return successResponse({
      success: true,
    })
  } catch (error) {
    console.error('[Disconnect] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to disconnect',
      500
    )
  }
}

