/**
 * POST /billing/add-projects — Add extra projects to existing subscription
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createSubscriptionItem, updateSubscriptionItem } from '../utils/stripe.ts'
import { validateAddProjectsRequest } from '../validators/billing.ts'

export async function handleAddProjects(
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
    const validation = validateAddProjectsRequest(body)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    const { quantity } = body

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

    // Get active subscription
    const { data: sub, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('id, plan_id, stripe_subscription_id')
      .eq('company_id', membership.company_id)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .single()

    if (subError || !sub) {
      return errorResponse('No active subscription found', 404)
    }

    if (!sub.stripe_subscription_id) {
      return errorResponse('Subscription has no Stripe subscription ID', 400)
    }

    // Get the extra_project addon for the current plan
    const { data: addon, error: addonError } = await supabaseClient
      .from('plan_addons')
      .select('stripe_price_id')
      .eq('plan_id', sub.plan_id)
      .eq('addon_type', 'extra_project')
      .single()

    if (addonError || !addon?.stripe_price_id) {
      return errorResponse('Extra project addon not configured for this plan', 500)
    }

    // Check if subscription_addons already has an extra_project entry
    const { data: existingAddon } = await supabaseClient
      .from('subscription_addons')
      .select('id, stripe_item_id, quantity')
      .eq('subscription_id', sub.id)
      .eq('addon_type', 'extra_project')
      .limit(1)
      .single()

    let totalExtraProjects: number

    if (existingAddon?.stripe_item_id) {
      // Update existing subscription item
      const newQuantity = (existingAddon.quantity ?? 0) + quantity
      await updateSubscriptionItem({
        itemId: existingAddon.stripe_item_id,
        quantity: newQuantity,
      })

      await supabaseClient
        .from('subscription_addons')
        .update({ quantity: newQuantity })
        .eq('id', existingAddon.id)

      totalExtraProjects = newQuantity
    } else {
      // Create new subscription item in Stripe
      const stripeItem = await createSubscriptionItem({
        subscriptionId: sub.stripe_subscription_id,
        priceId: addon.stripe_price_id,
        quantity,
      })

      // Insert into subscription_addons
      await supabaseClient
        .from('subscription_addons')
        .insert({
          subscription_id: sub.id,
          addon_type: 'extra_project',
          quantity,
          stripe_item_id: stripeItem.id,
        })

      totalExtraProjects = quantity
    }

    return successResponse({
      total_extra_projects: totalExtraProjects,
      message: `Successfully added ${quantity} extra project(s)`,
    })
  } catch (error) {
    console.error('[add-projects] Unexpected error:', error)
    if (error instanceof Error && error.message.includes('Stripe error')) {
      return errorResponse(error.message, 502)
    }
    return errorResponse('Internal server error', 500)
  }
}
