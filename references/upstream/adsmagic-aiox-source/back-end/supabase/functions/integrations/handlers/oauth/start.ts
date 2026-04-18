/**
 * OAuth Start Handler
 * Generates OAuth authorization URL for Meta
 */

import type { OAuthStartResponse } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'

/**
 * Validate redirect URI for security
 */
function validateRedirectUri(redirectUri: string): boolean {
  try {
    const url = new URL(redirectUri)
    
    // Lista de origens permitidas
    const allowedOrigins = [
      Deno.env.get('FRONTEND_URL') || '',
      Deno.env.get('META_OAUTH_REDIRECT_URI') || '', // Fallback para variável de ambiente
      'https://adsmagic.com.br',
      'https://www.adsmagic.com.br',
      'https://adsmagic-first-ai.pages.dev', // Cloudflare Pages - produção
      // Adicionar localhost apenas em desenvolvimento
      ...(Deno.env.get('ENVIRONMENT') === 'development' || !Deno.env.get('ENVIRONMENT')
        ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173']
        : []
      )
    ].filter(Boolean) // Remove valores vazios
    
    const isValidOrigin = allowedOrigins.some(origin => {
      try {
        const originUrl = new URL(origin)
        return url.origin === originUrl.origin
      } catch {
        // Se origin não é URL válida, verificar se redirectUri começa com ela
        return redirectUri.startsWith(origin)
      }
    })
    
    // Garantir que pathname é válido (começa com /)
    const hasValidPath = url.pathname.startsWith('/')
    
    // Garantir HTTPS em produção (exceto localhost)
    const isSecure = url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    
    return isValidOrigin && hasValidPath && isSecure
  } catch (error) {
    console.error('[OAuth Start] Invalid redirect URI format:', error)
    return false
  }
}

/**
 * Handle OAuth start request
 * Generates authorization URL for the specified platform
 */
export async function handleOAuthStart(
  req: Request,
  platform: string
): Promise<Response> {
  try {
    console.log('[OAuth Start]', { platform })

    // Supported platforms
    const supportedPlatforms = ['meta', 'google']
    if (!supportedPlatforms.includes(platform)) {
      return errorResponse(`Platform ${platform} not supported yet`, 400)
    }

    // Parse request body to get redirectUri from frontend
    let redirectUri: string | null = null
    try {
      const body = await req.json()
      redirectUri = body.redirectUri || null
    } catch (error) {
      // Se não houver body, usar variável de ambiente como fallback
      console.log('[OAuth Start] No redirectUri in body, using environment variable')
    }

    // Use redirectUri from request body, fallback to environment variable
    if (!redirectUri) {
      const envRedirectUri = platform === 'meta'
        ? Deno.env.get('META_OAUTH_REDIRECT_URI')
        : Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI')
      redirectUri = envRedirectUri || null
    }

    if (!redirectUri) {
      console.error('[OAuth Start] No redirectUri provided')
      return errorResponse('Redirect URI is required. Please provide redirectUri in request body.', 400)
    }

    // Validate redirect URI for security
    if (!validateRedirectUri(redirectUri)) {
      console.error('[OAuth Start] Invalid redirect URI:', redirectUri)
      return errorResponse('Invalid redirect URI. The redirect URI must belong to an allowed origin and use HTTPS in production.', 400)
    }

    // Get project ID from header to include in state parameter
    const projectId = req.headers.get('X-Project-ID')

    // Build state parameter with projectId (OAuth 2.0 standard parameter)
    let stateParam = ''
    if (projectId) {
      const state = encodeURIComponent(JSON.stringify({ projectId }))
      stateParam = `&state=${state}`
      console.log('[OAuth Start] Including projectId in state parameter:', projectId)
    } else {
      console.warn('[OAuth Start] No X-Project-ID header found, state parameter will not include projectId')
    }

    // Build OAuth URL based on platform
    let authUrl: string

    if (platform === 'meta') {
      const apiVersion = Deno.env.get('META_OAUTH_API_VERSION') || 'v23.0'
      const clientId = Deno.env.get('META_OAUTH_CLIENT_ID')
      const scope = Deno.env.get('META_OAUTH_SCOPE') || 'ads_read,business_management,ads_management'

      if (!clientId) {
        console.error('[OAuth Start] META_OAUTH_CLIENT_ID not configured')
        return errorResponse('Meta OAuth not configured: META_OAUTH_CLIENT_ID environment variable is missing.', 500)
      }

      authUrl = `https://www.facebook.com/${apiVersion}/dialog/oauth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&response_type=token` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}` +
        stateParam

      console.log('[OAuth Start] Generated auth URL for Meta', { hasState: !!stateParam })
    } else if (platform === 'google') {
      const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
      const scope = 'https://www.googleapis.com/auth/adwords openid email profile'

      if (!clientId) {
        console.error('[OAuth Start] GOOGLE_OAUTH_CLIENT_ID not configured')
        return errorResponse('Google OAuth not configured: GOOGLE_OAUTH_CLIENT_ID environment variable is missing.', 500)
      }

      // Google uses authorization code flow with offline access for refresh tokens
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        stateParam

      console.log('[OAuth Start] Generated auth URL for Google', { hasState: !!stateParam })
    } else {
      return errorResponse(`Platform ${platform} not supported`, 400)
    }

    const response: OAuthStartResponse = {
      authUrl,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[OAuth Start] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to generate OAuth URL',
      500
    )
  }
}

