/**
 * Integrations Edge Function
 * Handles OAuth flows for external platforms (Meta, Google, TikTok)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'
import { handleOAuthStart } from './handlers/oauth/start.ts'
import { handleOAuthCallback } from './handlers/oauth/callback.ts'
import { handleSelectAccounts } from './handlers/integrations/select-accounts.ts'
import { handleGetPixels } from './handlers/integrations/get-pixels.ts'
import { handleCreatePixel } from './handlers/integrations/create-pixel.ts'
import { handleValidateToken } from './handlers/integrations/validate-token.ts'
import { handleRefreshToken } from './handlers/integrations/refresh-token.ts'
import { handleRenewTokenOAuth } from './handlers/integrations/renew-token-oauth.ts'
import { handleSyncAccounts } from './handlers/integrations/sync-accounts.ts'
import { handleDisconnect } from './handlers/integrations/disconnect.ts'
import { handleGetAuditLogs } from './handlers/integrations/get-audit-logs.ts'
import { handleGetAccounts } from './handlers/integrations/get-accounts.ts'
import { handleListIntegrations } from './handlers/integrations/list-integrations.ts'
import { handleGetGoogleConversionActions } from './handlers/integrations/get-google-conversion-actions.ts'
import { handleSaveGoogleConversionActions } from './handlers/integrations/save-google-conversion-actions.ts'
import { handleGetMetaPixelConfig } from './handlers/integrations/get-meta-pixel-config.ts'
import { handleSaveMetaPixelConfig } from './handlers/integrations/save-meta-pixel-config.ts'
import { handleStartTagVerification } from './handlers/tag/start-verification.ts'
import { handleGetTagVerificationStatus } from './handlers/tag/get-verification-status.ts'
import { handleCheckTagInstallation } from './handlers/tag/check-installation.ts'
import { handleTagVerificationPing } from './handlers/tag/verification-ping.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // POST /integrations/tag/verification/ping - Public endpoint (token-based)
    if (
      req.method === 'POST' &&
      pathParts.length === 4 &&
      pathParts[0] === 'integrations' &&
      pathParts[1] === 'tag' &&
      pathParts[2] === 'verification' &&
      pathParts[3] === 'ping'
    ) {
      return await handleTagVerificationPing(req)
    }

    // Autenticação via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Unauthorized: Missing Authorization header', 401)
    }

    // Validar formato do token
    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Invalid token format', 401)
    }

    // Cliente Supabase com JWT do usuário (RLS automático)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: authHeader 
          } 
        } 
      }
    )

    // Verificar se o token é válido
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    console.log('[Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })
    
    // GET /integrations - List all integrations for a project
    // Pathname will be '/integrations' when calling /functions/v1/integrations
    // After split('/').filter(Boolean), pathParts = ['integrations'] (length === 1)
    if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'integrations') {
      return await handleListIntegrations(req, supabaseClient)
    }
    
    // POST /integrations/oauth/:platform - Start OAuth flow
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'oauth') {
      const platform = pathParts[2]
      return await handleOAuthStart(req, platform)
    }
    
    // POST /integrations/oauth/:platform/callback - OAuth callback
    if (req.method === 'POST' && pathParts.length === 4 && pathParts[1] === 'oauth' && pathParts[3] === 'callback') {
      const platform = pathParts[2]
      return await handleOAuthCallback(req, supabaseClient, platform)
    }
    
    // POST /integrations/:id/select-accounts - Select accounts after OAuth
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'select-accounts') {
      const integrationId = pathParts[1]
      return await handleSelectAccounts(req, supabaseClient, integrationId)
    }
    
    // GET /integrations/:id/pixels - Get available pixels
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'pixels') {
      const integrationId = pathParts[1]
      return await handleGetPixels(req, supabaseClient, integrationId)
    }
    
    // GET /integrations/:id/accounts - Get saved accounts
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'accounts') {
      const integrationId = pathParts[1]
      return await handleGetAccounts(req, supabaseClient, integrationId)
    }

    // GET /integrations/:id/google/conversion-actions - Get Google conversion actions
    if (req.method === 'GET' && pathParts.length === 4 && pathParts[2] === 'google' && pathParts[3] === 'conversion-actions') {
      const integrationId = pathParts[1]
      return await handleGetGoogleConversionActions(req, supabaseClient, integrationId)
    }

    // POST /integrations/:id/google/conversion-actions - Save selected Google conversion actions
    if (req.method === 'POST' && pathParts.length === 4 && pathParts[2] === 'google' && pathParts[3] === 'conversion-actions') {
      const integrationId = pathParts[1]
      return await handleSaveGoogleConversionActions(req, supabaseClient, integrationId)
    }

    // GET /integrations/:id/meta/pixel-config - Get Meta pixel config
    if (req.method === 'GET' && pathParts.length === 4 && pathParts[2] === 'meta' && pathParts[3] === 'pixel-config') {
      const integrationId = pathParts[1]
      return await handleGetMetaPixelConfig(req, supabaseClient, integrationId)
    }

    // POST /integrations/:id/meta/pixel-config - Save Meta pixel config
    if (req.method === 'POST' && pathParts.length === 4 && pathParts[2] === 'meta' && pathParts[3] === 'pixel-config') {
      const integrationId = pathParts[1]
      return await handleSaveMetaPixelConfig(req, supabaseClient, integrationId)
    }
    
    // POST /integrations/:id/pixels - Create new pixel
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'pixels') {
      const integrationId = pathParts[1]
      return await handleCreatePixel(req, supabaseClient, integrationId)
    }
    
    // GET /integrations/:id/validate-token - Validate token
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'validate-token') {
      const integrationId = pathParts[1]
      return await handleValidateToken(req, supabaseClient, integrationId)
    }
    
    // POST /integrations/:id/refresh-token - Refresh token
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'refresh-token') {
      const integrationId = pathParts[1]
      return await handleRefreshToken(req, supabaseClient, integrationId)
    }

    // POST /integrations/:id/renew-token-oauth - Renew token via new OAuth flow
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'renew-token-oauth') {
      const integrationId = pathParts[1]
      return await handleRenewTokenOAuth(req, supabaseClient, integrationId)
    }
    
    // POST /integrations/:id/sync-accounts - Sync accounts
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'sync-accounts') {
      const integrationId = pathParts[1]
      return await handleSyncAccounts(req, supabaseClient, integrationId)
    }

    // POST /integrations/tag/check - Check installation status (authenticated)
    if (
      req.method === 'POST' &&
      pathParts.length === 3 &&
      pathParts[0] === 'integrations' &&
      pathParts[1] === 'tag' &&
      pathParts[2] === 'check'
    ) {
      return await handleCheckTagInstallation(req, supabaseClient)
    }

    // GET /integrations/tag/status - Backward-compatible status endpoint
    if (
      req.method === 'GET' &&
      pathParts.length === 3 &&
      pathParts[0] === 'integrations' &&
      pathParts[1] === 'tag' &&
      pathParts[2] === 'status'
    ) {
      return await handleCheckTagInstallation(req, supabaseClient)
    }

    // POST /integrations/tag/verification/start - Start one-shot verification
    if (
      req.method === 'POST' &&
      pathParts.length === 4 &&
      pathParts[0] === 'integrations' &&
      pathParts[1] === 'tag' &&
      pathParts[2] === 'verification' &&
      pathParts[3] === 'start'
    ) {
      return await handleStartTagVerification(req, supabaseClient)
    }

    // GET /integrations/tag/verification/:id - Get verification status
    if (
      req.method === 'GET' &&
      pathParts.length === 4 &&
      pathParts[0] === 'integrations' &&
      pathParts[1] === 'tag' &&
      pathParts[2] === 'verification'
    ) {
      const verificationId = pathParts[3]
      return await handleGetTagVerificationStatus(req, supabaseClient, verificationId)
    }
    
    // DELETE /integrations/:id - Disconnect integration
    if (req.method === 'DELETE' && pathParts.length === 2) {
      const integrationId = pathParts[1]
      return await handleDisconnect(req, supabaseClient, integrationId)
    }
    
    // GET /integrations/:id/audit-logs - Get audit logs
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'audit-logs') {
      const integrationId = pathParts[1]
      return await handleGetAuditLogs(req, supabaseClient, integrationId)
    }
    
    // GET /integrations/debug/env - Debug endpoint to check environment variables (TEMPORARY)
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'debug' && url.searchParams.get('check') === 'env') {
      const clientId = Deno.env.get('META_OAUTH_CLIENT_ID')
      const clientSecret = Deno.env.get('META_OAUTH_CLIENT_SECRET')
      const apiVersion = Deno.env.get('META_OAUTH_API_VERSION')
      
      // List all environment variables that contain 'META'
      const envObj = Deno.env.toObject()
      const metaEnvKeys = Object.keys(envObj).filter(key => key.includes('META')).sort()
      
      return new Response(JSON.stringify({
        debug: 'Environment variables check',
        variables: {
          META_OAUTH_CLIENT_ID: {
            exists: !!clientId,
            length: clientId?.length || 0,
            firstChar: clientId ? clientId[0] : null,
            lastChar: clientId ? clientId[clientId.length - 1] : null,
          },
          META_OAUTH_CLIENT_SECRET: {
            exists: !!clientSecret,
            length: clientSecret?.length || 0,
            firstChar: clientSecret ? clientSecret[0] : null,
            lastChar: clientSecret ? clientSecret[clientSecret.length - 1] : null,
          },
          META_OAUTH_API_VERSION: {
            exists: !!apiVersion,
            value: apiVersion || 'not set (using default)',
          },
        },
        allMetaEnvKeys: metaEnvKeys.sort(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Route not found
    return errorResponse('Route not found', 404)
  } catch (error) {
    console.error('[Edge Function] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
})
