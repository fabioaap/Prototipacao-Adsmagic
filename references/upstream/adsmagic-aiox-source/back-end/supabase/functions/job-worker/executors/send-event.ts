/**
 * Executor para enviar eventos de conversão
 *
 * Processa jobs do tipo 'send_event' chamando o platform-sender
 */

import type { Job } from '../types.ts'
import {
  classifyGoogleApiFailure,
  prepareGoogleIdentifiers,
  resolveEnhancedConversionsForLeadsEnabled,
} from '../../events/integrations/google-conversion-policy.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Database, Json } from '../../../types/database.types.ts'

interface SendEventPayload {
  event_id: string
  platform: 'meta' | 'google' | 'tiktok'
  event_type: string
  contact_id?: string
  sale_id?: string
  integration_account_id?: string
}

interface SendEventResult {
  success: boolean
  nonRetryable?: boolean
  response?: Record<string, unknown>
  error?: string
  errorCode?: string
}

interface IntegrationAccountRow {
  id: string
  external_account_id: string
  access_token: string | null
  account_metadata: Record<string, unknown>
  status: string
  is_primary?: boolean
}

function parseSendEventPayload(payload: Record<string, unknown>): SendEventPayload | null {
  const eventId = typeof payload.event_id === 'string' ? payload.event_id.trim() : ''
  const eventType = typeof payload.event_type === 'string' ? payload.event_type.trim() : ''
  const platform = payload.platform

  if (eventId.length === 0 || eventType.length === 0) {
    return null
  }

  if (platform !== 'meta' && platform !== 'google' && platform !== 'tiktok') {
    return null
  }

  return {
    event_id: eventId,
    platform,
    event_type: eventType,
    contact_id: typeof payload.contact_id === 'string' && payload.contact_id.trim().length > 0
      ? payload.contact_id.trim()
      : undefined,
    sale_id: typeof payload.sale_id === 'string' && payload.sale_id.trim().length > 0
      ? payload.sale_id.trim()
      : undefined,
    integration_account_id:
      typeof payload.integration_account_id === 'string' && payload.integration_account_id.trim().length > 0
        ? payload.integration_account_id.trim()
        : undefined,
  }
}

function getTargetIntegrationAccountId(
  payload: SendEventPayload,
  event: Record<string, unknown>
): string | undefined {
  if (typeof payload.integration_account_id === 'string' && payload.integration_account_id.trim().length > 0) {
    return payload.integration_account_id.trim()
  }

  const eventPayload = event.payload as Record<string, unknown> | undefined
  if (!eventPayload) return undefined

  if (typeof eventPayload.integration_account_id === 'string' && eventPayload.integration_account_id.trim().length > 0) {
    return eventPayload.integration_account_id.trim()
  }

  if (typeof eventPayload.integrationAccountId === 'string' && eventPayload.integrationAccountId.trim().length > 0) {
    return eventPayload.integrationAccountId.trim()
  }

  return undefined
}

function selectIntegrationAccount(
  accounts: IntegrationAccountRow[],
  preferredAccountId?: string
): { account: IntegrationAccountRow | null; error?: string } {
  if (accounts.length === 0) {
    return { account: null, error: 'No integration accounts configured' }
  }

  if (preferredAccountId) {
    const preferred = accounts.find((acc) => acc.id === preferredAccountId)
    if (!preferred) {
      return {
        account: null,
        error: `Configured integration account not found: ${preferredAccountId}`,
      }
    }

    if (preferred.status !== 'active') {
      return {
        account: null,
        error: `Configured integration account is not active: ${preferredAccountId}`,
      }
    }

    return { account: preferred }
  }

  const activeAccounts = accounts.filter((acc) => acc.status === 'active')
  if (activeAccounts.length === 0) {
    return { account: null, error: 'No active account found for this integration' }
  }

  const primary = activeAccounts.find((acc) => acc.is_primary)
  return { account: primary || activeAccounts[0] || null }
}

