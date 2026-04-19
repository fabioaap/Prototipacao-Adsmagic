/**
 * Meta Token Validation Service
 * Validates tokens by making test requests to Meta API
 */

/**
 * Validate a token by making a test request to Meta API
 * 
 * @param accessToken - Access token to validate
 * @returns Object with isValid flag and error if invalid
 */
export async function validateMetaToken(accessToken: string): Promise<{
  isValid: boolean
  error?: string
  errorCode?: string
}> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
    
    // Make a simple request to validate token
    const url = `https://graph.facebook.com/${apiVersion}/me?` +
      `fields=id&` +
      `access_token=${encodeURIComponent(accessToken)}`

    console.log('[Token Validation] Validating token')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Check for specific error codes
      const errorCode = errorData.error?.code
      const errorMessage = errorData.error?.message || 'Token validation failed'

      // Token expired or invalid
      if (errorCode === 190 || errorCode === 102) {
        console.log('[Token Validation] Token expired or invalid:', errorCode)
        return {
          isValid: false,
          error: 'Token expired or invalid',
          errorCode: 'TOKEN_EXPIRED',
        }
      }

      // Other errors
      console.error('[Token Validation] Token validation failed:', {
        status: response.status,
        error: errorData,
      })
      
      return {
        isValid: false,
        error: errorMessage,
        errorCode: errorCode?.toString() || 'VALIDATION_FAILED',
      }
    }

    const data = await response.json()

    if (data.id) {
      console.log('[Token Validation] Token is valid')
      return { isValid: true }
    }

    return {
      isValid: false,
      error: 'Invalid token response',
      errorCode: 'INVALID_RESPONSE',
    }
  } catch (error) {
    console.error('[Token Validation] Error validating token:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Token validation error',
      errorCode: 'VALIDATION_ERROR',
    }
  }
}

/**
 * Check if token is expired based on expiration date
 * 
 * @param tokenExpiresAt - Token expiration date (ISO string)
 * @param daysBeforeExpiry - Days before expiry to consider as "expiring soon" (default: 7)
 * @returns Object with status and days until expiry
 */
export function checkTokenExpiry(
  tokenExpiresAt: string | null | undefined,
  daysBeforeExpiry = 7
): {
  isExpired: boolean
  isExpiringSoon: boolean
  daysUntilExpiry: number | null
} {
  if (!tokenExpiresAt) {
    return {
      isExpired: true,
      isExpiringSoon: true,
      daysUntilExpiry: null,
    }
  }

  const expiryDate = new Date(tokenExpiresAt)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    isExpired: daysUntilExpiry < 0,
    isExpiringSoon: daysUntilExpiry <= daysBeforeExpiry && daysUntilExpiry >= 0,
    daysUntilExpiry: daysUntilExpiry >= 0 ? daysUntilExpiry : null,
  }
}

