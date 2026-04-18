/**
 * Integração com plataformas de advertising para envio de eventos de conversão
 * 
 * Suporta:
 * - Meta Conversions API (Facebook/Meta)
 * - Google Ads Conversion API
 * - TikTok Events API
 */

import { sendToMeta } from './meta.ts'
import { sendToGoogle } from './google.ts'
import { sendToTikTok } from './tiktok.ts'
import type { ConversionEvent } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export interface SendEventResult {
  success: boolean
  nonRetryable?: boolean
  errorCode?: string
  response?: Record<string, unknown>
  error?: string
}

interface IntegrationAccountRow {
  id: string
  external_account_id: string
  access_token: string | null
  account_metadata: Record<string, unknown>
  status: string
  is_primary?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getPreferredIntegrationAccountId(event: ConversionEvent): string | undefined {
  const payload = event.payload
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  if (typeof payload.integration_account_id === 'string' && payload.integration_account_id.trim().length > 0) {
    return payload.integration_account_id.trim()
  }

  if (typeof payload.integrationAccountId === 'string' && payload.integrationAccountId.trim().length > 0) {
    return payload.integrationAccountId.trim()
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
      return { account: null, error: `Configured integration account not found: ${preferredAccountId}` }
    }
    if (preferred.status !== 'active') {
      return { account: null, error: `Configured integration account is not active: ${preferredAccountId}` }
    }
    return { account: preferred }
  }

  const active = accounts.filter((acc) => acc.status === 'active')
  if (active.length === 0) {
    return { account: null, error: 'No active account found for this integration' }
  }

  const primary = active.find((acc) => acc.is_primary)
  return { account: primary || active[0] || null }
}

/**
 * Envia evento para a plataforma correspondente
 */
export async function sendEventToPlatform(
  event: ConversionEvent,
  supabaseClient: SupabaseDbClient
): Promise<SendEventResult> {
  try {
    // Buscar credenciais da integração
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
        error: `Integration not found or not connected for platform: ${event.platform}`
      }
    }

    // Selecionar conta ativa (ou conta explícita no payload)
    const accounts: IntegrationAccountRow[] = Array.isArray(integration.integration_accounts)
      ? integration.integration_accounts.map((account) => ({
          id: account.id,
          external_account_id: account.external_account_id,
          access_token: account.access_token,
          account_metadata: isRecord(account.account_metadata) ? account.account_metadata : {},
          status: account.status,
          is_primary: account.is_primary || false,
        }))
      : []
    const preferredAccountId = getPreferredIntegrationAccountId(event)
    const accountSelection = selectIntegrationAccount(accounts, preferredAccountId)
    const selectedAccount = accountSelection.account

    if (!selectedAccount) {
      return {
        success: false,
        error: accountSelection.error || `No active account found for platform: ${event.platform}`
      }
    }

    const decryptedAccessToken = await decryptAccessToken(
      supabaseClient,
      selectedAccount.access_token
    )

    if (!decryptedAccessToken) {
      return {
        success: false,
        error: `Could not decrypt access token for platform: ${event.platform}`,
      }
    }

    const accountForSend = {
      ...selectedAccount,
      access_token: decryptedAccessToken,
    }
    const integrationForSend = {
      ...integration,
      platform_config: isRecord(integration.platform_config) ? integration.platform_config : {},
    }

    // Enviar para a plataforma específica
    switch (event.platform) {
      case 'meta':
        return await sendToMeta(event, integrationForSend, accountForSend)
      
      case 'google':
        return await sendToGoogle(event, integrationForSend, accountForSend)
      
      case 'tiktok':
        return await sendToTikTok(event, integrationForSend, accountForSend)
      
      default:
        return {
          success: false,
          error: `Unsupported platform: ${event.platform}`
        }
    }

  } catch (error) {
    console.error('[Send Event To Platform Error]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
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
    console.error('[Send Event To Platform] Error decrypting token:', error)
    return null
  }

  return data
}
