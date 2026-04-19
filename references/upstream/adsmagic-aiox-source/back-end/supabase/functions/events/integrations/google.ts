/**
 * Integração com Google Ads Conversion API
 * 
 * Documentação: https://developers.google.com/google-ads/api/docs/conversions/upload-click-conversions
 */

import type { ConversionEvent } from '../types.ts'
import type { SendEventResult } from './platform-sender.ts'
import {
  classifyGoogleApiFailure,
  prepareGoogleIdentifiers,
  resolveEnhancedConversionsForLeadsEnabled,
} from './google-conversion-policy.ts'

interface GoogleIntegration {
  id: string
  platform: string
  status: string
  platform_config: Record<string, unknown>
}

interface GoogleAccount {
  id: string
  external_account_id: string
  access_token: string | null
  account_metadata: Record<string, unknown>
  status: string
}

/**
 * Envia evento para Google Ads Conversion API
 */
export async function sendToGoogle(
  event: ConversionEvent,
  integration: GoogleIntegration,
  account: GoogleAccount
): Promise<SendEventResult> {
  try {
    const config = integration.platform_config as Record<string, unknown>
    const accountMetadata = account.account_metadata || {}
    const googleAdsMetadata = (accountMetadata.google_ads as Record<string, unknown>) || {}
    const eventPayload = event.payload || {}
    const enhancedConversionsForLeadsEnabled = resolveEnhancedConversionsForLeadsEnabled(accountMetadata) ?? false

    const payloadCustomerId =
      typeof eventPayload.google_customer_id === 'string'
        ? eventPayload.google_customer_id
        : (typeof eventPayload.googleCustomerId === 'string' ? eventPayload.googleCustomerId : undefined)

    const customerIdRaw =
      payloadCustomerId ||
      account.external_account_id ||
      (config.customer_id as string | undefined)

    const customerId = normalizeGoogleCustomerId(customerIdRaw)
    if (!customerId) {
      return {
        success: false,
        error: 'Google Ads customer_id not configured',
      }
    }

    const selectedIds = Array.isArray(googleAdsMetadata.selected_conversion_action_ids)
      ? googleAdsMetadata.selected_conversion_action_ids.filter((id): id is string => typeof id === 'string')
      : []

    const payloadConversionActionId =
      typeof eventPayload.conversion_action_id === 'string'
        ? eventPayload.conversion_action_id
        : (typeof eventPayload.conversionActionId === 'string' ? eventPayload.conversionActionId : undefined)

    const conversionActionId =
      payloadConversionActionId ||
      selectedIds[0] ||
      (config.conversion_action_id as string | undefined)

    if (!conversionActionId) {
      return {
        success: false,
        error: 'Google conversion_action_id not configured',
      }
    }

    const accessToken = account.access_token
    if (!accessToken) {
      return {
        success: false,
        error: 'Google access token not found'
      }
    }

    const identifierPreparation = await prepareGoogleIdentifiers(
      eventPayload as Record<string, unknown>,
      enhancedConversionsForLeadsEnabled
    )

    if (!identifierPreparation.success) {
      return {
        success: false,
        nonRetryable: true,
        error: identifierPreparation.error,
        errorCode: identifierPreparation.errorCode,
        response: {
          error_code: identifierPreparation.errorCode,
          ...identifierPreparation.diagnostics,
        },
      }
    }

    const {
      gclid,
      gbraid,
      wbraid,
      userIdentifiers,
      hasClickIds,
      hasUserIdentifiers,
    } = identifierPreparation.data

    const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') ||
      (config.developer_token as string | undefined)
    if (!developerToken) {
      return {
        success: false,
        error: 'Google Ads developer token not configured',
      }
    }

    const loginCustomerIdRaw =
      typeof eventPayload.google_login_customer_id === 'string'
        ? eventPayload.google_login_customer_id
        : (typeof accountMetadata.parentMccId === 'string'
          ? accountMetadata.parentMccId
          : (typeof config.login_customer_id === 'string' ? config.login_customer_id : undefined))

    const googlePayload = {
      conversions: [
        {
          conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
          conversionDateTime: formatGoogleDateTime(event.created_at),
          conversionValue: event.payload.value as number || 0,
          currencyCode: (event.payload.currency as string) || 'BRL',
          gclid,
          gbraid,
          wbraid,
          userIdentifiers,
          orderId: event.sale_id || event.contact_id, // Usar sale_id ou contact_id como order_id único
        }
      ],
      partialFailure: true
    }

    // Enviar para Google Ads API
    const apiUrl = `https://googleads.googleapis.com/v23/customers/${customerId}:uploadClickConversions`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': developerToken,
        ...(loginCustomerIdRaw ? { 'login-customer-id': normalizeGoogleCustomerId(loginCustomerIdRaw) } : {}),
      },
      body: JSON.stringify(googlePayload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      const apiErrorMessage = responseData.error?.message || `HTTP ${response.status}`
      const failureClassification = classifyGoogleApiFailure({
        status: response.status,
        message: apiErrorMessage,
      })

      return {
        success: false,
        nonRetryable: failureClassification.nonRetryable,
        httpStatus: response.status,
        error: apiErrorMessage,
        errorCode: failureClassification.errorCode,
        response: {
          ...responseData,
          error_code: failureClassification.errorCode,
          has_click_ids: hasClickIds,
          has_user_identifiers: hasUserIdentifiers,
          enhanced_conversions_for_leads_enabled: enhancedConversionsForLeadsEnabled,
        },
      }
    }

    // Check for partial failure errors (HTTP 200 but conversion-level errors)
    if (responseData.partialFailureError) {
      const partialError = responseData.partialFailureError
      const errorMessage = partialError.message || 'Partial failure in Google Ads conversion upload'

      return {
        success: false,
        nonRetryable: true,
        error: errorMessage,
        response: responseData,
      }
    }

    return {
      success: true,
      response: responseData
    }

  } catch (error) {
    console.error('[Google Send Error]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function normalizeGoogleCustomerId(customerId: unknown): string {
  if (typeof customerId !== 'string') return ''
  return customerId.replace(/-/g, '').trim()
}

/**
 * Formats a date string to Google Ads required format: "yyyy-mm-dd hh:mm:ss+|-hh:mm"
 * Google Ads rejects ISO 8601 format (with "T" separator).
 */
function formatGoogleDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')

  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  const seconds = pad(date.getUTCSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00:00`
}
