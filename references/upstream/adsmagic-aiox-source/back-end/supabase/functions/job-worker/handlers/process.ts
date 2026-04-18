/**
 * Handler principal para processamento de jobs
 *
 * Responsabilidades:
 * 1. Buscar jobs pending por prioridade
 * 2. Fazer lock otimístico do job
 * 3. Executar handler apropriado
 * 4. Atualizar status e resultado
 * 5. Gerenciar retries com exponential backoff
 */

import { calculateRetryAfter } from '../utils/retry.ts'
import { executeSendEvent } from '../executors/send-event.ts'
import type { Job, JobResult, WorkerConfig, ProcessResult } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Json } from '../../../types/database.types.ts'

/**
 * Processa jobs pendentes
 */
export async function processJobs(
  supabaseClient: SupabaseDbClient,
  config: WorkerConfig
): Promise<ProcessResult> {
  const results: JobResult[] = []
  const errors: string[] = []

  console.log('[Job Worker] Starting processing', {
    queues: config.queueNames,
    maxJobs: config.maxJobsPerRun,
    workerId: config.workerInstanceId
  })

  try {
    // 1. Buscar jobs pendentes
    const pendingJobs = await fetchPendingJobs(supabaseClient, config)

    // 2. Buscar jobs prontos para retry
    const retryJobs = await fetchRetryReadyJobs(supabaseClient, config)

    // Combinar e limitar
    const allJobs = [...pendingJobs, ...retryJobs].slice(0, config.maxJobsPerRun)

    console.log('[Job Worker] Found jobs', {
      pending: pendingJobs.length,
      retry: retryJobs.length,
      total: allJobs.length
    })

    // 3. Processar cada job
    for (const job of allJobs) {
      const result = await processJob(job, supabaseClient, config)
      results.push(result)

      if (result.status === 'failed' && result.error) {
        errors.push(`Job ${job.id}: ${result.error}`)
      }
    }

    return {
      success: true,
      processed: results.length,
      results,
      errors
    }

  } catch (error) {
    console.error('[Job Worker] Fatal error', error)
    return {
      success: false,
      processed: results.length,
      results,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Busca jobs pendentes ordenados por prioridade
 */
async function fetchPendingJobs(
  supabaseClient: SupabaseDbClient,
  config: WorkerConfig
): Promise<Job[]> {
  const { data, error } = await supabaseClient
    .from('jobs')
    .select('*')
    .in('queue_name', config.queueNames)
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('scheduled_at', { ascending: true })
    .limit(config.maxJobsPerRun)

  if (error) {
    console.error('[Job Worker] Error fetching pending jobs', error)
    return []
  }

  return (data as Job[]) || []
}

/**
 * Busca jobs falhados prontos para retry
 */
async function fetchRetryReadyJobs(
  supabaseClient: SupabaseDbClient,
  config: WorkerConfig
): Promise<Job[]> {
  const { data, error } = await supabaseClient
    .from('jobs')
    .select('*')
    .in('queue_name', config.queueNames)
    .eq('status', 'failed')
    .lt('retry_count', 3) // Usar max_retries seria melhor mas precisa de SQL raw
    .lte('retry_after', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('retry_after', { ascending: true })
    .limit(config.maxJobsPerRun)

  if (error) {
    console.error('[Job Worker] Error fetching retry jobs', error)
    return []
  }

  return (data as Job[]) || []
}

/**
 * Processa um único job
 */
async function processJob(
  job: Job,
  supabaseClient: SupabaseDbClient,
  config: WorkerConfig
): Promise<JobResult> {
  console.log('[Job Worker] Processing job', {
    jobId: job.id,
    queue: job.queue_name,
    type: job.job_type,
    retryCount: job.retry_count
  })

  try {
    // 1. Tentar fazer lock do job (otimístico)
    const locked = await lockJob(job.id, config.workerInstanceId, supabaseClient)

    if (!locked) {
      console.log('[Job Worker] Job already locked by another worker', job.id)
      return {
        jobId: job.id,
        status: 'skipped',
        error: 'Job locked by another worker'
      }
    }

    // 2. Executar o job baseado no tipo
    let result: { success: boolean; nonRetryable?: boolean; response?: Record<string, unknown>; error?: string }

    switch (job.job_type) {
      case 'send_event':
        result = await executeSendEvent(job, supabaseClient)
        break

      case 'refresh_analytics':
        result = await executeRefreshAnalytics(supabaseClient)
        break

      default:
        result = {
          success: false,
          error: `Unknown job type: ${job.job_type}`
        }
    }

    // 3. Atualizar status do job
    if (result.success) {
      await completeJob(job.id, result.response || {}, supabaseClient)
      return {
        jobId: job.id,
        status: 'completed',
        result: result.response
      }
    } else {
      // Não retentar erros definitivos (ex.: configuração ausente de integração/credencial).
      if (result.nonRetryable) {
        await failJob(job.id, result.error || 'Non-retryable error', supabaseClient)
        return {
          jobId: job.id,
          status: 'failed',
          error: result.error
        }
      }

      // Verificar se deve fazer retry
      if (job.retry_count < job.max_retries) {
        const retryAfter = calculateRetryAfter(job.retry_count)
        await scheduleRetry(job.id, job.retry_count, result.error || '', retryAfter, supabaseClient)

        return {
          jobId: job.id,
          status: 'retry_scheduled',
          error: result.error,
          retryAfter: retryAfter.toISOString()
        }
      } else {
        await failJob(job.id, result.error || 'Max retries exceeded', supabaseClient)
        return {
          jobId: job.id,
          status: 'failed',
          error: result.error
        }
      }
    }

  } catch (error) {
    console.error('[Job Worker] Error processing job', job.id, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Mesmo em erro, tentar agendar retry se possível
    if (job.retry_count < job.max_retries) {
      const retryAfter = calculateRetryAfter(job.retry_count)
      await scheduleRetry(job.id, job.retry_count, errorMessage, retryAfter, supabaseClient)

      return {
        jobId: job.id,
        status: 'retry_scheduled',
        error: errorMessage,
        retryAfter: retryAfter.toISOString()
      }
    }

    await failJob(job.id, errorMessage, supabaseClient)
    return {
      jobId: job.id,
      status: 'failed',
      error: errorMessage
    }
  }
}

/**
 * Faz lock otimístico do job
 */
async function lockJob(
  jobId: string,
  workerId: string,
  supabaseClient: SupabaseDbClient
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('jobs')
    .update({
      status: 'processing',
      locked_at: new Date().toISOString(),
      locked_by: workerId,
      started_at: new Date().toISOString()
    })
    .eq('id', jobId)
    .in('status', ['pending', 'failed']) // Só pode fazer lock de pending ou failed
    .select()
    .single()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * Marca job como completo
 */
async function completeJob(
  jobId: string,
  result: Record<string, unknown>,
  supabaseClient: SupabaseDbClient
): Promise<void> {
  await supabaseClient
    .from('jobs')
    .update({
      status: 'completed',
      result: result as Json,
      completed_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null
    })
    .eq('id', jobId)
}

/**
 * Agenda retry para o job
 */
async function scheduleRetry(
  jobId: string,
  currentRetryCount: number,
  errorMessage: string,
  retryAfter: Date,
  supabaseClient: SupabaseDbClient
): Promise<void> {
  await supabaseClient
    .from('jobs')
    .update({
      status: 'failed',
      error_message: errorMessage,
      retry_count: currentRetryCount + 1,
      last_retry_at: new Date().toISOString(),
      retry_after: retryAfter.toISOString(),
      locked_at: null,
      locked_by: null
    })
    .eq('id', jobId)
}

/**
 * Marca job como falho permanentemente
 */
async function failJob(
  jobId: string,
  errorMessage: string,
  supabaseClient: SupabaseDbClient
): Promise<void> {
  await supabaseClient
    .from('jobs')
    .update({
      status: 'failed',
      error_message: `Max retries exceeded: ${errorMessage}`,
      completed_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null
    })
    .eq('id', jobId)
}

/**
 * Executor para refresh de analytics (materialized views)
 */
async function executeRefreshAnalytics(
  supabaseClient: SupabaseDbClient
): Promise<{ success: boolean; response?: Record<string, unknown>; error?: string }> {
  try {
    // Chamar a função RPC para refresh das views
    const { data, error } = await supabaseClient.rpc('refresh_analytics_materialized_views', {
      refresh_type: 'concurrent'
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, response: { refreshed: true, result: data } }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analytics refresh error'
    }
  }
}
