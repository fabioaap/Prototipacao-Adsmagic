/**
 * Billing Store
 *
 * Manages plan catalog, subscription state, limits, and checkout/portal flows.
 *
 * @module stores/billing
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { billingService } from '@/services/api/billing'
import { analytics } from '@/services/analytics'
import type { Plan, Subscription, Usage, PlanLimits } from '@/services/api/adapters/billingAdapter'

/** Cache TTL: 30 minutes for plans (rarely changes) */
const PLANS_CACHE_TTL = 30 * 60 * 1000

export const useBillingStore = defineStore('billing', () => {
  // ─── State ───
  const plans = ref<Plan[]>([])
  const subscription = ref<Subscription | null>(null)
  const usage = ref<Usage | null>(null)
  const limits = ref<PlanLimits | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let plansCachedAt = 0

  // ─── Computed ───
  const currentPlanSlug = computed(() => subscription.value?.plan?.slug ?? limits.value?.subscription.planSlug ?? null)
  const isSubscribed = computed(() =>
    subscription.value != null && subscription.value.status === 'active'
  )
  const hasPlans = computed(() => plans.value.length > 0)

  const isTrialing = computed(() => {
    if (limits.value) return limits.value.subscription.status === 'trialing'
    return subscription.value?.status === 'trialing'
  })

  const isExpired = computed(() => {
    const status = limits.value?.subscription.status ?? subscription.value?.status
    if (!status) return true
    if (status === 'expired') return true
    if (status === 'trialing') {
      const trialEnd = limits.value?.subscription.trialEndsAt ?? subscription.value?.trialEndsAt
      if (trialEnd && new Date(trialEnd) < new Date()) return true
    }
    return false
  })

  const trialDaysRemaining = computed(() => {
    return limits.value?.subscription.daysRemaining ?? 0
  })

  const hasActiveSubscription = computed(() => {
    const status = limits.value?.subscription.status ?? subscription.value?.status
    return status === 'active' || (status === 'trialing' && !isExpired.value)
  })

  const canCreateProject = computed(() => limits.value?.limits.projects.canCreate ?? false)
  const canInviteUser = computed(() => limits.value?.limits.users.canInvite ?? false)

  const trialPlanName = computed(() => limits.value?.subscription.planName ?? subscription.value?.plan?.name ?? null)

  // ─── Actions ───

  async function fetchPlans(force = false): Promise<void> {
    const now = Date.now()
    if (!force && plans.value.length > 0 && now - plansCachedAt < PLANS_CACHE_TTL) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      plans.value = await billingService.getPlans()
      plansCachedAt = Date.now()
    } catch (err) {
      console.error('[billing-store] Failed to fetch plans:', err)
      error.value = 'Failed to load plans'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSubscription(): Promise<void> {
    try {
      const previousStatus = subscription.value?.status
      subscription.value = await billingService.getSubscription()

      if (previousStatus && previousStatus !== 'canceled' && subscription.value?.status === 'canceled') {
        analytics.track('churned', { plan: subscription.value?.plan?.slug ?? null })
      }
    } catch (err) {
      console.error('[billing-store] Failed to fetch subscription:', err)
    }
  }

  async function fetchUsage(): Promise<void> {
    try {
      usage.value = await billingService.getUsage()
    } catch (err) {
      console.error('[billing-store] Failed to fetch usage:', err)
    }
  }

  async function fetchLimits(): Promise<void> {
    try {
      limits.value = await billingService.getLimits()
    } catch (err) {
      console.error('[billing-store] Failed to fetch limits:', err)
    }
  }

  /**
   * Start Stripe Checkout flow — redirects the browser to Stripe.
   */
  async function startCheckout(planSlug: string, billingCycle: 'monthly' | 'yearly', extraProjects?: number): Promise<void> {
    const currentUrl = window.location.href
    const result = await billingService.createCheckout(
      planSlug,
      billingCycle,
      `${currentUrl}?checkout=success`,
      `${currentUrl}?checkout=cancel`,
      extraProjects
    )
    window.location.href = result.checkoutUrl
  }

  /**
   * Add extra projects to an existing subscription.
   * Refreshes limits after update.
   */
  async function addExtraProjects(quantity: number): Promise<number> {
    const result = await billingService.addProjects(quantity)
    await Promise.allSettled([fetchLimits(), fetchSubscription()])
    return result.totalProjects
  }

  /**
   * Start a trial on the chosen plan (first-time subscription).
   * Refreshes limits after trial is created.
   */
  async function startTrialForPlan(planSlug: string): Promise<{ planName: string; trialDays: number }> {
    const result = await billingService.startTrial(planSlug)
    // Refresh limits and subscription to reflect the new trial
    await Promise.allSettled([fetchLimits(), fetchSubscription()])
    return { planName: result.planName, trialDays: result.trialDays }
  }

  /**
   * Open Stripe Customer Portal — redirects the browser.
   */
  async function openPortal(): Promise<void> {
    const result = await billingService.createPortal(window.location.href)
    window.location.href = result.portalUrl
  }

  return {
    // State
    plans,
    subscription,
    usage,
    limits,
    isLoading,
    error,
    // Computed
    currentPlanSlug,
    isSubscribed,
    hasPlans,
    isTrialing,
    isExpired,
    trialDaysRemaining,
    hasActiveSubscription,
    canCreateProject,
    canInviteUser,
    trialPlanName,
    // Actions
    fetchPlans,
    fetchSubscription,
    fetchUsage,
    fetchLimits,
    startCheckout,
    startTrialForPlan,
    addExtraProjects,
    openPortal,
  }
})
