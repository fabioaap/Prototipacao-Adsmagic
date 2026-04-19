/**
 * Handler para regenerar QR Code via token de compartilhamento
 * POST /whatsapp-share/:token/refresh
 *
 * Endpoint público que permite ao destinatário gerar um novo QR Code
 * quando o anterior expira.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { WhatsAppBrokerFactory } from '../../messaging/brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../../messaging/repositories/MessagingAccountRepository.ts'
import {
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection
} from '../../messaging/utils/connection-helpers.ts'
import { successResponse, errorResponse } from '../../messaging/utils/response.ts'

export async function handleRefreshQR(
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

  if (shareToken.status === 'connected') {
    return successResponse({ status: 'connected' })
  }

  if (shareToken.status === 'revoked') {
    return errorResponse('Token revogado', 410)
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

  // Criar broker e gerar novo QR
  const brokerConfig = createBrokerConfigForConnection(account, connectionConfigResult.config)
  const broker = WhatsAppBrokerFactory.create(
    account.broker_type,
    brokerConfig,
    account.id
  )

  try {
    // Verificar se já está conectado
    const connectionStatus = await broker.getConnectionStatus()
    if (connectionStatus.connected) {
      await supabaseClient
        .from('whatsapp_share_tokens')
        .update({ status: 'connected' })
        .eq('id', shareToken.id)
      return successResponse({ status: 'connected' })
    }

    // Gerar novo QR Code
    if (!('generateQRCode' in broker) || typeof (broker as any).generateQRCode !== 'function') {
      return errorResponse('Broker não suporta geração de QR Code', 400)
    }

    const result = await (broker as any).generateQRCode()
    const newQrCode = result.qrCode || ''
    const newExpiresAt = result.expiresAt instanceof Date
      ? result.expiresAt.toISOString()
      : new Date(Date.now() + 2 * 60 * 1000).toISOString()

    // Atualizar token no banco com novo QR e expiração
    await supabaseClient
      .from('whatsapp_share_tokens')
      .update({
        qr_code: newQrCode,
        expires_at: newExpiresAt,
        status: 'active',
      })
      .eq('id', shareToken.id)

    // Atualizar status da conta para 'connecting'
    await supabaseClient
      .from('messaging_accounts')
      .update({ status: 'connecting' })
      .eq('id', account.id)

    return successResponse({
      qrCode: newQrCode,
      expiresAt: newExpiresAt,
    })
  } catch (err) {
    console.error('[Refresh QR] Erro ao regenerar QR:', err)
    return errorResponse(
      err instanceof Error ? err.message : 'Erro ao gerar novo QR Code',
      500
    )
  }
}
