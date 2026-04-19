interface GoogleIdentifierDiagnostics {
  hasClickIds: boolean
  hasUserIdentifiers: boolean
  enhancedConversionsForLeadsEnabled: boolean
}

export interface GooglePreparedIdentifiers extends GoogleIdentifierDiagnostics {
  gclid?: string
  gbraid?: string
  wbraid?: string
  userIdentifiers?: Array<Record<string, unknown>>
}

export type GooglePreparationErrorCode =
  | 'GOOGLE_MISSING_IDENTIFIERS'
  | 'GOOGLE_ENHANCED_LEADS_REQUIRED'
  | 'GOOGLE_AUTH_EXPIRED'

export type GooglePreparationResult =
  | {
      success: true
      data: GooglePreparedIdentifiers
    }
  | {
      success: false
      error: string
      errorCode: GooglePreparationErrorCode
      diagnostics: GoogleIdentifierDiagnostics
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function extractTrackingParams(eventPayload: Record<string, unknown>): Record<string, unknown> {
  return isRecord(eventPayload.tracking_params)
    ? eventPayload.tracking_params
    : {}
}

function extractClickId(
  eventPayload: Record<string, unknown>,
  trackingParams: Record<string, unknown>,
  key: 'gclid' | 'gbraid' | 'wbraid'
): string | undefined {
  const fromPayload = eventPayload[key]
  if (typeof fromPayload === 'string' && fromPayload.trim().length > 0) {
    return fromPayload.trim()
  }

  const fromTracking = trackingParams[key]
  if (typeof fromTracking === 'string' && fromTracking.trim().length > 0) {
    return fromTracking.trim()
  }

  return undefined
}

export function resolveEnhancedConversionsForLeadsEnabled(accountMetadata: Record<string, unknown>): boolean | undefined {
  const googleAdsRaw = accountMetadata.google_ads
  if (!isRecord(googleAdsRaw)) {
    return undefined
  }

  const raw = googleAdsRaw.enhanced_conversions_for_leads_enabled
  if (typeof raw !== 'boolean') {
    return undefined
  }

  return raw
}

interface GoogleAdsCustomerSettingRow {
  customer?: {
    conversionTrackingSetting?: {
      enhancedConversionsForLeadsEnabled?: boolean
    }
  }
}

export interface EnhancedLeadsFetchResult {
  value: boolean | undefined
  httpStatus?: number
}

export async function fetchEnhancedConversionsForLeadsSetting(
  accessToken: string,
  customerId: string,
  loginCustomerId?: string
): Promise<EnhancedLeadsFetchResult> {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
  if (!developerToken) {
    return { value: undefined }
  }

  const normalizedCustomerId = customerId.replace(/-/g, '').trim()
  const query = `
    SELECT conversion_tracking_setting.enhanced_conversions_for_leads_enabled
    FROM customer
    LIMIT 1
  `

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId.replace(/-/g, '').trim()
  }

  try {
    const response = await fetch(
      `https://googleads.googleapis.com/v23/customers/${normalizedCustomerId}/googleAds:search`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      console.warn('[Enhanced Leads Check] Google API returned', response.status)
      return { value: undefined, httpStatus: response.status }
    }

    const data = await response.json().catch(() => ({})) as { results?: GoogleAdsCustomerSettingRow[] }
    const rows = Array.isArray(data.results) ? data.results : []
    const setting = rows[0]?.customer?.conversionTrackingSetting?.enhancedConversionsForLeadsEnabled

    return { value: typeof setting === 'boolean' ? setting : undefined, httpStatus: 200 }
  } catch (error) {
    console.warn('[Enhanced Leads Check] Failed to fetch setting:', error)
    return { value: undefined }
  }
}

