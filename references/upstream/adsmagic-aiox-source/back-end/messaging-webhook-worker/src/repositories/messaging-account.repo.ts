/**
 * Messaging Account Repository — REST client version
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { MessagingAccount } from '../types/messaging.js'

export class MessagingAccountRepository {
  constructor(private supabase: SupabaseRestClient) {}

  async findById(id: string): Promise<MessagingAccount | null> {
    const row = await this.supabase.selectOne('messaging_accounts', { 'id': `eq.${id}` })
    return row as unknown as MessagingAccount | null
  }

  async findByProjectAndBroker(projectId: string, brokerType: string): Promise<MessagingAccount | null> {
    const row = await this.supabase.selectOne('messaging_accounts', {
      'project_id': `eq.${projectId}`,
      'broker_type': `eq.${brokerType}`,
      'status': `eq.active`,
    })
    return row as unknown as MessagingAccount | null
  }

  async findByToken(token: string, brokerType?: string): Promise<MessagingAccount | null> {
    // Try api_key first
    const apiKeyFilters: Record<string, string> = { 'api_key': `eq.${token}` }
    if (brokerType) apiKeyFilters['broker_type'] = `eq.${brokerType}`

    const byApiKey = await this.supabase.selectOne('messaging_accounts', apiKeyFilters)
    if (byApiKey) return byApiKey as unknown as MessagingAccount

    // Try access_token
    const accessTokenFilters: Record<string, string> = { 'access_token': `eq.${token}` }
    if (brokerType) accessTokenFilters['broker_type'] = `eq.${brokerType}`

    const byAccessToken = await this.supabase.selectOne('messaging_accounts', accessTokenFilters)
    return byAccessToken as unknown as MessagingAccount | null
  }

  async updateStats(id: string, stats: {
    totalMessages?: number
    lastWebhookAt?: string
    lastMessageAt?: string
    totalContacts?: number
  }): Promise<void> {
    const data: Record<string, unknown> = {}
    if (stats.totalMessages !== undefined) data.total_messages = stats.totalMessages
    if (stats.lastWebhookAt) data.last_webhook_at = stats.lastWebhookAt
    if (stats.lastMessageAt) data.last_message_at = stats.lastMessageAt
    if (stats.totalContacts !== undefined) data.total_contacts = stats.totalContacts
    data.updated_at = new Date().toISOString()

    await this.supabase.update('messaging_accounts', data, { 'id': `eq.${id}` })
  }
}