/**
 * Executa o envio de um evento de conversão para a plataforma
 */
export async function executeSendEvent(
  job: Job,
  supabaseClient: SupabaseDbClient
): Promise<SendEventResult> {
  const payload = parseSendEventPayload(job.payload)

  if (!payload) {
    return {
      success: false,
      nonRetryable: true,
      error: 'Invalid send_event payload: required fields event_id, platform and event_type'
    }
  }

  console.log('[SendEvent Executor] Starting', {
    jobId: job.id,
    eventId: payload.event_id,
    platform: payload.platform
  })

  try {
    // 1. Buscar o evento de conversão completo
    const { data: event, error: eventError } = await supabaseClient
      .from('conversion_events')
      .select('*')
      .eq('id', payload.event_id)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        nonRetryable: true,
        error: `Event not found: ${payload.event_id}`
      }
    }

    // Se o evento já foi enviado, pular
    if (event.status === 'sent') {
      return {
        success: true,
        response: { skipped: true, reason: 'Event already sent' }
      }
    }

    // Se o evento foi cancelado, pular
    if (event.status === 'cancelled') {
      return {
        success: true,
        response: { skipped: true, reason: 'Event was cancelled' }
      }
    }

    // 2. Buscar integração e credenciais
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select(`
        id,
        platform,
        status,
        platform_config,
        integration_accounts (
          id,
          external_account_id,
          access_token,
          account_metadata,
          status,
          is_primary
        )
      `)
      .eq('project_id', event.project_id)
      .eq('platform', event.platform)
      .eq('platform_type', 'advertising')
      .eq('status', 'connected')
      .single()

    if (integrationError || !integration) {
      return {
        success: false,
        nonRetryable: true,
        error: `Integration not found for platform: ${event.platform}`
      }
    }

    // 3. Selecionar conta ativa (ou conta explícita no payload)
    const accounts = Array.isArray(integration.integration_accounts)
      ? (integration.integration_accounts as IntegrationAccountRow[])
      : []

    const preferredAccountId = getTargetIntegrationAccountId(payload, event as Record<string, unknown>)
    const accountSelection = selectIntegrationAccount(accounts, preferredAccountId)
    const selectedAccount = accountSelection.account

    if (!selectedAccount) {
      return {
        success: false,
        nonRetryable: true,
        error: accountSelection.error || `No active account for platform: ${event.platform}`
      }
    }

    const decryptedAccessToken = await decryptAccessToken(
      supabaseClient,
      selectedAccount.access_token
    )

    if (!decryptedAccessToken) {
      return {
        success: false,
        nonRetryable: true,
        error: `Could not decrypt access token for platform: ${event.platform}`,
      }
    }

    const accountForSend = {
      ...selectedAccount,
      access_token: decryptedAccessToken,
    }

    // 4. Enviar para a plataforma específica
    let result: SendEventResult

    switch (event.platform) {
      case 'meta':
        result = await sendToMetaAPI(event, integration, accountForSend)
        break

      case 'google':
        result = await sendToGoogleAPI(event, integration, accountForSend)
        break

      case 'tiktok':
        result = await sendToTikTokAPI(event, integration, accountForSend)
        break

      default:
        result = {
          success: false,
          nonRetryable: true,
          error: `Unsupported platform: ${event.platform}`
        }
    }

    // 5. Atualizar status do evento
    const updateData: Database['public']['Tables']['conversion_events']['Update'] = result.success
      ? {
          status: 'sent',
          sent_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          response: (result.response || null) as Json | null,
        }
      : {
          status: result.nonRetryable ? 'cancelled' : 'failed',
          processed_at: new Date().toISOString(),
          error_message: result.error,
          response: (result.response || (result.errorCode
            ? { error_code: result.errorCode }
            : null)) as Json | null,
          retry_count: result.nonRetryable ? event.retry_count : event.retry_count + 1,
          last_retry_at: result.nonRetryable ? event.last_retry_at : new Date().toISOString(),
        }

    await supabaseClient
      .from('conversion_events')
      .update(updateData)
      .eq('id', event.id)

    console.log('[SendEvent Executor] Completed', {
      jobId: job.id,
      eventId: event.id,
      success: result.success
    })

    return result

  } catch (error) {
    console.error('[SendEvent Executor Error]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Envia evento para Meta Conversions API
 */
async function sendToMetaAPI(
  event: Record<string, unknown>,
  integration: Record<string, unknown>,
  account: Record<string, unknown>
): Promise<SendEventResult> {
  try {
    const config = integration.platform_config as Record<string, unknown> || {}
    const pixelId = config.pixel_id as string

    if (!pixelId) {
      return { success: false, nonRetryable: true, error: 'Pixel ID not configured' }
    }

    const accessToken = account.access_token as string
    if (!accessToken) {
      return { success: false, nonRetryable: true, error: 'Access token not found' }
    }

    const eventPayload = event.payload as Record<string, unknown> || {}

    // Hash de dados sensíveis usando SHA256
    const userData: Record<string, unknown> = {}

    if (eventPayload.email) {
      userData.em = [await hashSHA256(String(eventPayload.email))]
    }
    if (eventPayload.phone) {
      userData.ph = [await hashSHA256(normalizePhone(String(eventPayload.phone)))]
    }
    if (eventPayload.fbc) userData.fbc = eventPayload.fbc
    if (eventPayload.fbp) userData.fbp = eventPayload.fbp
    if (eventPayload.client_ip_address) userData.client_ip_address = eventPayload.client_ip_address
    if (eventPayload.client_user_agent) userData.client_user_agent = eventPayload.client_user_agent

    const metaPayload = {
      data: [{
        event_name: mapEventType(event.event_type as string, 'meta'),
        event_time: Math.floor(new Date(event.created_at as string).getTime() / 1000),
        event_id: event.id, // Para deduplicação
        action_source: 'system_generated',
        user_data: userData,
        custom_data: {
          currency: eventPayload.currency || 'BRL',
          value: eventPayload.value || 0,
          content_ids: event.sale_id ? [event.sale_id] : [],
          content_type: 'product'
        }
      }]
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        nonRetryable: response.status >= 400 && response.status < 500,
        error: data.error?.message || `Meta API error: ${response.status}`,
        response: data
      }
    }

    return { success: true, response: data }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Meta API error'
    }
  }
}

