/**
 * Google Token Validation Service
 * Validates access tokens and checks expiration.
 */

/**
 * Validate Google access token.
 * Uses tokeninfo endpoint to verify token structure/validity.
 */
export async function validateGoogleToken(accessToken: string): Promise<{
  isValid: boolean
  error?: string
  errorCode?: string
}> {
  try {
    const url = `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string
        error_description?: string
      }
      const err = data.error_description || data.error || 'Google token validation failed'
      return {
        isValid: false,
        error: err,
        errorCode: 'TOKEN_INVALID',
      }
    }

    const tokenInfo = (await response.json().catch(() => ({}))) as {
      expires_in?: string
    }

    if (tokenInfo.expires_in !== undefined && Number(tokenInfo.expires_in) <= 0) {
      return {
        isValid: false,
        error: 'Token expired',
        errorCode: 'TOKEN_EXPIRED',
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Google token validation error',
      errorCode: 'VALIDATION_ERROR',
    }
  }
}
