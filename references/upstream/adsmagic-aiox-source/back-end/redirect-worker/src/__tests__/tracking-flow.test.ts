import { describe, it, expect, vi } from 'vitest'
import {
  extractTrackingParams,
  getAccessUuid,
  detectDevice,
  extractGeoData,
  extractClientTimezone,
} from '../utils'
import { buildRedirect } from '../redirect-builder'
import {
  generateWhatsAppProtocol,
  encodeWhatsAppProtocol,
  buildWhatsAppTrackedMessage,
} from '../whatsapp-protocol'
import type { CachedLinkData, TrackingParams } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLink(overrides: Partial<CachedLinkData> = {}): CachedLinkData {
  return {
    id: 'link-001',
    project_id: 'proj-001',
    destination_url: null,
    link_type: 'whatsapp',
    whatsapp_number: '+5511999999999',
    whatsapp_message_template: 'Ola, quero saber mais!',
    initial_message: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    origin_id: null,
    is_active: true,
    ...overrides,
  }
}

// Zero-width chars used by the protocol encoder
const ZERO_WIDTH_CHARS = ['\u200B', '\u200C', '\u200D', '\u2060']

function stripZeroWidth(str: string): string {
  return str.replace(/[\u200B\u200C\u200D\u2060]/g, '')
}

// ---------------------------------------------------------------------------
// 1. extractTrackingParams
// ---------------------------------------------------------------------------

