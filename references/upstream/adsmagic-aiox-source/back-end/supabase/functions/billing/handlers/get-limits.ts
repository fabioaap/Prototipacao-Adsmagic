/**
 * Handler: GET /billing/limits
 *
 * Returns subscription status and resource limits for the user's company
 * in a single call. Auto-expires trials when trial_ends_at < now().
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface LimitsResponse {
  subscription: {
    status: string
    plan_slug: string | null
    plan_name: string | null
    trial_ends_at: string | null
    days_remaining: number
    billing_cycle: string | null
  }
  limits: {
    projects: { max: number; current: number; can_create: boolean }
    users: { max: number; current: number; can_invite: boolean }
    contacts_per_project: number
  }
}

export async function handleGetLimits(
  req: Request,
  supabaseClient: SupabaseClient
) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Find user's company
    const { data: companyUser, error: cuError } = await supabaseClient
      .from('company_users')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (cuError || !companyUser) {
      return errorResponse('No company found for user', 404)
    }

    const companyId = companyUser.company_id

    // Get subscription with plan details
    const { data: sub, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        id, status, billing_cycle, trial_ends_at,
        plans (slug, name, projects_included, max_users, contacts_per_project)
      `)
      .eq('company_id', companyId)
      .limit(1)
      .single()

    if (subError || !sub) {
      // No subscription at all
      const result: LimitsResponse = {
        subscription: {
          status: 'expired',
          plan_slug: null,
          plan_name: null,
          trial_ends_at: null,
          days_remaining: 0,
          billing_cycle: null,
        },
        limits: {
          projects: { max: 0, current: 0, can_create: false },
          users: { max: 0, current: 0, can_invite: false },
          contacts_per_project: 0,
        },
      }
      return successResponse(result)
    }

    // Auto-expire trial if past due
    let status = sub.status as string
    if (status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) < new Date()) {
      // Update in DB
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', sub.id)
      status = 'expired'
    }

    // Calculate days remaining
    let daysRemaining = 0
    if (status === 'trialing' && sub.trial_ends_at) {
      const diff = new Date(sub.trial_ends_at).getTime() - Date.now()
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    // Plan details (handle both object and array response from Supabase)
    const plan = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans
    const baseProjects = plan?.projects_included ?? 0
    const maxUsers = plan?.max_users ?? 0
    const contactsPerProject = plan?.contacts_per_project ?? 0

    // Include extra_project addons in the max projects limit
    const { data: addonRows } = await supabaseClient
      .from('subscription_addons')
      .select('quantity')
      .eq('subscription_id', sub.id)
      .eq('addon_type', 'extra_project')

    const extraProjects = (addonRows ?? []).reduce(
      (sum: number, row: { quantity: number | null }) => sum + (row.quantity ?? 0),
      0
    )
    const maxProjects = baseProjects + extraProjects

    // Count current projects
    const { count: projectCount } = await supabaseClient
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .neq('status', 'archived')

    // Count current users
    const { count: userCount } = await supabaseClient
      .from('company_users')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)

    const currentProjects = projectCount ?? 0
    const currentUsers = userCount ?? 0
    const isActive = status === 'active' || status === 'trialing'

    const result: LimitsResponse = {
      subscription: {
        status,
        plan_slug: plan?.slug ?? null,
        plan_name: plan?.name ?? null,
        trial_ends_at: sub.trial_ends_at,
        days_remaining: daysRemaining,
        billing_cycle: sub.billing_cycle,
      },
      limits: {
        projects: {
          max: maxProjects,
          current: currentProjects,
          can_create: isActive && currentProjects < maxProjects,
        },
        users: {
          max: maxUsers,
          current: currentUsers,
          can_invite: isActive && currentUsers < maxUsers,
        },
        contacts_per_project: contactsPerProject,
      },
    }

    return successResponse(result)
  } catch (error) {
    console.error('[billing/limits] Error:', error)
    return errorResponse('Internal server error', 500)
  }
}
