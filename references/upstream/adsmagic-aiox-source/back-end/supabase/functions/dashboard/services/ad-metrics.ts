/**
 * Servico para buscar metricas de ads para o dashboard
 *
 * Busca metricas agregadas de todas as plataformas de ads conectadas
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

type SupabaseClient = SupabaseDbClient

interface AdMetrics {
  spend: number
  impressions: number
  clicks: number
}

interface DateRange {
  start: string
  end: string
}

interface GoogleInsightsFetchResult {
  metrics: AdMetrics
  authError: boolean
}

interface IntegrationRelation {
  id?: string
  platform: string
  platform_type?: string
  status?: string
  project_id?: string
  platform_config?: Record<string, unknown>
}

function getIntegrationRelation(
  relation: IntegrationRelation | IntegrationRelation[] | null | undefined
): IntegrationRelation | null {
  if (!relation) {
    return null
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation
}

const META_API_VERSION = 'v18.0'
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

const GOOGLE_ADS_API_VERSION = 'v23'
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`

/**
 * Descriptografa um token usando pgcrypto
 */
async function decryptToken(
  supabaseClient: SupabaseClient,
  encryptedToken: string,
  key: string
): Promise<string> {
  const { data, error } = await supabaseClient.rpc('decrypt_token', {
    encrypted_data: encryptedToken,
    encryption_key: key,
  })

  if (error) {
    console.error('[Ad Metrics] Error decrypting token:', error)
    throw new Error('Failed to decrypt token')
  }

  return data
}

/**
 * Busca metricas de uma conta Meta Ads
 */
