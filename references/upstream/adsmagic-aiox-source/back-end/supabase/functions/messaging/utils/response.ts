/**
 * Response helpers para Edge Functions
 * 
 * Funções utilitárias para padronizar respostas HTTP
 */

import { corsHeaders } from './cors.ts'

/**
 * Resposta de sucesso
 */
export function successResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json' 
    }
  })
}

/**
 * Resposta de sucesso vazia (para webhooks que requerem resposta vazia)
 * 
 * Alguns webhooks (ex: UAZAPI) requerem HTTP 2xx com resposta vazia
 * para confirmar recebimento do webhook
 * 
 * @param status - Status HTTP (padrão: 200)
 * @returns Response vazia com status 2xx
 */
export function emptySuccessResponse(status = 200): Response {
  return new Response('', {
    status,
    headers: corsHeaders,
  })
}

/**
 * Resposta de erro
 */
export function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json' 
    }
  })
}

/**
 * Resposta de validação
 */
export function validationErrorResponse(errors: string[], status = 400) {
  return new Response(JSON.stringify({ 
    error: 'Validation failed',
    details: errors 
  }), {
    status,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json' 
    }
  })
}
