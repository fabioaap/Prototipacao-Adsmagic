/**
 * Edge Function para API de Links Rastreáveis
 * 
 * Router principal que gerencia todas as operações de links rastreáveis:
 * 
 * Endpoints autenticados:
 * - POST /trackable-links - Criar link
 * - GET /trackable-links - Listar links (com filtros)
 * - GET /trackable-links/:id - Obter link específico
 * - PATCH /trackable-links/:id - Atualizar link
 * - DELETE /trackable-links/:id - Deletar link
 * - GET /trackable-links/:id/stats - Estatísticas do link
 * 
 * Endpoints públicos (sem autenticação):
 * - POST /trackable-links/:id/generate-whatsapp - Gerar link WhatsApp
 * - POST /trackable-links/:id/register-access - Registrar acesso
 * 
 * @module trackable-links
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { errorResponse } from './utils/response.ts'
import { getCorsHeaders, withCorsHeaders } from './utils/cors.ts'
import { classifyRoute, getRouteParts } from './auth/classify-endpoint.ts'
import { createAuthenticatedClient, createPublicClient } from './auth/create-client.ts'
import { dispatchRequest } from './router/dispatch.ts'
import { enforcePublicRateLimit } from './utils/rate-limit.ts'

serve(async (req) => {
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID()
  const withRequestContext = (response: Response): Response => {
    const responseWithCors = withCorsHeaders(req, response)
    responseWithCors.headers.set('x-request-id', requestId)
    return responseWithCors
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    const response = new Response('ok', { headers: getCorsHeaders(req) })
    response.headers.set('x-request-id', requestId)
    return response
  }

  try {
    const url = new URL(req.url)
    const routeParts = getRouteParts(url.pathname)
    const classification = classifyRoute(req.method, routeParts)

    console.log('[Trackable Links]', {
      method: req.method,
      path: url.pathname,
      endpoint: classification.endpointKey,
      scope: classification.scope,
      requestId
    })

    if (classification.scope === 'public') {
      const publicClientResult = createPublicClient()
      if (!publicClientResult.ok) {
        return withRequestContext(publicClientResult.response)
      }

      const rateLimitResult = await enforcePublicRateLimit(
        req,
        publicClientResult.client,
        req.method,
        classification.routeParts
      )

      if (!rateLimitResult.allowed) {
        const response = errorResponse('Too Many Requests: Rate limit exceeded', 429)
        response.headers.set('Retry-After', String(rateLimitResult.retryAfterSeconds))
        return withRequestContext(response)
      }

      const response = await dispatchRequest({
        req,
        routeParts: classification.routeParts,
        supabaseClient: publicClientResult.client
      })
      return withRequestContext(response)
    }

    const authClientResult = await createAuthenticatedClient(req)
    if (!authClientResult.ok) {
      return withRequestContext(authClientResult.response)
    }

    console.log('[Trackable Links] Authenticated request', {
      endpoint: classification.endpointKey,
      userId: authClientResult.userId,
      requestId
    })

    const response = await dispatchRequest({
      req,
      routeParts: classification.routeParts,
      supabaseClient: authClientResult.client
    })
    return withRequestContext(response)

  } catch (error) {
    console.error('[Trackable Links Error]', { requestId, error })
    
    // Tratar erros específicos
    if (error instanceof SyntaxError) {
      return withRequestContext(errorResponse('Bad Request: Invalid JSON', 400))
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return withRequestContext(errorResponse('Service Unavailable: Database connection failed', 503))
    }
    
    return withRequestContext(errorResponse('Internal Server Error', 500))
  }
})
