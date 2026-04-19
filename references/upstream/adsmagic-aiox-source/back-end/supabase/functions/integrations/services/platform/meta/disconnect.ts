/**
 * Meta Disconnect Service
 * Revokes tokens and disconnects integration
 */

/**
 * Revoke token in Meta
 * 
 * @param accessToken - Access token to revoke
 * @param userId - Meta user ID
 * @returns Success status
 */
export async function revokeMetaToken(
  accessToken: string,
  userId: string
): Promise<boolean> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
    
    // Revoke permissions
    const revokeUrl = `https://graph.facebook.com/${apiVersion}/${userId}/permissions?` +
      `access_token=${encodeURIComponent(accessToken)}`

    console.log('[Disconnect] Revoking token for user:', userId)

    const response = await fetch(revokeUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Disconnect] Failed to revoke token:', {
        status: response.status,
        error: errorData,
      })
      // Don't throw - token might already be revoked
      return false
    }

    const data = await response.json()
    const success = data.success === true

    console.log('[Disconnect] Token revocation result:', success)

    return success
  } catch (error) {
    console.error('[Disconnect] Error revoking token:', error)
    // Don't throw - continue with disconnect even if revocation fails
    return false
  }
}

