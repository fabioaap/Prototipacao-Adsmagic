/**
 * POST /billing/checkout — Create a Stripe Checkout Session
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createCheckoutSession } from '../utils/stripe.ts'
import { validateCheckoutRequest } from '../validators/billing.ts'

export async function handleCreateCheckout(
  req: Request,
  supabaseClient: SupabaseClient
): Promise<Response> {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Parse and validate body
    const body = await req.json()
    const validation = validateCheckoutRequest(body)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    const { plan_slug, billing_cycle, success_url, cancel_url } = body

    // Get plan from database
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('slug', plan_slug)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return errorResponse('Plan not found', 404)
    }

    // Determine which Stripe price to use
    const priceId = billing_cycle === 'yearly'
      ? plan.stripe_price_yearly_id
      : plan.stripe_price_monthly_id

    if (!priceId) {
      return errorResponse('Plan price not configured', 500)
    }

    // Build line items (plan + optional extra projects)
    const lineItems: Array<{ priceId: string; quantity: number }> = [
      { priceId, quantity: 1 },
    ]

    const extraProjects: number = body.extra_projects ?? 0
    if (extraProjects > 0) {
      const { data: addon, error: addonError } = await supabaseClient
        .from('plan_addons')
        .select('stripe_price_id')
        .eq('plan_id', plan.id)
        .eq('addon_type', 'extra_project')
        .single()

      if (addonError || !addon?.stripe_price_id) {
        return errorResponse('Extra project addon not configured', 500)
      }
      lineItems.push({ priceId: addon.stripe_price_id, quantity: extraProjects })
    }

    // Get user's company
    const { data: membership, error: memberError } = await supabaseClient
      .from('company_users')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (memberError || !membership) {
      return errorResponse('No active company membership found', 404)
    }

    // Check if company already has a subscription
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('company_id', membership.company_id)
      .limit(1)
      .single()

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      customerId: existingSub?.stripe_customer_id || undefined,
      customerEmail: existingSub?.stripe_customer_id ? undefined : user.email,
      lineItems,
      successUrl: success_url,
      cancelUrl: cancel_url,
      metadata: {
        company_id: membership.company_id,
        plan_id: plan.id,
        plan_slug: plan.slug,
        billing_cycle,
        user_id: user.id,
        extra_projects: String(extraProjects),
      },
    })

    return successResponse({
      checkout_session_id: session.id,
      checkout_url: session.url,
    })
  } catch (error) {
    console.error('[create-checkout] Unexpected error:', error)
    if (error instanceof Error && error.message.includes('Stripe error')) {
      return errorResponse(error.message, 502)
    }
    return errorResponse('Internal server error', 500)
  }
}
