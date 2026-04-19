import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

export type WebhookParseStatus = 'received' | 'processed' | 'failed'
export type WebhookType = 'global' | 'by_account'

export interface CreateWebhookEventParams {
  brokerType: string
  webhookType: WebhookType
  endpointPath: string
  payloadRaw: Record<string, unknown>
  payloadHash: string
  requestHeaders?: Record<string, string>
  projectId?: string | null
  messagingAccountId?: string | null
  resolvedBy?: string | null
  parseStatus?: WebhookParseStatus
  errorMessage?: string | null
  processingTimeMs?: number | null
}

export interface UpdateWebhookEventParams {
  parseStatus?: WebhookParseStatus
  errorMessage?: string | null
  processingTimeMs?: number | null
  projectId?: string | null
  messagingAccountId?: string | null
  resolvedBy?: string | null
}

let lastCleanupAttemptAt = 0
const CLEANUP_INTERVAL_MS = 1000 * 60 * 60 // 1h

export class WebhookEventRepository {
  private supabaseClient: SupabaseDbClient

  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }

  async create(params: CreateWebhookEventParams): Promise<string | null> {
    const { data, error } = await this.supabaseClient
      .from('webhook_events')
      .insert({
        broker_type: params.brokerType,
        webhook_type: params.webhookType,
        endpoint_path: params.endpointPath,
        request_headers: params.requestHeaders || {},
        payload_raw: params.payloadRaw,
        payload_hash: params.payloadHash,
        project_id: params.projectId || null,
        messaging_account_id: params.messagingAccountId || null,
        resolved_by: params.resolvedBy || null,
        parse_status: params.parseStatus || 'received',
        error_message: params.errorMessage || null,
        processing_time_ms: params.processingTimeMs || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[WebhookEventRepository] Error creating webhook event:', error)
      return null
    }

    void this.cleanupOldEventsIfNeeded()

    return String((data as { id?: string })?.id || '')
  }

  async update(id: string, params: UpdateWebhookEventParams): Promise<void> {
    const updateData: Record<string, unknown> = {}

    if (params.parseStatus) updateData.parse_status = params.parseStatus
    if (params.errorMessage !== undefined) updateData.error_message = params.errorMessage
    if (params.processingTimeMs !== undefined) updateData.processing_time_ms = params.processingTimeMs
    if (params.projectId !== undefined) updateData.project_id = params.projectId
    if (params.messagingAccountId !== undefined) updateData.messaging_account_id = params.messagingAccountId
    if (params.resolvedBy !== undefined) updateData.resolved_by = params.resolvedBy

    if (Object.keys(updateData).length === 0) return

    const { error } = await this.supabaseClient
      .from('webhook_events')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('[WebhookEventRepository] Error updating webhook event:', error)
    }
  }

  private async cleanupOldEventsIfNeeded(): Promise<void> {
    const now = Date.now()
    if (now - lastCleanupAttemptAt < CLEANUP_INTERVAL_MS) return
    lastCleanupAttemptAt = now

    const { error } = await this.supabaseClient.rpc('cleanup_old_webhook_events')
    if (error) {
      console.warn('[WebhookEventRepository] Cleanup RPC failed (non-blocking):', error.message)
    }
  }
}
