/**
 * Product Analytics Types
 *
 * Typed event map for product analytics (PostHog).
 * Each event name maps to its required properties.
 *
 * @module types/productAnalytics
 */

/** Mapa de eventos de produto → properties tipadas */
export interface ProductAnalyticsEventMap {
  user_signed_up: { email: string }
  onboarding_completed: Record<string, never>
  trial_started: { plan: string; trialDays: number }
  subscription_started: { plan: string; billingCycle: 'monthly' | 'yearly' }
  payment_succeeded: { plan: string }
  churned: { plan: string | null }

  // Setup Checklist
  setup_checklist_viewed: {
    completedSteps: number
    totalSteps: number
    projectId: string
  }
  setup_checklist_step_clicked: {
    stepId: string
    stepOrder: number
    projectId: string
  }
  setup_checklist_step_completed: {
    stepId: string
    stepOrder: number
    projectId: string
    completedSteps: number
    totalSteps: number
  }
  setup_checklist_completed: {
    projectId: string
    timeToCompleteMs: number | null
  }
  setup_checklist_dismissed: {
    completedSteps: number
    totalSteps: number
    projectId: string
  }
}

export type ProductAnalyticsEventName = keyof ProductAnalyticsEventMap

/** Interface do provider de analytics (DIP — dependa desta abstração) */
export interface AnalyticsProvider {
  init(): void
  identify(userId: string, traits: { email: string; name: string }): void
  track<E extends ProductAnalyticsEventName>(event: E, properties: ProductAnalyticsEventMap[E]): void
  reset(): void
}
