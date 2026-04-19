/**
 * Repository para acesso a dados de messaging_accounts
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { MessagingAccount } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export class MessagingAccountRepository {
  private supabaseClient: SupabaseDbClient
  
  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }
  
  /**
   * Busca conta por ID
   */
  async findById(id: string): Promise<MessagingAccount | null> {
    const { data, error } = await this.supabaseClient
      .from('messaging_accounts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('[MessagingAccountRepository] Error finding account:', error)
      return null
    }
    
    return data as MessagingAccount
  }
  
  /**
   * Busca conta por project_id e broker_type
   */
  async findByProjectAndBroker(
    projectId: string,
    brokerType: string
  ): Promise<MessagingAccount[]> {
    const { data, error } = await this.supabaseClient
      .from('messaging_accounts')
      .select('*')
      .eq('project_id', projectId)
      .eq('broker_type', brokerType)
      .eq('status', 'active')
    
    if (error) {
      console.error('[MessagingAccountRepository] Error finding accounts:', error)
      return []
    }
    
    return (data || []) as MessagingAccount[]
  }
  
  /**
   * Busca conta por token (api_key ou access_token)
   * Usado para webhooks globais que identificam conta pelo token no body
   * 
   * @param token - Token da instância (pode estar em api_key ou access_token)
   * @param brokerType - Tipo do broker (opcional, para filtrar)
   * @returns Conta encontrada ou null
   */
  async findByToken(
    token: string,
    brokerType?: string
  ): Promise<MessagingAccount | null> {
    if (!token) {
      return null
    }
    
    // Buscar por api_key primeiro (campo principal para UAZAPI)
    let query = this.supabaseClient
      .from('messaging_accounts')
      .select('*')
      .eq('api_key', token)
      .eq('status', 'active')
    
    if (brokerType) {
      query = query.eq('broker_type', brokerType)
    }
    
    const { data: byApiKey, error: errorApiKey } = await query.single()
    
    if (!errorApiKey && byApiKey) {
      return byApiKey as MessagingAccount
    }
    
    // Se não encontrou por api_key, buscar por access_token
    let queryByToken = this.supabaseClient
      .from('messaging_accounts')
      .select('*')
      .eq('access_token', token)
      .eq('status', 'active')
    
    if (brokerType) {
      queryByToken = queryByToken.eq('broker_type', brokerType)
    }
    
    const { data: byAccessToken, error: errorAccessToken } = await queryByToken.single()
    
    if (!errorAccessToken && byAccessToken) {
      return byAccessToken as MessagingAccount
    }
    
    // Log apenas se ambos falharam
    if (errorApiKey && errorAccessToken) {
      console.warn('[MessagingAccountRepository] Account not found by token', {
        token: token.substring(0, 10) + '...', // Log parcial por segurança
        brokerType,
        errorApiKey: errorApiKey.message,
        errorAccessToken: errorAccessToken.message,
      })
    }
    
    return null
  }
  
  /**
   * Atualiza estatísticas da conta
   */
  async updateStats(
    id: string,
    stats: {
      totalMessages?: number
      totalContacts?: number
      lastMessageAt?: string
      lastWebhookAt?: string
    }
  ): Promise<void> {
    const updateData: Record<string, unknown> = {}
    
    if (stats.totalMessages !== undefined) {
      updateData.total_messages = stats.totalMessages
    }
    if (stats.totalContacts !== undefined) {
      updateData.total_contacts = stats.totalContacts
    }
    if (stats.lastMessageAt) {
      updateData.last_message_at = stats.lastMessageAt
    }
    if (stats.lastWebhookAt) {
      updateData.last_webhook_at = stats.lastWebhookAt
    }
    
    const { error } = await this.supabaseClient
      .from('messaging_accounts')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('[MessagingAccountRepository] Error updating stats:', error)
      throw new Error(`Failed to update stats: ${error.message}`)
    }
  }
}
