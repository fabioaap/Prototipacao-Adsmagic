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
