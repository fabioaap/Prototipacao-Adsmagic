/**
 * Env — Cloudflare Worker environment bindings
 */
export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  MESSAGING_WEBHOOKS_QUEUE: Queue<MessagingWebhookQueueMessage>
}

/**
 * Queue message format — sent by Producer, consumed by Consumer
 */
export interface MessagingWebhookQueueMessage {
  webhook_event_id: string
  broker_type: string
  webhook_type: 'global' | 'by_account'
  account_id: string | null
  raw_body: string
  parsed_body: Record<string, unknown>
  request_headers: Record<string, string>
  endpoint_path: string
  received_at: string
}
