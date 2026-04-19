/**
 * Select Accounts Handler
 * Saves selected accounts after OAuth callback
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SelectAccountsRequest, SelectAccountsResponse } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { fetchMetaAdAccounts } from '../meta/exchangeToken.ts'
import { fetchGoogleAdsCustomers } from '../google/exchangeToken.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle account selection request
 * Saves selected accounts and updates integration status
 */
export async function handleSelectAccounts(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Select Accounts] Processing for integration:', integrationId)

    // Parse request body
    const body: SelectAccountsRequest = await req.json()
    const { accountIds, pixelId, createPixel } = body

    if (!accountIds || accountIds.length === 0) {
      return errorResponse('At least one account must be selected', 400)
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

    // Get encrypted token from platform_config
    const platformConfig = integration.platform_config as any
    const encryptedToken = platformConfig?.encrypted_token
    const tokenExpiresAt = platformConfig?.token_expires_at

    if (!encryptedToken) {
      return errorResponse('Token not found in integration', 400)
    }

    // Decrypt token to fetch account details
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    const { data: decryptedToken, error: decryptError } = await supabaseAdmin.rpc('decrypt_token', {
      encrypted_data: encryptedToken,
      encryption_key: encryptionKey,
    })

    if (decryptError || !decryptedToken) {
      console.error('[Select Accounts] Error decrypting token:', decryptError)
      return errorResponse('Failed to decrypt token', 500)
    }

    // Determine platform from integration
    const platform = integration.platform as string

    // Fetch all available accounts based on platform
    let allAccounts: Array<{ id: string; name: string; account_id: string; currency?: string }>
    let googleCustomerMap: Map<string, { parentMccId?: string; isManager: boolean }> | undefined

    if (platform === 'meta') {
      allAccounts = await fetchMetaAdAccounts(decryptedToken)
    } else if (platform === 'google') {
      const googleCustomers = await fetchGoogleAdsCustomers(decryptedToken)
      // Store map for metadata enrichment
      googleCustomerMap = new Map(
        googleCustomers.map(c => [c.customerId, { parentMccId: c.parentMccId, isManager: c.isManager }])
      )
      // Filter out MCC (manager) accounts — users should only select child accounts
      allAccounts = googleCustomers
        .filter(c => !c.isManager)
        .map(c => ({
          id: c.id,
          name: c.name,
          account_id: c.customerId,
          currency: c.currency,
        }))
    } else {
      return errorResponse(`Unsupported platform: ${platform}`, 400)
    }

    // Filter selected accounts
    const selectedAccounts = allAccounts.filter(account => {
      return accountIds.includes(account.account_id) ||
             accountIds.includes(account.id) ||
             accountIds.some(id => id === account.account_id || id === account.id)
    })

    if (selectedAccounts.length === 0) {
      return errorResponse('No matching accounts found', 400)
    }

    // Handle pixel selection/creation (Meta only)
    let finalPixelId = pixelId

    if (platform === 'meta' && createPixel && !pixelId) {
      const { createMetaPixel } = await import('../../services/platform/meta/pixels.ts')
      const primaryAccount = selectedAccounts[0]
      const pixel = await createMetaPixel(
        decryptedToken,
        primaryAccount.account_id,
        createPixel.name
      )
      finalPixelId = pixel.id
    }

    // Desativar contas existentes para evitar conflito com contas antigas após reconexão
    await supabaseAdmin
      .from('integration_accounts')
      .update({ status: 'inactive', is_primary: false, updated_at: new Date().toISOString() })
      .eq('integration_id', integrationId)
      .eq('status', 'active')

    // Save selected accounts
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const savedAccounts = await accountRepo.saveAccounts(
      integrationId,
      projectId,
      selectedAccounts.map((account, index) => {
        const googleMeta = googleCustomerMap?.get(account.account_id)
        return {
          externalAccountId: account.account_id,
          accountName: account.name,
          externalAccountName: account.name,
          externalEmail: platformConfig.user_email,
          currency: account.currency,
          metadata: {
            id: account.id,
            currency: account.currency,
            ...(googleMeta?.parentMccId ? { parentMccId: googleMeta.parentMccId } : {}),
          },
          isPrimary: index === 0,
          pixelId: platform === 'meta' ? finalPixelId : undefined,
        }
      }),
      encryptedToken,
      tokenExpiresAt,
      supabaseAdmin
    )

    // Update integration status and config
    await integrationRepo.updateStatus(integrationId, 'connected', supabaseAdmin)

    // Remove temporary tokens from config
    const updatedConfig = {
      ...platformConfig,
    }
    delete updatedConfig.encrypted_token
    delete updatedConfig.token_expires_at
    if (platform === 'meta') {
      delete updatedConfig.pixel_id
    }

    await integrationRepo.updateConfig(integrationId, updatedConfig, supabaseAdmin)

    // Update project connected flag based on platform
    if (platform === 'meta') {
      await supabaseAdmin
        .from('projects')
        .update({ meta_ads_connected: true })
        .eq('id', projectId)
    } else if (platform === 'google') {
      await supabaseAdmin
        .from('projects')
        .update({ google_ads_connected: true })
        .eq('id', projectId)
    }

    console.log('[Select Accounts] Success:', {
      integrationId,
      platform,
      accountsCount: savedAccounts.length,
      pixelId: platform === 'meta' ? finalPixelId : undefined,
    })

    const response: SelectAccountsResponse = {
      success: true,
      integrationId,
      accountsCount: savedAccounts.length,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Select Accounts] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to select accounts',
      500
    )
  }
}

