/**
 * Handler para obter detalhes de uma conta/instância específica
 * GET /messaging/accounts/:accountId
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import { validateAccountAccess } from '../utils/connection-helpers.ts'
import type { SupabaseDbClient } from '../types-db.ts'

function mapAccountStatus(status: string): 'connected' | 'connecting' | 'disconnected' {
  if (status === 'active') return 'connected'
  if (status === 'connecting') return 'connecting'
  return 'disconnected'
}

function parsePhoneNumber(accountIdentifier: string | null): string {
  if (!accountIdentifier || accountIdentifier.startsWith('instance-')) return ''
  const digitsOnly = accountIdentifier.replace(/[^\d]/g, '')
  return digitsOnly.length >= 8 ? digitsOnly : ''
}

export async function handleGetAccount(
  _req: Request,
  supabaseClient: SupabaseDbClient,
  accountId: string
) {
  try {
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(accountId)

    const accessValidation = await validateAccountAccess(supabaseClient, account)
    if (!accessValidation.valid || !account) {
      const statusCode = accessValidation.error === 'Authentication required' ? 401 :
        accessValidation.error === 'Conta não encontrada' ? 404 : 403
      return errorResponse(accessValidation.error || 'Acesso negado', statusCode)
    }

    const brokerConfig = account.broker_config || {}

    return successResponse({
      account_id: account.id,
      phone_number: parsePhoneNumber(account.account_identifier),
      profile_name: account.account_name || undefined,
      broker_type: account.broker_type,
      status: mapAccountStatus(account.status),
      profile_photo: undefined,
      connected_at: account.updated_at,
      instance_id: typeof brokerConfig.instanceId === 'string' ? brokerConfig.instanceId : undefined,
      instance_name: typeof brokerConfig.instanceName === 'string' ? brokerConfig.instanceName : undefined,
    }, 200)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Erro ao buscar conta',
      500
    )
  }
}

