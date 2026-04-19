/**
 * Get Meta Pixel Config Handler
 * Lists pixels from Meta for a selected account and returns saved config.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { GetMetaPixelConfigResponse } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { fetchMetaPixels } from '../../services/platform/meta/pixels.ts'
import type { SupabaseDbClient } from '../../types-db.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function findTargetAccount(
  supabaseAdmin: SupabaseDbClient,
  integrationId: string,
  accountId: string
): Promise<{
  id: string
  external_account_id: string
  access_token: string | null
  pixel_access_token: string | null
  account_metadata: Record<string, unknown> | null
  status: string
} | null> {
  const byExternal = await supabaseAdmin
    .from('integration_accounts')
    .select('id, external_account_id, access_token, pixel_access_token, account_metadata, status')
    .eq('integration_id', integrationId)
    .eq('external_account_id', accountId)
    .maybeSingle()

  if (byExternal.data) {
    return byExternal.data
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(accountId)) {
    return null
  }

  const byId = await supabaseAdmin
    .from('integration_accounts')
    .select('id, external_account_id, access_token, pixel_access_token, account_metadata, status')
    .eq('integration_id', integrationId)
    .eq('id', accountId)
    .maybeSingle()

  return byId.data || null
}

export async function handleGetMetaPixelConfig(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Get Meta Pixel Config] Processing for integration:', integrationId)

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const url = new URL(req.url)
    const accountId = url.searchParams.get('accountId')
    if (!accountId) {
      return errorResponse('accountId is required', 400)
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    const integrationRepo = new SupabaseIntegrationRepository()
    const integration = await integrationRepo.findById(integrationId, supabaseAdmin)
    if (!integration) {
      return errorResponse('Integration not found', 404)
    }

    if (integration.project_id !== projectId) {
      return errorResponse('Integration does not belong to this project', 403)
    }

    if (integration.platform !== 'meta') {
      return errorResponse('Integration platform must be meta', 400)
    }

    const account = await findTargetAccount(supabaseAdmin, integrationId, accountId)
    if (!account) {
      return errorResponse('Account not found for this integration', 404)
    }

    if (account.status !== 'active') {
      return errorResponse('Account is not active', 400)
    }

    if (!account.access_token) {
      return errorResponse('Access token not found for account', 400)
    }

    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    const { data: decryptedToken, error: decryptError } = await supabaseAdmin.rpc('decrypt_token', {
      encrypted_data: account.access_token,
      encryption_key: encryptionKey,
    })

    if (decryptError || !decryptedToken) {
      console.error('[Get Meta Pixel Config] Error decrypting token:', decryptError)
      return errorResponse('Failed to decrypt account token', 500)
    }

    const accountMetadata = isRecord(account.account_metadata) ? account.account_metadata : {}
    const metaAdsConfig = isRecord(accountMetadata.meta_ads) ? accountMetadata.meta_ads : {}

    const selectedPixelId = typeof metaAdsConfig.selected_pixel_id === 'string'
      ? metaAdsConfig.selected_pixel_id
      : undefined
    const selectedPixelName = typeof metaAdsConfig.selected_pixel_name === 'string'
      ? metaAdsConfig.selected_pixel_name
      : undefined

    let pixels = []
    let fetchError: string | undefined
    try {
      pixels = await fetchMetaPixels(decryptedToken, account.external_account_id)
    } catch (err) {
      console.error('[Get Meta Pixel Config] Error fetching pixels from Meta:', err)
      fetchError = err instanceof Error ? err.message : 'Failed to fetch pixels from Meta'
    }

    const response: GetMetaPixelConfigResponse = {
      accountId: account.external_account_id,
      pixels,
      selectedPixelId,
      selectedPixelName,
      pixelAccessTokenSet: !!account.pixel_access_token,
      fetchError,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Get Meta Pixel Config] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get Meta pixel config',
      500
    )
  }
}
