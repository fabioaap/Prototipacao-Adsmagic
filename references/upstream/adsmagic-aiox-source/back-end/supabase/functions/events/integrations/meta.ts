/**
 * Integração com Meta Conversions API (Facebook/Meta)
 * 
 * Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import type { ConversionEvent } from '../types.ts'
import type { SendEventResult } from './platform-sender.ts'

interface MetaIntegration {
  id: string
  platform: string
  status: string
  platform_config: Record<string, unknown>
}

interface MetaAccount {
  id: string
  external_account_id: string
  access_token: string | null
  account_metadata: Record<string, unknown>
  status: string
  pixel_id?: string | null
  pixel_access_token?: string | null
}

/**
 * Envia evento para Meta Conversions API
 */
export async function sendToMeta(
  event: ConversionEvent,
  integration: MetaIntegration,
  account: MetaAccount
): Promise<SendEventResult> {
  try {
    // Obter pixel_id: coluna dedicada > metadata > platform_config (legado)
    const config = integration.platform_config as Record<string, unknown>
    const accountMeta = (account.account_metadata as Record<string, unknown>) || {}
    const metaAdsMeta = (accountMeta.meta_ads as Record<string, unknown>) || {}

    const pixelId =
      (account.pixel_id as string) ||
      (metaAdsMeta.selected_pixel_id as string) ||
      (config.pixel_id as string)

    if (!pixelId) {
      return {
        success: false,
        error: 'Meta Pixel ID not configured'
      }
    }

    // pixel_access_token é o token dedicado para a Conversions API (CAPI)
    const accessToken = account.pixel_access_token as string
    if (!accessToken) {
      return {
        success: false,
        error: 'Meta access token not found'
      }
    }

    // Hash de dados sensíveis (requisito da Meta CAPI)
    const userData: Record<string, unknown> = {}
    if (event.payload.email) {
      userData.em = [await hashEmail(event.payload.email as string)]
    }
    if (event.payload.phone) {
      userData.ph = [await hashPhone(event.payload.phone as string)]
    }
    if (event.payload.fbc) userData.fbc = event.payload.fbc
    if (event.payload.fbp) userData.fbp = event.payload.fbp
    if (event.payload.client_ip_address) userData.client_ip_address = event.payload.client_ip_address
    if (event.payload.client_user_agent) userData.client_user_agent = event.payload.client_user_agent

    // Montar payload para Meta Conversions API
    const metaPayload = {
      data: [
        {
          event_name: event.event_type,
          event_time: Math.floor(new Date(event.created_at).getTime() / 1000),
          event_id: event.id,
          action_source: 'system_generated',
          user_data: userData,
          custom_data: {
            currency: event.payload.currency || 'BRL',
            value: event.payload.value || 0,
            content_ids: event.sale_id ? [event.sale_id] : [],
            content_type: 'product',
          },
        }
      ],
      access_token: accessToken,
    }

    // Enviar para Meta Conversions API
    const apiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metaPayload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: responseData.error?.message || `HTTP ${response.status}`,
        response: responseData
      }
    }

    return {
      success: true,
      response: responseData
    }

  } catch (error) {
    console.error('[Meta Send Error]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Hash SHA256 usando crypto.subtle (requisito da Meta CAPI)
 */
async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash SHA256 de email normalizado
 */
async function hashEmail(email: string): Promise<string> {
  return hashSHA256(email.toLowerCase().trim())
}

/**
 * Hash SHA256 de telefone normalizado (apenas dígitos)
 */
async function hashPhone(phone: string): Promise<string> {
  const digits = phone.replace(/\D/g, '')
  return hashSHA256(digits)
}
