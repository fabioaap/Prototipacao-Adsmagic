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
    
    // First, get the business ID from the ad account
    const accountUrl = `https://graph.facebook.com/${apiVersion}/${accountId}?` +
      `fields=business&` +
      `access_token=${encodeURIComponent(accessToken)}`

    console.log('[Meta Pixels] Fetching business ID for account:', accountId)

    const accountResponse = await fetch(accountUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.text()
      console.error('[Meta Pixels] Failed to fetch account:', {
        status: accountResponse.status,
        error: errorData,
      })
      throw new Error(`Failed to fetch account: ${accountResponse.status}`)
    }

    const accountData = await accountResponse.json()
    const businessId = accountData.business?.id

    if (!businessId) {
      console.warn('[Meta Pixels] No business ID found for account')
      return []
    }

    // Fetch pixels from business
    const pixelsUrl = `https://graph.facebook.com/${apiVersion}/${businessId}/owned_pixels?` +
      `fields=id,name,is_created_by_self&` +
      `access_token=${encodeURIComponent(accessToken)}`

    console.log('[Meta Pixels] Fetching pixels for business:', businessId)

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
      throw new Error(`Failed to fetch pixels: ${pixelsResponse.status}`)
    }

    const pixelsData = await pixelsResponse.json()
    const pixels = pixelsData.data || []

    console.log('[Meta Pixels] Pixels fetched:', { count: pixels.length })

    return pixels.map((pixel: any) => ({
      id: pixel.id,
      name: pixel.name || `Pixel ${pixel.id}`,
      isCreated: pixel.is_created_by_self || false,
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
    
    // First, get the business ID from the ad account
    const accountUrl = `https://graph.facebook.com/${apiVersion}/${accountId}?` +
      `fields=business&` +
      `access_token=${encodeURIComponent(accessToken)}`

    console.log('[Meta Pixels] Fetching business ID for account:', accountId)

    const accountResponse = await fetch(accountUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.text()
      console.error('[Meta Pixels] Failed to fetch account:', {
        status: accountResponse.status,
        error: errorData,
      })
      throw new Error(`Failed to fetch account: ${accountResponse.status}`)
    }

    const accountData = await accountResponse.json()
    const businessId = accountData.business?.id

    if (!businessId) {
      throw new Error('No business ID found for account')
    }

    // Create pixel in business
    const createUrl = `https://graph.facebook.com/${apiVersion}/${businessId}/owned_pixels`

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

