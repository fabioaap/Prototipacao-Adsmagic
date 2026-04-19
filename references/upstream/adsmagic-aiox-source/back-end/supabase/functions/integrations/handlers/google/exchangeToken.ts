/**
 * Google Token Exchange
 * Exchanges authorization code for access + refresh tokens
 * and fetches user/account data from Google APIs
 */

import type { GoogleTokenExchangeResponse } from '../../types.ts'

/**
 * Exchange authorization code for access and refresh tokens
 *
 * @param code - Authorization code from OAuth callback
 * @param redirectUri - Must match the redirect_uri used in the authorization request
 * @returns Access token, refresh token, and expiration
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string | null; expiresIn: number }> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')

  console.log('[Google Token Exchange] Checking environment variables:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId?.length || 0,
    clientSecretLength: clientSecret?.length || 0,
  })

  if (!clientId || !clientSecret) {
    console.error('[Google Token Exchange] Credentials not configured:', {
      clientId: clientId ? 'configured' : 'missing',
      clientSecret: clientSecret ? 'configured' : 'missing',
    })
    throw new Error('Google OAuth credentials not configured')
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  console.log('[Google Token Exchange] Exchanging authorization code for tokens')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('[Google Token Exchange] Failed:', {
      status: response.status,
      error: errorData,
    })
    throw new Error(`Token exchange failed: ${response.status}`)
  }

  const data: GoogleTokenExchangeResponse = await response.json()

  if (!data.access_token) {
    console.error('[Google Token Exchange] No access token in response:', data)
    throw new Error('No access token in exchange response')
  }

  const expiresIn = data.expires_in || 3600

  console.log('[Google Token Exchange] Success', {
    expiresIn,
    hasRefreshToken: !!data.refresh_token,
  })

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn,
  }
}

/**
 * Fetch user info from Google
 *
 * @param accessToken - OAuth access token
 * @returns User data (id, name, email)
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<{
  id: string
  name: string
  email: string
}> {
  console.log('[Google API] Fetching user info')

  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('[Google API] Failed to fetch user info:', {
      status: response.status,
      error: errorData,
    })
    throw new Error(`Failed to fetch user info: ${response.status}`)
  }

  const data = await response.json()

  console.log('[Google API] User info fetched:', { id: data.id, name: data.name })

  return {
    id: data.id,
    name: data.name || data.given_name || 'Google User',
    email: data.email || '',
  }
}

/**
 * Execute a GAQL search query against Google Ads API v23
 * Uses the non-streaming `search` endpoint for simpler JSON parsing.
 */
async function executeGaqlSearch(
  customerId: string,
  accessToken: string,
  developerToken: string,
  query: string,
  loginCustomerId?: string
): Promise<unknown[]> {
  const url = `https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:search`

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('[Google API] GAQL search error:', {
      customerId,
      status: response.status,
      error: errorData,
    })
    throw new Error(`GAQL search failed: ${response.status}`)
  }

  const data = await response.json()
  return data.results || []
}

/**
 * Check if a customer is an MCC (manager account) using GAQL
 */
async function checkCustomerIsManager(
  customerId: string,
  accessToken: string,
  developerToken: string
): Promise<{ descriptiveName: string; isManager: boolean }> {
  const query = 'SELECT customer.descriptive_name, customer.manager FROM customer LIMIT 1'

  const results = await executeGaqlSearch(
    customerId,
    accessToken,
    developerToken,
    query,
    customerId
  )

  if (results.length === 0) {
    return { descriptiveName: `Google Ads (${customerId})`, isManager: false }
  }

  const row = results[0] as {
    customer?: { descriptiveName?: string; manager?: boolean }
  }

  return {
    descriptiveName: row.customer?.descriptiveName || `Google Ads (${customerId})`,
    isManager: row.customer?.manager === true,
  }
}

/**
 * Fetch child (non-manager) accounts under an MCC
 */
async function fetchMccChildAccounts(
  mccId: string,
  accessToken: string,
  developerToken: string
): Promise<Array<{ customerId: string; descriptiveName: string }>> {
  const query = `
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.manager
    FROM customer_client
    WHERE customer_client.manager = false
  `

  const results = await executeGaqlSearch(
    mccId,
    accessToken,
    developerToken,
    query,
    mccId
  )

  return (results as Array<{
    customerClient?: {
      id?: string
      descriptiveName?: string
    }
  }>).map(row => ({
    customerId: String(row.customerClient?.id || ''),
    descriptiveName: row.customerClient?.descriptiveName || '',
  })).filter(child => child.customerId !== '')
}

