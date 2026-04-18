/**
 * Get Accounts Handler
 * Returns saved accounts for an integration
 * 
 * ✅ Conformidade:
 * - SRP: Apenas busca contas
 * - Type-safe: Tipos explícitos
 * - Error handling: Try-catch específico
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

export interface GetAccountsResponse {
  accounts: Array<{
    id: string
    account_name: string
    external_account_id: string
    external_account_name: string
    pixel_id?: string
    is_primary: boolean
    status: string
    account_metadata?: Record<string, unknown>
  }>
}

/**
 * Handle get accounts request
 * Returns saved accounts for an integration
 */
export async function handleGetAccounts(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Get Accounts] Processing for integration:', integrationId)

    // ✅ Autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('[Get Accounts] Auth error:', authError)
      return errorResponse('Unauthorized', 401)
    }

    // ✅ Validação: Project ID
    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    // ✅ Service role client
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // ✅ Verificar integração existe e pertence ao projeto
    const integrationRepo = new SupabaseIntegrationRepository()
    const integration = await integrationRepo.findById(integrationId, supabaseAdmin)

    if (!integration) {
      return errorResponse('Integration not found', 404)
    }

    if (integration.project_id !== projectId) {
      return errorResponse('Integration does not belong to this project', 403)
    }

    // ✅ Buscar contas (usando repository - SRP)
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)

    // ✅ Mapear resposta (apenas campos necessários - segurança)
    const response: GetAccountsResponse = {
      accounts: accounts.map(acc => ({
        id: acc.id,
        account_name: acc.account_name,
        external_account_id: acc.external_account_id,
        external_account_name: acc.external_account_name,
        pixel_id: acc.pixel_id, // ✅ NOVO: Pixel ID por conta
        is_primary: acc.is_primary,
        status: acc.status,
        account_metadata: acc.account_metadata || {},
      })),
    }

    console.log('[Get Accounts] Success:', {
      integrationId,
      accountsCount: response.accounts.length,
    })

    return successResponse(response)
  } catch (error) {
    console.error('[Get Accounts] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get accounts',
      500
    )
  }
}
