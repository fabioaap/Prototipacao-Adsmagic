/**
 * Edge Function para API de Ad Insights
 *
 * Router principal que gerencia operacoes de metricas de ads:
 * - GET /ad-insights/summary - Metricas agregadas de todas as contas
 * - GET /ad-insights/campaigns - Lista campanhas com metricas
 * - GET /ad-insights/adsets - Lista adsets de uma campanha
 * - GET /ad-insights/ads - Lista anuncios de um adset
 * - GET /ad-insights/performance - Performance detalhada + funil
 * - POST /ad-insights/refresh - Forcar atualizacao do cache
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'
import { handleSummary } from './handlers/summary.ts'
import { handleCampaigns } from './handlers/campaigns.ts'
import { handleAdsets } from './handlers/adsets.ts'
import { handleAds } from './handlers/ads.ts'
import { handleTableConfig } from './handlers/table-config.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Autenticacao via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Unauthorized: Missing Authorization header', 401)
    }

    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Invalid token format', 401)
    }

    // Cliente Supabase com JWT do usuario (RLS automatico)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verificar se o token e valido
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    console.log('[Ad Insights Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id,
    })

    // GET /ad-insights/summary - Metricas agregadas
    if (
      req.method === 'GET' &&
      pathParts.length === 2 &&
      pathParts[1] === 'summary'
    ) {
      return await handleSummary(req, supabaseClient)
    }

    // GET /ad-insights/campaigns - Lista campanhas
    if (
      req.method === 'GET' &&
      pathParts.length === 2 &&
      pathParts[1] === 'campaigns'
    ) {
      return await handleCampaigns(req, supabaseClient)
    }

    // GET /ad-insights/adsets - Lista adsets
    if (
      req.method === 'GET' &&
      pathParts.length === 2 &&
      pathParts[1] === 'adsets'
    ) {
      return await handleAdsets(req, supabaseClient)
    }

    // GET /ad-insights/ads - Lista anuncios
    if (
      req.method === 'GET' &&
      pathParts.length === 2 &&
      pathParts[1] === 'ads'
    ) {
      return await handleAds(req, supabaseClient)
    }

    // GET/PATCH /ad-insights/table-config - Configuracao de colunas da tabela
    if (
      (req.method === 'GET' || req.method === 'PATCH') &&
      pathParts.length === 2 &&
      pathParts[1] === 'table-config'
    ) {
      return await handleTableConfig(req, supabaseClient)
    }

    // GET /ad-insights/performance - Performance detalhada (TODO: implementar)
    if (
      req.method === 'GET' &&
      pathParts.length === 2 &&
      pathParts[1] === 'performance'
    ) {
      return errorResponse(
        'Not Implemented: performance endpoint coming soon',
        501
      )
    }

    // POST /ad-insights/refresh - Forcar atualizacao do cache (TODO: implementar)
    if (
      req.method === 'POST' &&
      pathParts.length === 2 &&
      pathParts[1] === 'refresh'
    ) {
      return errorResponse(
        'Not Implemented: refresh endpoint coming soon',
        501
      )
    }

    // Rota nao encontrada
    return errorResponse('Not Found: Invalid endpoint', 404)
  } catch (error) {
    console.error('[Ad Insights Edge Function Error]', error)

    if (error instanceof SyntaxError) {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return errorResponse(
        'Service Unavailable: Database connection failed',
        503
      )
    }

    return errorResponse('Internal Server Error', 500)
  }
})
