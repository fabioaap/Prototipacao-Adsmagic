/**
 * Edge Function para API de Billing
 *
 * Router principal que gerencia operações de billing:
 * - GET /billing/plans - Listar planos ativos
 * - GET /billing/subscription - Obter assinatura da company do usuário
 * - POST /billing/checkout - Criar Stripe Checkout Session
 * - POST /billing/portal - Criar Stripe Customer Portal Session
 * - GET /billing/usage - Obter uso de contatos do projeto atual
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { errorResponse } from './utils/response.ts'
import { handleListPlans } from './handlers/list-plans.ts'
import { handleGetSubscription } from './handlers/get-subscription.ts'
import { handleCreateCheckout } from './handlers/create-checkout.ts'
import { handleCreatePortal } from './handlers/create-portal.ts'
import { handleGetUsage } from './handlers/get-usage.ts'
import { handleGetLimits } from './handlers/get-limits.ts'
import { handleStartTrial } from './handlers/start-trial.ts'
import { handleAddProjects } from './handlers/add-projects.ts'

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

    // Verificar token válido
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Routing
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    console.log('[billing]', {
      method: req.method,
      path: url.pathname,
      pathParts,
      userId: user.id
    })

    // Resolve sub-path: pathParts[0] = "billing", pathParts[1] = action
    const action = pathParts.length >= 2 ? pathParts[1] : pathParts[0]

    // GET /billing/plans — List active plans
    if (req.method === 'GET' && action === 'plans') {
      return await handleListPlans(req, supabaseClient)
    }

    // GET /billing/subscription — Get current subscription
    if (req.method === 'GET' && action === 'subscription') {
      return await handleGetSubscription(req, supabaseClient)
    }

    // POST /billing/checkout — Create checkout session
    if (req.method === 'POST' && action === 'checkout') {
      return await handleCreateCheckout(req, supabaseClient)
    }

    // POST /billing/portal — Create portal session
    if (req.method === 'POST' && action === 'portal') {
      return await handleCreatePortal(req, supabaseClient)
    }

    // GET /billing/usage — Get usage for current project
    if (req.method === 'GET' && action === 'usage') {
      return await handleGetUsage(req, supabaseClient)
    }

    // GET /billing/limits — Get subscription status and resource limits
    if (req.method === 'GET' && action === 'limits') {
      return await handleGetLimits(req, supabaseClient)
    }

    // POST /billing/start-trial — Start trial on chosen plan
    if (req.method === 'POST' && action === 'start-trial') {
      return await handleStartTrial(req, supabaseClient)
    }

    // POST /billing/add-projects — Add extra projects to existing subscription
    if (req.method === 'POST' && action === 'add-projects') {
      return await handleAddProjects(req, supabaseClient)
    }

    return errorResponse('Not Found: Invalid endpoint', 404)

  } catch (error) {
    console.error('[billing] Error:', error)

    if (error instanceof SyntaxError) {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return errorResponse('Service Unavailable: Database connection failed', 503)
    }

    return errorResponse('Internal Server Error', 500)
  }
})
