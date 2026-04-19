/**
 * Cloudflare Worker: Messaging Webhook Receiver + Queue Consumer
 *
 * Fetch handler (Producer): receives POST from brokers, validates, enqueues
 * Queue consumer: processes webhooks asynchronously with retry
 */

import { SupabaseRestClient } from './lib/supabase.js'
import { parseRoute } from './producer/route.js'
import { isValidBrokerType, isValidUUID, validateBody, SUPPORTED_BROKERS } from './producer/validate.js'
import { sanitizeHeaders, sanitizeWebhookPayload, sha256 } from './producer/sanitizer.js'
import { WebhookEventRepository } from './repositories/webhook-event.repo.js'
import { processWebhookMessage } from './consumer/process-webhook.js'
import type { Env, MessagingWebhookQueueMessage } from './types.js'

export default {
  /**
   * HTTP fetch handler — receives webhook POSTs from brokers
   * Goal: respond in <50ms, enqueue for async processing
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const route = parseRoute(url)

    if (!route) {
      return new Response('Not Found', { status: 404 })
    }

    const { brokerType, accountId, webhookType } = route

    // Validate broker type
    if (!isValidBrokerType(brokerType)) {
      return new Response(
        `Broker não suportado: ${brokerType}. Suportados: ${SUPPORTED_BROKERS.join(', ')}`,
        { status: 400 }
      )
    }

    // Validate account UUID for by_account routes
    if (webhookType === 'by_account' && accountId && !isValidUUID(accountId)) {
      return new Response(
        `Formato de UUID inválido: ${accountId}`,
        { status: 400 }
      )
    }

    // Read and validate body
    const rawBody = await request.text()
    const bodyResult = validateBody(rawBody)

    if (!bodyResult.valid) {
      return new Response(bodyResult.error, { status: 400 })
    }

    const parsedBody = bodyResult.parsed
    const payloadHash = await sha256(rawBody)

    // Create audit record (best-effort — don't block on failure)
    let webhookEventId = ''
    const supabase = new SupabaseRestClient({
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    })

    try {
      const eventRepo = new WebhookEventRepository(supabase)
      webhookEventId = await eventRepo.create({
        brokerType,
        webhookType,
        endpointPath: url.pathname,
        payloadRaw: sanitizeWebhookPayload(parsedBody),
        payloadHash,
        requestHeaders: sanitizeHeaders(request.headers),
        parseStatus: 'received',
        messagingAccountId: accountId ?? undefined,
        resolvedBy: webhookType === 'by_account' ? 'account_id' : undefined,
      })
    } catch (err) {
      console.error('[producer] Audit creation failed:', err)
      // Generate a fallback ID so consumer can still process
      webhookEventId = `fallback-${payloadHash.substring(0, 16)}`
    }

    // Collect headers needed by consumer (signature headers + routing)
    const headerRecord: Record<string, string> = {}
    for (const key of [
      'x-hub-signature-256',
      'x-signature',
      'x-webhook-signature',
      'signature',
      'x-account-id',
      'x-broker-type',
      'content-type',
    ]) {
      const value = request.headers.get(key)
      if (value) headerRecord[key] = value
    }

    // Enqueue for async processing
    const queueMessage: MessagingWebhookQueueMessage = {
      webhook_event_id: webhookEventId,
      broker_type: brokerType,
      webhook_type: webhookType,
      account_id: accountId,
      raw_body: rawBody,
      parsed_body: parsedBody,
      request_headers: headerRecord,
      endpoint_path: url.pathname,
      received_at: new Date().toISOString(),
    }

    try {
      await env.MESSAGING_WEBHOOKS_QUEUE.send(queueMessage)
    } catch (err) {
      console.error('[producer] Queue send failed:', err)
      return new Response('Queue error', { status: 500 })
    }

    // Return empty 200 — brokers like UAZAPI require empty body
    return new Response('', { status: 200 })
  },

  /**
   * Queue consumer — processes webhook messages asynchronously
   */
  async queue(batch: MessageBatch<MessagingWebhookQueueMessage>, env: Env): Promise<void> {
    const supabase = new SupabaseRestClient({
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    })

    for (const message of batch.messages) {
      const { webhook_event_id } = message.body

      try {
        await processWebhookMessage(message.body, supabase)

        // Mark as processed
        const eventRepo = new WebhookEventRepository(supabase)
        try {
          await eventRepo.update(webhook_event_id, {
            parseStatus: 'processed',
          })
        } catch {
          // Best effort
        }

        message.ack()
      } catch (err) {
        console.error(`[consumer] Error processing ${webhook_event_id}:`, err)

        // Mark as failed
        const eventRepo = new WebhookEventRepository(supabase)
        try {
          await eventRepo.update(webhook_event_id, {
            parseStatus: 'failed',
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
          })
        } catch {
          // Best effort
        }

        message.retry()
      }
    }
  },
}