/**
 * Fetch accessible Google Ads customer accounts with MCC detection
 *
 * Flow:
 * 1. List accessible customers via listAccessibleCustomers
 * 2. For each, check if MCC using GAQL (customer.manager field)
 * 3. If MCC, fetch child accounts via customer_client resource
 * 4. Return consolidated list with hierarchy info
 *
 * @param accessToken - OAuth access token
 * @returns List of customer accounts with MCC hierarchy
 */
export async function fetchGoogleAdsCustomers(accessToken: string): Promise<Array<{
  id: string
  name: string
  customerId: string
  currency?: string
  isManager: boolean
  parentMccId?: string
}>> {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')

  if (!developerToken) {
    console.error('[Google API] GOOGLE_ADS_DEVELOPER_TOKEN not configured')
    throw new Error('Google Ads developer token not configured')
  }

  console.log('[Google API] Listing accessible customers')

  // Step 1: List accessible customer IDs
  const listResponse = await fetch(
    'https://googleads.googleapis.com/v23/customers:listAccessibleCustomers',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Accept': 'application/json',
      },
    }
  )

  if (!listResponse.ok) {
    const errorData = await listResponse.text()
    console.error('[Google API] Failed to list customers:', {
      status: listResponse.status,
      error: errorData,
      hint: listResponse.status === 404
        ? 'API version may be sunset or Google Ads API not enabled in Cloud Console'
        : listResponse.status === 403
          ? 'Developer token may lack access or Google Ads API not enabled'
          : 'Check developer token and API configuration',
    })
    throw new Error(`Failed to list Google Ads customers: ${listResponse.status} - ${errorData}`)
  }

  const listData = await listResponse.json()
  const resourceNames: string[] = listData.resourceNames || []

  console.log('[Google API] Accessible customers found:', { count: resourceNames.length })

  if (resourceNames.length === 0) {
    return []
  }

  // Step 2: Check each customer for MCC status using GAQL (in parallel)
  const customerChecks = resourceNames.map(async (resourceName) => {
    const customerId = resourceName.replace('customers/', '')
    try {
      const { descriptiveName, isManager } = await checkCustomerIsManager(
        customerId,
        accessToken,
        developerToken
      )
      return { customerId, descriptiveName, isManager }
    } catch (err) {
      console.warn('[Google API] Could not check customer:', customerId, err)
      return { customerId, descriptiveName: `Google Ads (${customerId})`, isManager: false }
    }
  })

  const checkedCustomers = await Promise.allSettled(customerChecks)

  const customers: Array<{
    id: string
    name: string
    customerId: string
    currency?: string
    isManager: boolean
    parentMccId?: string
  }> = []

  for (const result of checkedCustomers) {
    if (result.status !== 'fulfilled') continue
    const { customerId, descriptiveName, isManager } = result.value

    if (isManager) {
      // Step 3: Fetch child accounts under this MCC
      console.log('[Google API] MCC detected, fetching child accounts:', customerId)

      // Add the MCC itself (for display grouping)
      customers.push({
        id: `customers/${customerId}`,
        name: descriptiveName,
        customerId,
        isManager: true,
      })

      try {
        const children = await fetchMccChildAccounts(customerId, accessToken, developerToken)

        for (const child of children) {
          customers.push({
            id: `customers/${child.customerId}`,
            name: child.descriptiveName || `Google Ads (${child.customerId})`,
            customerId: child.customerId,
            isManager: false,
            parentMccId: customerId,
          })
        }
      } catch (err) {
        console.warn('[Google API] Failed to fetch MCC children for:', customerId, err)
      }
    } else {
      // Standalone non-MCC account
      customers.push({
        id: `customers/${customerId}`,
        name: descriptiveName,
        customerId,
        isManager: false,
      })
    }
  }

  console.log('[Google API] Customer details fetched:', {
    total: customers.length,
    managers: customers.filter(c => c.isManager).length,
    childAccounts: customers.filter(c => c.parentMccId).length,
    standalone: customers.filter(c => !c.isManager && !c.parentMccId).length,
  })

  return customers
}
