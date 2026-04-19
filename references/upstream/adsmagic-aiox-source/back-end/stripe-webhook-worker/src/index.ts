/**
 * Cloudflare Worker: Stripe Webhook Receiver + Queue Consumer
 *
 * Fetch handler: receives POST from Stripe, validates signature, enqueues
 * Queue consumer: processes events and updates Supabase
 */

import { verifyStripeSignature } from './lib/stripe-signature.js'
import { SupabaseRestClient } from './lib/supabase.js'
import { handleCheckoutCompleted } from './handlers/checkout-completed.js'
import { handleInvoicePaid } from './handlers/invoice-paid.js'
import { handleInvoiceFailed } from './handlers/invoice-failed.js'
import { handleSubscriptionUpdated } from './handlers/subscription-updated.js'
import { handleSubscriptionDeleted } from './handlers/subscription-deleted.js'
import type { Env, StripeEvent, StripeQueueMessage } from './types.js'

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default {
  /**
   * HTTP fetch handler — receives Stripe webhooks
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    const body = await request.text()

    // Verify Stripe signature
    try {
      const valid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET)
      if (!valid) {
        console.error('[webhook] Invalid signature')
        return new Response('Invalid signature', { status: 401 })
      }
    } catch (err) {
      console.error('[webhook] Signature verification failed:', err)
      return new Response('Signature verification failed', { status: 401 })
    }

    const event: StripeEvent = JSON.parse(body)

    // Skip events we don't handle
    if (!HANDLED_EVENTS.has(event.type)) {
      return new Response('Event type not handled', { status: 200 })
    }

    // Idempotency check via Supabase
    const supabase = new SupabaseRestClient({
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    })

    try {
      const existing = await supabase.select('stripe_webhook_events', {
        'id': `eq.${event.id}`,
      })

      if (existing.length > 0) {
        console.log(`[webhook] Event ${event.id} already processed, skipping`)
        return new Response('Already processed', { status: 200 })
      }

      // Register event as received
      await supabase.insert('stripe_webhook_events', {
        id: event.id,
        type: event.type,
        status: 'received',
        payload: event,
      })
    } catch (err) {
      // Log but don't block — idempotency is best-effort at this stage
      console.error('[webhook] Idempotency check failed:', err)
    }

    // Enqueue for processing
    try {
      await env.STRIPE_EVENTS_QUEUE.send({
        event_id: event.id,
        event_type: event.type,
        data: event.data.object,
      })
    } catch (err) {
      console.error('[webhook] Queue send failed:', err)
      return new Response('Queue error', { status: 500 })
    }

    return new Response('OK', { status: 200 })
  },

  /**
   * Queue consumer — processes Stripe events
   */
  async queue(batch: MessageBatch<StripeQueueMessage>, env: Env): Promise<void> {
    const supabase = new SupabaseRestClient({
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    })

    for (const message of batch.messages) {
      const { event_id, event_type, data } = message.body

      try {
        switch (event_type) {
          case 'checkout.session.completed':
            await handleCheckoutCompleted(data as never, supabase, env.STRIPE_SECRET_KEY)
            break
          case 'invoice.paid':
            await handleInvoicePaid(data as never, supabase)
            break
          case 'invoice.payment_failed':
            await handleInvoiceFailed(data as never, supabase)
            break
          case 'customer.subscription.updated':
            await handleSubscriptionUpdated(data as never, supabase)
            break
          case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(data as never, supabase)
            break
          default:
            console.log(`[queue] Unhandled event type: ${event_type}`)
        }

        // Mark as processed
        await supabase.update(
          'stripe_webhook_events',
          {
            status: 'processed',
            processed_at: new Date().toISOString(),
          },
          { 'id': `eq.${event_id}` }
        )

        message.ack()
      } catch (err) {
        console.error(`[queue] Error processing ${event_id} (${event_type}):`, err)

        // Mark as failed
        try {
          await supabase.update(
            'stripe_webhook_events',
            { status: 'failed' },
            { 'id': `eq.${event_id}` }
          )
        } catch {
          // Best effort
        }

        message.retry()
      }
    }
  },
}
