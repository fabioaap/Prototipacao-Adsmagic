/**
 * Testes unitários para rate-limiter.ts
 * 
 * Testa o sistema de rate limiting
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../utils/rate-limiter.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Mock do Supabase client
function createMockSupabaseClient() {
  let counters: Array<{
    id: string
    key: string
    count: number
    expires_at: string
    created_at: string
    updated_at: string
  }> = []
  
  return {
    from: (table: string) => {
      if (table === 'rate_limit_counters') {
        return {
          select: (columns: string) => ({
            eq: (column: string, value: unknown) => ({
              gt: (column: string, value: unknown) => ({
                order: () => ({
                  limit: () => ({
                    single: () => {
                      const now = new Date()
                      const counter = counters.find(c => 
                        c.key === value && new Date(c.expires_at) > now
                      )
                      return Promise.resolve({ 
                        data: counter || null, 
                        error: counter ? null : { code: 'PGRST116' } 
                      })
                    },
                  }),
                }),
              }),
            }),
            insert: (data: unknown) => {
              const dataObj = data as typeof counters[0]
              const newCounter: typeof counters[0] = {
                id: crypto.randomUUID(),
                key: dataObj.key,
                count: dataObj.count,
                expires_at: dataObj.expires_at,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              counters.push(newCounter)
              return Promise.resolve({ error: null })
            },
            update: (data: unknown) => ({
              eq: (column: string, value: unknown) => {
                const index = counters.findIndex(c => c.id === value)
                if (index >= 0) {
                  counters[index] = { ...counters[index], ...(data as Partial<typeof counters[0]>) }
                }
                return Promise.resolve({ error: null })
              },
            }),
            delete: () => ({
              lt: () => Promise.resolve({ error: null }),
            }),
          }),
        }
      }
      return {}
    },
  } as unknown as ReturnType<typeof createClient>
}

Deno.test('RateLimiter - Deve permitir requisição dentro do limite', async () => {
  const supabaseClient = createMockSupabaseClient()
  const rateLimiter = new RateLimiter(supabaseClient, {
    maxRequests: 10,
    windowMs: 60000, // 1 minuto
  })
  
  const result = await rateLimiter.check('test-key-1')
  
  assertEquals(result.allowed, true)
  assertEquals(result.remaining, 9) // 10 - 1
  assertExists(result.resetAt)
})

Deno.test('RateLimiter - Deve bloquear requisição acima do limite', async () => {
  const supabaseClient = createMockSupabaseClient()
  const rateLimiter = new RateLimiter(supabaseClient, {
    maxRequests: 2,
    windowMs: 60000,
  })
  
  // Primeira requisição
  const result1 = await rateLimiter.check('test-key-2')
  assertEquals(result1.allowed, true)
  
  // Segunda requisição
  const result2 = await rateLimiter.check('test-key-2')
  assertEquals(result2.allowed, true)
  
  // Terceira requisição (deve bloquear)
  const result3 = await rateLimiter.check('test-key-2')
  assertEquals(result3.allowed, false)
  assertEquals(result3.remaining, 0)
  assertExists(result3.retryAfter)
})

Deno.test('RATE_LIMIT_CONFIGS - Deve ter configurações corretas', () => {
  assertEquals(RATE_LIMIT_CONFIGS.global.maxRequests, 200)
  assertEquals(RATE_LIMIT_CONFIGS.global.windowMs, 60000)
  
  assertEquals(RATE_LIMIT_CONFIGS.byAccount.maxRequests, 100)
  assertEquals(RATE_LIMIT_CONFIGS.byAccount.windowMs, 60000)
})

Deno.test('RateLimiter - Deve retornar retryAfter quando bloqueado', async () => {
  const supabaseClient = createMockSupabaseClient()
  const rateLimiter = new RateLimiter(supabaseClient, {
    maxRequests: 1,
    windowMs: 60000,
  })
  
  // Primeira requisição (permitida)
  const result1 = await rateLimiter.check('test-key-3')
  assertEquals(result1.allowed, true)
  assertEquals(result1.retryAfter, undefined)
  
  // Segunda requisição (bloqueada)
  const result2 = await rateLimiter.check('test-key-3')
  assertEquals(result2.allowed, false)
  assertExists(result2.retryAfter)
  assertEquals(result2.retryAfter! > 0, true)
})
