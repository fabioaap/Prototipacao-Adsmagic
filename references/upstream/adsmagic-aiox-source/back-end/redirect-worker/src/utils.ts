import type { TrackingParams, GeoData } from './types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VALID_TIMEZONE_REGEX = /^[A-Za-z_]+(?:\/[A-Za-z0-9_\-+]+)+$/

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}

export function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile'
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet'
  }
  return 'desktop'
}

function readParam(url: URL, key: string): string | null {
  const value = url.searchParams.get(key)
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeTimezone(value?: string | null): string | null {
  const timezone = value?.trim() || ''
  if (!timezone) return null
  if (!VALID_TIMEZONE_REGEX.test(timezone)) return null
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: timezone }).format(new Date())
    return timezone
  } catch {
    return null
  }
}

export function extractTrackingParams(url: URL): TrackingParams {
  return {
    utm_source: readParam(url, 'utm_source'),
    utm_medium: readParam(url, 'utm_medium'),
    utm_campaign: readParam(url, 'utm_campaign'),
    utm_content: readParam(url, 'utm_content'),
    utm_term: readParam(url, 'utm_term'),
    campaign_id: readParam(url, 'campaign_id'),
    adgroup_id: readParam(url, 'adgroup_id'),
    ad_id: readParam(url, 'ad_id'),
    fbclid: readParam(url, 'fbclid'),
    gclid: readParam(url, 'gclid'),
    msclkid: readParam(url, 'msclkid'),
    gbraid: readParam(url, 'gbraid'),
    wbraid: readParam(url, 'wbraid'),
    yclid: readParam(url, 'yclid'),
    ttclid: readParam(url, 'ttclid'),
    referrer: readParam(url, 'referrer'),
    landing_url: readParam(url, 'landing_url'),
  }
}

export function extractGeoData(headers: Headers): GeoData {
  return {
    ip_address: headers.get('cf-connecting-ip') || headers.get('x-forwarded-for')?.split(',')[0] || null,
    country: headers.get('cf-ipcountry') || null,
    city: headers.get('cf-ipcity') || null,
    state: headers.get('cf-ipregion') || null,
  }
}

export function extractClientTimezone(url: URL, request: Request): string | null {
  const queryTimezone = readParam(url, 'timezone') || readParam(url, 'tz')
  const headerTimezone = request.headers.get('x-timezone')
  const cfTimezone =
    (request as Request & { cf?: { timezone?: string } }).cf?.timezone || null

  return (
    normalizeTimezone(queryTimezone) ||
    normalizeTimezone(headerTimezone) ||
    normalizeTimezone(cfTimezone)
  )
}

export function getAccessUuid(cookieHeader: string | null): { uuid: string; isNew: boolean } {
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim())
    const accessCookie = cookies.find(c => c.startsWith('access_uuid='))
    if (accessCookie) {
      return { uuid: accessCookie.split('=')[1], isNew: false }
    }
  }
  return { uuid: crypto.randomUUID(), isNew: true }
}
