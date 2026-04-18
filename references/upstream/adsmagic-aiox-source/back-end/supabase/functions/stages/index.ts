/**
 * Edge Function para API de Estágios
 * 
 * Router principal que gerencia todas as operações de estágios:
 * - GET /stages - Listar estágios (ordenados por display_order)
 * - GET /stages/:id - Obter estágio específico
 * - POST /stages - Criar estágio
 * - POST /stages/reorder - Reordenar estágios
 * - PATCH /stages/:id - Atualizar estágio
 * - DELETE /stages/:id - Deletar estágio
 * 
 * Valida unicidade de tipo 'sale' e 'lost' por projeto.
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
import { handleReorder } from './handlers/reorder.ts'

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
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('[Stages Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })
    
    // POST /stages/reorder - Reordenar estágios (deve vir antes de POST /stages)
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'reorder') {
      return await handleReorder(req, supabaseClient)
    }
    
    // POST /stages - Criar estágio
    if (req.method === 'POST' && pathParts.length === 1) {
      return await handleCreate(req, supabaseClient)
    }
    
    // GET /stages - Listar estágios
    if (req.method === 'GET' && pathParts.length === 1) {
      return await handleList(req, supabaseClient)
    }
    
    // GET /stages/:id - Obter estágio específico
    if (req.method === 'GET' && pathParts.length === 2) {
      return await handleGet(req, supabaseClient, pathParts[1])
    }
    
    // PATCH /stages/:id - Atualizar estágio
    if (req.method === 'PATCH' && pathParts.length === 2) {
      return await handleUpdate(req, supabaseClient, pathParts[1])
    }
    
    // DELETE /stages/:id - Deletar estágio
    if (req.method === 'DELETE' && pathParts.length === 2) {
      return await handleDelete(req, supabaseClient, pathParts[1])
    }

    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[Stages Edge Function Error]', error)
    
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
