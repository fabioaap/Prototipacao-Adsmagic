/**
 * Billing API Service
 *
 * Handles all billing API operations:
 * - List plans (GET /billing/plans)
 * - Get subscription (GET /billing/subscription)
 * - Create checkout session (POST /billing/checkout)
 * - Create portal session (POST /billing/portal)
 * - Get usage (GET /billing/usage)
 *
 * Mock active when VITE_USE_MOCK === 'true'.
 *
 * @module services/api/billing
 */

import { apiClient } from './client'
import {
  adaptPlan,
  adaptSubscription,
  adaptUsage,
  adaptCheckout,
  adaptPortal,
  adaptLimits,
} from './adapters/billingAdapter'
import type {
  BackendPlan,
  BackendCheckoutResponse,
  BackendPortalResponse,
  BackendUsage,
  BackendLimits,
  Plan,
  Subscription,
  Usage,
  CheckoutResult,
  PortalResult,
  PlanLimits,
} from './adapters/billingAdapter'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ─── Mock data ───

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-starter',
    slug: 'starter',
    name: 'Starter',
    priceMonthly: 9700,
    priceYearly: 97000,
    projectsIncluded: 1,
    maxUsers: 2,
    contactsPerProject: 500,
    stripePriceMonthlyId: null,
    stripePriceYearlyId: null,
    sortOrder: 1,
    features: [
      { id: 'f1', planId: 'plan-starter', featureSlug: 'projects_1', enabled: true, metadata: null },
      { id: 'f2', planId: 'plan-starter', featureSlug: 'users_2', enabled: true, metadata: null },
      { id: 'f3', planId: 'plan-starter', featureSlug: 'contacts_500', enabled: true, metadata: null },
      { id: 'f4', planId: 'plan-starter', featureSlug: 'basic_dashboard', enabled: true, metadata: null },
      { id: 'f5', planId: 'plan-starter', featureSlug: 'whatsapp_1', enabled: true, metadata: null },
      { id: 'f6', planId: 'plan-starter', featureSlug: 'email_support', enabled: true, metadata: null },
    ],
    addons: [
      { id: 'a1', planId: 'plan-starter', addonType: 'extra_project', unitAmount: 1, price: 7900, stripePriceId: null, description: null },
      { id: 'a2', planId: 'plan-starter', addonType: 'extra_contacts_500', unitAmount: 500, price: 2900, stripePriceId: null, description: null },
    ],
  },
  {
    id: 'plan-growth',
    slug: 'growth',
    name: 'Growth',
    priceMonthly: 24700,
    priceYearly: 247000,
    projectsIncluded: 3,
    maxUsers: 5,
    contactsPerProject: 1000,
    stripePriceMonthlyId: null,
    stripePriceYearlyId: null,
    sortOrder: 2,
    features: [
      { id: 'f7', planId: 'plan-growth', featureSlug: 'projects_3', enabled: true, metadata: null },
      { id: 'f8', planId: 'plan-growth', featureSlug: 'users_5', enabled: true, metadata: null },
      { id: 'f9', planId: 'plan-growth', featureSlug: 'contacts_1000', enabled: true, metadata: null },
      { id: 'f10', planId: 'plan-growth', featureSlug: 'full_dashboard', enabled: true, metadata: null },
      { id: 'f11', planId: 'plan-growth', featureSlug: 'whatsapp_3', enabled: true, metadata: null },
      { id: 'f12', planId: 'plan-growth', featureSlug: 'all_origins', enabled: true, metadata: null },
      { id: 'f13', planId: 'plan-growth', featureSlug: 'csv_export', enabled: true, metadata: null },
      { id: 'f14', planId: 'plan-growth', featureSlug: 'priority_support', enabled: true, metadata: null },
    ],
    addons: [
      { id: 'a3', planId: 'plan-growth', addonType: 'extra_project', unitAmount: 1, price: 7900, stripePriceId: null, description: null },
      { id: 'a4', planId: 'plan-growth', addonType: 'extra_contacts_500', unitAmount: 500, price: 1900, stripePriceId: null, description: null },
    ],
  },
  {
    id: 'plan-pro',
    slug: 'pro',
    name: 'Pro',
    priceMonthly: 39700,
    priceYearly: 397000,
    projectsIncluded: 5,
    maxUsers: 15,
    contactsPerProject: 2000,
    stripePriceMonthlyId: null,
    stripePriceYearlyId: null,
    sortOrder: 3,
    features: [
      { id: 'f15', planId: 'plan-pro', featureSlug: 'projects_5', enabled: true, metadata: null },
      { id: 'f16', planId: 'plan-pro', featureSlug: 'users_15', enabled: true, metadata: null },
      { id: 'f17', planId: 'plan-pro', featureSlug: 'contacts_2000', enabled: true, metadata: null },
      { id: 'f18', planId: 'plan-pro', featureSlug: 'full_dashboard_pipeline', enabled: true, metadata: null },
      { id: 'f19', planId: 'plan-pro', featureSlug: 'whatsapp_unlimited', enabled: true, metadata: null },
      { id: 'f20', planId: 'plan-pro', featureSlug: 'all_origins_api', enabled: true, metadata: null },
      { id: 'f21', planId: 'plan-pro', featureSlug: 'advanced_export', enabled: true, metadata: null },
      { id: 'f22', planId: 'plan-pro', featureSlug: 'dedicated_support', enabled: true, metadata: null },
    ],
    addons: [
      { id: 'a5', planId: 'plan-pro', addonType: 'extra_project', unitAmount: 1, price: 7900, stripePriceId: null, description: null },
      { id: 'a6', planId: 'plan-pro', addonType: 'extra_contacts_500', unitAmount: 500, price: 900, stripePriceId: null, description: null },
    ],
  },
]

