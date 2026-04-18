/**
 * Edge Function para API de Dashboard
 * 
 * Router principal que gerencia todas as operações de dashboard:
 * - GET /dashboard/metrics - Métricas agregadas (legado)
 * - GET /dashboard/summary - North Star KPIs (14 métricas com deltas)
 * - GET /dashboard/time-series - Dados de série temporal
 * - GET /dashboard/origin-performance - Performance por origem (legado)
 * - GET /dashboard/origin-breakdown - Breakdown detalhado por origem
 * - GET /dashboard/funnel-stats - Estatísticas de funil de conversão
 * - GET /dashboard/pipeline-stats - Estatísticas de pipeline de vendas
 * - GET /dashboard/drill-down - Entidades filtradas para drill-down
 * - PATCH /dashboard/north-star-config - Configuração de cards e métricas customizadas
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
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

    // Verificar se o token é válido fazendo uma consulta simples
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('[Dashboard Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })
    
    // GET /dashboard/metrics - Métricas agregadas (legado, mantido para compatibilidade)
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'metrics') {
      const { handleMetrics } = await import('./handlers/metrics.ts')
      return await handleMetrics(req, supabaseClient)
    }
    
    // GET /dashboard/summary - North Star KPIs (14 métricas com deltas)
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'summary') {
      const { handleSummary } = await import('./handlers/summary.ts')
      return await handleSummary(req, supabaseClient)
    }
    
    // GET /dashboard/time-series - Dados de série temporal
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'time-series') {
      const { handleTimeSeries } = await import('./handlers/timeSeries.ts')
      return await handleTimeSeries(req, supabaseClient)
    }
    
    // GET /dashboard/origin-performance - Performance por origem (legado, mantido para compatibilidade)
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'origin-performance') {
      const { handleOriginPerformance } = await import('./handlers/originPerformance.ts')
      return await handleOriginPerformance(req, supabaseClient)
    }
    
    // GET /dashboard/origin-breakdown - Breakdown detalhado por origem
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'origin-breakdown') {
      const { handleOriginBreakdown } = await import('./handlers/origin-breakdown.ts')
      return await handleOriginBreakdown(req, supabaseClient)
    }
    
    // GET /dashboard/funnel-stats - Estatísticas de funil de conversão
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'funnel-stats') {
      const { handleFunnelStats } = await import('./handlers/funnel-stats.ts')
      return await handleFunnelStats(req, supabaseClient)
    }
    
    // GET /dashboard/pipeline-stats - Estatísticas de pipeline de vendas
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'pipeline-stats') {
      const { handlePipelineStats } = await import('./handlers/pipeline-stats.ts')
      return await handlePipelineStats(req, supabaseClient)
    }
    
    // GET /dashboard/drill-down - Entidades filtradas para drill-down
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'drill-down') {
      const { handleDrillDown } = await import('./handlers/drill-down.ts')
      return await handleDrillDown(req, supabaseClient)
    }

    // PATCH /dashboard/north-star-config - Configuração de cards e métricas customizadas
    if (req.method === 'PATCH' && pathParts.length === 2 && pathParts[1] === 'north-star-config') {
      const { handleNorthStarConfig } = await import('./handlers/north-star-config.ts')
      return await handleNorthStarConfig(req, supabaseClient)
    }

    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[Dashboard Edge Function Error]', error)
    
    // Tratar erros específicos
    if (error instanceof SyntaxError) {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return errorResponse('Service Unavailable: Database connection failed', 503)
    }
    
    return errorResponse('Internal Server Error', 500)
  }
})
