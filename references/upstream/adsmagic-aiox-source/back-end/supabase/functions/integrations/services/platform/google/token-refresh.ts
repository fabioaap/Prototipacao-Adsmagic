/**
 * Google Token Refresh Service
 * Refreshes OAuth access tokens using a stored refresh token.
 */

interface GoogleRefreshResponse {
  access_token?: string
  expires_in?: number
  refresh_token?: string
  error?: string
  error_description?: string
}

/**
 * Refresh Google access token using refresh token flow.
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number; refreshToken?: string | null }> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  const data = (await response.json().catch(() => ({}))) as GoogleRefreshResponse

  if (!response.ok || !data.access_token) {
    const reason =
      data.error_description ||
      data.error ||
      `Google refresh failed with status ${response.status}`
    throw new Error(reason)
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 3600,
    refreshToken: data.refresh_token || null,
  }
}
