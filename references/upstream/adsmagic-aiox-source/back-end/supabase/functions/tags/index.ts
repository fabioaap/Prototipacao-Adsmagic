/**
 * Edge Function para API de Tags
 * 
 * Router principal que gerencia todas as operações de tags:
 * - GET /tags - Listar tags por projeto
 * - GET /tags/:id - Obter tag específica
 * - POST /tags - Criar tag
 * - PATCH /tags/:id - Atualizar tag
 * - DELETE /tags/:id - Deletar tag
 * - POST /contacts/:contactId/tags - Adicionar tag a contato
 * - DELETE /contacts/:contactId/tags/:tagId - Remover tag de contato
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
import { handleAddTagToContact } from './handlers/addTagToContact.ts'
import { handleRemoveTagFromContact } from './handlers/removeTagFromContact.ts'

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
    
    console.log('[Tags Edge Function]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })
    
    // POST /tags - Criar tag
    if (req.method === 'POST' && pathParts.length === 1 && pathParts[0] === 'tags') {
      return await handleCreate(req, supabaseClient)
    }
    
    // GET /tags - Listar tags
    if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'tags') {
      return await handleList(req, supabaseClient)
    }
    
    // GET /tags/:id - Obter tag específica
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[0] === 'tags') {
      return await handleGet(req, supabaseClient, pathParts[1])
    }
    
    // PATCH /tags/:id - Atualizar tag
    if (req.method === 'PATCH' && pathParts.length === 2 && pathParts[0] === 'tags') {
      return await handleUpdate(req, supabaseClient, pathParts[1])
    }
    
    // DELETE /tags/:id - Deletar tag
    if (req.method === 'DELETE' && pathParts.length === 2 && pathParts[0] === 'tags') {
      return await handleDelete(req, supabaseClient, pathParts[1])
    }
    
    // POST /contacts/:contactId/tags - Adicionar tag a contato
    if (req.method === 'POST' && 
        pathParts.length === 3 && 
        pathParts[0] === 'contacts' && 
        pathParts[2] === 'tags') {
      return await handleAddTagToContact(req, supabaseClient, pathParts[1])
    }
    
    // DELETE /contacts/:contactId/tags/:tagId - Remover tag de contato
    if (req.method === 'DELETE' && 
        pathParts.length === 4 && 
        pathParts[0] === 'contacts' && 
        pathParts[2] === 'tags') {
      return await handleRemoveTagFromContact(req, supabaseClient, pathParts[1], pathParts[3])
    }

    // Rota não encontrada
    return errorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[Tags Edge Function Error]', error)
    
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
