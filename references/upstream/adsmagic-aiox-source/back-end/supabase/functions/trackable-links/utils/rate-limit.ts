import type { SupabaseDbClient } from '../types-db.ts'

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

const RATE_LIMIT_ENABLED = (Deno.env.get('RATE_LIMIT_ENABLED') ?? 'true') !== 'false'
const CLEANUP_PROBABILITY = 0.02
const CLEANUP_RETENTION_SECONDS = 60 * 60 * 24

function getClientIp(req: Request): string {
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  const xForwardedFor = req.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }

  const xRealIp = req.headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp.trim()
  }

  return 'unknown'
}

function getRateLimitKey(method: string, routeParts: string[]): string | null {
  if (method === 'POST' && routeParts.length === 2 && routeParts[1] === 'register-access') {
    return 'register-access'
  }

  if (method === 'POST' && routeParts.length === 2 && routeParts[1] === 'generate-whatsapp') {
    return 'generate-whatsapp'
  }

  return null
}

function getRateLimitConfig(key: string): RateLimitConfig {
  switch (key) {
    case 'register-access':
      return { maxRequests: 60, windowSeconds: 60 }
    case 'generate-whatsapp':
      return { maxRequests: 30, windowSeconds: 60 }
    default:
      return { maxRequests: 60, windowSeconds: 60 }
  }
}

async function cleanupOldRateLimitRows(supabaseClient: SupabaseDbClient): Promise<void> {
  const cutoff = new Date(Date.now() - CLEANUP_RETENTION_SECONDS * 1000).toISOString()
  const { error } = await supabaseClient
    .from('edge_rate_limits')
    .delete()
    .lt('created_at', cutoff)

  if (error) {
    console.warn('[Trackable Links] Rate limit cleanup failed:', error.message)
  }
}

/**
 * Enforces rate limit for public endpoints.
 * This function is fail-open to avoid blocking legitimate traffic on infra hiccups.
 */
export async function enforcePublicRateLimit(
  req: Request,
  supabaseClient: SupabaseDbClient,
  method: string,
  routeParts: string[]
): Promise<RateLimitResult> {
  if (!RATE_LIMIT_ENABLED) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const key = getRateLimitKey(method, routeParts)
  if (!key) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const config = getRateLimitConfig(key)
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000).toISOString()
  const clientIp = getClientIp(req)

  const { error: insertError } = await supabaseClient
    .from('edge_rate_limits')
    .insert({
      endpoint_key: key,
      ip_address: clientIp,
      request_path: new URL(req.url).pathname
    })

  if (insertError) {
    console.warn('[Trackable Links] Rate limit insert failed:', insertError.message)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const { count, error: countError } = await supabaseClient
    .from('edge_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('endpoint_key', key)
    .eq('ip_address', clientIp)
    .gte('created_at', windowStart)

  if (countError) {
    console.warn('[Trackable Links] Rate limit count failed:', countError.message)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (Math.random() < CLEANUP_PROBABILITY) {
    void cleanupOldRateLimitRows(supabaseClient)
  }

  const requestsInWindow = count ?? 0
  if (requestsInWindow > config.maxRequests) {
    return { allowed: false, retryAfterSeconds: config.windowSeconds }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}
