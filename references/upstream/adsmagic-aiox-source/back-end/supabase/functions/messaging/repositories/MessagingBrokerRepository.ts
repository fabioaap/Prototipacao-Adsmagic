/**
 * Repository para acesso a dados de messaging_brokers
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { MessagingBroker } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export class MessagingBrokerRepository {
  private supabaseClient: SupabaseDbClient
  
  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }
  
  /**
   * Busca broker por nome
   */
  async findByName(name: string): Promise<MessagingBroker | null> {
    const { data, error } = await this.supabaseClient
      .from('messaging_brokers')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('[MessagingBrokerRepository] Error finding broker:', error)
      return null
    }
    
    return data as MessagingBroker
  }
  
  /**
   * Lista todos os brokers ativos para uma plataforma
   */
  async findByPlatform(platform: string): Promise<MessagingBroker[]> {
    const { data, error } = await this.supabaseClient
      .from('messaging_brokers')
      .select('*')
      .eq('platform', platform)
      .eq('is_active', true)
      .order('display_name')
    
    if (error) {
      console.error('[MessagingBrokerRepository] Error finding brokers:', error)
      return []
    }
    
    return (data || []) as MessagingBroker[]
  }
  
  /**
   * Lista todos os brokers ativos
   */
  async findAll(): Promise<MessagingBroker[]> {
    const { data, error } = await this.supabaseClient
      .from('messaging_brokers')
      .select('*')
      .eq('is_active', true)
      .order('platform', { ascending: true })
      .order('display_name')
    
    if (error) {
      console.error('[MessagingBrokerRepository] Error finding all brokers:', error)
      return []
    }
    
    return (data || []) as MessagingBroker[]
  }
}