describe('extractTrackingParams', () => {
  it('extracts all UTM parameters', () => {
    const url = new URL(
      'https://r.adsmagic.com.br/abc?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=banner&utm_term=shoes',
    )
    const params = extractTrackingParams(url)

    expect(params.utm_source).toBe('google')
    expect(params.utm_medium).toBe('cpc')
    expect(params.utm_campaign).toBe('spring')
    expect(params.utm_content).toBe('banner')
    expect(params.utm_term).toBe('shoes')
  })

  it('extracts click IDs (gclid, fbclid, ttclid, msclkid, gbraid, wbraid, yclid)', () => {
    const url = new URL(
      'https://r.adsmagic.com.br/abc?gclid=gc123&fbclid=fb456&ttclid=tt789&msclkid=ms000&gbraid=gb111&wbraid=wb222&yclid=yc333',
    )
    const params = extractTrackingParams(url)

    expect(params.gclid).toBe('gc123')
    expect(params.fbclid).toBe('fb456')
    expect(params.ttclid).toBe('tt789')
    expect(params.msclkid).toBe('ms000')
    expect(params.gbraid).toBe('gb111')
    expect(params.wbraid).toBe('wb222')
    expect(params.yclid).toBe('yc333')
  })

  it('extracts campaign_id, adgroup_id, ad_id, referrer and landing_url', () => {
    const url = new URL(
      'https://r.adsmagic.com.br/abc?campaign_id=camp1&adgroup_id=group1&ad_id=ad99&referrer=https://google.com&landing_url=https://site.com/promo',
    )
    const params = extractTrackingParams(url)

    expect(params.campaign_id).toBe('camp1')
    expect(params.adgroup_id).toBe('group1')
    expect(params.ad_id).toBe('ad99')
    expect(params.referrer).toBe('https://google.com')
    expect(params.landing_url).toBe('https://site.com/promo')
  })

  it('returns null for missing parameters', () => {
    const url = new URL('https://r.adsmagic.com.br/abc')
    const params = extractTrackingParams(url)

    expect(params.utm_source).toBeNull()
    expect(params.gclid).toBeNull()
    expect(params.fbclid).toBeNull()
    expect(params.campaign_id).toBeNull()
  })

  it('ignores empty and whitespace-only values', () => {
    const url = new URL(
      'https://r.adsmagic.com.br/abc?utm_source=&utm_medium=%20%20&gclid=%20',
    )
    const params = extractTrackingParams(url)

    expect(params.utm_source).toBeNull()
    expect(params.utm_medium).toBeNull()
    expect(params.gclid).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 2. getAccessUuid
// ---------------------------------------------------------------------------

describe('getAccessUuid', () => {
  it('returns existing UUID from cookie header', () => {
    const result = getAccessUuid('access_uuid=abc-123-def; other_cookie=foo')
    expect(result.uuid).toBe('abc-123-def')
    expect(result.isNew).toBe(false)
  })

  it('generates new UUID when cookie header is null', () => {
    const result = getAccessUuid(null)
    expect(result.uuid).toBeTruthy()
    expect(result.isNew).toBe(true)
  })

  it('generates new UUID when access_uuid cookie is missing', () => {
    const result = getAccessUuid('session=abc; theme=dark')
    expect(result.uuid).toBeTruthy()
    expect(result.isNew).toBe(true)
  })

  it('generated UUID has valid format', () => {
    const result = getAccessUuid(null)
    expect(result.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })
})

// ---------------------------------------------------------------------------
// 3. buildRedirect
// ---------------------------------------------------------------------------

describe('buildRedirect', () => {
  it('builds WhatsApp URL for whatsapp link type', () => {
    const link = makeLink()
    const result = buildRedirect(link)

    expect(result).not.toBeNull()
    expect(result!.destinationUrl).toContain('https://wa.me/5511999999999')
    expect(result!.destinationUrl).toContain('text=')
    expect(result!.whatsappProtocol).toMatch(/^WA-/)
  })

  it('includes message template in WhatsApp URL', () => {
    const link = makeLink({ whatsapp_message_template: 'Oi, vim pelo site' })
    const result = buildRedirect(link)

    const decoded = decodeURIComponent(result!.destinationUrl)
    expect(stripZeroWidth(decoded)).toContain('Oi, vim pelo site')
  })

  it('uses initial_message as fallback when template is empty', () => {
    const link = makeLink({
      whatsapp_message_template: null,
      initial_message: 'Mensagem inicial',
    })
    const result = buildRedirect(link)

    const decoded = decodeURIComponent(result!.destinationUrl)
    expect(stripZeroWidth(decoded)).toContain('Mensagem inicial')
  })

  it('returns destination_url directly for landing_page type', () => {
    const link = makeLink({
      link_type: 'landing_page',
      destination_url: 'https://meusite.com/promo',
      whatsapp_number: null,
    })
    const result = buildRedirect(link)

    expect(result).not.toBeNull()
    expect(result!.destinationUrl).toBe('https://meusite.com/promo')
    expect(result!.whatsappProtocol).toBeNull()
  })

  it('returns null when link has no destination', () => {
    const link = makeLink({
      link_type: 'landing_page',
      destination_url: null,
      whatsapp_number: null,
    })
    const result = buildRedirect(link)

    expect(result).toBeNull()
  })

  it('strips non-numeric characters from whatsapp number', () => {
    const link = makeLink({ whatsapp_number: '+55 (11) 99999-9999' })
    const result = buildRedirect(link)

    expect(result!.destinationUrl).toContain('wa.me/5511999999999')
  })
})

// ---------------------------------------------------------------------------
// 4. WhatsApp Protocol — encode/decode
// ---------------------------------------------------------------------------

describe('WhatsApp Protocol', () => {
  it('generateWhatsAppProtocol returns WA-xxx-xxx format', () => {
    const protocol = generateWhatsAppProtocol()
    expect(protocol).toMatch(/^WA-[A-Z0-9]+-[A-Z0-9]+$/)
  })

  it('generates unique protocols on each call', () => {
    const protocols = new Set(Array.from({ length: 20 }, () => generateWhatsAppProtocol()))
    expect(protocols.size).toBe(20)
  })

  it('encodeWhatsAppProtocol produces only zero-width characters', () => {
    const protocol = 'WA-TEST123-ABCDEF'
    const encoded = encodeWhatsAppProtocol(protocol)

    expect(encoded.length).toBeGreaterThan(0)
    for (const char of encoded) {
      expect(ZERO_WIDTH_CHARS).toContain(char)
    }
  })

  it('buildWhatsAppTrackedMessage embeds token after first character', () => {
    const message = 'Ola mundo'
    const protocol = 'WA-TEST-ABC'
    const tracked = buildWhatsAppTrackedMessage(message, protocol)

    // First char is 'O', then invisible token, then 'la mundo'
    expect(tracked[0]).toBe('O')
    expect(stripZeroWidth(tracked)).toBe('Ola mundo')
  })

  it('invisible token does not alter visible message', () => {
    const original = 'Quero saber sobre o produto'
    const protocol = generateWhatsAppProtocol()
    const tracked = buildWhatsAppTrackedMessage(original, protocol)

    expect(stripZeroWidth(tracked)).toBe(original)
    expect(tracked.length).toBeGreaterThan(original.length)
  })

  it('protocol survives encodeURIComponent → decodeURIComponent roundtrip', () => {
    const message = 'Ola, vi o anuncio!'
    const protocol = generateWhatsAppProtocol()
    const tracked = buildWhatsAppTrackedMessage(message, protocol)

    const encoded = encodeURIComponent(tracked)
    const decoded = decodeURIComponent(encoded)

    expect(decoded).toBe(tracked)
    expect(stripZeroWidth(decoded)).toBe(message)
  })

  it('uses default greeting when message is empty', () => {
    const protocol = generateWhatsAppProtocol()
    const tracked = buildWhatsAppTrackedMessage('', protocol)
    const visible = stripZeroWidth(tracked)

    expect(visible).toMatch(/^Ola, bo[am]/)
  })

  it('uses default greeting when message is null', () => {
    const protocol = generateWhatsAppProtocol()
    const tracked = buildWhatsAppTrackedMessage(null, protocol)
    const visible = stripZeroWidth(tracked)

    expect(visible).toMatch(/^Ola, bo[am]/)
  })

  it('removes pre-existing protocol zero-width chars before embedding a new token', () => {
    const protocol = 'WA-TEST-ABC'
    const preexistingNoise = '\u2060\u200D\u200B\u200B\u200B\u2060\u200C\u200C\u200D\u200D'
    const tracked = buildWhatsAppTrackedMessage(`O${preexistingNoise}la mundo`, protocol)

    expect(stripZeroWidth(tracked)).toBe('Ola mundo')
  })
})

// ---------------------------------------------------------------------------
// 5. Fluxo completo E2E (simulado)
// ---------------------------------------------------------------------------

describe('Full tracking flow (simulated E2E)', () => {
  it('URL with UTMs → extractTrackingParams → buildRedirect → tracked WhatsApp URL', () => {
    // Step 1: Visitor arrives with UTMs
    const visitorUrl = new URL(
      'https://r.adsmagic.com.br/abc?utm_source=facebook&utm_medium=social&utm_campaign=black_friday&gclid=gc999',
    )
    const trackingParams = extractTrackingParams(visitorUrl)

    // Step 2: Build redirect for WhatsApp link
    const link = makeLink({ whatsapp_message_template: 'Oi, vim do anuncio!' })
    const redirect = buildRedirect(link)

    expect(redirect).not.toBeNull()
    expect(redirect!.whatsappProtocol).toMatch(/^WA-/)

    // Step 3: Verify tracking params captured
    expect(trackingParams.utm_source).toBe('facebook')
    expect(trackingParams.utm_medium).toBe('social')
    expect(trackingParams.utm_campaign).toBe('black_friday')
    expect(trackingParams.gclid).toBe('gc999')

    // Step 4: Final URL contains tracked message
    const decoded = decodeURIComponent(redirect!.destinationUrl)
    expect(decoded).toContain('wa.me/')
    expect(stripZeroWidth(decoded)).toContain('Oi, vim do anuncio!')
  })

  it('URL UTMs override link UTMs (fallback behavior)', () => {
    const visitorUrl = new URL(
      'https://r.adsmagic.com.br/abc?utm_source=google&utm_medium=cpc',
    )
    const urlParams = extractTrackingParams(visitorUrl)

    const link = makeLink({
      utm_source: 'meta',
      utm_medium: 'paid',
      utm_campaign: 'promo',
    })

    // URL params take priority over link params
    const mergedSource = urlParams.utm_source || link.utm_source
    const mergedMedium = urlParams.utm_medium || link.utm_medium
    const mergedCampaign = urlParams.utm_campaign || link.utm_campaign

    expect(mergedSource).toBe('google')
    expect(mergedMedium).toBe('cpc')
    expect(mergedCampaign).toBe('promo') // fallback to link
  })

  it('link UTMs are used when URL has none', () => {
    const visitorUrl = new URL('https://r.adsmagic.com.br/abc')
    const urlParams = extractTrackingParams(visitorUrl)

    const link = makeLink({
      utm_source: 'meta',
      utm_medium: 'paid',
      utm_campaign: 'summer',
    })

    const mergedSource = urlParams.utm_source || link.utm_source
    const mergedMedium = urlParams.utm_medium || link.utm_medium
    const mergedCampaign = urlParams.utm_campaign || link.utm_campaign

    expect(mergedSource).toBe('meta')
    expect(mergedMedium).toBe('paid')
    expect(mergedCampaign).toBe('summer')
  })

  it('all tracking params map to LinkAccessInsert fields', () => {
    const url = new URL(
      'https://r.adsmagic.com.br/abc?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=banner&utm_term=shoes&campaign_id=camp1&adgroup_id=grp1&ad_id=ad1&gclid=gc1&fbclid=fb1&ttclid=tt1&msclkid=ms1&gbraid=gb1&wbraid=wb1&yclid=yc1&referrer=https://google.com&landing_url=https://site.com',
    )
    const params = extractTrackingParams(url)

    // Every field in TrackingParams should have a value
    const keys = Object.keys(params) as (keyof TrackingParams)[]
    for (const key of keys) {
      expect(params[key]).not.toBeNull()
    }
  })
})

// ---------------------------------------------------------------------------
// 6. detectDevice & extractGeoData
// ---------------------------------------------------------------------------

describe('detectDevice', () => {
  it('detects mobile from iPhone user agent', () => {
    expect(detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')).toBe('mobile')
  })

  it('detects mobile from Android user agent', () => {
    expect(detectDevice('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36')).toBe('mobile')
  })

  it('detects tablet from iPad user agent', () => {
    expect(detectDevice('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)')).toBe('tablet')
  })

  it('detects desktop from Chrome on Windows', () => {
    expect(
      detectDevice(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      ),
    ).toBe('desktop')
  })

  it('defaults to desktop for unknown user agent', () => {
    expect(detectDevice('curl/7.88.0')).toBe('desktop')
  })
})

describe('extractGeoData', () => {
  it('extracts all Cloudflare geo headers', () => {
    const headers = new Headers({
      'cf-connecting-ip': '200.100.50.25',
      'cf-ipcountry': 'BR',
      'cf-ipcity': 'Sao Paulo',
      'cf-ipregion': 'SP',
    })
    const geo = extractGeoData(headers)

    expect(geo.ip_address).toBe('200.100.50.25')
    expect(geo.country).toBe('BR')
    expect(geo.city).toBe('Sao Paulo')
    expect(geo.state).toBe('SP')
  })

  it('falls back to x-forwarded-for for IP', () => {
    const headers = new Headers({
      'x-forwarded-for': '10.0.0.1, 10.0.0.2',
    })
    const geo = extractGeoData(headers)

    expect(geo.ip_address).toBe('10.0.0.1')
  })

  it('returns null for missing headers', () => {
    const headers = new Headers()
    const geo = extractGeoData(headers)

    expect(geo.ip_address).toBeNull()
    expect(geo.country).toBeNull()
    expect(geo.city).toBeNull()
    expect(geo.state).toBeNull()
  })
})
