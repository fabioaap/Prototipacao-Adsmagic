/**
 * Resolve base URL used to build tracking links.
 *
 * TRACKING_BASE_URL can override the default domain, but the previous
 * legacy domain is normalized to the new official one.
 */
const DEFAULT_TRACKING_BASE_URL = 'https://r.adsmagic.com.br'
const LEGACY_TRACKING_BASE_URL = 'https://link.adsmagic.com.br'

export function resolveTrackingBaseUrl(): string {
  const configuredBaseUrl = Deno.env.get('TRACKING_BASE_URL')?.trim()

  if (!configuredBaseUrl || configuredBaseUrl === LEGACY_TRACKING_BASE_URL) {
    return DEFAULT_TRACKING_BASE_URL
  }

  return configuredBaseUrl
}

