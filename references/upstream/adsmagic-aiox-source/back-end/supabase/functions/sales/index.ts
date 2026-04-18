/**
 * Edge Function para API de Sales
 * 
 * Router principal que gerencia todas as operações de vendas:
 * - POST /sales - Criar venda
 * - GET /sales - Listar vendas (com filtros e paginação)
 * - GET /sales/:id - Obter venda específica
 * - PATCH /sales/:id - Atualizar venda
 * - PATCH /sales/:id/lost - Marcar como perdida
 * - PATCH /sales/:id/recover - Recuperar venda perdida
 * - DELETE /sales/:id - Deletar venda
 * 
 * Segue o mesmo padrão arquitetural de contacts/index.ts
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
import { handleMarkLost, handleRecoverSale } from './handlers/mark-lost.ts'

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

    const token = authHeader.slice(7).trim()
    const serviceRoleKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '').trim()
    const isInternalCall = serviceRoleKey.length > 0 && token === serviceRoleKey

    if (isInternalCall) {
      // Chamada interna (ex.: Edge Function contacts criando venda automática).
      // Aceita apenas POST /sales. Path pode ser /sales ou /functions/v1/sales.
      const url = new URL(req.url)
      const pathParts = url.pathname.split('/').filter(Boolean)
      const isPostSales = req.method === 'POST' && pathParts[pathParts.length - 1] === 'sales'
      if (isPostSales) {
        const supabaseServiceClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          serviceRoleKey,
          { auth: { persistSession: false } }
        )
        return await handleCreate(req, supabaseServiceClient, { isInternalCall: true })
      }
      return errorResponse('Forbidden: Internal calls only allowed for POST /sales', 403)
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

    // Routing (path pode ser /sales ou /functions/v1/sales)
    const url = new URL(req.url)
    const rawParts = url.pathname.split('/').filter(Boolean)
    const pathParts = rawParts[0] === 'functions' && rawParts[1] === 'v1'
      ? rawParts.slice(2)
      : rawParts

    console.log('[Sales Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })

    // POST /sales - Criar venda
    if (req.method === 'POST' && pathParts.length === 1 && pathParts[0] === 'sales') {
      return await handleCreate(req, supabaseClient)
    }

    // GET /sales - Listar vendas
    if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'sales') {
      return await handleList(req, supabaseClient)
    }

    // GET /sales/:id - Obter venda específica
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[0] === 'sales') {
      return await handleGet(req, supabaseClient, pathParts[1])
    }

    // PATCH /sales/:id/lost - Marcar como perdida
    if (req.method === 'PATCH' && pathParts.length === 3 && pathParts[0] === 'sales' && pathParts[2] === 'lost') {
      return await handleMarkLost(req, supabaseClient, pathParts[1])
    }

    // PATCH /sales/:id/recover - Recuperar venda perdida
    if (req.method === 'PATCH' && pathParts.length === 3 && pathParts[0] === 'sales' && pathParts[2] === 'recover') {
      return await handleRecoverSale(req, supabaseClient, pathParts[1])
    }

    // PATCH /sales/:id - Atualizar venda
    if (req.method === 'PATCH' && pathParts.length === 2 && pathParts[0] === 'sales') {
      return await handleUpdate(req, supabaseClient, pathParts[1])
    }

    // DELETE /sales/:id - Deletar venda
    if (req.method === 'DELETE' && pathParts.length === 2 && pathParts[0] === 'sales') {
      return await handleDelete(req, supabaseClient, pathParts[1])
    }

    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[Sales Edge Function Error]', error)
    
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
