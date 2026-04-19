/**
 * Handler: POST /billing/start-trial
 *
 * Starts a 14-day trial on the chosen plan for the user's company.
 * Only allowed when the company has no active subscription.
 * If a trial already exists, updates it to the new plan.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TRIAL_DAYS = 14

export async function handleStartTrial(
  req: Request,
  supabaseClient: SupabaseClient
) {
  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Parse body
    const body = await req.json()
    const planSlug = body.plan_slug as string | undefined

    if (!planSlug) {
      return errorResponse('Missing plan_slug', 400)
    }

    // Find user's company
    const { data: companyUser, error: cuError } = await supabaseClient
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (cuError || !companyUser) {
      return errorResponse('No company found for user', 404)
    }

    // Only owner/admin can start trial
    if (!['owner', 'admin'].includes(companyUser.role)) {
      return errorResponse('Only company owner or admin can start a trial', 403)
    }

    const companyId = companyUser.company_id

    // Find the plan
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('id, slug, name')
      .eq('slug', planSlug)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return errorResponse(`Plan '${planSlug}' not found`, 404)
    }

    // Use service role to bypass RLS for subscription mutations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    // Check existing subscription
    const { data: existingSub } = await adminClient
      .from('subscriptions')
      .select('id, status, plan_id')
      .eq('company_id', companyId)
      .limit(1)
      .single()

    if (existingSub) {
      if (existingSub.status === 'active') {
        return errorResponse('Company already has an active subscription. Use the portal to manage your plan.', 409)
      }

      if (existingSub.status === 'expired' || existingSub.status === 'canceled') {
        return errorResponse('Trial period has ended. Please subscribe to a plan.', 403)
      }

      // Update existing trialing subscription to new plan
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

      const { error: updateError } = await adminClient
        .from('subscriptions')
        .update({
          plan_id: plan.id,
          status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          stripe_customer_id: null,
          stripe_subscription_id: null,
          billing_cycle: 'monthly',
        })
        .eq('id', existingSub.id)

      if (updateError) {
        console.error('[start-trial] Update failed:', updateError)
        return errorResponse('Failed to update trial', 500)
      }

      console.log(`[start-trial] Updated trial to plan '${planSlug}' for company ${companyId}`)
    } else {
      // Create new trial subscription
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

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
        console.error('[start-trial] Insert failed:', insertError)
        return errorResponse('Failed to create trial', 500)
      }

      console.log(`[start-trial] Created trial on plan '${planSlug}' for company ${companyId}`)
    }

    return successResponse({
      message: 'Trial started successfully',
      plan_slug: plan.slug,
      plan_name: plan.name,
      trial_days: TRIAL_DAYS,
    }, 201)
  } catch (error) {
    console.error('[start-trial] Error:', error)
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    return errorResponse('Internal server error', 500)
  }
}
