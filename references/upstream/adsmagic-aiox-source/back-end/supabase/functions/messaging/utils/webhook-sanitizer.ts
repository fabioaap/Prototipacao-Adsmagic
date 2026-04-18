/**
 * Utilitários para sanitização e auditoria de webhooks.
 *
 * Objetivo:
 * - Remover/mascarar segredos de headers e payloads antes de persistir em log.
 * - Gerar hash determinístico do body bruto para correlação.
 */

const SENSITIVE_KEYS = [
  'authorization',
  'token',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
  'secret',
  'password',
  'webhook_secret',
  'x-signature',
  'signature',
]

const MAX_DEPTH = 8

function isSensitiveKey(key: string): boolean {
  const lowered = key.toLowerCase()
  return SENSITIVE_KEYS.some((sensitive) => lowered.includes(sensitive))
}

function maskValue(value: unknown): string {
  const raw = String(value ?? '')
  if (raw.length <= 8) return '***'
  return `${raw.slice(0, 4)}***${raw.slice(-2)}`
}

function sanitizeObject(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[max-depth]'
  if (value === null || value === undefined) return value

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item, depth + 1))
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        out[key] = maskValue(nested)
      } else {
        out[key] = sanitizeObject(nested, depth + 1)
      }
    }
    return out
  }

  return value
}

export function sanitizeWebhookPayload(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === 'object') {
    return sanitizeObject(payload) as Record<string, unknown>
  }

  return {
    _raw_payload: String(payload ?? ''),
  }
}

export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of headers.entries()) {
    result[key] = isSensitiveKey(key) ? maskValue(value) : value
  }
  return result
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}
