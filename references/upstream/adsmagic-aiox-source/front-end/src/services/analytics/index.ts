/**
 * Analytics Service — Barrel Export
 *
 * Singleton instance of the analytics provider.
 * Import this everywhere instead of posthog-js directly.
 *
 * @module services/analytics
 */

import { PostHogProvider } from './posthogProvider'
import type { AnalyticsProvider } from '@/types/productAnalytics'

export const analytics: AnalyticsProvider = new PostHogProvider()
