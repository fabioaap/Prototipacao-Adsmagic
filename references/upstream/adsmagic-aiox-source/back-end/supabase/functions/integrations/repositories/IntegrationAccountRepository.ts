/**
 * Integration Account Repository
 * Abstracts database access for integration accounts
 */

import { decryptToken } from '../utils/encryption.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export interface IntegrationAccountRepository {
  saveAccounts(
    integrationId: string,
    projectId: string,
    accounts: Array<{
      externalAccountId: string
      accountName: string
      externalAccountName: string
      externalEmail?: string
      currency?: string
      metadata: Record<string, unknown>
      isPrimary: boolean
      pixelId?: string // Pixel ID associado a esta conta (Meta Ads)
    }>,
    encryptedToken: string,
    tokenExpiresAt: string,
    supabaseClient: SupabaseDbClient
  ): Promise<Array<{ id: string }>>
  
  findByIntegration(
    integrationId: string,
    supabaseClient: SupabaseDbClient
  ): Promise<any[]>
  
  getDecryptedToken(
    integrationId: string,
    supabaseClient: SupabaseDbClient
  ): Promise<string | null>
}

export class SupabaseIntegrationAccountRepository implements IntegrationAccountRepository {
  async saveAccounts(
    integrationId: string,
    projectId: string,
    accounts: Array<{
      externalAccountId: string
      accountName: string
      externalAccountName: string
      externalEmail?: string
      currency?: string
      metadata: Record<string, unknown>
      isPrimary: boolean
      pixelId?: string // Pixel ID associado a esta conta (Meta Ads)
    }>,
    encryptedToken: string,
    tokenExpiresAt: string,
    supabaseClient: SupabaseDbClient
  ): Promise<Array<{ id: string }>> {
    const savedAccounts = []

    for (const account of accounts) {
      // Validação de input (Clean Code)
      if (!account.externalAccountId || !account.accountName) {
        console.error('[IntegrationAccountRepository] Invalid account data:', account)
        continue
      }

      const { data, error } = await supabaseClient
        .from('integration_accounts')
        .upsert({
          integration_id: integrationId,
          project_id: projectId,
          account_name: account.accountName,
          external_account_id: account.externalAccountId,
          external_account_name: account.externalAccountName,
          external_email: account.externalEmail,
          status: 'active',
          is_primary: account.isPrimary,
          access_token: encryptedToken,
          token_expires_at: tokenExpiresAt,
          permissions: ['ads_read', 'business_management', 'ads_management'],
          account_metadata: account.metadata,
          pixel_id: account.pixelId || null, // Salvar pixel_id por conta
          last_sync_at: new Date().toISOString(),
          sync_status: 'success',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'integration_id,external_account_id',
        })
        .select('id')
        .single()

      if (error) {
        console.error('[IntegrationAccountRepository] Error saving account:', error)
        continue // Não lança erro - processa próximo
      }

      savedAccounts.push({ id: data.id })
    }

    return savedAccounts
  }

  async findByIntegration(
    integrationId: string,
    supabaseClient: SupabaseDbClient
  ): Promise<any[]> {
    const { data, error } = await supabaseClient
      .from('integration_accounts')
      .select('*')
      .eq('integration_id', integrationId)
      .eq('status', 'active')

    if (error) {
      console.error('[IntegrationAccountRepository] Error finding accounts:', error)
      throw new Error(`Failed to find accounts: ${error.message}`)
    }

    return data || []
  }

  async getDecryptedToken(
    integrationId: string,
    supabaseClient: SupabaseDbClient
  ): Promise<string | null> {
    // Get first active account with token
    const { data: account, error } = await supabaseClient
      .from('integration_accounts')
      .select('access_token')
      .eq('integration_id', integrationId)
      .eq('status', 'active')
      .not('access_token', 'is', null)
      .limit(1)
      .single()

    if (error || !account?.access_token) {
      return null
    }

    // Decrypt token
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    
    try {
      const decryptedToken = await decryptToken(
        supabaseClient,
        account.access_token,
        encryptionKey
      )
      return decryptedToken
    } catch (error) {
      console.error('[IntegrationAccountRepository] Error decrypting token:', error)
      return null
    }
  }
}

