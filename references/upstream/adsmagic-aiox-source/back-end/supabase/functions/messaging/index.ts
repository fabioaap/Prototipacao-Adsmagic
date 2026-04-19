/**
 * Edge Function para API de Mensageria
 * 
 * Router principal que gerencia todas as operações de mensageria autenticadas.
 * 
 * IMPORTANTE: Webhooks foram movidos para a função separada `messaging-webhooks`
 * que não requer autenticação JWT. Use a função `messaging-webhooks` para receber
 * webhooks dos brokers.
 * 
 * Endpoints disponíveis:
 * - POST /messaging/send - Envia mensagem
 * - GET /messaging/status/:accountId - Status da conta
 * - POST /messaging/sync-contacts/:accountId - Sincroniza contatos
 * - GET /messaging/brokers - Lista brokers WhatsApp disponíveis
 * - POST /messaging/configure-broker - Valida credenciais de broker (Gupshup, API Oficial)
 * - POST /messaging/instances - Cria instância WhatsApp (multi-broker) e salva no banco
 * - POST /messaging/connect/:accountId - Conecta instância ao WhatsApp (QR Code ou Pair Code via body)
 * - POST /messaging/disconnect/:accountId - Desconecta instância do WhatsApp (logout no broker + status no banco)
 * - GET /messaging/connection-status/:accountId - Verifica status de conexão detalhado
 * 
 * Nota: Endpoints GET /qrcode/:accountId e GET /paircode/:accountId foram removidos na versão 0.6.0.
 * Use POST /messaging/connect/:accountId com body vazio (QR Code) ou com phone no body (Pair Code).
 * 
 * Nota: Webhooks foram migrados para `messaging-webhooks` na versão 0.7.0.
 * Use POST /messaging-webhooks/webhook/{brokerType} ou POST /messaging-webhooks/webhook/{brokerType}/{accountId}
 * 
 * @version 0.8.0 - Adicionado diagnóstico de inicialização para resolver BOOT_ERROR 503
 */

// ============================================================================
// FASE 1: Logs de diagnóstico de inicialização
// ============================================================================
console.log('[Messaging] ========== BOOT START ==========')
console.log('[Messaging] Timestamp:', new Date().toISOString())

// ============================================================================
// FASE 2: Importações críticas (serve e CORS) - devem funcionar sempre
// ============================================================================
console.log('[Messaging] Loading core dependencies...')

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
console.log('[Messaging] ✓ serve loaded')

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
console.log('[Messaging] ✓ supabase-js loaded')

// CORS headers inline para garantir que OPTIONS sempre funcione
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-project-id, x-account-id, x-broker-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}
console.log('[Messaging] ✓ CORS headers defined')

// ============================================================================
// FASE 3: Importações de handlers (podem falhar)
// ============================================================================
console.log('[Messaging] Loading handlers...')

// Variáveis para armazenar handlers (podem ser null se importação falhar)
let handleSendMessage: typeof import('./handlers/send-message.ts').handleSendMessage | null = null
let handleGetStatus: typeof import('./handlers/get-status.ts').handleGetStatus | null = null
let handleSyncContacts: typeof import('./handlers/sync-contacts.ts').handleSyncContacts | null = null
let handleConnectionStatus: typeof import('./handlers/connection-status.ts').handleConnectionStatus | null = null
let handleCreateInstance: typeof import('./handlers/create-instance.ts').handleCreateInstance | null = null
let handleConnectInstance: typeof import('./handlers/connect-instance.ts').handleConnectInstance | null = null
let handleListWhatsAppBrokers: typeof import('./handlers/list-whatsapp-brokers.ts').handleListWhatsAppBrokers | null = null
let handleConfigureBroker: typeof import('./handlers/configure-broker.ts').handleConfigureBroker | null = null
let handleListAccounts: typeof import('./handlers/list-accounts.ts').handleListAccounts | null = null
let handleGetAccount: typeof import('./handlers/get-account.ts').handleGetAccount | null = null
let handleDisconnectInstance: typeof import('./handlers/disconnect-instance.ts').handleDisconnectInstance | null = null
let handleSaveConnectedAccount: typeof import('./handlers/save-connected-account.ts').handleSaveConnectedAccount | null = null
let handleCreateShareToken: typeof import('./handlers/create-share-token.ts').handleCreateShareToken | null = null
let handleGetConversation: typeof import('./handlers/get-conversation.ts').handleGetConversation | null = null
let errorResponse: typeof import('./utils/response.ts').errorResponse | null = null

// Flag para indicar se todos os handlers foram carregados
let handlersLoaded = false
let loadError: Error | null = null

