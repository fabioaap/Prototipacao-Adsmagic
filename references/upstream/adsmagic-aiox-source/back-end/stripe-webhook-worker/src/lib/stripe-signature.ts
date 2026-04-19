/**
 * Stripe webhook signature verification using Web Crypto API
 */

const TOLERANCE_SECONDS = 300 // 5 minutes

export async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(',')
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2)
  const v1Signature = parts.find(p => p.startsWith('v1='))?.slice(3)

  if (!timestamp || !v1Signature) {
    throw new Error('Invalid Stripe signature format')
  }

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000)
  const ts = parseInt(timestamp, 10)
  if (Math.abs(now - ts) > TOLERANCE_SECONDS) {
    throw new Error('Stripe signature timestamp too old')
  }

  // Compute expected signature using Web Crypto
  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedPayload)
  )

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time comparison
  return timingSafeEqual(expectedSignature, v1Signature)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
