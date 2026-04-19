/**
 * Billing types
 */

export interface Plan {
  id: string
  slug: string
  name: string
  description: string | null
  projects_included: number
  max_users: number
  contacts_per_project: number
  price_monthly: number
  price_yearly: number
  stripe_product_id: string | null
  stripe_price_monthly_id: string | null
  stripe_price_yearly_id: string | null
  is_active: boolean
  sort_order: number
  features?: PlanFeature[]
  addons?: PlanAddon[]
}

export interface PlanFeature {
  id: string
  feature_slug: string
  enabled: boolean
  metadata: Record<string, unknown>
}

export interface PlanAddon {
  id: string
  addon_type: 'extra_project' | 'extra_contacts'
  unit_amount: number
  price: number
  stripe_price_id: string | null
  description: string | null
}

export interface Subscription {
  id: string
  company_id: string
  plan_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete'
  billing_cycle: 'monthly' | 'yearly'
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  trial_ends_at: string | null
  plan?: Plan
}

export interface UsageTracking {
  id: string
  project_id: string
  period_start: string
  period_end: string
  contacts_created: number
  contacts_limit: number
}

export interface CheckoutRequest {
  plan_slug: string
  billing_cycle: 'monthly' | 'yearly'
  success_url: string
  cancel_url: string
}

export interface PortalRequest {
  return_url: string
}

export interface AddProjectsRequest {
  quantity: number
}
