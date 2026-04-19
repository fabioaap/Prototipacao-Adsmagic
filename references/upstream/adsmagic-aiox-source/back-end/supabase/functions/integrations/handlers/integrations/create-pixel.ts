/**
 * Create Pixel Handler
 * Creates a new pixel in Meta
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { CreatePixelRequest, CreatePixelResponse } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { createMetaPixel } from '../../services/platform/meta/pixels.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle create pixel request
 * Creates a new pixel in Meta for the integration's primary account
 */
export async function handleCreatePixel(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Create Pixel] Processing for integration:', integrationId)

    // Parse request body
    const body: CreatePixelRequest = await req.json()
    const { name, accountId } = body

    if (!name || !name.trim()) {
      return errorResponse('Pixel name is required', 400)
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

    // Get account to use (provided accountId or primary account)
    const accountRepo = new SupabaseIntegrationAccountRepository()
    let targetAccountId = accountId

    if (!targetAccountId) {
      const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)
      if (accounts.length === 0) {
        return errorResponse('No accounts found for this integration', 400)
      }
      const primaryAccount = accounts.find(acc => acc.is_primary) || accounts[0]
      targetAccountId = primaryAccount.external_account_id
    }

    // Get decrypted token
    const decryptedToken = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)

    if (!decryptedToken) {
      return errorResponse('Token not found or could not be decrypted', 400)
    }

    // Create pixel in Meta
    const pixel = await createMetaPixel(
      decryptedToken,
      targetAccountId,
      name.trim()
    )

    console.log('[Create Pixel] Success:', { pixelId: pixel.id })

    const response: CreatePixelResponse = {
      success: true,
      pixel,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Create Pixel] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create pixel',
      500
    )
  }
}

