/**
 * Meta Account Sync Service
 * Synchronizes ad accounts from Meta API
 */

import { fetchMetaAdAccounts } from '../../../handlers/meta/exchangeToken.ts'

export interface SyncResult {
  added: number
  updated: number
  removed: number
  accounts: Array<{
    id: string
    name: string
    accountId: string
    currency?: string
  }>
}

/**
 * Sync accounts from Meta API
 * 
 * @param accessToken - Long-lived access token
 * @param existingAccounts - Existing accounts in database
 * @returns Sync result with changes
 */
export async function syncMetaAccounts(
  accessToken: string,
  existingAccounts: Array<{
    external_account_id: string
    account_name: string
    id: string
  }>
): Promise<SyncResult> {
  try {
    // Fetch all accounts from Meta
    const metaAccounts = await fetchMetaAdAccounts(accessToken)

    const existingAccountMap = new Map(
      existingAccounts.map(acc => [acc.external_account_id, acc])
    )

    const metaAccountMap = new Map(
      metaAccounts.map(acc => [acc.account_id, acc])
    )

    const result: SyncResult = {
      added: 0,
      updated: 0,
      removed: 0,
      accounts: [],
    }

    // Find new accounts (in Meta but not in DB)
    for (const metaAccount of metaAccounts) {
      if (!existingAccountMap.has(metaAccount.account_id)) {
        result.added++
        result.accounts.push({
          id: metaAccount.id,
          name: metaAccount.name,
          accountId: metaAccount.account_id,
          currency: metaAccount.currency,
        })
      } else {
        // Account exists - check if needs update
        const existing = existingAccountMap.get(metaAccount.account_id)!
        if (existing.account_name !== metaAccount.name) {
          result.updated++
        }
        result.accounts.push({
          id: existing.id,
          name: metaAccount.name,
          accountId: metaAccount.account_id,
          currency: metaAccount.currency,
        })
      }
    }

    // Find removed accounts (in DB but not in Meta)
    for (const existingAccount of existingAccounts) {
      if (!metaAccountMap.has(existingAccount.external_account_id)) {
        result.removed++
      }
    }

    console.log('[Account Sync] Sync result:', result)

    return result
  } catch (error) {
    console.error('[Account Sync] Error syncing accounts:', error)
    throw error
  }
}

