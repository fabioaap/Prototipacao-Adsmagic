/**
 * Webhook Event Repository — REST client version
 *
 * Manages audit trail in `webhook_events` table.
 */

import type { SupabaseRestClient } from '../lib/supabase.js'

export type WebhookParseStatus = 'received' | 'processed' | 'failed'
export type WebhookType = 'global' | 'by_account'

export interface CreateWebhookEventParams {
  brokerType: string
  webhookType: WebhookType
  endpointPath: string
  payloadRaw?: unknown
  payloadHash?: string
  requestHeaders?: Record<string, string>
  parseStatus: WebhookParseStatus
  messagingAccountId?: string
  projectId?: string
  resolvedBy?: string
}

export interface UpdateWebhookEventParams {
  parseStatus?: WebhookParseStatus
  errorMessage?: string
  messagingAccountId?: string
  projectId?: string
  resolvedBy?: string
  processingTimeMs?: number
}

let lastCleanupAttemptAt = 0
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export class WebhookEventRepository {
  constructor(private supabase: SupabaseRestClient) {}

  async create(params: CreateWebhookEventParams): Promise<string> {
    const rows = await this.supabase.insert('webhook_events', {
      broker_type: params.brokerType,
      webhook_type: params.webhookType,
      endpoint_path: params.endpointPath,
      payload_raw: params.payloadRaw ?? null,
      payload_hash: params.payloadHash ?? null,
      request_headers: params.requestHeaders ?? null,
      parse_status: params.parseStatus,
      messaging_account_id: params.messagingAccountId ?? null,
      project_id: params.projectId ?? null,
      resolved_by: params.resolvedBy ?? null,
    })

    const id = rows[0]?.id as string
    if (!id) {
      throw new Error('Failed to create webhook event: no ID returned')
    }

    // Trigger async cleanup (best-effort, non-blocking)
    this.cleanupOldEventsIfNeeded().catch(() => {})

    return id
  }

  async update(id: string, params: UpdateWebhookEventParams): Promise<void> {
    const data: Record<string, unknown> = {}
    if (params.parseStatus !== undefined) data.parse_status = params.parseStatus
    if (params.errorMessage !== undefined) data.error_message = params.errorMessage
    if (params.messagingAccountId !== undefined) data.messaging_account_id = params.messagingAccountId
    if (params.projectId !== undefined) data.project_id = params.projectId
    if (params.resolvedBy !== undefined) data.resolved_by = params.resolvedBy
    if (params.processingTimeMs !== undefined) data.processing_time_ms = params.processingTimeMs

    await this.supabase.update('webhook_events', data, { 'id': `eq.${id}` })
  }

  private async cleanupOldEventsIfNeeded(): Promise<void> {
    const now = Date.now()
    if (now - lastCleanupAttemptAt < CLEANUP_INTERVAL_MS) return

    lastCleanupAttemptAt = now
    try {
      await this.supabase.rpc('cleanup_old_webhook_events')
    } catch (err) {
      console.error('[WebhookEventRepo] Cleanup failed:', err)
    }
  }
}
