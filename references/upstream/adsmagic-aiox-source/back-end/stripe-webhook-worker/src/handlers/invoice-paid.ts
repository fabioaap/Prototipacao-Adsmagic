/**
 * Handler: invoice.paid
 * Updates subscription status to active, renews period, creates usage rows
 */

import { SupabaseRestClient } from '../lib/supabase.js'
import type { StripeInvoice } from '../types.js'

export async function handleInvoicePaid(
  invoice: StripeInvoice,
  supabase: SupabaseRestClient
): Promise<void> {
  if (!invoice.subscription) {
    console.log('[invoice-paid] No subscription on invoice, skipping')
    return
  }

  // Get subscription from Supabase
  const subs = await supabase.select('subscriptions', {
    'stripe_subscription_id': `eq.${invoice.subscription}`,
  })

  if (!subs.length) {
    console.log(`[invoice-paid] No subscription found for ${invoice.subscription}`)
    return
  }

  const sub = subs[0]
  const line = invoice.lines?.data?.[0]

  // Update subscription status and period
  const updateData: Record<string, unknown> = {
    status: 'active',
    updated_at: new Date().toISOString(),
  }

  if (line?.period) {
    updateData.current_period_start = new Date(line.period.start * 1000).toISOString()
    updateData.current_period_end = new Date(line.period.end * 1000).toISOString()
  }

  await supabase.update('subscriptions', updateData, {
    'id': `eq.${sub.id}`,
  })

  // Create new usage tracking rows for the new period
  if (line?.period) {
    const plans = await supabase.select('plans', { 'id': `eq.${sub.plan_id}` })
    if (plans.length) {
      const plan = plans[0]
      const projects = await supabase.select('projects', {
        'company_id': `eq.${sub.company_id}`,
      }, 'id')

      if (projects.length > 0) {
        const contactsLimit = (plan.contacts_per_project as number) || 500
        const periodStart = new Date(line.period.start * 1000).toISOString().split('T')[0]
        const periodEnd = new Date(line.period.end * 1000).toISOString().split('T')[0]

        // Check for extra_contacts addons
        const addons = await supabase.select('subscription_addons', {
          'subscription_id': `eq.${sub.id}`,
          'addon_type': 'eq.extra_contacts',
        })

        const usageRows = projects.map((p) => {
          // Find addon for this specific project
          const addon = addons.find((a) => a.project_id === p.id)
          const extraContacts = addon ? ((addon.quantity as number) || 0) * 500 : 0

          return {
            project_id: p.id,
            period_start: periodStart,
            period_end: periodEnd,
            contacts_created: 0,
            contacts_limit: contactsLimit + extraContacts,
          }
        })

        await supabase.insert('usage_tracking', usageRows)
      }
    }
  }

  console.log(`[invoice-paid] Subscription ${invoice.subscription} renewed`)
}
