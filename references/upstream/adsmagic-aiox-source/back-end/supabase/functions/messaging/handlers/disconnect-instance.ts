/**
 * Handler para desconectar instância WhatsApp
 * POST /messaging/disconnect/:accountId
 *
 * Faz logout no broker (UAZAPI) e atualiza status para 'disconnected' no banco.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import {
  validateAccountAccess,
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection,
} from '../utils/connection-helpers.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleDisconnectInstance(
  _req: Request,
  supabaseClient: SupabaseDbClient,
  accountId: string
) {
  try {
    // Buscar conta
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(accountId)

    // Validar acesso à conta
    const accessValidation = await validateAccountAccess(supabaseClient, account)
    if (!accessValidation.valid) {
      const statusCode = accessValidation.error === 'Authentication required' ? 401 :
                        accessValidation.error === 'Conta não encontrada' ? 404 : 403
      return errorResponse(accessValidation.error || 'Acesso negado', statusCode)
    }

    // Tentar logout no broker
    const connectionConfigResult = extractBrokerConnectionConfig(account!)
    if (connectionConfigResult.config) {
      try {
        const brokerConfig = createBrokerConfigForConnection(account!, connectionConfigResult.config)
        const broker = WhatsAppBrokerFactory.create(
          account!.broker_type,
          brokerConfig,
          accountId
        )

        if ('disconnect' in broker && typeof (broker as any).disconnect === 'function') {
          await (broker as any).disconnect()
          console.log('[Disconnect Instance] Broker logout successful for', accountId)
        }
      } catch (brokerError) {
        // Não bloquear disconnect se broker falhar — atualizar status mesmo assim
        console.warn('[Disconnect Instance] Broker logout failed (proceeding):', brokerError)
      }
    }

    // Atualizar status no banco
    const { error: updateError } = await supabaseClient
      .from('messaging_accounts')
      .update({ status: 'disconnected' })
      .eq('id', accountId)

    if (updateError) {
      console.error('[Disconnect Instance] DB update error:', updateError)
      return errorResponse('Erro ao atualizar status no banco', 500)
    }

    return successResponse({
      success: true,
      message: 'Instância desconectada com sucesso',
    })
  } catch (error) {
    console.error('[Disconnect Instance] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao desconectar instância',
      500
    )
  }
}
