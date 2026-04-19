/**
 * GET /billing/subscription — Get current subscription for user's company
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'

export async function handleGetSubscription(
  _req: Request,
  supabaseClient: SupabaseClient
): Promise<Response> {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Get user's company (first active membership)
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

    // Get subscription with plan details
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('company_id', membership.company_id)
      .limit(1)
      .single()

    if (subError) {
      // No subscription = return null (not an error)
      if (subError.code === 'PGRST116') {
        return successResponse({ subscription: null })
      }
      console.error('[get-subscription] Error:', subError)
      return errorResponse('Failed to fetch subscription', 500)
    }

    // Get active addons
    const { data: addons, error: addonsError } = await supabaseClient
      .from('subscription_addons')
      .select('*')
      .eq('subscription_id', subscription.id)

    if (addonsError) {
      console.error('[get-subscription] Error fetching addons:', addonsError)
    }

    return successResponse({
      subscription: {
        ...subscription,
        addons: addons || [],
      }
    })
  } catch (error) {
    console.error('[get-subscription] Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
