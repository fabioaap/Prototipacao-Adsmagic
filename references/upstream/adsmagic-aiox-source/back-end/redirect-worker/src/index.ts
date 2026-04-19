/**
 * AdsMagic Redirect Worker
 *
 * Redirect direto com cache KV e tracking assincrono.
 * Fluxo: KV lookup -> 302 imediato -> ctx.waitUntil(tracking insert)
 */

import type { Env } from './types'
import { resolveLink } from './link-cache'
import { buildRedirect } from './redirect-builder'
import { insertLinkAccess } from './tracking'
import {
  isUuid,
  detectDevice,
  extractTrackingParams,
  extractGeoData,
  extractClientTimezone,
  getAccessUuid,
} from './utils'

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const requestId = request.headers.get('cf-ray') || crypto.randomUUID()

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { allow: 'GET, OPTIONS', 'cache-control': 'no-store' },
      })
    }

    if (request.method !== 'GET') {
      return jsonResponse(405, { error: 'Method not allowed', requestId })
    }

    const url = new URL(request.url)
    const allowedHost = (env.ALLOWED_HOST || '').trim().toLowerCase()
    if (allowedHost && url.hostname.toLowerCase() !== allowedHost) {
      return jsonResponse(400, { error: 'Invalid host', requestId })
    }

    const routeKey = url.pathname.split('/').filter(Boolean)[0] || ''
    if (!routeKey || !isUuid(routeKey)) {
      return jsonResponse(400, { error: 'Invalid link ID', requestId })
    }

    // --- FAST PATH: KV cache hit em ~2-5ms ---
    const link = await resolveLink(routeKey, env)
    if (!link) {
      return jsonResponse(404, { error: 'Link not found', requestId })
    }

    const clientTimezone = extractClientTimezone(url, request)
    const redirect = buildRedirect(link, { timezone: clientTimezone })
    if (!redirect) {
      return jsonResponse(400, { error: 'Destination not configured', requestId })
    }

    const { uuid: accessUuid, isNew: isNewAccess } = getAccessUuid(request.headers.get('cookie'))

    const responseHeaders: Record<string, string> = {
      'Location': redirect.destinationUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Request-Id': requestId,
      'X-Adsmagic-Latency': `${Date.now() - startedAt}ms`,
    }

    if (isNewAccess) {
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      responseHeaders['Set-Cookie'] =
        `access_uuid=${accessUuid}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax; Secure`
    }

    // --- ASYNC PATH: tracking nao bloqueia o redirect ---
    const trackingParams = extractTrackingParams(url)
    const geoData = extractGeoData(request.headers)
    const userAgent = request.headers.get('user-agent') || ''

    ctx.waitUntil(
      insertLinkAccess(
        {
          event_id: crypto.randomUUID(),
          link_id: link.id,
          project_id: link.project_id,
          access_uuid: accessUuid,
          whatsapp_protocol: redirect.whatsappProtocol,
          user_agent: userAgent.substring(0, 500),
          ip_address: geoData.ip_address,
          city: geoData.city,
          country: geoData.country,
          state: geoData.state,
          device: detectDevice(userAgent),
          fbclid: trackingParams.fbclid,
          gclid: trackingParams.gclid,
          msclkid: trackingParams.msclkid,
          gbraid: trackingParams.gbraid,
          wbraid: trackingParams.wbraid,
          yclid: trackingParams.yclid,
          ttclid: trackingParams.ttclid,
          utm_source: trackingParams.utm_source || link.utm_source,
          utm_medium: trackingParams.utm_medium || link.utm_medium,
          utm_campaign: trackingParams.utm_campaign || link.utm_campaign,
          utm_content: trackingParams.utm_content || link.utm_content,
          utm_term: trackingParams.utm_term || link.utm_term,
          campaign_id: trackingParams.campaign_id || trackingParams.utm_campaign || link.utm_campaign || null,
          adgroup_id: trackingParams.adgroup_id || null,
          ad_id: trackingParams.ad_id || null,
          referrer: trackingParams.referrer || request.headers.get('referer') || null,
          landing_page: trackingParams.landing_url || url.toString(),
        },
        env
      )
    )

    console.log(JSON.stringify({
      level: 'info',
      message: 'redirect',
      requestId,
      linkId: link.id,
      linkType: link.link_type,
      latencyMs: Date.now() - startedAt,
    }))

    return new Response(null, { status: 302, headers: responseHeaders })
  },
}
