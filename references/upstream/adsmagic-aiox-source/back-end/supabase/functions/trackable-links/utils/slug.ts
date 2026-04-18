/**
 * Utilitários de URL e UUID para links rastreáveis
 * 
 * @module trackable-links/utils/slug
 */

import {
  buildWhatsAppTrackedMessage,
  generateWhatsAppProtocol as generateSharedWhatsAppProtocol,
} from '../../_shared/whatsapp-protocol.ts'

/**
 * Gera um UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}

/**
 * Gera um protocolo único para WhatsApp
 * Formato: WA-{timestamp}-{random}
 */
export function generateWhatsAppProtocol(): string {
  return generateSharedWhatsAppProtocol()
}

/**
 * Monta URL do WhatsApp com número e mensagem
 */
export function buildWhatsAppUrl(
  phoneNumber: string,
  message?: string,
  protocol?: string
): string {
  // Limpar número (apenas dígitos)
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  // Montar mensagem com protocolo
  const fullMessage = protocol
    ? buildWhatsAppTrackedMessage(message, protocol)
    : (message || '')
  
  // Codificar mensagem para URL
  const encodedMessage = encodeURIComponent(fullMessage)
  
  return `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

/**
 * Monta URL de tracking completa
 */
export function buildTrackingUrl(
  baseUrl: string,
  routeKey: string,
  utmParams?: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_term?: string
  }
): string {
  const url = new URL(`${baseUrl}/${routeKey}`)
  
  if (utmParams) {
    if (utmParams.utm_source) url.searchParams.set('utm_source', utmParams.utm_source)
    if (utmParams.utm_medium) url.searchParams.set('utm_medium', utmParams.utm_medium)
    if (utmParams.utm_campaign) url.searchParams.set('utm_campaign', utmParams.utm_campaign)
    if (utmParams.utm_content) url.searchParams.set('utm_content', utmParams.utm_content)
    if (utmParams.utm_term) url.searchParams.set('utm_term', utmParams.utm_term)
  }
  
  return url.toString()
}
