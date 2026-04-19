/**
 * Edge Function para Redirecionamento de Links Rastreáveis
 * 
 * Endpoint público que processa redirecionamentos com tracking completo:
 * - GET /:routeKey - Redireciona para destino com tracking
 * 
 * Fluxo:
 * 1. Busca link por id (UUID canônico)
 * 2. Gera/recupera access_uuid via cookies
 * 3. Captura UTMs e click IDs da URL
 * 4. Captura geo data via headers
 * 5. Se WhatsApp: gera protocolo único
 * 6. Registra acesso
 * 7. Redireciona para destino
 * 
 * @module redirect
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  buildWhatsAppTrackedMessage,
  generateWhatsAppProtocol,
} from '../_shared/whatsapp-protocol.ts'

/** URL base do Supabase */
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const VALID_TIMEZONE_REGEX = /^[A-Za-z_]+(?:\/[A-Za-z0-9_\-+]+)+$/

/** CORS headers */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

/**
 * Gera UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID()
}

/**
 * Monta URL do WhatsApp
 */
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

function extractClientTimezone(url: URL, req: Request): string | null {
  const queryTimezone = readStringParam(url, 'timezone') || readStringParam(url, 'tz')
  const headerTimezone = req.headers.get('x-timezone')
  const cfTimezone =
    (req as Request & { cf?: { timezone?: string } }).cf?.timezone || null

  return (
    normalizeTimezone(queryTimezone) ||
    normalizeTimezone(headerTimezone) ||
    normalizeTimezone(cfTimezone)
  )
}

