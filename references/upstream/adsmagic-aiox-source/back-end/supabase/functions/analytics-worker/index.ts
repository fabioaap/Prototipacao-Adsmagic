/**
 * Analytics Worker
 * Endpoint para refresh automático de materialized views e limpeza de cache
 * 
 * Este worker:
 * - Atualiza materialized views de analytics (refresh CONCURRENTLY)
 * - Limpa cache expirado do dashboard
 * - Pode ser chamado via cron externo (Cloudflare Workers, QStash, etc.)
 * 
 * Frequência recomendada: A cada 5 minutos
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WorkerResult {
  success: boolean
  refreshed_views: string[]
  cache_cleaned: number
  errors: string[]
  duration_ms: number
}

serve(async (req) => {
  const startTime = Date.now()
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Verificar autenticação via header de segurança (opcional)
    // Para workers internos, podemos usar SERVICE_ROLE_KEY ou secret
    const workerSecret = Deno.env.get('ANALYTICS_WORKER_SECRET')
    const providedSecret = req.headers.get('X-Worker-Secret')
    
    if (workerSecret && providedSecret !== workerSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid worker secret' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Criar cliente Supabase com SERVICE_ROLE_KEY para bypassar RLS
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing SERVICE_ROLE_KEY' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    const result: WorkerResult = {
      success: true,
      refreshed_views: [],
      cache_cleaned: 0,
      errors: [],
      duration_ms: 0
    }

    // ----------------------------------------------------------------------------
    // 1. Refresh de Materialized Views (CONCURRENTLY para não bloquear queries)
    // ----------------------------------------------------------------------------
    console.log('[Analytics Worker] Starting refresh of materialized views...')

    const viewsToRefresh = [
      'summary_metrics',
      'funnel_stats',
      'origin_breakdown',
      'pipeline_stats'
    ]

    for (const viewName of viewsToRefresh) {
      try {
        // Chamar função SQL refresh_analytics_materialized_views
        const { error: refreshError } = await supabaseAdmin.rpc(
          'refresh_analytics_materialized_views',
          {
            view_name: viewName,
            refresh_type: 'concurrent' // Refresh incremental (não bloqueia)
          }
        )

        if (refreshError) {
          console.error(`[Analytics Worker] Error refreshing view ${viewName}:`, refreshError)
          result.errors.push(`Failed to refresh ${viewName}: ${refreshError.message}`)
          result.success = false
        } else {
          console.log(`[Analytics Worker] Successfully refreshed view: ${viewName}`)
          result.refreshed_views.push(viewName)
        }
      } catch (error) {
        console.error(`[Analytics Worker] Exception refreshing view ${viewName}:`, error)
        result.errors.push(`Exception refreshing ${viewName}: ${error.message}`)
        result.success = false
      }
    }

    // ----------------------------------------------------------------------------
    // 2. Limpar cache expirado
    // ----------------------------------------------------------------------------
    console.log('[Analytics Worker] Cleaning expired cache...')

    try {
      const { data: deletedCount, error: cleanupError } = await supabaseAdmin.rpc(
        'cleanup_expired_cache'
      )

      if (cleanupError) {
        console.error('[Analytics Worker] Error cleaning expired cache:', cleanupError)
        result.errors.push(`Failed to clean expired cache: ${cleanupError.message}`)
        result.success = false
      } else {
        const count = deletedCount || 0
        console.log(`[Analytics Worker] Cleaned ${count} expired cache entries`)
        result.cache_cleaned = count
      }
    } catch (error) {
      console.error('[Analytics Worker] Exception cleaning expired cache:', error)
      result.errors.push(`Exception cleaning cache: ${error.message}`)
      result.success = false
    }

    // ----------------------------------------------------------------------------
    // 3. Calcular duração
    // ----------------------------------------------------------------------------
    result.duration_ms = Date.now() - startTime

    console.log('[Analytics Worker] Completed', {
      success: result.success,
      refreshed_views: result.refreshed_views.length,
      cache_cleaned: result.cache_cleaned,
      errors: result.errors.length,
      duration_ms: result.duration_ms
    })

    // Retornar resultado
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 207, // 207 = Multi-Status (alguns sucessos, alguns erros)
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('[Analytics Worker] Fatal error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        duration_ms: Date.now() - startTime
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
