/**
 * Edge Function para API de Eventos de Conversão
 * 
 * Router principal que gerencia todas as operações de eventos de conversão:
 * - GET /events - Listar eventos (com filtros)
 * - GET /events/:id - Obter evento específico
 * - POST /events - Criar evento manual
 * - POST /events/:id/retry - Retentar envio de evento
 * - POST /events/:id/cancel - Cancelar evento pendente
 * 
 * Integra com plataformas de advertising: Meta, Google Ads e TikTok.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from '../../types/database.types.ts'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'
import { handleCreate } from './handlers/create.ts'
import { handleGet } from './handlers/get.ts'
import { handleList } from './handlers/list.ts'
import { handleRetry } from './handlers/retry.ts'
import { handleCancel } from './handlers/cancel.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rota pública: POST /events/track (antes do auth check)
    if (req.method === 'POST') {
      const url = new URL(req.url)
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (pathParts[pathParts.length - 1] === 'track') {
        const { handleTrack } = await import('./handlers/track.ts')
        return await handleTrack(req)
      }
    }

    // Autenticação via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Unauthorized: Missing Authorization header', 401)
    }

    // Validar formato do token
    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Invalid token format', 401)
    }

    // Cliente Supabase com JWT do usuário (RLS automático)
    const supabaseClient = createClient<Database>(
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

    // Verificar se o token é válido fazendo uma consulta simples
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('[Events Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })
    
    // POST /events/:id/retry - Retentar envio (deve vir antes de POST /events)
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'retry') {
      return await handleRetry(req, supabaseClient, pathParts[1])
    }
    
    // POST /events/:id/cancel - Cancelar evento (deve vir antes de POST /events)
    if (req.method === 'POST' && pathParts.length === 3 && pathParts[2] === 'cancel') {
      return await handleCancel(req, supabaseClient, pathParts[1])
    }
    
    // POST /events - Criar evento
    if (req.method === 'POST' && pathParts.length === 1) {
      return await handleCreate(req, supabaseClient)
    }
    
    // GET /events - Listar eventos
    if (req.method === 'GET' && pathParts.length === 1) {
      return await handleList(req, supabaseClient)
    }
    
    // GET /events/:id - Obter evento específico
    if (req.method === 'GET' && pathParts.length === 2) {
      return await handleGet(req, supabaseClient, pathParts[1])
    }
    
    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint. Use GET /events, GET /events/:id, POST /events, POST /events/:id/retry, or POST /events/:id/cancel', 404)

  } catch (error) {
    console.error('[Events Edge Function Error]', error)
    return errorResponse('Internal server error', 500)
  }
})
