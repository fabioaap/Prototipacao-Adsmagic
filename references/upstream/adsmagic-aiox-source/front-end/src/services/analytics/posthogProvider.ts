/**
 * PostHog Analytics Provider
 *
 * Concrete implementation of AnalyticsProvider using PostHog Cloud.
 * Automatically disabled in mock mode or when VITE_POSTHOG_KEY is missing.
 *
 * @module services/analytics/posthogProvider
 */

import posthog from 'posthog-js'
import type {
  AnalyticsProvider,
  ProductAnalyticsEventName,
  ProductAnalyticsEventMap,
} from '@/types/productAnalytics'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string

export class PostHogProvider implements AnalyticsProvider {
  private readonly enabled: boolean

  constructor() {
    this.enabled = !!POSTHOG_KEY && import.meta.env.VITE_USE_MOCK !== 'true'
  }

  init(): void {
    if (!this.enabled) return
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    })
  }

  identify(userId: string, traits: { email: string; name: string }): void {
    if (!this.enabled) return
    posthog.identify(userId, traits)
  }

  track<E extends ProductAnalyticsEventName>(
    event: E,
    properties: ProductAnalyticsEventMap[E],
  ): void {
    if (!this.enabled) return
    posthog.capture(event, properties)
  }

  reset(): void {
    if (!this.enabled) return
    posthog.reset()
  }
}
