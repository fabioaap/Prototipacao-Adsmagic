/**
 * Handler: customer.subscription.deleted
 * Marks subscription as canceled with timestamp
 */

import { SupabaseRestClient } from '../lib/supabase.js'
import type { StripeSubscription } from '../types.js'

export async function handleSubscriptionDeleted(
  stripeSub: StripeSubscription,
  supabase: SupabaseRestClient
): Promise<void> {
  const canceledAt = stripeSub.canceled_at
    ? new Date(stripeSub.canceled_at * 1000).toISOString()
    : new Date().toISOString()

  await supabase.update(
    'subscriptions',
    {
      status: 'canceled',
      canceled_at: canceledAt,
      updated_at: new Date().toISOString(),
    },
    {
      'stripe_subscription_id': `eq.${stripeSub.id}`,
    }
  )

  console.log(`[sub-deleted] Subscription ${stripeSub.id} canceled`)
}
