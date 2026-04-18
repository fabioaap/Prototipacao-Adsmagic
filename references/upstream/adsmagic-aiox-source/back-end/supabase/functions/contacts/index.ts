/**
 * Edge Function para API de Contatos
 * 
 * Router principal que gerencia todas as operações de contatos:
 * - POST /contacts - Criar contato
 * - GET /contacts - Listar contatos (com busca full-text)
 * - GET /contacts/:id - Obter contato específico
 * - PATCH /contacts/:id - Atualizar contato
 * - DELETE /contacts/:id - Deletar contato
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'
import { handleCreate } from './handlers/create.ts'
import { handleUpdate } from './handlers/update.ts'
import { handleGet } from './handlers/get.ts'
import { handleList } from './handlers/list.ts'
import { handleDelete } from './handlers/delete.ts'
import { handleGetActivities } from './handlers/get-activities.ts'
import { handleCountActivities } from './handlers/count-activities.ts'

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
    // IMPORTANTE: O header Authorization deve ser passado para que RLS funcione corretamente
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

    // Verificar se o token é válido fazendo uma consulta simples
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('[Edge Function] Auth error:', {
        error: authError?.message,
        hasUser: !!user
      })
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    console.log('[Edge Function] Authenticated user:', {
      userId: user.id,
      email: user.email
    })

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('[Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })
    
    // POST /contacts - Criar contato
    if (req.method === 'POST' && pathParts.length === 1) {
      return await handleCreate(req, supabaseClient)
    }
    
    // GET /contacts - Listar contatos
    if (req.method === 'GET' && pathParts.length === 1) {
      return await handleList(req, supabaseClient)
    }
    
    // GET /contacts/:id/activities/count - Contar atividades do contato
    // IMPORTANTE: Verificar rotas mais específicas ANTES das genéricas
    if (req.method === 'GET' && pathParts.length === 4 && pathParts[2] === 'activities' && pathParts[3] === 'count') {
      return await handleCountActivities(req, supabaseClient, pathParts[1])
    }
    
    // GET /contacts/:id/activities - Obter atividades do contato
    // IMPORTANTE: Verificar rotas mais específicas ANTES das genéricas
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'activities') {
      return await handleGetActivities(req, supabaseClient, pathParts[1])
    }
    
    // GET /contacts/:id - Obter contato específico
    if (req.method === 'GET' && pathParts.length === 2) {
      return await handleGet(req, supabaseClient, pathParts[1])
    }
    
    // PATCH /contacts/:id - Atualizar contato
    if (req.method === 'PATCH' && pathParts.length === 2) {
      return await handleUpdate(req, supabaseClient, pathParts[1])
    }
    
    // DELETE /contacts/:id - Deletar contato
    if (req.method === 'DELETE' && pathParts.length === 2) {
      return await handleDelete(req, supabaseClient, pathParts[1])
    }

    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[Edge Function Error]', error)
    
    // Tratar erros específicos
    if (error instanceof SyntaxError) {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return errorResponse('Service Unavailable: Database connection failed', 503)
    }
    
    return errorResponse('Internal Server Error', 500)
  }
})

