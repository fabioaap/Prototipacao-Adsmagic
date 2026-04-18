/**
 * Integração com TikTok Events API
 * 
 * Documentação: https://ads.tiktok.com/marketing_api/docs?id=1739585576931330
 */

import type { ConversionEvent } from '../types.ts'
import type { SendEventResult } from './platform-sender.ts'

interface TikTokIntegration {
  id: string
  platform: string
  status: string
  platform_config: Record<string, unknown>
}

interface TikTokAccount {
  id: string
  external_account_id: string
  access_token: string | null
  account_metadata: Record<string, unknown>
  status: string
}

/**
 * Envia evento para TikTok Events API
 */
export async function sendToTikTok(
  event: ConversionEvent,
  integration: TikTokIntegration,
  account: TikTokAccount
): Promise<SendEventResult> {
  try {
    // Obter configurações da integração
    const config = integration.platform_config as Record<string, unknown>
    const pixelCode = config.pixel_code as string | undefined
    const accessToken = config.access_token as string | undefined // TikTok usa access token diferente
    
    if (!pixelCode) {
      return {
        success: false,
        error: 'TikTok Pixel Code not configured'
      }
    }

    if (!accessToken) {
      return {
        success: false,
        error: 'TikTok access token not found'
      }
    }

    // Mapear tipos de evento do sistema para TikTok
    const eventTypeMap: Record<string, string> = {
      'purchase': 'CompletePayment',
      'lead': 'SubmitForm',
      'add_to_cart': 'AddToCart',
      'initiate_checkout': 'InitiateCheckout',
      'view_content': 'ViewContent',
      'complete_registration': 'CompleteRegistration'
    }

    const tiktokEventType = eventTypeMap[event.event_type] || 'CompletePayment'

    // Montar payload para TikTok Events API
    const tiktokPayload = {
      pixel_code: pixelCode,
      event: tiktokEventType,
      timestamp: new Date(event.created_at).toISOString(),
      context: {
        page: {
          url: event.payload.url as string | undefined,
        },
        user: {
          // Dados do usuário para matching (hash SHA256)
          email: event.payload.email ? hashSHA256(event.payload.email as string) : undefined,
          phone_number: event.payload.phone ? hashSHA256(event.payload.phone as string) : undefined,
        },
        ad: {
          callback: event.payload.ttclid as string | undefined, // TikTok Click ID
        }
      },
      properties: {
        value: event.payload.value as number || 0,
        currency: (event.payload.currency as string) || 'BRL',
        content_type: 'product',
        content_id: event.sale_id || event.contact_id,
      }
    }

    // Enviar para TikTok Events API
    const apiUrl = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tiktokPayload),
    })

    const responseData = await response.json()

    if (!response.ok || responseData.code !== 0) {
      return {
        success: false,
        error: responseData.message || `HTTP ${response.status}`,
        response: responseData
      }
    }

    return {
      success: true,
      response: responseData
    }

  } catch (error) {
    console.error('[TikTok Send Error]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Hash SHA256 (simplificado - implementar crypto na produção)
 */
function hashSHA256(value: string): string {
  // Implementação simplificada - usar crypto.subtle.digest na produção
  // Por enquanto retorna lowercase trim (TikTok aceita sem hash em sandbox)
  return value.toLowerCase().trim()
}
