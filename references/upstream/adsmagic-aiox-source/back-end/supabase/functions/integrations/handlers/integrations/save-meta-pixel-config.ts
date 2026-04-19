/**
 * Save Meta Pixel Config Handler
 * Persists selected pixel and optional CAPI access token in integration account metadata.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type {
  SaveMetaPixelConfigRequest,
  SaveMetaPixelConfigResponse,
} from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
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
  account_metadata: Record<string, unknown> | null
} | null> {
  const byExternal = await supabaseAdmin
    .from('integration_accounts')
    .select('id, external_account_id, account_metadata')
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
    .select('id, external_account_id, account_metadata')
    .eq('integration_id', integrationId)
    .eq('id', accountId)
    .maybeSingle()

  return byId.data || null
}

export async function handleSaveMetaPixelConfig(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Save Meta Pixel Config] Processing for integration:', integrationId)

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const body = await req.json() as SaveMetaPixelConfigRequest
    const accountId = typeof body.accountId === 'string' ? body.accountId.trim() : ''
    if (!accountId) {
      return errorResponse('accountId is required', 400)
    }

    const selectedPixelId = typeof body.selectedPixelId === 'string' ? body.selectedPixelId.trim() : ''
    if (!selectedPixelId) {
      return errorResponse('selectedPixelId is required', 400)
    }

    const selectedPixelName = typeof body.selectedPixelName === 'string' ? body.selectedPixelName.trim() : ''
    const pixelAccessToken = typeof body.pixelAccessToken === 'string' ? body.pixelAccessToken.trim() : ''

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

    const now = new Date().toISOString()
    const accountMetadata = isRecord(account.account_metadata) ? account.account_metadata : {}
    const existingMetaAds = isRecord(accountMetadata.meta_ads) ? accountMetadata.meta_ads : {}

    const updatedMetadata = {
      ...accountMetadata,
      meta_ads: {
        ...existingMetaAds,
        selected_pixel_id: selectedPixelId,
        selected_pixel_name: selectedPixelName,
        pixel_access_token_set: pixelAccessToken ? true : (existingMetaAds.pixel_access_token_set || false),
        updated_at: now,
      },
    }

    const updatePayload: Record<string, unknown> = {
      account_metadata: updatedMetadata,
      pixel_id: selectedPixelId,
      updated_at: now,
    }

    // Encrypt and save pixel access token if provided
    if (pixelAccessToken) {
      const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
      const { data: encryptedToken, error: encryptError } = await supabaseAdmin.rpc('encrypt_token', {
        token_data: pixelAccessToken,
        encryption_key: encryptionKey,
      })

      if (encryptError) {
        console.error('[Save Meta Pixel Config] Error encrypting pixel access token:', encryptError)
        return errorResponse('Failed to encrypt pixel access token', 500)
      }

      updatePayload.pixel_access_token = encryptedToken
    }

    const { error: updateError } = await supabaseAdmin
      .from('integration_accounts')
      .update(updatePayload)
      .eq('id', account.id)

    if (updateError) {
      console.error('[Save Meta Pixel Config] Error updating account:', updateError)
      return errorResponse(`Failed to save pixel config: ${updateError.message}`, 500)
    }

    const response: SaveMetaPixelConfigResponse = {
      success: true,
      accountId: account.external_account_id,
      selectedPixelId,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Save Meta Pixel Config] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to save Meta pixel config',
      500
    )
  }
}
