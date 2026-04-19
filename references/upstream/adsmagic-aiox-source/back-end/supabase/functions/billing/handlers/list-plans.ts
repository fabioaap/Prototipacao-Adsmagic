/**
 * GET /billing/plans — List all active plans with features and addons
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'

export async function handleListPlans(
  _req: Request,
  supabaseClient: SupabaseClient
): Promise<Response> {
  try {
    // Fetch active plans ordered by sort_order
    const { data: plans, error: plansError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (plansError) {
      console.error('[list-plans] Error fetching plans:', plansError)
      return errorResponse('Failed to fetch plans', 500)
    }

    if (!plans || plans.length === 0) {
      return successResponse([])
    }

    const planIds = plans.map((p: { id: string }) => p.id)

    // Fetch features and addons in parallel
    const [featuresResult, addonsResult] = await Promise.all([
      supabaseClient
        .from('plan_features')
        .select('id, plan_id, feature_slug, enabled, metadata')
        .in('plan_id', planIds),
      supabaseClient
        .from('plan_addons')
        .select('id, plan_id, addon_type, unit_amount, price, stripe_price_id, description')
        .in('plan_id', planIds),
    ])

    if (featuresResult.error) {
      console.error('[list-plans] Error fetching features:', featuresResult.error)
      return errorResponse('Failed to fetch plan features', 500)
    }

    if (addonsResult.error) {
      console.error('[list-plans] Error fetching addons:', addonsResult.error)
      return errorResponse('Failed to fetch plan addons', 500)
    }

    // Group features and addons by plan_id
    const featuresByPlan = new Map<string, typeof featuresResult.data>()
    const addonsByPlan = new Map<string, typeof addonsResult.data>()

    for (const f of featuresResult.data || []) {
      const list = featuresByPlan.get(f.plan_id) || []
      list.push(f)
      featuresByPlan.set(f.plan_id, list)
    }

    for (const a of addonsResult.data || []) {
      const list = addonsByPlan.get(a.plan_id) || []
      list.push(a)
      addonsByPlan.set(a.plan_id, list)
    }

    // Compose response
    const result = plans.map((plan: { id: string }) => ({
      ...plan,
      features: featuresByPlan.get(plan.id) || [],
      addons: addonsByPlan.get(plan.id) || [],
    }))

    return successResponse(result)
  } catch (error) {
    console.error('[list-plans] Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
