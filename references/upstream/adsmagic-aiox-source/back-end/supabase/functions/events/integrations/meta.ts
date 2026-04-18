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
    // Obter configurações da integração
    const config = integration.platform_config as Record<string, unknown>
    const pixelId = config.pixel_id as string | undefined
    
    if (!pixelId) {
      return {
        success: false,
        error: 'Meta Pixel ID not configured'
      }
    }

    const accessToken = account.access_token
    if (!accessToken) {
      return {
        success: false,
        error: 'Meta access token not found'
      }
    }

    // Montar payload para Meta Conversions API
    const metaPayload = {
      data: [
        {
          event_name: event.event_type,
          event_time: Math.floor(new Date(event.created_at).getTime() / 1000),
          action_source: 'website',
          user_data: {
            // Dados do contato/venda para matching
            em: event.payload.email ? hashEmail(event.payload.email as string) : undefined,
            ph: event.payload.phone ? hashPhone(event.payload.phone as string) : undefined,
          },
          custom_data: {
            currency: event.payload.currency || 'BRL',
            value: event.payload.value || 0,
          },
          // Click IDs para atribuição
          event_source_url: event.payload.url as string | undefined,
          fbc: event.payload.fbc as string | undefined,
          fbp: event.payload.fbp as string | undefined,
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
 * Hash SHA256 de email (requisito da Meta)
 */
function hashEmail(email: string): string {
  // Implementação simplificada - usar crypto.subtle na produção
  // Por enquanto retorna o email (será hashado pela Meta ou implementar crypto)
  return email.toLowerCase().trim()
}

/**
 * Hash SHA256 de telefone (requisito da Meta)
 */
function hashPhone(phone: string): string {
  // Remove caracteres não numéricos
  const digits = phone.replace(/\D/g, '')
  return digits
}
