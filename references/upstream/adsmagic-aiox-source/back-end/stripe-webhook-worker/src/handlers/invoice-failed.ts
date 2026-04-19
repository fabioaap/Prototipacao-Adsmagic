/**
 * Handler: invoice.payment_failed
 * Marks subscription status as past_due
 */

import { SupabaseRestClient } from '../lib/supabase.js'
import type { StripeInvoice } from '../types.js'

export async function handleInvoiceFailed(
  invoice: StripeInvoice,
  supabase: SupabaseRestClient
): Promise<void> {
  if (!invoice.subscription) {
    console.log('[invoice-failed] No subscription on invoice, skipping')
    return
  }

  await supabase.update(
    'subscriptions',
    {
      status: 'past_due',
      updated_at: new Date().toISOString(),
    },
    {
      'stripe_subscription_id': `eq.${invoice.subscription}`,
    }
  )

  console.log(`[invoice-failed] Subscription ${invoice.subscription} marked as past_due`)
}
