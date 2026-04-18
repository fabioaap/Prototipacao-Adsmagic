/**
 * OAuth Callback Handler
 * Processes OAuth callback, exchanges token, fetches accounts, and saves to database
 * Supports Meta (implicit flow) and Google (authorization code flow)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { OAuthCallbackRequest, OAuthCallbackResponse, IntegrationAccountData } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { exchangeTokenForLongLived, fetchMetaUserData, fetchMetaAdAccounts } from '../meta/exchangeToken.ts'
import { exchangeCodeForTokens, fetchGoogleUserInfo, fetchGoogleAdsCustomers } from '../google/exchangeToken.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Encrypt a token using pgcrypto RPC
 */
async function encryptToken(
  supabaseAdmin: SupabaseDbClient,
  tokenData: string
): Promise<string> {
  const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
  const encryptResult = await supabaseAdmin.rpc('encrypt_token', {
    token_data: tokenData,
    encryption_key: encryptionKey,
  })

  if (encryptResult.error) {
    throw new Error(`Encryption failed: ${encryptResult.error.message}`)
  }

  if (!encryptResult.data) {
    throw new Error('Encryption failed: No data returned')
  }

  return encryptResult.data
}

/**
 * Process Meta OAuth callback
 */
async function processMetaCallback(
  shortLivedToken: string,
  projectId: string,
  supabaseAdmin: SupabaseDbClient
): Promise<Response> {
  // Step 1: Exchange short-lived token for long-lived token
  let longLivedToken: string
  let expiresIn: number
  try {
    console.log('[OAuth Callback][Meta] Step 1: Exchanging token')
    const exchangeResult = await exchangeTokenForLongLived(shortLivedToken)
    longLivedToken = exchangeResult.accessToken
    expiresIn = exchangeResult.expiresIn
    console.log('[OAuth Callback][Meta] Step 1: Token exchanged successfully')
  } catch (error) {
    console.error('[OAuth Callback][Meta] Step 1 failed:', error)
    return errorResponse(
      `Failed to exchange token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }

  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  // Step 2: Fetch user data
  let userData: { id: string; name: string; email?: string }
  try {
    console.log('[OAuth Callback][Meta] Step 2: Fetching user data')
    userData = await fetchMetaUserData(longLivedToken)
    console.log('[OAuth Callback][Meta] Step 2: User data fetched:', { id: userData.id, name: userData.name })
  } catch (error) {
    console.error('[OAuth Callback][Meta] Step 2 failed:', error)
    return errorResponse(
      `Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }

  // Step 3: Fetch ad accounts
  let adAccounts: Array<{ id: string; name: string; account_id: string; currency?: string }>
  try {
    console.log('[OAuth Callback][Meta] Step 3: Fetching ad accounts')
    adAccounts = await fetchMetaAdAccounts(longLivedToken)
    console.log('[OAuth Callback][Meta] Step 3: Ad accounts fetched:', { count: adAccounts.length })
  } catch (error) {
    console.error('[OAuth Callback][Meta] Step 3 failed:', error)
    return errorResponse(
      `Failed to fetch ad accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }

  if (adAccounts.length === 0) {
    return errorResponse('No ad accounts found for this Meta account', 400)
  }

  // Step 4: Encrypt token and save integration
  try {
    console.log('[OAuth Callback][Meta] Step 4: Encrypting token and saving integration')
    const encryptedToken = await encryptToken(supabaseAdmin, longLivedToken)

    const integrationResult = await supabaseAdmin
      .from('integrations')
      .upsert({
        project_id: projectId,
        platform: 'meta',
        platform_type: 'advertising',
        status: 'pending',
        platform_config: {
          user_id: userData.id,
          user_name: userData.name,
          user_email: userData.email,
          encrypted_token: encryptedToken,
          token_expires_at: tokenExpiresAt,
        },
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,platform',
      })
      .select()
      .single()

    if (integrationResult.error) {
      console.error('[OAuth Callback][Meta] Integration upsert error:', integrationResult.error)
      return errorResponse(`Failed to save integration: ${integrationResult.error.message}`, 500)
    }

    if (!integrationResult.data) {
      return errorResponse('Failed to save integration: No data returned', 500)
    }

    const integration = integrationResult.data

    const accountsData: IntegrationAccountData[] = adAccounts.map((account, index) => ({
      id: account.id,
      name: account.name,
      accountId: account.account_id,
      currency: account.currency,
      metadata: {
        isPrimary: index === 0,
        externalId: account.id,
      },
    }))

    console.log('[OAuth Callback][Meta] Success:', {
      integrationId: integration.id,
      accountsCount: accountsData.length,
    })

    const response: OAuthCallbackResponse = {
      success: true,
      integrationId: integration.id,
      accounts: accountsData,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[OAuth Callback][Meta] Step 4 failed:', error)
    return errorResponse(
      `Failed to save integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

/**
 * Process Google OAuth callback (authorization code flow)
 */
async function processGoogleCallback(
  authCode: string,
  redirectUri: string | undefined,
  projectId: string,
  supabaseAdmin: SupabaseDbClient
): Promise<Response> {
  if (!redirectUri) {
    return errorResponse('Redirect URI is required for Google OAuth code exchange', 400)
  }

  // Step 1: Exchange authorization code for access + refresh tokens
  let accessToken: string
  let refreshToken: string | null
  let expiresIn: number
  try {
    console.log('[OAuth Callback][Google] Step 1: Exchanging authorization code')
    const exchangeResult = await exchangeCodeForTokens(authCode, redirectUri)
    accessToken = exchangeResult.accessToken
    refreshToken = exchangeResult.refreshToken
    expiresIn = exchangeResult.expiresIn
    console.log('[OAuth Callback][Google] Step 1: Tokens obtained', { hasRefreshToken: !!refreshToken })
  } catch (error) {
    console.error('[OAuth Callback][Google] Step 1 failed:', error)
    return errorResponse(
      `Failed to exchange authorization code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }

  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  // Step 2: Fetch user info
  let userData: { id: string; name: string; email: string }
  try {
    console.log('[OAuth Callback][Google] Step 2: Fetching user info')
    userData = await fetchGoogleUserInfo(accessToken)
    console.log('[OAuth Callback][Google] Step 2: User info fetched:', { id: userData.id, name: userData.name })
  } catch (error) {
    console.error('[OAuth Callback][Google] Step 2 failed:', error)
    return errorResponse(
      `Failed to fetch user info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }

  // Step 3: Fetch Google Ads customer accounts
  let customers: Array<{ id: string; name: string; customerId: string; currency?: string; isManager: boolean; parentMccId?: string }>
  try {
    console.log('[OAuth Callback][Google] Step 3: Fetching Google Ads customers')
    customers = await fetchGoogleAdsCustomers(accessToken)
    console.log('[OAuth Callback][Google] Step 3: Customers fetched:', { count: customers.length })
  } catch (error) {
    console.error('[OAuth Callback][Google] Step 3 failed:', error)
    return errorResponse(
      `Failed to fetch Google Ads accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }

  if (customers.length === 0) {
    return errorResponse('No Google Ads accounts found for this Google account', 400)
  }

  // Step 4: Encrypt tokens and save integration
  try {
    console.log('[OAuth Callback][Google] Step 4: Encrypting tokens and saving integration')
    const encryptedAccessToken = await encryptToken(supabaseAdmin, accessToken)

    let encryptedRefreshToken: string | null = null
    if (refreshToken) {
      encryptedRefreshToken = await encryptToken(supabaseAdmin, refreshToken)
    }

    const platformConfig: Record<string, unknown> = {
      user_id: userData.id,
      user_name: userData.name,
      user_email: userData.email,
      encrypted_token: encryptedAccessToken,
      token_expires_at: tokenExpiresAt,
    }

    // Store refresh token separately (Google-specific)
    if (encryptedRefreshToken) {
      platformConfig.encrypted_refresh_token = encryptedRefreshToken
    }

    const integrationResult = await supabaseAdmin
      .from('integrations')
      .upsert({
        project_id: projectId,
        platform: 'google',
        platform_type: 'advertising',
        status: 'pending',
        platform_config: platformConfig,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,platform',
      })
      .select()
      .single()

    if (integrationResult.error) {
      console.error('[OAuth Callback][Google] Integration upsert error:', integrationResult.error)
      return errorResponse(`Failed to save integration: ${integrationResult.error.message}`, 500)
    }

    if (!integrationResult.data) {
      return errorResponse('Failed to save integration: No data returned', 500)
    }

    const integration = integrationResult.data

    const accountsData: IntegrationAccountData[] = customers.map((customer, index) => ({
      id: customer.id,
      name: customer.name,
      accountId: customer.customerId,
      currency: customer.currency,
      isManager: customer.isManager,
      parentMccId: customer.parentMccId,
      metadata: {
        isPrimary: index === 0 && !customer.isManager,
        externalId: customer.id,
        isManager: customer.isManager,
        parentMccId: customer.parentMccId,
      },
    }))

    console.log('[OAuth Callback][Google] Success:', {
      integrationId: integration.id,
      accountsCount: accountsData.length,
    })

    const response: OAuthCallbackResponse = {
      success: true,
      integrationId: integration.id,
      accounts: accountsData,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[OAuth Callback][Google] Step 4 failed:', error)
    return errorResponse(
      `Failed to save integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

/**
 * Handle OAuth callback request
 * Routes to platform-specific handler after common validation
 */
export async function handleOAuthCallback(
  req: Request,
  supabaseClient: SupabaseDbClient,
  platform: string
): Promise<Response> {
  try {
    console.log('[OAuth Callback]', { platform })

    // Supported platforms
    const supportedPlatforms = ['meta', 'google']
    if (!supportedPlatforms.includes(platform)) {
      return errorResponse(`Platform ${platform} not supported yet`, 400)
    }

    // Parse request body
    const body: OAuthCallbackRequest = await req.json()
    const { accessToken: tokenOrCode, projectId: projectIdFromBody, redirectUri } = body

    if (!tokenOrCode) {
      return errorResponse('Access token or authorization code is required', 400)
    }

    // Get user from JWT (already validated in index.ts)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Get current project ID: header has priority, body is fallback (for session loss cases)
    let projectId = req.headers.get('X-Project-ID')

    if (!projectId && projectIdFromBody) {
      projectId = projectIdFromBody
      console.log('[OAuth Callback] Using projectId from body (fallback):', projectId)
    } else if (projectId) {
      console.log('[OAuth Callback] Using projectId from header:', projectId)
    }

    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    console.log('[OAuth Callback] Processing for user:', user.id, 'project:', projectId, {
      projectIdSource: req.headers.get('X-Project-ID') ? 'header' : (projectIdFromBody ? 'body (state parameter)' : 'none'),
    })

    // Create service role client for encryption and admin operations
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      console.error('[OAuth Callback] Service role key not configured')
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // Route to platform-specific handler
    if (platform === 'meta') {
      return processMetaCallback(tokenOrCode, projectId, supabaseAdmin)
    } else if (platform === 'google') {
      return processGoogleCallback(tokenOrCode, redirectUri, projectId, supabaseAdmin)
    }

    return errorResponse(`Platform ${platform} not supported`, 400)
  } catch (error) {
    console.error('[OAuth Callback] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to process OAuth callback',
      500
    )
  }
}
