import type { CachedLinkData } from './types'
import { generateWhatsAppProtocol, buildWhatsAppTrackedMessage } from './whatsapp-protocol'

interface RedirectResult {
  destinationUrl: string
  whatsappProtocol: string | null
}

interface BuildRedirectOptions {
  timezone?: string | null
}

export function buildRedirect(link: CachedLinkData, options?: BuildRedirectOptions): RedirectResult | null {
  if (link.link_type === 'whatsapp' && link.whatsapp_number) {
    const protocol = generateWhatsAppProtocol()
    const cleanNumber = link.whatsapp_number.replace(/\D/g, '')
    const message = link.whatsapp_message_template || link.initial_message || ''
    const fullMessage = buildWhatsAppTrackedMessage(message, protocol, {
      timezone: options?.timezone,
    })
    const encodedMessage = encodeURIComponent(fullMessage)
    const url = `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`

    return { destinationUrl: url, whatsappProtocol: protocol }
  }

  if (link.destination_url) {
    return { destinationUrl: link.destination_url, whatsappProtocol: null }
  }

  return null
}
