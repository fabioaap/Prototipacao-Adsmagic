/**
 * POST /billing/portal — Create a Stripe Customer Portal session
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createPortalSession } from '../utils/stripe.ts'
import { validatePortalRequest } from '../validators/billing.ts'

export async function handleCreatePortal(
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
    const validation = validatePortalRequest(body)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    const { return_url } = body

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

    // Get subscription with Stripe customer ID
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('company_id', membership.company_id)
      .single()

    if (subError || !subscription?.stripe_customer_id) {
      return errorResponse('No active subscription found. Please subscribe first.', 404)
    }

    // Create Stripe portal session
    const session = await createPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl: return_url,
    })

    return successResponse({
      portal_url: session.url,
    })
  } catch (error) {
    console.error('[create-portal] Unexpected error:', error)
    if (error instanceof Error && error.message.includes('Stripe error')) {
      return errorResponse(error.message, 502)
    }
    return errorResponse('Internal server error', 500)
  }
}
