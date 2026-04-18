/**
 * Validate Token Handler
 * Validates integration token and checks expiration
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { validateMetaToken, checkTokenExpiry } from '../../services/platform/meta/token-validation.ts'
import { validateGoogleToken } from '../../services/platform/google/token-validation.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle token validation request
 * Validates token via Meta API and checks expiration date
 */
export async function handleValidateToken(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Validate Token] Processing for integration:', integrationId)

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

    // Get primary account with token
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)

    if (accounts.length === 0) {
      return errorResponse('No accounts found for this integration', 400)
    }

    const primaryAccount = accounts.find(acc => acc.is_primary) || accounts[0]

    // Check expiration date first (faster)
    const expiryCheck = checkTokenExpiry(primaryAccount.token_expires_at)
    
    if (expiryCheck.isExpired) {
      // Update integration status
      await integrationRepo.updateStatus(integrationId, 'expired', supabaseAdmin)
      
      return successResponse({
        isValid: false,
        isExpired: true,
        error: 'Token has expired',
        errorCode: 'TOKEN_EXPIRED',
        daysUntilExpiry: null,
      })
    }

    // Get decrypted token
    const decryptedToken = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)

    if (!decryptedToken) {
      return errorResponse('Token not found or could not be decrypted', 400)
    }

    // Validate token in provider API
    const platform = integration.platform as string
    if (platform !== 'meta' && platform !== 'google') {
      return errorResponse(`Platform ${platform} does not support token validation`, 400)
    }

    const validation =
      platform === 'google'
        ? await validateGoogleToken(decryptedToken)
        : await validateMetaToken(decryptedToken)

    if (!validation.isValid) {
      // Update integration status if token is expired
      if (validation.errorCode === 'TOKEN_EXPIRED') {
        await integrationRepo.updateStatus(integrationId, 'expired', supabaseAdmin)
      }

      return successResponse({
        isValid: false,
        isExpired: validation.errorCode === 'TOKEN_EXPIRED',
        error: validation.error,
        errorCode: validation.errorCode,
        daysUntilExpiry: expiryCheck.daysUntilExpiry,
      })
    }

    // Token is valid
    return successResponse({
      isValid: true,
      isExpired: false,
      isExpiringSoon: expiryCheck.isExpiringSoon,
      daysUntilExpiry: expiryCheck.daysUntilExpiry,
    })
  } catch (error) {
    console.error('[Validate Token] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to validate token',
      500
    )
  }
}
