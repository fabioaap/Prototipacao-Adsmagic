/**
 * Stripe REST API helper
 *
 * Uses fetch() directly with application/x-www-form-urlencoded
 * (no npm dependencies needed in Deno)
 */

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

function getStripeKey(): string {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return key
}

function encodeFormData(params: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
}

export async function stripeRequest(
  method: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<Record<string, unknown>> {
  const url = `${STRIPE_API_BASE}${path}`
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getStripeKey()}`,
  }

  const options: RequestInit = { method, headers }

  if (params && (method === 'POST' || method === 'PATCH')) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.body = encodeFormData(params)
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Stripe API error'
    throw new Error(`Stripe error (${response.status}): ${errorMessage}`)
  }

  return data as Record<string, unknown>
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(params: {
  customerId?: string
  customerEmail?: string
  lineItems: Array<{ priceId: string; quantity: number }>
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<{ id: string; url: string }> {
  const body: Record<string, string | number | boolean | undefined> = {
    'mode': 'subscription',
    'success_url': params.successUrl,
    'cancel_url': params.cancelUrl,
    'allow_promotion_codes': true,
  }

  params.lineItems.forEach((item, i) => {
    body[`line_items[${i}][price]`] = item.priceId
    body[`line_items[${i}][quantity]`] = item.quantity
  })

  if (params.customerId) {
    body['customer'] = params.customerId
  } else if (params.customerEmail) {
    body['customer_email'] = params.customerEmail
  }

  if (params.metadata) {
    for (const [key, value] of Object.entries(params.metadata)) {
      body[`metadata[${key}]`] = value
    }
  }

  const data = await stripeRequest('POST', '/checkout/sessions', body)
  return { id: data.id as string, url: data.url as string }
}

/**
 * Create a Stripe Subscription Item (add addon to existing subscription)
 */
export async function createSubscriptionItem(params: {
  subscriptionId: string
  priceId: string
  quantity: number
}): Promise<{ id: string }> {
  const data = await stripeRequest('POST', '/subscription_items', {
    subscription: params.subscriptionId,
    price: params.priceId,
    quantity: params.quantity,
  })
  return { id: data.id as string }
}

/**
 * Update a Stripe Subscription Item quantity
 */
export async function updateSubscriptionItem(params: {
  itemId: string
  quantity: number
}): Promise<{ id: string }> {
  const data = await stripeRequest('POST', `/subscription_items/${params.itemId}`, {
    quantity: params.quantity,
  })
  return { id: data.id as string }
}

/**
 * Create a Stripe Customer Portal Session
 */
export async function createPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<{ url: string }> {
  const data = await stripeRequest('POST', '/billing_portal/sessions', {
    customer: params.customerId,
    return_url: params.returnUrl,
  })
  return { url: data.url as string }
}
