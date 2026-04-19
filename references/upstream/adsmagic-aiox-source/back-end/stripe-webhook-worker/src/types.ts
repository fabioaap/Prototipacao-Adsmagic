export interface Env {
  STRIPE_WEBHOOK_SECRET: string
  STRIPE_SECRET_KEY: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  STRIPE_EVENTS_QUEUE: Queue<StripeQueueMessage>
}

export interface StripeQueueMessage {
  event_id: string
  event_type: string
  data: Record<string, unknown>
}

export interface StripeEvent {
  id: string
  type: string
  data: {
    object: Record<string, unknown>
  }
  created: number
}

export interface StripeCheckoutSession {
  id: string
  customer: string
  subscription: string
  metadata: {
    company_id: string
    plan_id: string
    plan_slug: string
    billing_cycle: string
    user_id: string
  }
}

export interface StripeInvoice {
  id: string
  customer: string
  subscription: string
  status: string
  lines: {
    data: Array<{
      price: {
        id: string
        product: string
      }
      period: {
        start: number
        end: number
      }
    }>
  }
}

export interface StripeSubscriptionItem {
  id: string
  quantity?: number
  price: {
    id: string
    product: string
    recurring: {
      interval: string
    }
  }
}

export interface StripeSubscription {
  id: string
  customer: string
  status: string
  items: {
    data: StripeSubscriptionItem[]
  }
  current_period_start: number
  current_period_end: number
  canceled_at: number | null
  metadata: Record<string, string>
}
