/**
 * Meta Token Exchange
 * Exchanges short-lived token (1-2h) for long-lived token (~60 days)
 */

import type { MetaTokenExchangeResponse } from '../../types.ts'

/**
 * Exchange short-lived token for long-lived token
 * 
 * @param shortLivedToken - Short-lived access token from OAuth callback
 * @returns Long-lived access token and expiration
 */
export async function exchangeTokenForLongLived(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
    const clientId = Deno.env.get('META_OAUTH_CLIENT_ID')
    const clientSecret = Deno.env.get('META_OAUTH_CLIENT_SECRET')

    // Debug: Verificar se as variáveis estão configuradas (sem mostrar valores)
    console.log('[Token Exchange] Debug - Verificando variáveis de ambiente:', {
      hasApiVersion: !!Deno.env.get('META_OAUTH_API_VERSION'),
      apiVersion,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0,
    })

    if (!clientId || !clientSecret) {
      console.error('[Token Exchange] Credenciais não configuradas:', {
        clientId: clientId ? '✅ configurado' : '❌ ausente',
        clientSecret: clientSecret ? '✅ configurado' : '❌ ausente',
      })
      throw new Error('Meta OAuth credentials not configured')
    }

    // Build exchange URL
    const exchangeUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&client_secret=${encodeURIComponent(clientSecret)}` +
      `&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`

    console.log('[Token Exchange] Exchanging short-lived token for long-lived')

    // Make exchange request
    const response = await fetch(exchangeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Token Exchange] Failed:', {
        status: response.status,
        error: errorData,
      })
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    const data: MetaTokenExchangeResponse = await response.json()

    if (!data.access_token) {
      console.error('[Token Exchange] No access token in response:', data)
      throw new Error('No access token in exchange response')
    }

    // Long-lived tokens typically expire in ~60 days (5184000 seconds)
    const expiresIn = data.expires_in || 5184000

    console.log('[Token Exchange] Success', {
      expiresIn,
      expiresInDays: Math.floor(expiresIn / 86400),
    })

    return {
      accessToken: data.access_token,
      expiresIn,
    }
  } catch (error) {
    console.error('[Token Exchange] Error:', error)
    throw error
  }
}

/**
 * Fetch user data from Meta API
 * 
 * @param accessToken - Long-lived access token
 * @returns User data (id, name, email)
 */
export async function fetchMetaUserData(accessToken: string): Promise<{
  id: string
  name: string
  email?: string
}> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
    
    const url = `https://graph.facebook.com/${apiVersion}/me?` +
      `fields=id,name,email` +
      `&access_token=${encodeURIComponent(accessToken)}`

    console.log('[Meta API] Fetching user data')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Meta API] Failed to fetch user:', {
        status: response.status,
        error: errorData,
      })
      throw new Error(`Failed to fetch user data: ${response.status}`)
    }

    const data = await response.json()

    console.log('[Meta API] User data fetched:', { id: data.id, name: data.name })

    return data
  } catch (error) {
    console.error('[Meta API] Error fetching user:', error)
    throw error
  }
}

/**
 * Fetch ad accounts from Meta API
 * 
 * @param accessToken - Long-lived access token
 * @returns List of ad accounts
 */
export async function fetchMetaAdAccounts(accessToken: string): Promise<Array<{
  id: string
  name: string
  account_id: string
  currency?: string
}>> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
    
    const url = `https://graph.facebook.com/${apiVersion}/me/adaccounts?` +
      `fields=id,name,account_id,currency` +
      `&access_token=${encodeURIComponent(accessToken)}`

    console.log('[Meta API] Fetching ad accounts')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Meta API] Failed to fetch ad accounts:', {
        status: response.status,
        error: errorData,
      })
      throw new Error(`Failed to fetch ad accounts: ${response.status}`)
    }

    const data = await response.json()
    const accounts = data.data || []

    console.log('[Meta API] Ad accounts fetched:', { count: accounts.length })

    return accounts
  } catch (error) {
    console.error('[Meta API] Error fetching ad accounts:', error)
    throw error
  }
}