/**
 * List all active plans with features and addons
 */
async function getPlans(): Promise<Plan[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_PLANS
  }

  const response = await apiClient.get<BackendPlan[]>('/billing/plans')
  const raw = Array.isArray(response.data)
    ? response.data
    : (response.data as { data?: BackendPlan[] })?.data ?? []
  return raw.map(adaptPlan)
}

/**
 * Get current subscription for the user's company
 */
async function getSubscription(): Promise<Subscription | null> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return null
  }

  const response = await apiClient.get<{ subscription: unknown }>('/billing/subscription')
  const sub = (response.data as { subscription?: unknown })?.subscription
  if (!sub) return null
  return adaptSubscription(sub as Parameters<typeof adaptSubscription>[0])
}

/**
 * Create a Stripe Checkout session
 */
async function createCheckout(
  planSlug: string,
  billingCycle: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string,
  extraProjects?: number
): Promise<CheckoutResult> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('[billing-mock] createCheckout extra_projects:', extraProjects ?? 0)
    return {
      checkoutSessionId: 'mock_cs_123',
      checkoutUrl: `https://checkout.stripe.com/mock?plan=${planSlug}&cycle=${billingCycle}&extras=${extraProjects ?? 0}`,
    }
  }

  const response = await apiClient.post<BackendCheckoutResponse>('/billing/checkout', {
    plan_slug: planSlug,
    billing_cycle: billingCycle,
    success_url: successUrl,
    cancel_url: cancelUrl,
    extra_projects: extraProjects ?? 0,
  })
  return adaptCheckout(response.data)
}

/**
 * Add extra projects to an existing subscription
 */
async function addProjects(quantity: number): Promise<{ totalProjects: number }> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('[billing-mock] addProjects:', quantity)
    return { totalProjects: quantity }
  }

  const response = await apiClient.post<{ total_extra_projects: number }>('/billing/add-projects', {
    quantity,
  })
  return { totalProjects: (response.data as { total_extra_projects: number }).total_extra_projects }
}

/**
 * Create a Stripe Customer Portal session
 */
async function createPortal(returnUrl: string): Promise<PortalResult> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      portalUrl: 'https://billing.stripe.com/mock-portal',
    }
  }

  const response = await apiClient.post<BackendPortalResponse>('/billing/portal', {
    return_url: returnUrl,
  })
  return adaptPortal(response.data)
}

/**
 * Get usage tracking for current project
 */
async function getUsage(): Promise<Usage | null> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      projectId: 'mock-project',
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]!,
      periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]!,
      contactsCreated: 127,
      contactsLimit: 500,
      usagePercentage: 25,
      remaining: 373,
    }
  }

  const response = await apiClient.get<{ usage: BackendUsage | null }>('/billing/usage')
  const raw = (response.data as { usage?: BackendUsage | null })?.usage
  if (!raw) return null
  return adaptUsage(raw)
}

/**
 * Get subscription limits and status for the user's company
 */
async function getLimits(): Promise<PlanLimits> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)
    return {
      subscription: {
        status: 'trialing',
        planSlug: 'growth',
        planName: 'Growth',
        trialEndsAt: trialEnd.toISOString(),
        daysRemaining: 14,
        billingCycle: 'monthly',
      },
      limits: {
        projects: { max: 3, current: 1, canCreate: true },
        users: { max: 5, current: 2, canInvite: true },
        contactsPerProject: 1000,
      },
    }
  }

  const response = await apiClient.get<BackendLimits>('/billing/limits')
  const raw = response.data as BackendLimits
  return adaptLimits(raw)
}

interface StartTrialResult {
  message: string
  planSlug: string
  planName: string
  trialDays: number
}

/**
 * Start a trial on the chosen plan (first-time subscription)
 */
async function startTrial(planSlug: string): Promise<StartTrialResult> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const planNames: Record<string, string> = { starter: 'Starter', growth: 'Growth', pro: 'Pro' }
    return {
      message: 'Trial started successfully',
      planSlug,
      planName: planNames[planSlug] ?? planSlug,
      trialDays: 14,
    }
  }

  const response = await apiClient.post<{
    message: string
    plan_slug: string
    plan_name: string
    trial_days: number
  }>('/billing/start-trial', { plan_slug: planSlug })

  const raw = response.data
  return {
    message: raw.message,
    planSlug: raw.plan_slug,
    planName: raw.plan_name,
    trialDays: raw.trial_days,
  }
}

export const billingService = {
  getPlans,
  getSubscription,
  createCheckout,
  createPortal,
  getUsage,
  getLimits,
  startTrial,
  addProjects,
}
