/**
 * Edge Function para Webhooks de Mensageria
 * 
 * Esta função é dedicada exclusivamente ao recebimento de webhooks dos brokers.
 * Configurada com verify_jwt: false para permitir que brokers externos enviem
 * webhooks sem autenticação JWT.
 * 
 * A segurança é garantida através de:
 * - Validação de assinatura (webhook_secret)
 * - Rate limiting por conta
 * - Validação de token/api_key no body ou UUID na URL
 * - Verificação de status da conta (apenas 'active')
 * 
 * Rotas disponíveis:
 * - POST /messaging-webhooks/webhook/{brokerType} - Webhook Global (identifica por token no body)
 * - POST /messaging-webhooks/webhook/{brokerType}/{accountId} - Webhook por Conta (identifica por UUID na URL)
 * 
 * Exemplos:
 * - POST /messaging-webhooks/webhook/uazapi
 *   Body: { "token": "abc123...", "EventType": "messages", ... }
 * 
 * - POST /messaging-webhooks/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000
 *   Body: { "message": {...} }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../messaging/utils/cors.ts'
import { errorResponse } from '../messaging/utils/response.ts'
import { handleWebhookGlobal } from './handlers/webhook-global.ts'
import { handleWebhookByAccount } from './handlers/webhook-by-account.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Webhooks não requerem autenticação JWT (verify_jwt: false configurado)
    // Usamos SERVICE_ROLE_KEY para bypassar RLS, já que:
    // - Webhooks são endpoints públicos (sem JWT)
    // - A segurança é garantida por validação de assinatura e rate limiting
    // - Service role é apropriado para operações internas que precisam acessar dados sem RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('[Messaging Webhooks Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
    })
    
    // POST /messaging-webhooks/webhook/{brokerType} - Webhook Global (identifica por token no body)
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'webhook') {
      const brokerType = pathParts[2]
      return await handleWebhookGlobal(req, supabaseClient, brokerType)
    }
    
    // POST /messaging-webhooks/webhook/{brokerType}/{accountId} - Webhook por Conta (identifica por UUID na URL)
    if (req.method === 'POST' && pathParts.length === 4 && pathParts[1] === 'webhook') {
      const brokerType = pathParts[2]
      const accountId = pathParts[3]
      return await handleWebhookByAccount(req, supabaseClient, brokerType, accountId)
    }

    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint. Use POST /webhook/{brokerType} or POST /webhook/{brokerType}/{accountId}', 404)

  } catch (error) {
    console.error('[Messaging Webhooks Edge Function Error]', error)
    
    // Tratar erros específicos
    if (error instanceof SyntaxError) {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return errorResponse('Service Unavailable: External service connection failed', 503)
    }
    
    return errorResponse('Internal Server Error', 500)
  }
})
