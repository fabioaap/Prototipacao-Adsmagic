import type { GoogleConversionAction } from '../../../types.ts'

interface GoogleAdsSearchRow {
  conversionAction?: {
    id?: string | number
    name?: string
    type?: string
    status?: string
    category?: string
    primaryForGoal?: boolean
    resourceName?: string
  }
}

interface GoogleAdsCustomerSettingRow {
  customer?: {
    conversionTrackingSetting?: {
      enhancedConversionsForLeadsEnabled?: boolean
    }
  }
}

export interface GoogleConversionActionsFetchResult {
  conversionActions: GoogleConversionAction[]
  enhancedConversionsForLeadsEnabled?: boolean
}

function normalizeCustomerId(customerId: string): string {
  return customerId.replace(/-/g, '').trim()
}

async function executeGoogleAdsSearch<T>(
  accessToken: string,
  normalizedCustomerId: string,
  query: string,
  loginCustomerId?: string
): Promise<T[]> {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
  if (!developerToken) {
    throw new Error('Google Ads developer token not configured')
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (loginCustomerId) {
    headers['login-customer-id'] = normalizeCustomerId(loginCustomerId)
  }

  const response = await fetch(
    `https://googleads.googleapis.com/v23/customers/${normalizedCustomerId}/googleAds:search`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch Google Ads data: ${response.status} - ${errorText}`)
  }

  const data = await response.json().catch(() => ({})) as { results?: T[] }
  return Array.isArray(data.results) ? data.results : []
}

/**
 * Fetch conversion actions from Google Ads API using GAQL.
 */
export async function fetchGoogleConversionActions(
  accessToken: string,
  customerId: string,
  loginCustomerId?: string,
  selectedConversionActionIds: string[] = []
): Promise<GoogleConversionActionsFetchResult> {
  const normalizedCustomerId = normalizeCustomerId(customerId)
  if (!normalizedCustomerId) {
    throw new Error('Google Ads customer ID is required')
  }

  const query = `
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.type,
      conversion_action.status,
      conversion_action.category,
      conversion_action.primary_for_goal,
      conversion_action.resource_name
    FROM conversion_action
  `

  const rows = await executeGoogleAdsSearch<GoogleAdsSearchRow>(
    accessToken,
    normalizedCustomerId,
    query,
    loginCustomerId
  )

  const conversionActions: GoogleConversionAction[] = []
  const returnedIds = new Set<string>()
  const selectedIdsSet = new Set(
    selectedConversionActionIds
      .filter((id) => typeof id === 'string')
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  )

  for (const row of rows) {
    const action = row.conversionAction
    if (!action?.id) {
      continue
    }

    const actionId = String(action.id)
    const actionStatus = action.status || 'UNKNOWN'
    const shouldIncludeAction = actionStatus === 'ENABLED' || selectedIdsSet.has(actionId)
    if (!shouldIncludeAction) {
      continue
    }

    conversionActions.push({
      id: actionId,
      name: action.name || `Conversion Action ${action.id}`,
      type: action.type,
      status: actionStatus,
      category: action.category,
      primaryForGoal: action.primaryForGoal,
      resourceName: action.resourceName,
    })
    returnedIds.add(actionId)
  }

  for (const selectedId of selectedIdsSet) {
    if (returnedIds.has(selectedId)) {
      continue
    }

    conversionActions.push({
      id: selectedId,
      name: `Conversion Action ${selectedId}`,
      status: 'UNKNOWN',
    })
  }

  let enhancedConversionsForLeadsEnabled: boolean | undefined

  try {
    const customerSettingsQuery = `
      SELECT
        conversion_tracking_setting.enhanced_conversions_for_leads_enabled
      FROM customer
      LIMIT 1
    `

    const customerRows = await executeGoogleAdsSearch<GoogleAdsCustomerSettingRow>(
      accessToken,
      normalizedCustomerId,
      customerSettingsQuery,
      loginCustomerId
    )

    const setting = customerRows[0]?.customer?.conversionTrackingSetting?.enhancedConversionsForLeadsEnabled
    if (typeof setting === 'boolean') {
      enhancedConversionsForLeadsEnabled = setting
    }
  } catch (error) {
    console.warn('[Google Conversion Actions] Failed to fetch enhanced conversions for leads setting:', error)
  }

  return {
    conversionActions,
    enhancedConversionsForLeadsEnabled,
  }
}
