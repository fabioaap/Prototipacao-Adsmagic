/**
 * Tipos específicos do broker Gupshup
 */

export interface GupshupWebhookData {
  messageId: string
  source: string
  destination: string
  timestamp: string
  payload: {
    text?: string
    type?: string
    mediaUrl?: string
    caption?: string
  }
}

export interface GupshupSendResponse {
  messageId: string
  status: string
}
