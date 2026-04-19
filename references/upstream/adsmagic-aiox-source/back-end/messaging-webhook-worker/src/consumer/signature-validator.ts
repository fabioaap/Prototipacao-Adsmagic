/**
 * Webhook Signature Validator
 *
 * Validates webhook signatures for different broker types.
 * Uses Web Crypto API (available in CF Workers).
 */

const SIGNATURE_HEADER_NAMES = [
  'x-hub-signature-256',
  'x-signature',
  'x-webhook-signature',
  'signature',
]

export function extractSignatureFromHeaders(headers: Record<string, string>): string | null {
  for (const name of SIGNATURE_HEADER_NAMES) {
    const value = headers[name]
    if (value) return value
  }
  return null
}

export async function validateWebhookSignature(params: {
  rawBody: string
  signature: string
  secret: string
  brokerType: string
}): Promise<boolean> {
  const { rawBody, signature, secret, brokerType } = params

  try {
    switch (brokerType) {
      case 'official_whatsapp':
        return await validateHmacSha256(rawBody, signature, secret, 'sha256=')

      case 'uazapi':
        // UAZAPI uses simple token comparison or HMAC
        if (signature === secret) return true
        return await validateHmacSha256(rawBody, signature, secret, '')

      case 'gupshup':
        return await validateHmacSha256(rawBody, signature, secret, '')

      default:
        // Unknown broker — try HMAC SHA-256 as default
        return await validateHmacSha256(rawBody, signature, secret, '')
    }
  } catch (error) {
    console.error('[signature-validator] Validation error:', error)
    return false
  }
}

async function validateHmacSha256(
  rawBody: string,
  signature: string,
  secret: string,
  prefix: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const computed = `${prefix}${bufferToHex(signatureBuffer)}`

  // Constant-time comparison
  return computed.length === signature.length &&
    timingSafeEqual(computed, signature)
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
