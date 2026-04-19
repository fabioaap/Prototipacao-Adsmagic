/**
 * Types para Job Worker
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export type QueueName = 'conversion_events' | 'webhooks' | 'analytics' | 'integrations'

export type JobType =
  | 'send_event'           // Enviar evento de conversão
  | 'refresh_analytics'    // Atualizar materialized views
  | 'process_webhook'      // Processar webhook
  | 'sync_integration'     // Sincronizar integração

export interface Job {
  id: string
  project_id: string
  queue_name: QueueName
  job_type: JobType
  status: JobStatus
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  error_message: string | null
  error_stack: string | null
  retry_count: number
  max_retries: number
  last_retry_at: string | null
  retry_after: string | null
  locked_at: string | null
  locked_by: string | null
  started_at: string | null
  completed_at: string | null
  priority: number
  scheduled_at: string
  created_at: string
  updated_at: string
}

export interface JobResult {
  jobId: string
  status: 'completed' | 'failed' | 'retry_scheduled' | 'skipped' | 'cancelled'
  result?: Record<string, unknown>
  error?: string
  retryAfter?: string
}

export interface WorkerConfig {
  maxJobsPerRun: number
  lockDurationMs: number
  workerInstanceId: string
  queueNames: QueueName[]
}

export interface ProcessResult {
  success: boolean
  processed: number
  results: JobResult[]
  errors: string[]
}
