/**
 * Adapter: billing backend responses → frontend types
 *
 * Converts snake_case from GET /billing/* endpoints to camelCase frontend types.
 *
 * @module services/api/adapters/billingAdapter
 */

// ─── Backend contract types (snake_case from DB/API) ───

export interface BackendPlanFeature {
  id: string
  plan_id: string
  feature_slug: string
  enabled: boolean
  metadata: Record<string, unknown> | null
}

export interface BackendPlanAddon {
  id: string
  plan_id: string
  addon_type: string
  unit_amount: number
  price: number
  stripe_price_id: string | null
  description: string | null
}

export interface BackendPlan {
  id: string
  slug: string
  name: string
  price_monthly: number
  price_yearly: number
  projects_included: number
  max_users: number
  contacts_per_project: number
  stripe_price_monthly_id: string | null
  stripe_price_yearly_id: string | null
  sort_order: number
  is_active: boolean
  features: BackendPlanFeature[]
  addons: BackendPlanAddon[]
}

export interface BackendSubscription {
  id: string
  company_id: string
  plan_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: string
  billing_cycle: string
  current_period_start: string | null
  current_period_end: string | null
  trial_ends_at: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
  plan: BackendPlan | null
  addons: BackendSubscriptionAddon[]
}

export interface BackendSubscriptionAddon {
  id: string
  subscription_id: string
  addon_type: string
  quantity: number
  stripe_subscription_item_id: string | null
}

export interface BackendUsage {
  project_id: string
  period_start: string
  period_end: string
  contacts_created: number
  contacts_limit: number
  usage_percentage: number
  remaining: number
}

export interface BackendCheckoutResponse {
  checkout_session_id: string
  checkout_url: string
}

export interface BackendPortalResponse {
  portal_url: string
}

// ─── Frontend types (camelCase) ───

export interface PlanFeature {
  id: string
  planId: string
  featureSlug: string
  enabled: boolean
  metadata: Record<string, unknown> | null
}

export interface PlanAddon {
  id: string
  planId: string
  addonType: string
  unitAmount: number
  price: number
  stripePriceId: string | null
  description: string | null
}

export interface Plan {
  id: string
  slug: string
  name: string
  priceMonthly: number
  priceYearly: number
  projectsIncluded: number
  maxUsers: number
  contactsPerProject: number
  stripePriceMonthlyId: string | null
  stripePriceYearlyId: string | null
  sortOrder: number
  features: PlanFeature[]
  addons: PlanAddon[]
}

export interface Subscription {
  id: string
  companyId: string
  planId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  status: string
  billingCycle: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
  plan: Plan | null
  addons: SubscriptionAddon[]
}

export interface SubscriptionAddon {
  id: string
  subscriptionId: string
  addonType: string
  quantity: number
  stripeSubscriptionItemId: string | null
}

export interface Usage {
  projectId: string
  periodStart: string
  periodEnd: string
  contactsCreated: number
  contactsLimit: number
  usagePercentage: number
  remaining: number
}

export interface CheckoutResult {
  checkoutSessionId: string
  checkoutUrl: string
}

export interface PortalResult {
  portalUrl: string
}

// ─── Adapter functions ───

export function adaptPlanFeature(raw: BackendPlanFeature): PlanFeature {
  return {
    id: raw.id,
    planId: raw.plan_id,
    featureSlug: raw.feature_slug,
    enabled: raw.enabled,
    metadata: raw.metadata,
  }
}

export function adaptPlanAddon(raw: BackendPlanAddon): PlanAddon {
  return {
    id: raw.id,
    planId: raw.plan_id,
    addonType: raw.addon_type,
    unitAmount: raw.unit_amount,
    price: raw.price,
    stripePriceId: raw.stripe_price_id,
    description: raw.description,
  }
}

export function adaptPlan(raw: BackendPlan): Plan {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    priceMonthly: raw.price_monthly,
    priceYearly: raw.price_yearly,
    projectsIncluded: raw.projects_included,
    maxUsers: raw.max_users,
    contactsPerProject: raw.contacts_per_project,
    stripePriceMonthlyId: raw.stripe_price_monthly_id,
    stripePriceYearlyId: raw.stripe_price_yearly_id,
    sortOrder: raw.sort_order,
    features: (raw.features || []).map(adaptPlanFeature),
    addons: (raw.addons || []).map(adaptPlanAddon),
  }
}

export function adaptSubscriptionAddon(raw: BackendSubscriptionAddon): SubscriptionAddon {
  return {
    id: raw.id,
    subscriptionId: raw.subscription_id,
    addonType: raw.addon_type,
    quantity: raw.quantity,
    stripeSubscriptionItemId: raw.stripe_subscription_item_id,
  }
}

export function adaptSubscription(raw: BackendSubscription): Subscription {
  return {
    id: raw.id,
    companyId: raw.company_id,
    planId: raw.plan_id,
    stripeCustomerId: raw.stripe_customer_id,
    stripeSubscriptionId: raw.stripe_subscription_id,
    status: raw.status,
    billingCycle: raw.billing_cycle,
    currentPeriodStart: raw.current_period_start,
    currentPeriodEnd: raw.current_period_end,
    trialEndsAt: raw.trial_ends_at ?? null,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    plan: raw.plan ? adaptPlan(raw.plan) : null,
    addons: (raw.addons || []).map(adaptSubscriptionAddon),
  }
}

export function adaptUsage(raw: BackendUsage): Usage {
  return {
    projectId: raw.project_id,
    periodStart: raw.period_start,
    periodEnd: raw.period_end,
    contactsCreated: raw.contacts_created,
    contactsLimit: raw.contacts_limit,
    usagePercentage: raw.usage_percentage,
    remaining: raw.remaining,
  }
}

export function adaptCheckout(raw: BackendCheckoutResponse): CheckoutResult {
  return {
    checkoutSessionId: raw.checkout_session_id,
    checkoutUrl: raw.checkout_url,
  }
}

export function adaptPortal(raw: BackendPortalResponse): PortalResult {
  return {
    portalUrl: raw.portal_url,
  }
}

// ─── Limits types and adapter ───

export interface BackendLimits {
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

export interface PlanLimits {
  subscription: {
    status: string
    planSlug: string | null
    planName: string | null
    trialEndsAt: string | null
    daysRemaining: number
    billingCycle: string | null
  }
  limits: {
    projects: { max: number; current: number; canCreate: boolean }
    users: { max: number; current: number; canInvite: boolean }
    contactsPerProject: number
  }
}

export function adaptLimits(raw: BackendLimits): PlanLimits {
  return {
    subscription: {
      status: raw.subscription.status,
      planSlug: raw.subscription.plan_slug,
      planName: raw.subscription.plan_name,
      trialEndsAt: raw.subscription.trial_ends_at,
      daysRemaining: raw.subscription.days_remaining,
      billingCycle: raw.subscription.billing_cycle,
    },
    limits: {
      projects: {
        max: raw.limits.projects.max,
        current: raw.limits.projects.current,
        canCreate: raw.limits.projects.can_create,
      },
      users: {
        max: raw.limits.users.max,
        current: raw.limits.users.current,
        canInvite: raw.limits.users.can_invite,
      },
      contactsPerProject: raw.limits.contacts_per_project,
    },
  }
}
