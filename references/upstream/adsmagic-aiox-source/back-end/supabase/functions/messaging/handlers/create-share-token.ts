/**
 * Handler para criar token de compartilhamento de QR Code
 * POST /messaging/share/:accountId
 *
 * Gera um token criptográfico e cacheia o QR Code atual para que
 * terceiros possam escanear via link público.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import {
  validateAccountAccess,
  validateBrokerSupportsConnection,
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection
} from '../utils/connection-helpers.ts'
import { QR_CODE_TIMEOUT_MS } from '../constants/connection.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Gera token hex de 64 caracteres (32 bytes = 256 bits de entropia)
 */
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function handleCreateShareToken(
  req: Request,
  supabaseClient: SupabaseDbClient,
  accountId: string
): Promise<Response> {
  try {
    // Buscar conta
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(accountId)

    // Validar acesso
    const accessValidation = await validateAccountAccess(supabaseClient, account)
    if (!accessValidation.valid || !account) {
      const statusCode = accessValidation.error === 'Authentication required' ? 401
        : accessValidation.error === 'Conta não encontrada' ? 404 : 403
      return errorResponse(accessValidation.error || 'Acesso negado', statusCode)
    }

    // Validar broker
    const brokerValidation = validateBrokerSupportsConnection(account.broker_type)
    if (!brokerValidation.valid) {
      return errorResponse(brokerValidation.error || 'Broker não suporta conexão', 400)
    }

    // Extrair configuração do broker
    const connectionConfigResult = extractBrokerConnectionConfig(account)
    if (!connectionConfigResult.config) {
      return errorResponse(connectionConfigResult.error || 'Configuração do broker incompleta', 400)
    }

    // Criar broker
    const brokerConfig = createBrokerConfigForConnection(account, connectionConfigResult.config)
    const broker = WhatsAppBrokerFactory.create(
      account.broker_type,
      brokerConfig,
      accountId
    )

    // Tentar obter QR Code atual ou gerar novo
    let qrCode = ''
    let expiresAt = new Date(Date.now() + QR_CODE_TIMEOUT_MS)

    // Verificar se já está conectado
    const connectionStatus = await broker.getConnectionStatus()
    if (connectionStatus.connected) {
      return errorResponse('WhatsApp já está conectado. Não é necessário compartilhar QR Code.', 400)
    }

    // Gerar QR Code
    if ('generateQRCode' in broker && typeof (broker as any).generateQRCode === 'function') {
      try {
        const result = await (broker as any).generateQRCode()
        qrCode = result.qrCode || ''
        if (result.expiresAt instanceof Date) {
          expiresAt = result.expiresAt
        }

        // Atualizar status da conta para 'connecting'
        await supabaseClient
          .from('messaging_accounts')
          .update({ status: 'connecting' })
          .eq('id', accountId)
      } catch (genError) {
        console.error('[Create Share Token] Erro ao gerar QR:', genError)
        return errorResponse('Não foi possível gerar o QR Code', 500)
      }
    } else {
      return errorResponse('Broker não suporta geração de QR Code', 400)
    }

    if (!qrCode) {
      return errorResponse('QR Code vazio retornado pelo broker', 500)
    }

    // Gerar token
    const token = generateToken()

    // Usar service role client para inserção (bypass RLS em endpoint autenticado)
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Inserir token no banco
    const { error: insertError } = await serviceClient
      .from('whatsapp_share_tokens')
      .insert({
        token,
        messaging_account_id: accountId,
        project_id: account.project_id,
        created_by: accessValidation.user!.id,
        qr_code: qrCode,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })

    if (insertError) {
      console.error('[Create Share Token] Erro ao inserir token:', insertError)
      return errorResponse('Erro ao criar link de compartilhamento', 500)
    }

    // Construir URL de compartilhamento
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const shareUrl = `${supabaseUrl}/functions/v1/whatsapp-share/${token}`

    return successResponse({
      shareUrl,
      token,
      expiresAt: expiresAt.toISOString(),
    }, 201)
  } catch (error) {
    console.error('[Create Share Token] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro ao criar token de compartilhamento',
      500
    )
  }
}