async function getMetaAccountInsights(
  accountId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<AdMetrics> {
  const url = new URL(`${META_API_BASE_URL}/act_${accountId}/insights`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('fields', 'spend,impressions,clicks')
  url.searchParams.set(
    'time_range',
    JSON.stringify({
      since: dateRange.start,
      until: dateRange.end,
    })
  )
  url.searchParams.set('level', 'account')

  try {
    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.error) {
      console.error('[Ad Metrics] Meta API Error:', data.error)
      return { spend: 0, impressions: 0, clicks: 0 }
    }

    const insights = data.data?.[0]
    if (!insights) {
      return { spend: 0, impressions: 0, clicks: 0 }
    }

    return {
      spend: parseFloat(insights.spend || '0'),
      impressions: parseInt(insights.impressions || '0', 10),
      clicks: parseInt(insights.clicks || '0', 10),
    }
  } catch (error) {
    console.error('[Ad Metrics] Error fetching Meta insights:', error)
    return { spend: 0, impressions: 0, clicks: 0 }
  }
}

/**
 * Busca metricas de uma conta Google Ads.
 * Usa o endpoint nao-streaming googleAds:search para parsear um unico JSON com results.
 */
async function getGoogleAccountInsights(
  customerId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<GoogleInsightsFetchResult> {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || ''

  if (!developerToken) {
    console.warn('[Ad Metrics] Missing GOOGLE_ADS_DEVELOPER_TOKEN')
    return { metrics: { spend: 0, impressions: 0, clicks: 0 }, authError: false }
  }

  const query = `
    SELECT
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks
    FROM customer
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
  `

  try {
    const response = await fetch(
      `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Ad Metrics] Google API Error:', errorData)
      return {
        metrics: { spend: 0, impressions: 0, clicks: 0 },
        authError: response.status === 401 || response.status === 403,
      }
    }

    const data = (await response.json()) as { results?: Array<{ metrics?: { costMicros?: string; impressions?: string; clicks?: string } }> }
    const results = data.results || []

    let totalSpend = 0
    let totalImpressions = 0
    let totalClicks = 0

    for (const row of results) {
      const m = row.metrics
      if (m) {
        totalSpend += parseInt(m.costMicros || '0', 10) / 1000000
        totalImpressions += parseInt(m.impressions || '0', 10)
        totalClicks += parseInt(m.clicks || '0', 10)
      }
    }

    return {
      metrics: {
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
      },
      authError: false,
    }
  } catch (error) {
    console.error('[Ad Metrics] Error fetching Google insights:', error)
    return { metrics: { spend: 0, impressions: 0, clicks: 0 }, authError: false }
  }
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresIn: number
  refreshToken?: string | null
}> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  const data = (await response.json().catch(() => ({}))) as {
    access_token?: string
    expires_in?: number
    refresh_token?: string
    error?: string
    error_description?: string
  }

  if (!response.ok || !data.access_token) {
    const reason =
      data.error_description ||
      data.error ||
      `Google token refresh failed with status ${response.status}`
    throw new Error(reason)
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 3600,
    refreshToken: data.refresh_token || null,
  }
}

async function refreshGoogleTokenForIntegration(
  serviceClient: SupabaseClient,
  integrationId: string,
  encryptedRefreshToken: string,
  encryptionKey: string
): Promise<string | null> {
  try {
    const { data: decryptedRefreshToken, error: decryptError } = await serviceClient.rpc(
      'decrypt_token',
      {
        encrypted_data: encryptedRefreshToken,
        encryption_key: encryptionKey,
      }
    )

    if (decryptError || !decryptedRefreshToken) {
      console.error('[Ad Metrics] Failed to decrypt Google refresh token:', decryptError)
      return null
    }

    const refreshed = await refreshGoogleAccessToken(decryptedRefreshToken)
    const tokenExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()

    const { data: encryptedAccessToken, error: encryptAccessError } = await serviceClient.rpc(
      'encrypt_token',
      {
        token_data: refreshed.accessToken,
        encryption_key: encryptionKey,
      }
    )

    if (encryptAccessError || !encryptedAccessToken) {
      console.error('[Ad Metrics] Failed to encrypt refreshed Google access token:', encryptAccessError)
      return null
    }

    const { error: updateAccountsError } = await serviceClient
      .from('integration_accounts')
      .update({
        access_token: encryptedAccessToken,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('integration_id', integrationId)
      .eq('status', 'active')

    if (updateAccountsError) {
      console.error('[Ad Metrics] Failed updating accounts with refreshed Google token:', updateAccountsError)
      return null
    }

    const { data: integrationData } = await serviceClient
      .from('integrations')
      .select('platform_config, project_id')
      .eq('id', integrationId)
      .single()

    const platformConfig = (integrationData?.platform_config || {}) as Record<string, unknown>
    let encryptedRefreshTokenForConfig = platformConfig.encrypted_refresh_token

    if (refreshed.refreshToken) {
      const { data: encryptedRefreshTokenUpdated, error: encryptRefreshError } = await serviceClient.rpc(
        'encrypt_token',
        {
          token_data: refreshed.refreshToken,
          encryption_key: encryptionKey,
        }
      )

      if (!encryptRefreshError && encryptedRefreshTokenUpdated) {
        encryptedRefreshTokenForConfig = encryptedRefreshTokenUpdated
      }
    }

    await serviceClient
      .from('integrations')
      .update({
        status: 'connected',
        platform_config: {
          ...platformConfig,
          encrypted_refresh_token: encryptedRefreshTokenForConfig,
          token_expires_at: tokenExpiresAt,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)

    // Avoid stale zeros after auto-refresh in dashboard.
    if (integrationData?.project_id) {
      await serviceClient
        .from('dashboard_cache')
        .delete()
        .eq('project_id', integrationData.project_id)
        .eq('endpoint', 'summary')
    }

    return refreshed.accessToken
  } catch (error) {
    console.error('[Ad Metrics] Google token refresh failed:', error)
    await serviceClient
      .from('integrations')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
    return null
  }
}

/** Mapeamento de plataforma de integração para nome da origem system */
const PLATFORM_TO_ORIGIN_NAME: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
}

/**
 * Busca metricas de ads agrupadas por plataforma (para atribuir spend por origem)
 *
 * Retorna um Record onde a chave é o nome da origem system (ex: "Meta Ads")
 * e o valor são as métricas agregadas daquela plataforma.
 */
export async function getAdMetricsPerPlatform(
  supabaseClient: SupabaseClient,
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, AdMetrics>> {
  const result: Record<string, AdMetrics> = {}

  try {
    const { data: accounts, error } = await supabaseClient
      .from('integration_accounts')
      .select(
        `
        id,
        external_account_id,
        access_token,
        token_expires_at,
        integration_id,
        integrations!inner(id, platform, platform_type, status, project_id, platform_config)
      `
      )
      .eq('status', 'active')
      .not('access_token', 'is', null)

    if (error || !accounts) {
      console.error('[Ad Metrics Per Platform] Error fetching accounts:', error)
      return result
    }

    const filteredAccounts = accounts.filter((account) => {
      const integration = getIntegrationRelation(
        account.integrations as IntegrationRelation | IntegrationRelation[] | null
      )
      if (!integration) {
        return false
      }

      return (
        integration.platform_type === 'advertising' &&
        integration.status === 'connected' &&
        integration.project_id === projectId
      )
    })

    // Deduplicar por external_account_id para evitar somar spend duplicado
    // quando a mesma conta é reconectada (múltiplos registros ativos)
    const deduped = new Map<string, (typeof filteredAccounts)[number]>()
    for (const account of filteredAccounts) {
      deduped.set(account.external_account_id, account)
    }
    const advertisingAccounts = Array.from(deduped.values())

    if (advertisingAccounts.length === 0) return result

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const encryptionKey =
      Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'

    const dateRange: DateRange = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    }

    const refreshedAccessTokenByIntegration = new Map<string, string>()

    for (const account of advertisingAccounts) {
      const integration = getIntegrationRelation(
        account.integrations as IntegrationRelation | IntegrationRelation[] | null
      )
      if (!integration) {
        continue
      }
      const originName = PLATFORM_TO_ORIGIN_NAME[integration.platform]
      if (!originName) continue

      try {
        let decryptedToken = refreshedAccessTokenByIntegration.get(account.integration_id)
        if (!decryptedToken) {
          decryptedToken = await decryptToken(
            serviceClient,
            account.access_token,
            encryptionKey
          )
        }

        let metrics: AdMetrics = { spend: 0, impressions: 0, clicks: 0 }

        switch (integration.platform) {
          case 'meta':
            metrics = await getMetaAccountInsights(
              account.external_account_id.replace('act_', ''),
              decryptedToken,
              dateRange
            )
            break
          case 'google':
          {
            const isExpired =
              !!account.token_expires_at &&
              new Date(account.token_expires_at).getTime() <= Date.now()

            if (isExpired && integration.platform_config?.encrypted_refresh_token) {
              const refreshedAccessToken = await refreshGoogleTokenForIntegration(
                serviceClient,
                account.integration_id,
                String(integration.platform_config.encrypted_refresh_token),
                encryptionKey
              )
              if (refreshedAccessToken) {
                decryptedToken = refreshedAccessToken
                refreshedAccessTokenByIntegration.set(account.integration_id, refreshedAccessToken)
              }
            }

            let googleInsights = await getGoogleAccountInsights(
              account.external_account_id,
              decryptedToken!,
              dateRange
            )
            if (googleInsights.authError && integration.platform_config?.encrypted_refresh_token) {
              const refreshedAccessToken = await refreshGoogleTokenForIntegration(
                serviceClient,
                account.integration_id,
                String(integration.platform_config.encrypted_refresh_token),
                encryptionKey
              )
              if (refreshedAccessToken) {
                decryptedToken = refreshedAccessToken
                refreshedAccessTokenByIntegration.set(account.integration_id, refreshedAccessToken)
                googleInsights = await getGoogleAccountInsights(
                  account.external_account_id,
                  refreshedAccessToken,
                  dateRange
                )
              }
            }
            metrics = googleInsights.metrics
            break
          }
          case 'tiktok':
            console.log('[Ad Metrics Per Platform] TikTok not implemented yet')
            break
        }

        if (!result[originName]) {
          result[originName] = { spend: 0, impressions: 0, clicks: 0 }
        }
        result[originName].spend += metrics.spend
        result[originName].impressions += metrics.impressions
        result[originName].clicks += metrics.clicks
      } catch (err) {
        console.error('[Ad Metrics Per Platform] Error for account:', account.id, err)
      }
    }

    console.log('[Ad Metrics Per Platform] Result:', Object.keys(result).map(k => `${k}: R$${result[k].spend.toFixed(2)}`))
    return result
  } catch (error) {
    console.error('[Ad Metrics Per Platform] Error:', error)
    return result
  }
}

/**
 * Busca metricas agregadas de ads para o dashboard
 *
 * Consulta todas as contas de advertising conectadas e agrega as metricas
 */
export async function getAdMetricsForDashboard(
  supabaseClient: SupabaseClient,
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<AdMetrics> {
  console.log('[Ad Metrics] Fetching ad metrics for dashboard', {
    projectId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  })

  try {
    // Buscar contas de integracao ativas de advertising
    const { data: accounts, error } = await supabaseClient
      .from('integration_accounts')
      .select(
        `
        id,
        external_account_id,
        access_token,
        token_expires_at,
        integration_id,
        integrations!inner(id, platform, platform_type, status, project_id, platform_config)
      `
      )
      .eq('status', 'active')
      .not('access_token', 'is', null)

    if (error) {
      console.error('[Ad Metrics] Error fetching accounts:', error)
      return { spend: 0, impressions: 0, clicks: 0 }
    }

    // Filtrar contas de advertising do projeto
    const filteredAccounts = (accounts || []).filter((account) => {
      const integration = getIntegrationRelation(
        account.integrations as IntegrationRelation | IntegrationRelation[] | null
      )
      if (!integration) {
        return false
      }

      return (
        integration.platform_type === 'advertising' &&
        integration.status === 'connected' &&
        integration.project_id === projectId
      )
    })

    // Deduplicar por external_account_id para evitar somar spend duplicado
    const deduped = new Map<string, (typeof filteredAccounts)[number]>()
    for (const account of filteredAccounts) {
      deduped.set(account.external_account_id, account)
    }
    const advertisingAccounts = Array.from(deduped.values())

    if (advertisingAccounts.length === 0) {
      console.log('[Ad Metrics] No advertising accounts connected')
      return { spend: 0, impressions: 0, clicks: 0 }
    }

    // Usar service role para descriptografar tokens
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const encryptionKey =
      Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'

    const dateRange: DateRange = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    }

    const refreshedAccessTokenByIntegration = new Map<string, string>()

    // Agregar metricas de todas as contas
    let totalSpend = 0
    let totalImpressions = 0
    let totalClicks = 0

    for (const account of advertisingAccounts) {
      const integration = getIntegrationRelation(
        account.integrations as IntegrationRelation | IntegrationRelation[] | null
      )
      if (!integration) {
        continue
      }

      try {
        let decryptedToken = refreshedAccessTokenByIntegration.get(account.integration_id)
        if (!decryptedToken) {
          decryptedToken = await decryptToken(
            serviceClient,
            account.access_token,
            encryptionKey
          )
        }

        let metrics: AdMetrics = { spend: 0, impressions: 0, clicks: 0 }

        switch (integration.platform) {
          case 'meta':
            metrics = await getMetaAccountInsights(
              account.external_account_id.replace('act_', ''),
              decryptedToken,
              dateRange
            )
            break
          case 'google':
          {
            const isExpired =
              !!account.token_expires_at &&
              new Date(account.token_expires_at).getTime() <= Date.now()

            if (isExpired && integration.platform_config?.encrypted_refresh_token) {
              const refreshedAccessToken = await refreshGoogleTokenForIntegration(
                serviceClient,
                account.integration_id,
                String(integration.platform_config.encrypted_refresh_token),
                encryptionKey
              )
              if (refreshedAccessToken) {
                decryptedToken = refreshedAccessToken
                refreshedAccessTokenByIntegration.set(account.integration_id, refreshedAccessToken)
              }
            }

            let googleInsights = await getGoogleAccountInsights(
              account.external_account_id,
              decryptedToken!,
              dateRange
            )
            if (googleInsights.authError && integration.platform_config?.encrypted_refresh_token) {
              const refreshedAccessToken = await refreshGoogleTokenForIntegration(
                serviceClient,
                account.integration_id,
                String(integration.platform_config.encrypted_refresh_token),
                encryptionKey
              )
              if (refreshedAccessToken) {
                decryptedToken = refreshedAccessToken
                refreshedAccessTokenByIntegration.set(account.integration_id, refreshedAccessToken)
                googleInsights = await getGoogleAccountInsights(
                  account.external_account_id,
                  refreshedAccessToken,
                  dateRange
                )
              }
            }
            metrics = googleInsights.metrics
            break
          }
          case 'tiktok':
            // TODO: Implementar TikTok
            console.log('[Ad Metrics] TikTok not implemented yet')
            break
        }

        totalSpend += metrics.spend
        totalImpressions += metrics.impressions
        totalClicks += metrics.clicks
      } catch (error) {
        console.error(
          '[Ad Metrics] Error fetching metrics for account:',
          account.id,
          error
        )
      }
    }

    console.log('[Ad Metrics] Fetched successfully', {
      projectId,
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      accounts: advertisingAccounts.length,
    })

    return {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
    }
  } catch (error) {
    console.error('[Ad Metrics] Error:', error)
    return { spend: 0, impressions: 0, clicks: 0 }
  }
}
