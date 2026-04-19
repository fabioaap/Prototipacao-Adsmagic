/**
 * Get Google Conversion Actions Handler
 * Lists conversion actions from Google Ads for a selected account.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { GetGoogleConversionActionsResponse } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { fetchGoogleConversionActions } from '../../services/platform/google/conversion-actions.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function extractSelectedIds(accountMetadata: Record<string, unknown>): string[] {
  const googleAdsRaw = accountMetadata.google_ads
  if (!isRecord(googleAdsRaw)) {
    return []
  }

  const selectedRaw = googleAdsRaw.selected_conversion_action_ids
  if (!Array.isArray(selectedRaw)) {
    return []
  }

  return selectedRaw
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function extractEnhancedConversionsForLeadsFromMetadata(accountMetadata: Record<string, unknown>): boolean | undefined {
  const googleAdsRaw = accountMetadata.google_ads
  if (!isRecord(googleAdsRaw)) {
    return undefined
  }

  const raw = googleAdsRaw.enhanced_conversions_for_leads_enabled
  return typeof raw === 'boolean' ? raw : undefined
}

function extractEnhancedConversionsCheckedAtFromMetadata(accountMetadata: Record<string, unknown>): string | undefined {
  const googleAdsRaw = accountMetadata.google_ads
  if (!isRecord(googleAdsRaw)) {
    return undefined
  }

  const raw = googleAdsRaw.enhanced_conversions_for_leads_checked_at
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined
}

async function findTargetAccount(
  supabaseAdmin: SupabaseDbClient,
  integrationId: string,
  accountId: string
): Promise<{
  id: string
  external_account_id: string
  access_token: string | null
  account_metadata: Record<string, unknown> | null
  status: string
} | null> {
  const byExternal = await supabaseAdmin
    .from('integration_accounts')
    .select('id, external_account_id, access_token, account_metadata, status')
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
    .select('id, external_account_id, access_token, account_metadata, status')
    .eq('integration_id', integrationId)
    .eq('id', accountId)
    .maybeSingle()

  return byId.data || null
}

export async function handleGetGoogleConversionActions(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Get Google Conversion Actions] Processing for integration:', integrationId)

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

    if (integration.platform !== 'google') {
      return errorResponse('Integration platform must be google', 400)
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
      console.error('[Get Google Conversion Actions] Error decrypting token:', decryptError)
      return errorResponse('Failed to decrypt account token', 500)
    }

    const accountMetadata = isRecord(account.account_metadata) ? account.account_metadata : {}
    const selectedConversionActionIds = extractSelectedIds(accountMetadata)
    const parentMccId = typeof accountMetadata.parentMccId === 'string'
      ? accountMetadata.parentMccId
      : undefined

    const actionsResult = await fetchGoogleConversionActions(
      decryptedToken,
      account.external_account_id,
      parentMccId,
      selectedConversionActionIds
    )

    const checkedAt = new Date().toISOString()
    const enhancedConversionsForLeadsEnabled =
      typeof actionsResult.enhancedConversionsForLeadsEnabled === 'boolean'
        ? actionsResult.enhancedConversionsForLeadsEnabled
        : extractEnhancedConversionsForLeadsFromMetadata(accountMetadata)

    if (typeof actionsResult.enhancedConversionsForLeadsEnabled === 'boolean') {
      const existingGoogleAds = isRecord(accountMetadata.google_ads) ? accountMetadata.google_ads : {}
      const updatedMetadata = {
        ...accountMetadata,
        google_ads: {
          ...existingGoogleAds,
          enhanced_conversions_for_leads_enabled: actionsResult.enhancedConversionsForLeadsEnabled,
          enhanced_conversions_for_leads_checked_at: checkedAt,
        },
      }

      const { error: updateMetadataError } = await supabaseAdmin
        .from('integration_accounts')
        .update({
          account_metadata: updatedMetadata,
          updated_at: checkedAt,
        })
        .eq('id', account.id)

      if (updateMetadataError) {
        console.warn('[Get Google Conversion Actions] Failed to persist enhanced leads setting:', updateMetadataError)
      }
    }

    const response: GetGoogleConversionActionsResponse = {
      accountId: account.external_account_id,
      conversionActions: actionsResult.conversionActions,
      selectedConversionActionIds,
      enhancedConversionsForLeadsEnabled,
      enhancedConversionsForLeadsCheckedAt:
        typeof actionsResult.enhancedConversionsForLeadsEnabled === 'boolean'
          ? checkedAt
          : extractEnhancedConversionsCheckedAtFromMetadata(accountMetadata),
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Get Google Conversion Actions] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get Google conversion actions',
      500
    )
  }
}
