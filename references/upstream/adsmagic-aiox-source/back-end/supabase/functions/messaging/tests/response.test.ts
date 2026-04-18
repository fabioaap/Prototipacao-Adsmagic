/**
 * Testes unitários para response.ts
 * 
 * Testa funções de resposta HTTP, especialmente resposta vazia 2xx
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { emptySuccessResponse, successResponse, errorResponse } from '../utils/response.ts'

Deno.test('emptySuccessResponse - Deve retornar HTTP 200 com resposta vazia', async () => {
  const response = emptySuccessResponse()
  
  assertEquals(response.status, 200)
  
  // Verificar que o body está vazio
  const text = await response.text()
  assertEquals(text, '')
  
  // Verificar headers CORS
  const allowOrigin = response.headers.get('Access-Control-Allow-Origin')
  assertEquals(allowOrigin, '*')
})

Deno.test('emptySuccessResponse - Deve aceitar status customizado', async () => {
  const response = emptySuccessResponse(201)
  
  assertEquals(response.status, 201)
  
  // Verificar que o body está vazio
  const text = await response.text()
  assertEquals(text, '')
})

Deno.test('emptySuccessResponse - Deve ter headers CORS', () => {
  const response = emptySuccessResponse()
  
  const allowOrigin = response.headers.get('Access-Control-Allow-Origin')
  assertEquals(allowOrigin, '*')
  
  const allowMethods = response.headers.get('Access-Control-Allow-Methods')
  assertExists(allowMethods)
})

Deno.test('emptySuccessResponse - Deve retornar resposta vazia (requisito de webhooks)', async () => {
  const response = emptySuccessResponse(200)
  
  // Verificar que é uma resposta 2xx
  assertEquals(response.status >= 200 && response.status < 300, true, 
    'Webhook deve retornar HTTP 2xx')
  
  // Verificar que o body está vazio (requisito: "empty response")
  const text = await response.text()
  assertEquals(text, '', 
    'Webhook deve retornar resposta vazia conforme requisito')
  
  // Verificar headers CORS estão presentes
  const allowOrigin = response.headers.get('Access-Control-Allow-Origin')
  assertEquals(allowOrigin, '*')
})

Deno.test('successResponse - Deve retornar JSON com dados', async () => {
  const data = { processed: true }
  const response = successResponse(data)
  
  assertEquals(response.status, 200)
  
  const body = await response.json()
  assertEquals(body, data)
  
  const contentType = response.headers.get('Content-Type')
  assertEquals(contentType, 'application/json')
})

Deno.test('errorResponse - Deve retornar JSON com erro', async () => {
  const message = 'Test error'
  const response = errorResponse(message, 400)
  
  assertEquals(response.status, 400)
  
  const body = await response.json()
  assertEquals(body.error, message)
})
