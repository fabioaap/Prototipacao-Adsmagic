/**
 * Edge Function: Job Worker
 *
 * Processa jobs assíncronos em background:
 * - Envio de eventos de conversão (Meta, Google, TikTok)
 * - Refresh de analytics (materialized views)
 * - Processamento de webhooks
 * - Sincronização de integrações
 *
 * Deve ser chamado periodicamente por um cron externo (ex: Cloudflare Workers).
 *
 * Endpoints:
 * - POST /job-worker - Processa jobs pendentes
 * - GET /job-worker/stats - Retorna estatísticas de jobs
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from '../../types/database.types.ts'
import { corsHeaders } from './utils/cors.ts'
import { successResponse, errorResponse } from './utils/response.ts'
import { processJobs } from './handlers/process.ts'
import type { WorkerConfig, QueueName } from './types.ts'
import type { SupabaseDbClient } from './types-db.ts'

interface JwtClaims {
  role?: string
  app_metadata?: {
    role?: string
  }
}

function decodeJwtClaims(token: string): JwtClaims | null {
  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padding = normalized.length % 4
    const padded = padding === 0 ? normalized : normalized + '='.repeat(4 - padding)
    const payload = atob(padded)
    return JSON.parse(payload) as JwtClaims
  } catch {
    return null
  }
}

function isServiceRoleJwt(token: string): boolean {
  const claims = decodeJwtClaims(token)
  if (!claims) {
    return false
  }

  return claims.role === 'service_role' || claims.app_metadata?.role === 'service_role'
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Esta função requer SERVICE_ROLE_KEY (não JWT do usuário)
    // porque precisa acessar jobs de todos os projetos
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!serviceRoleKey) {
      console.error('[Job Worker] SERVICE_ROLE_KEY not configured')
      return errorResponse('Server configuration error', 500)
    }

    // Verificar autorização: credenciais internas do worker.
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : ''

    // Aceita JWT service_role válido (inclui chaves antigas/rotacionadas com mesmo JWT secret)
    // ou fallback estrito de comparação para segredos explícitos.
    const isServiceRoleAuth = bearerToken.length > 0 && (
      isServiceRoleJwt(bearerToken) || bearerToken === serviceRoleKey
    )
    const isCronSecretAuth = !!cronSecret && bearerToken.length > 0 && bearerToken === cronSecret

    if (!isServiceRoleAuth && !isCronSecretAuth) {
      console.warn('[Job Worker] Unauthorized request', {
        method: req.method,
        path: new URL(req.url).pathname,
        hasAuthHeader: !!authHeader
      })
      return errorResponse('Unauthorized', 401)
    }

    // Cliente Supabase com service role (bypass RLS)
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Routing
    const url = new URL(req.url)
    const path = url.pathname

    // GET /job-worker/stats - Estatísticas
    if (req.method === 'GET' && path.endsWith('/stats')) {
      return await handleStats(supabaseClient)
    }

    // POST /job-worker - Processar jobs
    if (req.method === 'POST') {
      return await handleProcess(req, supabaseClient)
    }

    return errorResponse('Not Found', 404)

  } catch (error) {
    console.error('[Job Worker] Fatal error', error)
    return errorResponse('Internal server error', 500)
  }
})

/**
 * Handler para processamento de jobs
 */
async function handleProcess(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  // Configuração do worker
  let body: Partial<WorkerConfig> = {}

  try {
    const text = await req.text()
    if (text) {
      body = JSON.parse(text)
    }
  } catch {
    // Usar defaults
  }

  const config: WorkerConfig = {
    maxJobsPerRun: body.maxJobsPerRun || 10,
    lockDurationMs: body.lockDurationMs || 30000,
    workerInstanceId: body.workerInstanceId || crypto.randomUUID(),
    queueNames: body.queueNames || ['conversion_events', 'analytics'] as QueueName[]
  }

  console.log('[Job Worker] Processing with config', config)

  const result = await processJobs(supabaseClient, config)

  return successResponse(result)
}

/**
 * Handler para estatísticas de jobs
 */
async function handleStats(
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    // Contagem por status
    const { data: statusCounts, error: statusError } = await supabaseClient
      .from('jobs')
      .select('status')

    if (statusError) {
      throw statusError
    }

    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    }

    for (const job of statusCounts || []) {
      const status = job.status as keyof typeof counts
      if (status in counts) {
        counts[status]++
      }
    }

    // Jobs falhados que podem ser retentados
    const { count: retryableCount } = await supabaseClient
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .lt('retry_count', 3)
      .lte('retry_after', new Date().toISOString())

    // Última execução bem-sucedida
    const { data: lastCompleted } = await supabaseClient
      .from('jobs')
      .select('completed_at')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    return successResponse({
      counts,
      retryable: retryableCount || 0,
      lastCompletedAt: lastCompleted?.completed_at || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Job Worker] Stats error', error)
    return errorResponse('Failed to get stats', 500)
  }
}
