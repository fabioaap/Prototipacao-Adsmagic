import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decryptToken } from '../utils/encryption.ts'
import type { DateRange, AdPlatform } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type SupabaseClient = SupabaseDbClient

interface IntegrationRelation {
  platform: string
  platform_type: string
  status: string
  project_id: string
}

export interface AdAccountCredentials {
  id: string
  externalAccountId: string
  accessToken: string
  integrationId: string
}

function getIntegrationRelation(
  relation: IntegrationRelation | IntegrationRelation[] | null | undefined
): IntegrationRelation | null {
  if (!relation) return null
  return Array.isArray(relation) ? relation[0] ?? null : relation
}

/**
 * Calcula range de datas baseado no período informado.
 */
export function getDateRange(
  period: string,
  startDate?: string,
  endDate?: string
): DateRange {
  if (startDate && endDate) {
    return { start: startDate, end: endDate }
  }

  const end = new Date()
  const start = new Date()

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
    default:
      start.setDate(start.getDate() - 30)
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

/**
 * Busca uma conta ativa para a plataforma solicitada e descriptografa o token.
 */
export async function getAdAccount(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AdPlatform
): Promise<AdAccountCredentials | null> {
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabaseClient
    .from('integration_accounts')
    .select(
      `
      id,
      external_account_id,
      access_token,
      integration_id,
      integrations!inner(platform, platform_type, status, project_id)
    `
    )
    .eq('status', 'active')
    .not('access_token', 'is', null)

  if (error) {
    console.error('[Ad Insights Shared] Error fetching account:', error)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  const account = data.find((acc) => {
    const integration = getIntegrationRelation(
      acc.integrations as IntegrationRelation | IntegrationRelation[] | null
    )
    if (!integration) return false

    return (
      integration.platform === platform &&
      integration.platform_type === 'advertising' &&
      integration.status === 'connected' &&
      integration.project_id === projectId
    )
  })

  if (!account) return null

  const encryptionKey =
    Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'

  try {
    const decryptedToken = await decryptToken(
      serviceClient,
      account.access_token,
      encryptionKey
    )

    return {
      id: account.id,
      externalAccountId: account.external_account_id,
      accessToken: decryptedToken,
      integrationId: account.integration_id,
    }
  } catch (decryptError) {
    console.error('[Ad Insights Shared] Error decrypting token:', decryptError)
    return null
  }
}
