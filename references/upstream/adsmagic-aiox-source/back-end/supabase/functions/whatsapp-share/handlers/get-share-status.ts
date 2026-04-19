/**
 * Handler para verificar status da conexão via token de compartilhamento
 * GET /whatsapp-share/:token/status
 *
 * Endpoint público (sem JWT) que consulta o broker para verificar se
 * o WhatsApp foi conectado. Usado pelo polling da página compartilhada.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { WhatsAppBrokerFactory } from '../../messaging/brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../../messaging/repositories/MessagingAccountRepository.ts'
import {
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection
} from '../../messaging/utils/connection-helpers.ts'
import { successResponse, errorResponse } from '../../messaging/utils/response.ts'

export async function handleGetShareStatus(
  supabaseClient: SupabaseClient,
  token: string
): Promise<Response> {
  // Buscar token
  const { data: shareToken, error } = await supabaseClient
    .from('whatsapp_share_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !shareToken) {
    return errorResponse('Token inválido', 404)
  }

  // Token já conectado
  if (shareToken.status === 'connected') {
    return successResponse({ status: 'connected' })
  }

  // Token revogado
  if (shareToken.status === 'revoked') {
    return errorResponse('Token revogado', 410)
  }

  // Verificar expiração
  const now = new Date()
  const expiresAt = new Date(shareToken.expires_at)

  if (now > expiresAt || shareToken.status === 'expired') {
    if (shareToken.status !== 'expired') {
      await supabaseClient
        .from('whatsapp_share_tokens')
        .update({ status: 'expired' })
        .eq('id', shareToken.id)
    }
    return errorResponse('Token expirado', 410)
  }

  // Buscar conta de mensageria
  const accountRepo = new MessagingAccountRepository(supabaseClient)
  const account = await accountRepo.findById(shareToken.messaging_account_id)

  if (!account) {
    return errorResponse('Conta não encontrada', 404)
  }

  // Extrair configuração do broker
  const connectionConfigResult = extractBrokerConnectionConfig(account)
  if (!connectionConfigResult.config) {
    return errorResponse('Configuração do broker incompleta', 500)
  }

  // Criar broker e verificar status
  const brokerConfig = createBrokerConfigForConnection(account, connectionConfigResult.config)
  const broker = WhatsAppBrokerFactory.create(
    account.broker_type,
    brokerConfig,
    account.id
  )

  try {
    const connectionStatus = await broker.getConnectionStatus()

    if (connectionStatus.connected) {
      // Atualizar token e conta
      await supabaseClient
        .from('whatsapp_share_tokens')
        .update({ status: 'connected' })
        .eq('id', shareToken.id)

      if (account.status !== 'active') {
        let accountInfo = { phoneNumber: account.account_identifier || '', name: account.account_name || '' }
        try {
          accountInfo = await broker.getAccountInfo()
        } catch { /* fallback to DB data */ }

        await supabaseClient
          .from('messaging_accounts')
          .update({
            status: 'active',
            account_identifier: accountInfo.phoneNumber || account.account_identifier,
            account_name: accountInfo.name || account.account_name,
          })
          .eq('id', account.id)
      }

      return successResponse({ status: 'connected' })
    }

    return successResponse({ status: 'waiting' })
  } catch (err) {
    console.error('[Share Status] Erro ao verificar status do broker:', err)
    return successResponse({ status: 'waiting' })
  }
}
