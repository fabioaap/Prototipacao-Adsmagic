/**
 * Handler: checkout.session.completed
 * Creates subscription + usage_tracking rows
 */

import { SupabaseRestClient } from '../lib/supabase.js'
import { fetchStripeSubscription } from '../lib/stripe-api.js'
import { syncSubscriptionAddons } from '../lib/sync-addons.js'
import type { StripeCheckoutSession } from '../types.js'

export async function handleCheckoutCompleted(
  session: StripeCheckoutSession,
  supabase: SupabaseRestClient,
  stripeSecretKey: string
): Promise<void> {
  const { company_id, plan_id, billing_cycle } = session.metadata

  if (!company_id || !plan_id) {
    throw new Error('Missing metadata: company_id or plan_id')
  }

  // Get plan details for usage limits
  const plans = await supabase.select('plans', { 'id': `eq.${plan_id}` })
  if (!plans.length) {
    throw new Error(`Plan not found: ${plan_id}`)
  }
  const plan = plans[0]

  // Check for existing subscription (e.g., from trial)
  const existing = await supabase.select('subscriptions', { 'company_id': `eq.${company_id}` })
  if (existing.length > 0) {
    // Upgrade existing (trial or canceled) subscription
    await supabase.update('subscriptions', {
      plan_id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      billing_cycle: billing_cycle || 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: getNextPeriodEnd(billing_cycle || 'monthly'),
      trial_ends_at: null,
    }, { 'company_id': `eq.${company_id}` })
  } else {
    // Create new subscription
    await supabase.insert('subscriptions', {
      company_id,
      plan_id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      billing_cycle: billing_cycle || 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: getNextPeriodEnd(billing_cycle || 'monthly'),
    })
  }

  // Sync addons (e.g. extra_project) from the Stripe subscription's line items.
  // The checkout.session payload doesn't include the full items, so we fetch
  // the subscription directly from Stripe.
  if (session.subscription) {
    try {
      const subRows = await supabase.select('subscriptions', {
        'company_id': `eq.${company_id}`,
      })
      const subRow = subRows[0]
      if (subRow) {
        const stripeSub = await fetchStripeSubscription(session.subscription, stripeSecretKey)
        await syncSubscriptionAddons(supabase, { id: subRow.id as string }, stripeSub.items?.data ?? [])
      }
    } catch (err) {
      // Don't fail the whole checkout flow on addon sync — a subsequent
      // customer.subscription.updated event will retry.
      console.error('[checkout-completed] Addon sync failed:', err)
    }
  }

  // Get all projects for this company to create usage rows
  const projects = await supabase.select('projects', {
    'company_id': `eq.${company_id}`,
  }, 'id')

  if (projects.length > 0) {
    const now = new Date()
    const periodEnd = new Date(getNextPeriodEnd(billing_cycle || 'monthly'))
    const contactsLimit = (plan.contacts_per_project as number) || 500

    const usageRows = projects.map((p) => ({
      project_id: p.id,
      period_start: now.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      contacts_created: 0,
      contacts_limit: contactsLimit,
    }))

    await supabase.insert('usage_tracking', usageRows)
  }

  console.log(`[checkout-completed] Subscription created for company ${company_id}`)
}

function getNextPeriodEnd(cycle: string): string {
  const now = new Date()
  if (cycle === 'yearly') {
    now.setFullYear(now.getFullYear() + 1)
  } else {
    now.setMonth(now.getMonth() + 1)
  }
  return now.toISOString()
}
