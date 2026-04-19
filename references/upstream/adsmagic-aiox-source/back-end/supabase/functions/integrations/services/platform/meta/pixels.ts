/**
 * Meta Pixels Service
 * Handles fetching and creating Meta Pixels
 */

import type { Pixel } from '../../../types.ts'

/**
 * Fetch pixels from Meta API for a given ad account
 * 
 * @param accessToken - Long-lived access token
 * @param accountId - Ad account ID (e.g., act_123456)
 * @returns List of pixels
 */
export async function fetchMetaPixels(
  accessToken: string,
  accountId: string
): Promise<Pixel[]> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'

    // Ensure accountId has the act_ prefix required by Meta Graph API
    const normalizedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`

    // Fetch pixels directly from the ad account (works for both personal and Business Manager accounts)
    const pixelsUrl = `https://graph.facebook.com/${apiVersion}/${normalizedAccountId}/adspixels?` +
      `fields=id,name,is_created_by_business&` +
      `access_token=${encodeURIComponent(accessToken)}`

    console.log('[Meta Pixels] Fetching pixels for account:', normalizedAccountId)

    const pixelsResponse = await fetch(pixelsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!pixelsResponse.ok) {
      const errorData = await pixelsResponse.text()
      console.error('[Meta Pixels] Failed to fetch pixels:', {
        status: pixelsResponse.status,
        error: errorData,
      })
      throw new Error(`Failed to fetch pixels: ${pixelsResponse.status} - ${errorData}`)
    }

    const pixelsData = await pixelsResponse.json()
    const pixels = pixelsData.data || []

    console.log('[Meta Pixels] Pixels fetched:', { count: pixels.length })

    return pixels.map((pixel: any) => ({
      id: pixel.id,
      name: pixel.name || `Pixel ${pixel.id}`,
      isCreated: pixel.is_created_by_business || false,
    }))
  } catch (error) {
    console.error('[Meta Pixels] Error fetching pixels:', error)
    throw error
  }
}

/**
 * Create a new pixel in Meta
 * 
 * @param accessToken - Long-lived access token
 * @param accountId - Ad account ID (e.g., act_123456)
 * @param pixelName - Name for the new pixel
 * @returns Created pixel
 */
export async function createMetaPixel(
  accessToken: string,
  accountId: string,
  pixelName: string
): Promise<Pixel> {
  try {
    const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'

    // Ensure accountId has the act_ prefix required by Meta Graph API
    const normalizedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`

    // Create pixel directly on the ad account
    const createUrl = `https://graph.facebook.com/${apiVersion}/${normalizedAccountId}/adspixels`

    console.log('[Meta Pixels] Creating pixel:', pixelName)

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: pixelName,
        access_token: accessToken,
      }),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.text()
      console.error('[Meta Pixels] Failed to create pixel:', {
        status: createResponse.status,
        error: errorData,
      })
      throw new Error(`Failed to create pixel: ${createResponse.status}`)
    }

    const pixelData = await createResponse.json()

    console.log('[Meta Pixels] Pixel created:', pixelData.id)

    return {
      id: pixelData.id,
      name: pixelName,
      isCreated: true,
    }
  } catch (error) {
    console.error('[Meta Pixels] Error creating pixel:', error)
    throw error
  }
}

