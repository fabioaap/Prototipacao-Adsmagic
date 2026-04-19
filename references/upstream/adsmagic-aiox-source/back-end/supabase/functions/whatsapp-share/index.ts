/**
 * Edge Function pública para compartilhamento de QR Code do WhatsApp
 *
 * Permite que terceiros sem acesso ao sistema escaneiem o QR Code
 * via link compartilhável.
 *
 * Configurada com verify_jwt: false (público).
 * Segurança via token criptográfico de 256 bits com TTL curto.
 *
 * Rotas:
 * - GET  /whatsapp-share/:token        — Serve página HTML com QR Code
 * - GET  /whatsapp-share/:token/status  — JSON com status da conexão (polling)
 * - POST /whatsapp-share/:token/refresh — Regenera QR Code expirado
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../messaging/utils/cors.ts'
import { errorResponse } from '../messaging/utils/response.ts'
import { handleServeSharePage } from './handlers/serve-share-page.ts'
import { handleGetShareStatus } from './handlers/get-share-status.ts'
import { handleRefreshQR } from './handlers/refresh-qr.ts'

/**
 * Extrai o token do pathname, suportando ambos os formatos:
 * - /whatsapp-share/TOKEN (prefixo removido pelo gateway)
 * - /functions/v1/whatsapp-share/TOKEN (path completo)
 */
function extractToken(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  // Full gateway path: /functions/v1/whatsapp-share/TOKEN
  if (parts[0] === 'functions' && parts[1] === 'v1' && parts[2] === 'whatsapp-share') {
    return parts[3] || null
  }
  // Stripped prefix: /whatsapp-share/TOKEN
  if (parts[0] === 'whatsapp-share') {
    return parts[1] || null
  }
  return parts[0] || null
}

/**
 * Extrai o sub-path (status, refresh) do pathname
 */
function extractSubPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'functions' && parts[1] === 'v1' && parts[2] === 'whatsapp-share') {
    return parts[4] || ''
  }
  if (parts[0] === 'whatsapp-share') {
    return parts[2] || ''
  }
  return parts[1] || ''
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Service role client para bypass de RLS (endpoint público)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const baseUrl = `${url.protocol}//${url.host}/functions/v1`

    console.log('[WhatsApp Share]', {
      method: req.method,
      path: url.pathname,
    })

    // Extrair token com parsing robusto
    const token = extractToken(url.pathname)
    if (!token || token.length < 32) {
      return errorResponse('Token inválido', 400)
    }

    const subPath = extractSubPath(url.pathname)

    // GET /whatsapp-share/:token — Serve página HTML
    if (req.method === 'GET' && !subPath) {
      return await handleServeSharePage(supabaseClient, token, baseUrl)
    }

    // GET /whatsapp-share/:token/status — Status da conexão (JSON)
    if (req.method === 'GET' && subPath === 'status') {
      return await handleGetShareStatus(supabaseClient, token)
    }

    // POST /whatsapp-share/:token/refresh — Regenerar QR Code
    if (req.method === 'POST' && subPath === 'refresh') {
      return await handleRefreshQR(supabaseClient, token)
    }

    return errorResponse('Rota não encontrada', 404)
  } catch (error) {
    console.error('[WhatsApp Share] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro interno',
      500
    )
  }
})