/**
 * Envia evento para Google Ads Conversion API v17
 */
async function sendToGoogleAPI(
  event: Record<string, unknown>,
  integration: Record<string, unknown>,
  account: Record<string, unknown>
): Promise<SendEventResult> {
  try {
    const config = integration.platform_config as Record<string, unknown> || {}
    const accountMetadata = (account.account_metadata as Record<string, unknown>) || {}
    const googleAdsMetadata = (accountMetadata.google_ads as Record<string, unknown>) || {}
    const eventPayload = event.payload as Record<string, unknown> || {}
    const enhancedConversionsForLeadsEnabled = resolveEnhancedConversionsForLeadsEnabled(accountMetadata)

    const payloadCustomerId =
      typeof eventPayload.google_customer_id === 'string'
        ? eventPayload.google_customer_id
        : (typeof eventPayload.googleCustomerId === 'string' ? eventPayload.googleCustomerId : undefined)

    const customerIdRaw =
      payloadCustomerId ||
      (account.external_account_id as string | undefined) ||
      (config.customer_id as string | undefined)

    const customerId = normalizeGoogleCustomerId(customerIdRaw)
    if (!customerId) {
      return { success: false, nonRetryable: true, error: 'Google Ads customer_id not configured' }
    }

    const payloadConversionActionId =
      typeof eventPayload.conversion_action_id === 'string'
        ? eventPayload.conversion_action_id
        : (typeof eventPayload.conversionActionId === 'string' ? eventPayload.conversionActionId : undefined)

    const selectedIds = Array.isArray(googleAdsMetadata.selected_conversion_action_ids)
      ? googleAdsMetadata.selected_conversion_action_ids.filter((id): id is string => typeof id === 'string')
      : []

    const conversionActionId =
      payloadConversionActionId ||
      selectedIds[0] ||
      (config.conversion_action_id as string | undefined)

    if (!conversionActionId) {
      return { success: false, nonRetryable: true, error: 'Google conversion_action_id not configured' }
    }

    const accessToken = account.access_token as string
    if (!accessToken) {
      return { success: false, nonRetryable: true, error: 'Access token not found' }
    }

    const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
    if (!developerToken) {
      return { success: false, nonRetryable: true, error: 'Google Ads developer token not configured' }
    }

    // Formatar timestamp para Google (timezone aware)
    const conversionTime = formatGoogleDateTime(event.created_at as string)

    const identifierPreparation = await prepareGoogleIdentifiers(
      eventPayload,
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

    const loginCustomerIdRaw =
      typeof eventPayload.google_login_customer_id === 'string'
        ? eventPayload.google_login_customer_id
        : (typeof accountMetadata.parentMccId === 'string'
          ? accountMetadata.parentMccId
          : (typeof config.login_customer_id === 'string' ? config.login_customer_id : undefined))

    const googlePayload = {
      conversions: [{
        conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
        gclid,
        gbraid,
        wbraid,
        conversionDateTime: conversionTime,
        conversionValue: eventPayload.value || 0,
        currencyCode: eventPayload.currency || 'BRL',
        orderId: event.sale_id || event.id,
        userIdentifiers,
      }],
      partialFailure: true
    }

    const response = await fetch(
      `https://googleads.googleapis.com/v23/customers/${customerId}:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'developer-token': developerToken,
          ...(loginCustomerIdRaw ? { 'login-customer-id': normalizeGoogleCustomerId(loginCustomerIdRaw) } : {}),
        },
        body: JSON.stringify(googlePayload)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const apiErrorMessage = data.error?.message || `Google API error: ${response.status}`
      const failureClassification = classifyGoogleApiFailure({
        status: response.status,
        message: apiErrorMessage,
      })

      return {
        success: false,
        nonRetryable: failureClassification.nonRetryable,
        error: apiErrorMessage,
        errorCode: failureClassification.errorCode,
        response: {
          ...data,
          error_code: failureClassification.errorCode,
          has_click_ids: hasClickIds,
          has_user_identifiers: hasUserIdentifiers,
          enhanced_conversions_for_leads_enabled: enhancedConversionsForLeadsEnabled,
        },
      }
    }

    // Verificar partial failures
    if (data.partialFailureError) {
      const partialFailureMessage = typeof data.partialFailureError.message === 'string'
        ? data.partialFailureError.message
        : 'Partial failure'
      const failureClassification = classifyGoogleApiFailure({
        message: partialFailureMessage,
      })

      return {
        success: false,
        nonRetryable: failureClassification.nonRetryable,
        error: partialFailureMessage,
        errorCode: failureClassification.errorCode,
        response: {
          ...data,
          error_code: failureClassification.errorCode,
          has_click_ids: hasClickIds,
          has_user_identifiers: hasUserIdentifiers,
          enhanced_conversions_for_leads_enabled: enhancedConversionsForLeadsEnabled,
        },
      }
    }

    return { success: true, response: data }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google API error'
    }
  }
}

/**
 * Envia evento para TikTok Events API
 */
async function sendToTikTokAPI(
  event: Record<string, unknown>,
  integration: Record<string, unknown>,
  account: Record<string, unknown>
): Promise<SendEventResult> {
  try {
    const config = integration.platform_config as Record<string, unknown> || {}
    const pixelCode = config.pixel_code as string

    if (!pixelCode) {
      return { success: false, nonRetryable: true, error: 'TikTok Pixel Code not configured' }
    }

    const accessToken = account.access_token as string
    if (!accessToken) {
      return { success: false, nonRetryable: true, error: 'Access token not found' }
    }

    const eventPayload = event.payload as Record<string, unknown> || {}

    // User data com hash
    const userData: Record<string, unknown> = {}

    if (eventPayload.email) {
      userData.email = await hashSHA256(String(eventPayload.email).toLowerCase().trim())
    }
    if (eventPayload.phone) {
      userData.phone = await hashSHA256(normalizePhone(String(eventPayload.phone)))
    }

    const tiktokPayload = {
      pixel_code: pixelCode,
      event: mapEventType(event.event_type as string, 'tiktok'),
      event_id: event.id,
      timestamp: new Date(event.created_at as string).toISOString(),
      context: {
        user_agent: eventPayload.client_user_agent,
        ip: eventPayload.client_ip_address
      },
      properties: {
        contents: [{
          content_id: event.sale_id || event.id,
          content_type: 'product'
        }],
        currency: eventPayload.currency || 'BRL',
        value: eventPayload.value || 0
      },
      user: {
        ...userData,
        ttclid: eventPayload.ttclid
      }
    }

    const response = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/event/track/',
      {
        method: 'POST',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [tiktokPayload] })
      }
    )

    const data = await response.json()

    if (!response.ok || data.code !== 0) {
      return {
        success: false,
        nonRetryable: response.status >= 400 && response.status < 500,
        error: data.message || `TikTok API error: ${response.status}`,
        response: data
      }
    }

    return { success: true, response: data }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'TikTok API error'
    }
  }
}

// ============ Utility Functions ============

/**
 * Hash SHA256 para dados sensíveis (email, phone)
 */
async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Normaliza número de telefone para hashing
 */
function normalizePhone(phone: string): string {
  // Remove tudo exceto números
  return phone.replace(/\D/g, '')
}

/**
 * Mapeia event_type para formato da plataforma
 */
function mapEventType(eventType: string, platform: 'meta' | 'google' | 'tiktok'): string {
  const mapping: Record<string, Record<string, string>> = {
    meta: {
      purchase: 'Purchase',
      lead: 'Lead',
      add_to_cart: 'AddToCart',
      initiate_checkout: 'InitiateCheckout',
      view_content: 'ViewContent',
      complete_registration: 'CompleteRegistration'
    },
    google: {
      purchase: 'PURCHASE',
      lead: 'LEAD',
      add_to_cart: 'ADD_TO_CART',
      initiate_checkout: 'BEGIN_CHECKOUT',
      view_content: 'PAGE_VIEW',
      complete_registration: 'SIGN_UP'
    },
    tiktok: {
      purchase: 'CompletePayment',
      lead: 'SubmitForm',
      add_to_cart: 'AddToCart',
      initiate_checkout: 'InitiateCheckout',
      view_content: 'ViewContent',
      complete_registration: 'CompleteRegistration'
    }
  }

  return mapping[platform]?.[eventType] || eventType
}

/**
 * Formata datetime para Google Ads (formato específico)
 */
function formatGoogleDateTime(isoDate: string): string {
  const date = new Date(isoDate)
  // Formato: yyyy-mm-dd hh:mm:ss+|-hh:mm
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // Timezone offset
  const offset = -date.getTimezoneOffset()
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0')
  const offsetSign = offset >= 0 ? '+' : '-'

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`
}

function normalizeGoogleCustomerId(customerId: unknown): string {
  if (typeof customerId !== 'string') return ''
  return customerId.replace(/-/g, '').trim()
}

async function decryptAccessToken(
  supabaseClient: SupabaseDbClient,
  encryptedToken: string | null
): Promise<string | null> {
  if (!encryptedToken) {
    return null
  }

  const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
  const { data, error } = await supabaseClient.rpc('decrypt_token', {
    encrypted_data: encryptedToken,
    encryption_key: encryptionKey,
  })

  if (error || !data) {
    console.error('[SendEvent Executor] Error decrypting token:', error)
    return null
  }

  return data
}
