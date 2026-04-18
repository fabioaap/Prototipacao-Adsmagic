/**
 * CORS headers para Edge Functions
 *
 * Configuracao de CORS para permitir requisicoes do frontend
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-project-id',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}
