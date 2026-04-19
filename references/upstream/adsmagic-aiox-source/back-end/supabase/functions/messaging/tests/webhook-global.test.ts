/**
 * Testes unitários para webhook-global.ts
 * 
 * Testa o handler de webhook global que identifica conta por token no body
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { handleWebhookGlobal } from '../handlers/webhook-global.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Mock do Supabase client
function createMockSupabaseClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  } as unknown as ReturnType<typeof createClient>
}

Deno.test('handleWebhookGlobal - Deve retornar erro 400 para broker type inválido', async () => {
  const req = new Request('https://example.com/messaging/webhook/invalid_broker', {
    method: 'POST',
    body: JSON.stringify({ token: 'test-token' }),
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookGlobal(req, supabaseClient, 'invalid_broker')
  
  assertEquals(response.status, 400)
  const body = await response.json()
  assertEquals(body.error.includes('Broker não suportado'), true)
})

Deno.test('handleWebhookGlobal - Deve retornar erro 400 para body vazio', async () => {
  const req = new Request('https://example.com/messaging/webhook/uazapi', {
    method: 'POST',
    body: '',
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookGlobal(req, supabaseClient, 'uazapi')
  
  assertEquals(response.status, 400)
  const body = await response.json()
  assertEquals(body.error.includes('Body da requisição é obrigatório'), true)
})

Deno.test('handleWebhookGlobal - Deve retornar erro 400 para JSON inválido', async () => {
  const req = new Request('https://example.com/messaging/webhook/uazapi', {
    method: 'POST',
    body: 'invalid json{',
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookGlobal(req, supabaseClient, 'uazapi')
  
  assertEquals(response.status, 400)
  const body = await response.json()
  assertEquals(body.error.includes('JSON malformado'), true)
})

Deno.test('handleWebhookGlobal - Deve retornar erro 404 quando conta não encontrada', async () => {
  const req = new Request('https://example.com/messaging/webhook/uazapi', {
    method: 'POST',
    body: JSON.stringify({ 
      token: 'non-existent-token',
      EventType: 'messages',
    }),
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookGlobal(req, supabaseClient, 'uazapi')
  
  assertEquals(response.status, 404)
  const body = await response.json()
  assertEquals(body.error.includes('Conta não encontrada'), true)
})

Deno.test('handleWebhookGlobal - Deve validar broker types suportados', async () => {
  const validBrokers = ['uazapi', 'gupshup', 'official_whatsapp', 'evolution']
  
  for (const broker of validBrokers) {
    const req = new Request(`https://example.com/messaging/webhook/${broker}`, {
      method: 'POST',
      body: JSON.stringify({ token: 'test-token' }),
    })
    
    const supabaseClient = createMockSupabaseClient()
    const response = await handleWebhookGlobal(req, supabaseClient, broker)
    
    // Não deve retornar erro 400 de broker não suportado
    if (response.status === 400) {
      const body = await response.json()
      assertEquals(body.error.includes('Broker não suportado'), false, `Broker ${broker} deve ser suportado`)
    }
  }
})