function buildWhatsAppUrl(
  phoneNumber: string,
  message?: string,
  protocol?: string,
  options?: { timezone?: string | null }
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const fullMessage = protocol
    ? buildWhatsAppTrackedMessage(message, protocol, { timezone: options?.timezone })
    : (message || '')
  const encodedMessage = encodeURIComponent(fullMessage)
  return `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

/**
 * Detecta tipo de dispositivo pelo User-Agent
 */
function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile'
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet'
  }
  return 'desktop'
}

/**
 * Estrutura dos parâmetros de tracking capturados no redirect.
 */
interface TrackingParams {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  campaign_id: string | null
  adgroup_id: string | null
  ad_id: string | null
  fbclid: string | null
  gclid: string | null
  msclkid: string | null
  gbraid: string | null
  wbraid: string | null
  yclid: string | null
  ttclid: string | null
  referrer: string | null
  landing_url: string | null
}

function readStringParam(url: URL, key: string): string | null {
  const value = url.searchParams.get(key)
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Extrai parâmetros de tracking da URL do redirect.
 */
function extractTrackingParams(url: URL): TrackingParams {
  return {
    // UTMs
    utm_source: readStringParam(url, 'utm_source'),
    utm_medium: readStringParam(url, 'utm_medium'),
    utm_campaign: readStringParam(url, 'utm_campaign'),
    utm_content: readStringParam(url, 'utm_content'),
    utm_term: readStringParam(url, 'utm_term'),
    campaign_id: readStringParam(url, 'campaign_id'),
    adgroup_id: readStringParam(url, 'adgroup_id'),
    ad_id: readStringParam(url, 'ad_id'),
    // Click IDs
    fbclid: readStringParam(url, 'fbclid'),
    gclid: readStringParam(url, 'gclid'),
    msclkid: readStringParam(url, 'msclkid'),
    gbraid: readStringParam(url, 'gbraid'),
    wbraid: readStringParam(url, 'wbraid'),
    yclid: readStringParam(url, 'yclid'),
    ttclid: readStringParam(url, 'ttclid'),
    // Contexto opcional enviado pela tag
    referrer: readStringParam(url, 'referrer'),
    landing_url: readStringParam(url, 'landing_url'),
  }
}

/**
 * Extrai geo data dos headers (Cloudflare)
 */
function extractGeoData(headers: Headers): Record<string, string | null> {
  return {
    ip_address: headers.get('cf-connecting-ip') || headers.get('x-forwarded-for')?.split(',')[0] || null,
    country: headers.get('cf-ipcountry') || null,
    city: headers.get('cf-ipcity') || null,
    state: headers.get('cf-ipregion') || null,
  }
}

/**
 * Extrai ou gera access_uuid do cookie
 */
function getAccessUuid(cookieHeader: string | null): { uuid: string; isNew: boolean } {
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim())
    const accessCookie = cookies.find(c => c.startsWith('access_uuid='))
    if (accessCookie) {
      return { uuid: accessCookie.split('=')[1], isNew: false }
    }
  }
  return { uuid: generateUUID(), isNew: true }
}

/**
 * Valida UUID v4/v5 (case-insensitive)
 */
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

/**
 * Extrai a chave de rota (UUID) de forma robusta.
 *
 * Cenários suportados:
 * 1) Domínio customizado: /{uuid}
 * 2) Supabase gateway completo: /functions/v1/redirect/{uuid}
 * 3) Prefixo interno eventual: /redirect/{uuid}
 */
function extractRouteKey(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null

  if (parts[0] === 'functions' && parts[1] === 'v1' && parts[2] === 'redirect') {
    return parts[3] || null
  }

  // Só trata "redirect" como prefixo quando há um segundo segmento.
  // Ex.: "/redirect/<uuid>" -> "<uuid>", mas "/redirect" -> inválido.
  if (parts[0] === 'redirect') {
    return parts[1] || null
  }

  return parts[0]
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Apenas GET permitido
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const routeKey = extractRouteKey(url.pathname)
    
    console.log('[redirect.request]', {
      path: url.pathname,
      pathParts,
      routeKey,
      search: url.search
    })

    if (!routeKey) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Cliente Supabase com service role (bypass RLS)
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (!isUuid(routeKey)) {
      return new Response(JSON.stringify({ error: 'Invalid route key. UUID expected.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: link, error: idLookupError } = await supabaseClient
      .from('trackable_links')
      .select('*')
      .eq('id', routeKey)
      .eq('is_active', true)
      .maybeSingle()

    if (idLookupError) {
      console.error('[Redirect] ID lookup failed:', { routeKey, error: idLookupError })
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!link) {
      console.log('[Redirect] Link not found:', { routeKey })
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('[redirect.link_resolved]', { 
      id: link.id, 
      linkType: link.link_type,
      resolvedBy: 'id'
    })

    // Extrair dados de tracking
    const trackingParams = extractTrackingParams(url)
    const geoData = extractGeoData(req.headers)
    const userAgent = req.headers.get('user-agent') || ''
    const device = detectDevice(userAgent)
    const clientTimezone = extractClientTimezone(url, req)
    const referrer = trackingParams.referrer || req.headers.get('referer') || null
    const landingPage = trackingParams.landing_url || url.toString()

    // Obter ou gerar access_uuid
    const cookieHeader = req.headers.get('cookie')
    const { uuid: accessUuid, isNew: isNewAccess } = getAccessUuid(cookieHeader)
    const eventId = generateUUID()

    // Gerar protocolo WhatsApp se necessário
    let whatsappProtocol: string | null = null
    let destinationUrl: string

    if (link.link_type === 'whatsapp' && link.whatsapp_number) {
      whatsappProtocol = generateWhatsAppProtocol()
      const message = link.whatsapp_message_template || link.initial_message || ''
      destinationUrl = buildWhatsAppUrl(link.whatsapp_number, message, whatsappProtocol, {
        timezone: clientTimezone,
      })
    } else {
      destinationUrl = link.destination_url || ''
    }

    if (!destinationUrl) {
      return new Response(JSON.stringify({ error: 'Destination URL is not configured for this link' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Registrar acesso
    const accessData = {
      event_id: eventId,
      link_id: link.id,
      project_id: link.project_id,
      access_uuid: accessUuid,
      whatsapp_protocol: whatsappProtocol,
      user_agent: userAgent.substring(0, 500),
      ip_address: geoData.ip_address,
      city: geoData.city,
      country: geoData.country,
      state: geoData.state,
      device,
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
      referrer,
      landing_page: landingPage
    }

    // Inserir acesso (ignora se já existe com mesmo event_id)
    const { error: accessError } = await supabaseClient
      .from('link_accesses')
      .insert(accessData)

    if (accessError && accessError.code !== '23505') {
      console.error('[Redirect] Failed to register access:', accessError)
      // Não bloqueia o redirect, apenas loga
    } else if (accessError?.code === '23505') {
      console.log('[Redirect] Duplicate access event ignored:', { eventId })
    } else {
      console.log('[redirect.access_saved]', {
        linkId: link.id,
        eventId,
        accessUuid,
        whatsappProtocol,
        isNewAccess
      })
    }

    // Preparar headers de resposta
    const responseHeaders: Record<string, string> = {
      'Location': destinationUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }

    // Setar cookie de access_uuid se for novo
    if (isNewAccess) {
      // Cookie válido por 1 ano
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      const secureFlag = url.protocol === 'https:' ? '; Secure' : ''
      responseHeaders['Set-Cookie'] = `access_uuid=${accessUuid}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax${secureFlag}`
    }

    console.log('[redirect.whatsapp_redirected]', {
      linkId: link.id,
      eventId,
      protocolPresent: Boolean(whatsappProtocol),
      destinationUrl: destinationUrl.substring(0, 100) + '...',
      linkType: link.link_type
    })

    // Redirecionar (302 para permitir tracking)
    return new Response(null, {
      status: 302,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('[Redirect Error]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
