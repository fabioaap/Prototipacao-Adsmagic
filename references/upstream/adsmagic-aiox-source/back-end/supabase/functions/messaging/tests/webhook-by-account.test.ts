/**
 * Testes unitários para webhook-by-account.ts
 * 
 * Testa o handler de webhook por conta que identifica conta por UUID na URL
 */

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { handleWebhookByAccount } from '../handlers/webhook-by-account.ts'
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

Deno.test('handleWebhookByAccount - Deve retornar erro 400 para UUID inválido', async () => {
  const req = new Request('https://example.com/messaging/webhook/gupshup/invalid-uuid', {
    method: 'POST',
    body: JSON.stringify({ message: {} }),
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookByAccount(req, supabaseClient, 'gupshup', 'invalid-uuid')
  
  assertEquals(response.status, 400)
  const body = await response.json()
  assertEquals(body.error.includes('Formato de UUID inválido'), true)
})

Deno.test('handleWebhookByAccount - Deve aceitar UUID válido', async () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const req = new Request(`https://example.com/messaging/webhook/gupshup/${validUUID}`, {
    method: 'POST',
    body: JSON.stringify({ message: {} }),
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookByAccount(req, supabaseClient, 'gupshup', validUUID)
  
  // Não deve retornar erro 400 de UUID inválido
  if (response.status === 400) {
    const body = await response.json()
    assertEquals(body.error.includes('Formato de UUID inválido'), false, 'UUID válido não deve gerar erro de formato')
  }
})

Deno.test('handleWebhookByAccount - Deve retornar erro 400 para broker type inválido', async () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const req = new Request(`https://example.com/messaging/webhook/invalid_broker/${validUUID}`, {
    method: 'POST',
    body: JSON.stringify({ message: {} }),
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookByAccount(req, supabaseClient, 'invalid_broker', validUUID)
  
  assertEquals(response.status, 400)
  const body = await response.json()
  assertEquals(body.error.includes('Broker não suportado'), true)
})

Deno.test('handleWebhookByAccount - Deve retornar erro 400 para body vazio', async () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const req = new Request(`https://example.com/messaging/webhook/gupshup/${validUUID}`, {
    method: 'POST',
    body: '',
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookByAccount(req, supabaseClient, 'gupshup', validUUID)
  
  assertEquals(response.status, 400)
  const body = await response.json()
  assertEquals(body.error.includes('Body da requisição é obrigatório'), true)
})

Deno.test('handleWebhookByAccount - Deve retornar erro 404 quando conta não encontrada', async () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const req = new Request(`https://example.com/messaging/webhook/gupshup/${validUUID}`, {
    method: 'POST',
    body: JSON.stringify({ message: {} }),
  })
  
  const supabaseClient = createMockSupabaseClient()
  const response = await handleWebhookByAccount(req, supabaseClient, 'gupshup', validUUID)
  
  assertEquals(response.status, 404)
  const body = await response.json()
  assertEquals(body.error.includes('Conta não encontrada'), true)
})
