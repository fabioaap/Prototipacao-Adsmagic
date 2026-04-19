/**
 * Adsmagic Tag Worker
 *
 * Serves the tracking tag JS from a stable URL (tag.adsmagic.com.br)
 * and enqueues event tracking requests via Cloudflare Queue for
 * reliable, batched delivery to the Supabase Edge Function.
 *
 * Routes:
 *   GET  /v1/adsmagic-tag.js   → serves the tag script
 *   POST /api/events/track     → enqueues event to Cloudflare Queue
 *   GET  /health               → health check
 *
 * Queue consumer:
 *   Receives batched events and forwards them to the Supabase events API.
 */

import TAG_SCRIPT_V1 from './tag-v1.txt'

interface Env {
  EVENTS_API_URL: string
  EVENTS_QUEUE: Queue<EventMessage>
  EVENTS_DLQ: Queue<EventMessage>
}

interface EventMessage {
  payload: unknown
  clientIp: string
  userAgent: string
  enqueuedAt: string
}

const ONE_HOUR_SECONDS = 3600
const ONE_DAY_SECONDS = 86400
const MAX_BODY_BYTES = 64 * 1024
const UPSTREAM_TIMEOUT_MS = 10_000

const ROUTES = {
  TAG_V1: '/v1/adsmagic-tag.js',
  TAG_FALLBACK: '/adsmagic-tag.js',
  EVENTS_TRACK: '/api/events/track',
  HEALTH: '/health',
} as const

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function corsResponse(status = 204): Response {
  return new Response(null, { status, headers: CORS_HEADERS })
}

function handleTagScript(): Response {
  return new Response(TAG_SCRIPT_V1, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': `public, max-age=${ONE_HOUR_SECONDS}, s-maxage=${ONE_DAY_SECONDS}`,
      'X-Tag-Version': 'v1',
      ...CORS_HEADERS,
    },
  })
}

async function handleEventsEnqueue(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.includes('application/json')) {
    return jsonResponse({ error: 'Content-Type must be application/json' }, 415)
  }

  const body = await request.text()

  if (body.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Payload too large' }, 413)
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const message: EventMessage = {
    payload,
    clientIp: request.headers.get('CF-Connecting-IP') || '',
    userAgent: request.headers.get('User-Agent') || '',
    enqueuedAt: new Date().toISOString(),
  }

  await env.EVENTS_QUEUE.send(message)

  return jsonResponse({ accepted: true }, 202)
}

async function forwardEventToApi(message: EventMessage, env: Env): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  try {
    const response = await fetch(env.EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': message.userAgent,
        'X-Forwarded-For': message.clientIp,
      },
      body: JSON.stringify(message.payload),
      signal: controller.signal,
    })

    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname

    if (request.method === 'OPTIONS') {
      return corsResponse()
    }

    if (request.method === 'GET' && (path === ROUTES.TAG_V1 || path === ROUTES.TAG_FALLBACK)) {
      return handleTagScript()
    }

    if (request.method === 'POST' && path === ROUTES.EVENTS_TRACK) {
      return handleEventsEnqueue(request, env)
    }

    if (request.method === 'GET' && path === ROUTES.HEALTH) {
      return jsonResponse({ status: 'ok', service: 'adsmagic-tag' }, 200)
    }

    return jsonResponse({ error: 'Not found' }, 404)
  },

  async queue(batch: MessageBatch<EventMessage>, env: Env): Promise<void> {
    if (!env.EVENTS_API_URL) {
      batch.retryAll()
      return
    }

    for (const message of batch.messages) {
      const success = await forwardEventToApi(message.body, env)

      if (success) {
        message.ack()
      } else {
        message.retry()
      }
    }
  },
}
