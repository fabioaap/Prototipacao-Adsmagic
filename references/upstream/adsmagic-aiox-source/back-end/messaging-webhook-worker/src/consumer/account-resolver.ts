/**
 * Account Resolver — Strategy Pattern for webhook account identification
 *
 * Supports:
 * 1. By account ID (from URL/queue message)
 * 2. By header (x-account-id)
 * 3. By token in body (for global webhooks like UAZAPI)
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { MessagingAccount } from '../types/messaging.js'
import { MessagingAccountRepository } from '../repositories/messaging-account.repo.js'

export interface AccountResolution {
  account: MessagingAccount | null
  strategy: string
}

export class AccountResolverFactory {
  static async resolve(params: {
    accountId: string | null
    parsedBody: Record<string, unknown>
    requestHeaders: Record<string, string>
    supabase: SupabaseRestClient
  }): Promise<AccountResolution> {
    const accountRepo = new MessagingAccountRepository(params.supabase)

    // Strategy 1: Direct account ID (from by_account route)
    if (params.accountId) {
      const account = await accountRepo.findById(params.accountId)
      return { account, strategy: 'account_id' }
    }

    // Strategy 2: Header x-account-id
    const headerAccountId = params.requestHeaders['x-account-id']
    if (headerAccountId) {
      const account = await accountRepo.findById(headerAccountId)
      if (account) return { account, strategy: 'header' }
    }

    // Strategy 3: Token in body
    const token = extractToken(params.parsedBody)
    if (token) {
      const brokerType = detectBrokerType(params.parsedBody)
      const account = await accountRepo.findByToken(token, brokerType || undefined)
      if (account) return { account, strategy: 'token' }
    }

    return { account: null, strategy: 'none' }
  }
}

function extractToken(body: Record<string, unknown>): string | null {
  if (typeof body.token === 'string') return body.token
  if (typeof body.instanceToken === 'string') return body.instanceToken
  if (typeof body.instance_token === 'string') return body.instance_token
  return null
}

function detectBrokerType(body: Record<string, unknown>): string | null {
  if (body.EventType && body.message) return 'uazapi'
  if (Array.isArray(body.entry)) return 'official_whatsapp'
  return null
}