// Carregar handlers de forma assíncrona para capturar erros
async function loadHandlers(): Promise<void> {
  try {
    console.log('[Messaging] Loading response utils...')
    const responseModule = await import('./utils/response.ts')
    errorResponse = responseModule.errorResponse
    console.log('[Messaging] ✓ response utils loaded')

    console.log('[Messaging] Loading send-message handler...')
    const sendMessageModule = await import('./handlers/send-message.ts')
    handleSendMessage = sendMessageModule.handleSendMessage
    console.log('[Messaging] ✓ send-message loaded')

    console.log('[Messaging] Loading get-status handler...')
    const getStatusModule = await import('./handlers/get-status.ts')
    handleGetStatus = getStatusModule.handleGetStatus
    console.log('[Messaging] ✓ get-status loaded')

    console.log('[Messaging] Loading sync-contacts handler...')
    const syncContactsModule = await import('./handlers/sync-contacts.ts')
    handleSyncContacts = syncContactsModule.handleSyncContacts
    console.log('[Messaging] ✓ sync-contacts loaded')

    console.log('[Messaging] Loading connection-status handler...')
    const connectionStatusModule = await import('./handlers/connection-status.ts')
    handleConnectionStatus = connectionStatusModule.handleConnectionStatus
    console.log('[Messaging] ✓ connection-status loaded')

    console.log('[Messaging] Loading create-instance handler...')
    const createInstanceModule = await import('./handlers/create-instance.ts')
    handleCreateInstance = createInstanceModule.handleCreateInstance
    console.log('[Messaging] ✓ create-instance loaded')

    console.log('[Messaging] Loading connect-instance handler...')
    const connectInstanceModule = await import('./handlers/connect-instance.ts')
    handleConnectInstance = connectInstanceModule.handleConnectInstance
    console.log('[Messaging] ✓ connect-instance loaded')

    console.log('[Messaging] Loading list-whatsapp-brokers handler...')
    const listBrokersModule = await import('./handlers/list-whatsapp-brokers.ts')
    handleListWhatsAppBrokers = listBrokersModule.handleListWhatsAppBrokers
    console.log('[Messaging] ✓ list-whatsapp-brokers loaded')

    console.log('[Messaging] Loading configure-broker handler...')
    const configureBrokerModule = await import('./handlers/configure-broker.ts')
    handleConfigureBroker = configureBrokerModule.handleConfigureBroker
    console.log('[Messaging] ✓ configure-broker loaded')

    console.log('[Messaging] Loading list-accounts handler...')
    const listAccountsModule = await import('./handlers/list-accounts.ts')
    handleListAccounts = listAccountsModule.handleListAccounts
    console.log('[Messaging] ✓ list-accounts loaded')

    console.log('[Messaging] Loading get-account handler...')
    const getAccountModule = await import('./handlers/get-account.ts')
    handleGetAccount = getAccountModule.handleGetAccount
    console.log('[Messaging] ✓ get-account loaded')

    console.log('[Messaging] Loading disconnect-instance handler...')
    const disconnectInstanceModule = await import('./handlers/disconnect-instance.ts')
    handleDisconnectInstance = disconnectInstanceModule.handleDisconnectInstance
    console.log('[Messaging] ✓ disconnect-instance loaded')

    console.log('[Messaging] Loading save-connected-account handler...')
    const saveConnectedAccountModule = await import('./handlers/save-connected-account.ts')
    handleSaveConnectedAccount = saveConnectedAccountModule.handleSaveConnectedAccount
    console.log('[Messaging] ✓ save-connected-account loaded')

    console.log('[Messaging] Loading create-share-token handler...')
    const createShareTokenModule = await import('./handlers/create-share-token.ts')
    handleCreateShareToken = createShareTokenModule.handleCreateShareToken
    console.log('[Messaging] ✓ create-share-token loaded')

    console.log('[Messaging] Loading get-conversation handler...')
    const getConversationModule = await import('./handlers/get-conversation.ts')
    handleGetConversation = getConversationModule.handleGetConversation
    console.log('[Messaging] ✓ get-conversation loaded')

    handlersLoaded = true
    console.log('[Messaging] ========== ALL HANDLERS LOADED ==========')
  } catch (error) {
    loadError = error instanceof Error ? error : new Error(String(error))
    console.error('[Messaging] ❌ HANDLER LOAD ERROR:', {
      message: loadError.message,
      stack: loadError.stack,
    })
  }
}

// Iniciar carregamento dos handlers
const handlersPromise = loadHandlers()

console.log('[Messaging] Environment check:', {
  hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
  hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
  hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
})

console.log('[Messaging] ========== BOOT COMPLETE - Starting server ==========')

