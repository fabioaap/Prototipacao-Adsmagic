/**
 * Creates a trial subscription for a newly created company
 *
 * Auto-assigns the Growth plan with a 14-day trial period.
 * Non-blocking: errors are returned but should not prevent company creation.
 */

import type { SupabaseDbClient } from '../types-db.ts'

const TRIAL_PLAN_SLUG = 'growth'
const TRIAL_DAYS = 14

export async function createTrialSubscription(
  adminClient: SupabaseDbClient,
  companyId: string
): Promise<{ error: Error | null }> {
  try {
    // Find the Growth plan
    const { data: plan, error: planError } = await adminClient
      .from('plans')
      .select('id')
      .eq('slug', TRIAL_PLAN_SLUG)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return { error: new Error(`Plan '${TRIAL_PLAN_SLUG}' not found: ${planError?.message ?? 'no data'}`) }
    }

    // Calculate trial end date
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

    // Insert trial subscription
    const { error: insertError } = await adminClient
      .from('subscriptions')
      .insert({
        company_id: companyId,
        plan_id: plan.id,
        status: 'trialing',
        billing_cycle: 'monthly',
        trial_ends_at: trialEndsAt.toISOString(),
      })

    if (insertError) {
      return { error: new Error(`Failed to create trial subscription: ${insertError.message}`) }
    }

    console.log('[Trial] Created 14-day trial subscription for company:', companyId)
    return { error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { error: new Error(`Trial subscription error: ${message}`) }
  }
}
