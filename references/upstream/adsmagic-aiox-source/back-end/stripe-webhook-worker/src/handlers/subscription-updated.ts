/**
 * Handler: customer.subscription.updated
 * Updates plan, addons, billing cycle
 */

import { SupabaseRestClient } from '../lib/supabase.js'
import { syncSubscriptionAddons } from '../lib/sync-addons.js'
import type { StripeSubscription } from '../types.js'

export async function handleSubscriptionUpdated(
  stripeSub: StripeSubscription,
  supabase: SupabaseRestClient
): Promise<void> {
  // Find subscription in our DB
  const subs = await supabase.select('subscriptions', {
    'stripe_subscription_id': `eq.${stripeSub.id}`,
  })

  if (!subs.length) {
    console.log(`[sub-updated] No subscription found for ${stripeSub.id}`)
    return
  }

  const sub = subs[0]

  // Resolve the base-plan line item. A subscription can carry addon items
  // alongside the plan; we must pick the one that matches a row in `plans`.
  const items = stripeSub.items?.data ?? []
  const itemPriceIds = items.map((i) => i.price.id)

  let planId = sub.plan_id
  let planItem = items[0]

  if (itemPriceIds.length) {
    const inFilter = `(${itemPriceIds.join(',')})`
    const matchingPlans = await supabase.select('plans', {
      'or': `(stripe_price_monthly_id.in.${inFilter},stripe_price_yearly_id.in.${inFilter})`,
    })
    if (matchingPlans.length) {
      const plan = matchingPlans[0] as Record<string, unknown>
      planId = plan.id as string
      const monthly = plan.stripe_price_monthly_id
      const yearly = plan.stripe_price_yearly_id
      const found = items.find((i) => i.price.id === monthly || i.price.id === yearly)
      if (found) planItem = found
    }
  }

  const interval = planItem?.price?.recurring?.interval
  const billingCycle = interval === 'year' ? 'yearly' : 'monthly'

  // Update subscription
  await supabase.update(
    'subscriptions',
    {
      plan_id: planId,
      status: stripeSub.status,
      billing_cycle: billingCycle,
      current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      'id': `eq.${sub.id}`,
    }
  )

  // Sync addon line items (e.g. extra_project) into subscription_addons.
  await syncSubscriptionAddons(supabase, { id: sub.id as string }, items)

  console.log(`[sub-updated] Subscription ${stripeSub.id} updated to plan ${planId}`)
}
