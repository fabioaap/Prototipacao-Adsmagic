/**
 * Response helpers para Edge Functions
 */

import { corsHeaders } from './cors.ts'

export function successResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
}

export function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
}

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
