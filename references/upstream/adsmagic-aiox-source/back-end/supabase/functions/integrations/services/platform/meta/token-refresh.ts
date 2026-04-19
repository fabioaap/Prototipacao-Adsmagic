/**
 * Meta Token Refresh Service
 * Refreshes long-lived tokens before expiration
 */

/**
 * Refresh a long-lived token
 * 
 * @param currentToken - Current long-lived token
 * @returns New long-lived token and expiration
 */
export async function refreshMetaToken(
  currentToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
    const clientId = Deno.env.get('META_OAUTH_CLIENT_ID')
    const clientSecret = Deno.env.get('META_OAUTH_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('Meta OAuth credentials not configured')
    }

    // Build refresh URL
    const refreshUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `client_secret=${encodeURIComponent(clientSecret)}&` +
      `fb_exchange_token=${encodeURIComponent(currentToken)}`

    console.log('[Token Refresh] Refreshing long-lived token')

    // Make refresh request
    const response = await fetch(refreshUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Token Refresh] Failed:', {
        status: response.status,
        error: errorData,
      })
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      console.error('[Token Refresh] No access token in response:', data)
      throw new Error('No access token in refresh response')
    }

    // Long-lived tokens typically expire in ~60 days (5184000 seconds)
    const expiresIn = data.expires_in || 5184000

    console.log('[Token Refresh] Success', {
      expiresIn,
      expiresInDays: Math.floor(expiresIn / 86400),
    })

    return {
      accessToken: data.access_token,
      expiresIn,
    }
  } catch (error) {
    console.error('[Token Refresh] Error:', error)
    throw error
  }
}

