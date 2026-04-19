/**
 * CORS headers para Edge Functions
 *
 * Permite allowlist via ALLOWED_ORIGINS (CSV), com fallback para '*' em dev.
 */

const DEFAULT_ALLOWED_HEADERS = 'authorization, x-client-info, apikey, content-type, x-project-id'
const DEFAULT_ALLOWED_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS'

function getAllowedOrigins(): string[] {
  const raw = Deno.env.get('ALLOWED_ORIGINS')
  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function resolveOrigin(origin: string | null): string {
  const allowedOrigins = getAllowedOrigins()

  if (allowedOrigins.length === 0) {
    return '*'
  }

  if (origin && allowedOrigins.includes(origin)) {
    return origin
  }

  if (!origin) {
    return allowedOrigins[0] ?? 'null'
  }

  return 'null'
}

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers.get('origin') ?? null

  return {
    'Access-Control-Allow-Origin': resolveOrigin(origin),
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
    'Vary': 'Origin',
  }
}

export function withCorsHeaders(req: Request, response: Response): Response {
  const headers = new Headers(response.headers)
  const corsHeaders = getCorsHeaders(req)

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

export const corsHeaders = getCorsHeaders()
