/**
 * Sistema de Rate Limiting para webhooks
 * 
 * Implementa rate limiting usando Supabase para armazenar contadores
 * Segue estratégia de sliding window
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

export interface RateLimitConfig {
  maxRequests: number // Máximo de requisições
  windowMs: number // Janela de tempo em milissegundos
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number // Timestamp em milissegundos
  retryAfter?: number // Segundos até poder tentar novamente
}

/**
 * Rate Limiter usando Supabase
 */
export class RateLimiter {
  private supabaseClient: SupabaseDbClient
  private defaultConfig: RateLimitConfig
  
  constructor(
    supabaseClient: SupabaseDbClient,
    defaultConfig: RateLimitConfig = {
      maxRequests: 100, // 100 requisições
      windowMs: 60 * 1000, // Por minuto
    }
  ) {
    this.supabaseClient = supabaseClient
    this.defaultConfig = defaultConfig
  }
  
  /**
   * Verifica se requisição está dentro do rate limit
   * 
   * @param key - Chave única para rate limiting (ex: accountId, IP, token)
   * @param config - Configuração de rate limit (opcional, usa default)
   * @returns Resultado do rate limit check
   */
  async check(
    key: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const limitConfig = { ...this.defaultConfig, ...config }
    const now = Date.now()
    const windowStart = now - limitConfig.windowMs
    
    try {
      // Buscar contadores existentes
      const { data: counters, error: fetchError } = await this.supabaseClient
        .from('rate_limit_counters')
        .select('*')
        .eq('key', key)
        .gt('expires_at', new Date(now).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('[RateLimiter] Error fetching counters:', fetchError)
        // Em caso de erro, permitir requisição (fail open)
        return {
          allowed: true,
          remaining: limitConfig.maxRequests,
          resetAt: now + limitConfig.windowMs,
        }
      }
      
      const counter = counters && counters.length > 0 ? counters[0] : null
      
      // Se não há contador ou expirou, criar novo
      if (!counter || new Date(counter.expires_at).getTime() < windowStart) {
        // Criar novo contador
        const expiresAt = new Date(now + limitConfig.windowMs).toISOString()
        
        const { error: insertError } = await this.supabaseClient
          .from('rate_limit_counters')
          .insert({
            key,
            count: 1,
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
          })
        
        if (insertError) {
          console.error('[RateLimiter] Error creating counter:', insertError)
          // Fail open
          return {
            allowed: true,
            remaining: limitConfig.maxRequests - 1,
            resetAt: now + limitConfig.windowMs,
          }
        }
        
        return {
          allowed: true,
          remaining: limitConfig.maxRequests - 1,
          resetAt: now + limitConfig.windowMs,
        }
      }
      
      // Incrementar contador existente
      const newCount = (counter.count || 0) + 1
      const allowed = newCount <= limitConfig.maxRequests
      
      const { error: updateError } = await this.supabaseClient
        .from('rate_limit_counters')
        .update({
          count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', counter.id)
      
      if (updateError) {
        console.error('[RateLimiter] Error updating counter:', updateError)
        // Fail open
        return {
          allowed: true,
          remaining: limitConfig.maxRequests - newCount,
          resetAt: new Date(counter.expires_at).getTime(),
        }
      }
      
      const resetAt = new Date(counter.expires_at).getTime()
      const remaining = Math.max(0, limitConfig.maxRequests - newCount)
      const retryAfter = allowed ? undefined : Math.ceil((resetAt - now) / 1000)
      
      return {
        allowed,
        remaining,
        resetAt,
        retryAfter,
      }
      
    } catch (error) {
      console.error('[RateLimiter] Unexpected error:', error)
      // Fail open em caso de erro inesperado
      return {
        allowed: true,
        remaining: limitConfig.maxRequests,
        resetAt: now + limitConfig.windowMs,
      }
    }
  }
  
  /**
   * Limpa contadores expirados (opcional, pode ser chamado periodicamente)
   */
  async cleanup(): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('rate_limit_counters')
        .delete()
        .lt('expires_at', new Date().toISOString())
      
      if (error) {
        console.error('[RateLimiter] Error cleaning up:', error)
      }
    } catch (error) {
      console.error('[RateLimiter] Error in cleanup:', error)
    }
  }
}

/**
 * Configurações de rate limit por tipo de webhook
 */
export const RATE_LIMIT_CONFIGS = {
  // Webhook global: mais permissivo (múltiplas contas podem usar)
  global: {
    maxRequests: 200, // 200 requisições
    windowMs: 60 * 1000, // Por minuto
  },
  // Webhook por conta: mais restritivo (uma conta específica)
  byAccount: {
    maxRequests: 100, // 100 requisições
    windowMs: 60 * 1000, // Por minuto
  },
} as const
