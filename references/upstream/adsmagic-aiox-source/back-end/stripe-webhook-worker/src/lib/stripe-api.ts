/**
 * Minimal Stripe REST client for GET operations.
 * Avoids pulling the full Stripe SDK into the Cloudflare Worker bundle.
 */

import type { StripeSubscription } from '../types.js'

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

export async function fetchStripeSubscription(
  subscriptionId: string,
  secretKey: string
): Promise<StripeSubscription> {
  const response = await fetch(`${STRIPE_API_BASE}/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Stripe GET subscription ${subscriptionId} failed (${response.status}): ${error}`)
  }

  return response.json() as Promise<StripeSubscription>
}
