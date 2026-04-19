/**
 * Sanitization utilities for webhook payloads and headers
 *
 * Masks sensitive fields before persisting to audit table.
 * Uses Web Crypto API for sha256 (available in Workers runtime).
 */

const SENSITIVE_KEYS = new Set([
  'token',
  'authorization',
  'api_key',
  'apikey',
  'api_secret',
  'secret',
  'password',
  'access_token',
  'refresh_token',
  'webhook_secret',
  'instancetoken',
  'instance_token',
  'admintoken',
  'admin_token',
])

function maskValue(value: string): string {
  if (value.length <= 8) return '***'
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
}

function sanitizeObject(obj: unknown, depth = 0): unknown {
  if (depth > 8) return '[max depth]'

  if (obj === null || obj === undefined) return obj

  if (typeof obj === 'string') return obj

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1))
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase()) && typeof value === 'string') {
        result[key] = maskValue(value)
      } else {
        result[key] = sanitizeObject(value, depth + 1)
      }
    }
    return result
  }

  return obj
}

export function sanitizeWebhookPayload(payload: unknown): unknown {
  return sanitizeObject(payload)
}

export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = maskValue(value)
    } else {
      result[key] = value
    }
  })
  return result
}

export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
