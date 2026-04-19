/**
 * Save Google Conversion Actions Handler
 * Persists selected conversion action IDs in integration account metadata.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type {
  GoogleConversionAction,
  SaveGoogleConversionActionsRequest,
  SaveGoogleConversionActionsResponse,
} from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeSelectedIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) {
    return []
  }

  return [...new Set(
    ids
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  )]
}

function normalizeSelectedActions(actions: unknown): GoogleConversionAction[] {
  if (!Array.isArray(actions)) {
    return []
  }

  return actions
    .filter((action): action is Record<string, unknown> => isRecord(action))
    .map((action) => ({
      id: String(action.id || ''),
      name: String(action.name || ''),
      type: typeof action.type === 'string' ? action.type : undefined,
      status: typeof action.status === 'string' ? action.status : undefined,
      category: typeof action.category === 'string' ? action.category : undefined,
      primaryForGoal: typeof action.primaryForGoal === 'boolean' ? action.primaryForGoal : undefined,
      resourceName: typeof action.resourceName === 'string' ? action.resourceName : undefined,
    }))
    .filter((action) => action.id.length > 0)
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

export async function handleSaveGoogleConversionActions(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Save Google Conversion Actions] Processing for integration:', integrationId)

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const body = await req.json() as SaveGoogleConversionActionsRequest
    const accountId = typeof body.accountId === 'string' ? body.accountId.trim() : ''
    if (!accountId) {
      return errorResponse('accountId is required', 400)
    }

    const selectedConversionActionIds = normalizeSelectedIds(body.selectedConversionActionIds)
    const selectedConversionActions = normalizeSelectedActions(body.selectedConversionActions)

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

    const accountMetadata = isRecord(account.account_metadata) ? account.account_metadata : {}
    const existingGoogleAds = isRecord(accountMetadata.google_ads) ? accountMetadata.google_ads : {}

    const updatedMetadata = {
      ...accountMetadata,
      google_ads: {
        ...existingGoogleAds,
        selected_conversion_action_ids: selectedConversionActionIds,
        selected_conversion_actions: selectedConversionActions,
        updated_at: new Date().toISOString(),
      },
    }

    const { error: updateError } = await supabaseAdmin
      .from('integration_accounts')
      .update({
        account_metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id)

    if (updateError) {
      console.error('[Save Google Conversion Actions] Error updating account metadata:', updateError)
      return errorResponse(`Failed to save conversion actions: ${updateError.message}`, 500)
    }

    const response: SaveGoogleConversionActionsResponse = {
      success: true,
      accountId: account.external_account_id,
      selectedCount: selectedConversionActionIds.length,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Save Google Conversion Actions] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to save Google conversion actions',
      500
    )
  }
}