// ============================================================================
// FASE 4: Servidor HTTP
// ============================================================================
serve(async (req) => {
  // CORS preflight - SEMPRE retornar 200, mesmo se handlers não carregaram
  if (req.method === 'OPTIONS') {
    console.log('[Messaging] OPTIONS request - returning CORS headers')
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Aguardar carregamento dos handlers (com timeout)
  const timeoutPromise = new Promise<void>((_, reject) => 
    setTimeout(() => reject(new Error('Handler load timeout')), 5000)
  )
  
  try {
    await Promise.race([handlersPromise, timeoutPromise])
  } catch (timeoutError) {
    console.error('[Messaging] Handler load timeout or error')
  }
  
  // Se handlers não carregaram, retornar erro 503 com detalhes
  if (!handlersLoaded) {
    console.error('[Messaging] Handlers not loaded, returning 503')
    return new Response(JSON.stringify({
      error: 'Service temporarily unavailable',
      details: loadError?.message || 'Handlers failed to load',
      timestamp: new Date().toISOString(),
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Helper local para respostas de erro (fallback se errorResponse não carregou)
  const makeErrorResponse = (message: string, status: number) => {
    if (errorResponse) {
      return errorResponse(message, status)
    }
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Autenticação via JWT obrigatória para todos os endpoints
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return makeErrorResponse('Unauthorized: Missing Authorization header', 401)
    }

    if (!authHeader.startsWith('Bearer ')) {
      return makeErrorResponse('Unauthorized: Invalid token format', 401)
    }

    // Cliente Supabase com JWT do usuário (RLS automático)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: authHeader 
          } 
        } 
      }
    )

    // Verificar se o token é válido
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return makeErrorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('[Messaging Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id,
    })
    
    // POST /messaging/send - Envia mensagem
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'send') {
      if (!handleSendMessage) return makeErrorResponse('Handler not available: send-message', 503)
      return await handleSendMessage(req, supabaseClient)
    }
    
    // GET /messaging/status/:accountId - Status da conta
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[1] === 'status') {
      if (!handleGetStatus) return makeErrorResponse('Handler not available: get-status', 503)
      return await handleGetStatus(req, supabaseClient, pathParts[2])
    }
    
    // POST /messaging/sync-contacts/:accountId - Sincroniza contatos
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'sync-contacts') {
      if (!handleSyncContacts) return makeErrorResponse('Handler not available: sync-contacts', 503)
      return await handleSyncContacts(req, supabaseClient, pathParts[2])
    }
    
    // GET /messaging/brokers - Lista brokers WhatsApp disponíveis
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'brokers') {
      if (!handleListWhatsAppBrokers) return makeErrorResponse('Handler not available: list-whatsapp-brokers', 503)
      return await handleListWhatsAppBrokers(req, supabaseClient)
    }

    // GET /messaging/accounts - Lista contas/instâncias do projeto
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] === 'accounts') {
      if (!handleListAccounts) return makeErrorResponse('Handler not available: list-accounts', 503)
      return await handleListAccounts(req, supabaseClient)
    }

    // GET /messaging/accounts/:accountId - Busca detalhes de uma conta/instância
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[1] === 'accounts') {
      if (!handleGetAccount) return makeErrorResponse('Handler not available: get-account', 503)
      return await handleGetAccount(req, supabaseClient, pathParts[2])
    }
    
    // POST /messaging/configure-broker - Valida credenciais de broker
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'configure-broker') {
      if (!handleConfigureBroker) return makeErrorResponse('Handler not available: configure-broker', 503)
      return await handleConfigureBroker(req, supabaseClient)
    }

    // POST /messaging/save-connected-account - Salva conta conectada via webhook (API Oficial)
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'save-connected-account') {
      if (!handleSaveConnectedAccount) return makeErrorResponse('Handler not available: save-connected-account', 503)
      return await handleSaveConnectedAccount(req, supabaseClient)
    }
    
    // GET /messaging/connection-status/:accountId - Verifica status de conexão detalhado
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[1] === 'connection-status') {
      if (!handleConnectionStatus) return makeErrorResponse('Handler not available: connection-status', 503)
      return await handleConnectionStatus(req, supabaseClient, pathParts[2])
    }
    
    // POST /messaging/instances - Cria instância WhatsApp (multi-broker) e salva no banco
    // Rota genérica que aceita brokerId no body (corrige violação OCP)
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'instances') {
      if (!handleCreateInstance) return makeErrorResponse('Handler not available: create-instance', 503)
      return await handleCreateInstance(req, supabaseClient)
    }
    
    // POST /messaging/disconnect/:accountId - Desconecta instância do WhatsApp
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'disconnect') {
      if (!handleDisconnectInstance) return makeErrorResponse('Handler not available: disconnect-instance', 503)
      return await handleDisconnectInstance(req, supabaseClient, pathParts[2])
    }

    // POST /messaging/connect/:accountId - Conecta instância ao WhatsApp (QR Code ou Pair Code)
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'connect') {
      if (!handleConnectInstance) return makeErrorResponse('Handler not available: connect-instance', 503)
      return await handleConnectInstance(req, supabaseClient, pathParts[2])
    }

    // POST /messaging/share/:accountId - Cria token de compartilhamento de QR Code
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[1] === 'share') {
      if (!handleCreateShareToken) return makeErrorResponse('Handler not available: create-share-token', 503)
      return await handleCreateShareToken(req, supabaseClient, pathParts[2])
    }

    // GET /messaging/conversations/:contactId - Histórico de conversas de um contato
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[1] === 'conversations') {
      if (!handleGetConversation) return makeErrorResponse('Handler not available: get-conversation', 503)
      return await handleGetConversation(req, supabaseClient, pathParts[2])
    }

    // Rota não encontrada
    return makeErrorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[Messaging Edge Function Error]', error)
    
    // Tratar erros específicos
    if (error instanceof SyntaxError) {
      return makeErrorResponse('Bad Request: Invalid JSON', 400)
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return makeErrorResponse('Service Unavailable: External service connection failed', 503)
    }
    
    return makeErrorResponse('Internal Server Error', 500)
  }
})