export async function prepareGoogleIdentifiers(
  eventPayload: Record<string, unknown>,
  enhancedConversionsForLeadsEnabled: boolean
): Promise<GooglePreparationResult> {
  const trackingParams = extractTrackingParams(eventPayload)
  const gclid = extractClickId(eventPayload, trackingParams, 'gclid')
  const gbraid = extractClickId(eventPayload, trackingParams, 'gbraid')
  const wbraid = extractClickId(eventPayload, trackingParams, 'wbraid')

  const userIdentifiers: Array<Record<string, unknown>> = []

  if (typeof eventPayload.email === 'string' && eventPayload.email.trim().length > 0) {
    userIdentifiers.push({
      hashedEmail: await hashSHA256(eventPayload.email),
    })
  }

  if (typeof eventPayload.phone === 'string' && eventPayload.phone.trim().length > 0) {
    const normalizedPhone = normalizePhone(eventPayload.phone)
    if (normalizedPhone.length > 0) {
      userIdentifiers.push({
        hashedPhoneNumber: await hashSHA256(normalizedPhone),
      })
    }
  }

  const hasClickIds = Boolean(gclid || gbraid || wbraid)
  const hasUserIdentifiers = userIdentifiers.length > 0

  const diagnostics: GoogleIdentifierDiagnostics = {
    hasClickIds,
    hasUserIdentifiers,
    enhancedConversionsForLeadsEnabled,
  }

  if (!hasClickIds && !hasUserIdentifiers) {
    return {
      success: false,
      error: 'Google conversion requires gclid/gbraid/wbraid or email/phone identifiers',
      errorCode: 'GOOGLE_MISSING_IDENTIFIERS',
      diagnostics,
    }
  }

  if (!hasClickIds && hasUserIdentifiers && !enhancedConversionsForLeadsEnabled) {
    return {
      success: false,
      error: 'Google conversion without click IDs requires enhanced_conversions_for_leads_enabled=true',
      errorCode: 'GOOGLE_ENHANCED_LEADS_REQUIRED',
      diagnostics,
    }
  }

  // Sem Enhanced Leads habilitado, nunca envia userIdentifiers para evitar rejeição da API.
  const safeUserIdentifiers = enhancedConversionsForLeadsEnabled && hasUserIdentifiers
    ? userIdentifiers
    : undefined

  return {
    success: true,
    data: {
      gclid,
      gbraid,
      wbraid,
      userIdentifiers: safeUserIdentifiers,
      ...diagnostics,
    },
  }
}

export function isEnhancedLeadsApiError(message: string | undefined): boolean {
  if (!message) return false

  const normalized = message.toLowerCase()
  return normalized.includes('enhanced conversions for leads') ||
    normalized.includes('enhanced_conversions_for_leads_enabled')
}

function isTransientGoogleApiMessage(message: string | undefined): boolean {
  if (!message) {
    return false
  }

  const normalized = message.toLowerCase()
  return normalized.includes('too many requests') ||
    normalized.includes('rate limit') ||
    normalized.includes('quota') ||
    normalized.includes('temporar') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout') ||
    normalized.includes('unavailable') ||
    normalized.includes('internal')
}

export interface GoogleApiFailureClassification {
  nonRetryable: boolean
  errorCode?: GooglePreparationErrorCode
}

export function classifyGoogleApiFailure(params: {
  status?: number
  message?: string
}): GoogleApiFailureClassification {
  const { status, message } = params

  if (isEnhancedLeadsApiError(message)) {
    return {
      nonRetryable: true,
      errorCode: 'GOOGLE_ENHANCED_LEADS_REQUIRED',
    }
  }

  if (isTransientGoogleApiMessage(message)) {
    return { nonRetryable: false }
  }

  if (status === 429 || status === 408 || status === 409 || status === 425) {
    return { nonRetryable: false }
  }

  if (typeof status === 'number' && status >= 500) {
    return { nonRetryable: false }
  }

  if (status === 401) {
    return { nonRetryable: true, errorCode: 'GOOGLE_AUTH_EXPIRED' }
  }

  if (typeof status === 'number' && status >= 400 && status < 500) {
    return { nonRetryable: true }
  }

  return { nonRetryable: false }
}
