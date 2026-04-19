/**
 * Handler para conectar instância ao WhatsApp (POST com phone no body)
 * POST /messaging/connect/:accountId
 * 
 * Conforme documentação UAZAPI:
 * - Sem phone no body: gera QR Code (timeout 2 minutos)
 * - Com phone no body: gera Pair Code (timeout 5 minutos)
 * 
 * Refatorado para usar helpers compartilhados (ETAPA 2 da refatoração).
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import {
  validateAccountAccess,
  validateBrokerSupportsConnection,
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection
} from '../utils/connection-helpers.ts'
import { QR_CODE_TIMEOUT_MS, PAIR_CODE_TIMEOUT_MS } from '../constants/connection.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import type { SupabaseDbClient } from '../types-db.ts'

// Schema de validação
const connectSchema = z.object({
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
      { message: 'Formato de telefone inválido. Use formato internacional (ex: +5511999999999)' }
    ), // Opcional - se não passar, gera QR Code; se passar, gera Pair Code
})

export async function handleConnectInstance(
  req: Request,
  supabaseClient: SupabaseDbClient,
  accountId: string
) {
  try {
    // Buscar conta
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(accountId)
    
    // Validar acesso à conta usando helper compartilhado
    const accessValidation = await validateAccountAccess(supabaseClient, account)
    if (!accessValidation.valid) {
      const statusCode = accessValidation.error === 'Authentication required' ? 401 :
                        accessValidation.error === 'Conta não encontrada' ? 404 : 403
      return errorResponse(accessValidation.error || 'Acesso negado', statusCode)
    }
    
    // Validar se broker suporta conexão usando helper compartilhado
    const brokerValidation = validateBrokerSupportsConnection(account!.broker_type)
    if (!brokerValidation.valid) {
      return errorResponse(brokerValidation.error || 'Broker não suporta conexão', 400)
    }
    
    // Parse e validação do body
    let body: { phone?: string } = {}
    try {
      const rawBody = await req.text()
      if (rawBody) {
        body = JSON.parse(rawBody)
      }
    } catch {
      // Body vazio é permitido (gera QR Code)
    }
    
    const validationResult = connectSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      return validationErrorResponse(errors, 400)
    }
    
    const { phone } = validationResult.data
    
    // Extrair configuração do broker usando helper compartilhado
    const connectionConfigResult = extractBrokerConnectionConfig(account!)
    if (!connectionConfigResult.config) {
      return errorResponse(connectionConfigResult.error || 'Erro ao extrair configuração do broker', 400)
    }
    
    // Criar configuração completa do broker usando helper compartilhado
    const brokerConfig = createBrokerConfigForConnection(account!, connectionConfigResult.config)
    
    const broker = WhatsAppBrokerFactory.create(
      account!.broker_type,
      brokerConfig,
      accountId
    )
    
    // Verificar status da conexão primeiro
    // Se já estiver conectada, retornar sucesso com dados da conta
    const connectionStatus = await broker.getConnectionStatus()
    
    if (connectionStatus.connected) {
      // Já está conectada - obter informações da conta
      let accountInfo
      try {
        accountInfo = await broker.getAccountInfo()
      } catch (error) {
        console.warn('[Connect Instance Handler] Could not get account info:', error)
        accountInfo = {
          phoneNumber: account!.account_identifier || '',
          name: account!.account_name || '',
          status: 'active',
        }
      }
      
      // Retornar sucesso com dados da conta conectada
      return successResponse({
        success: true,
        type: 'connected',
        data: {
          status: 'connected',
          phoneNumber: accountInfo.phoneNumber,
          profileName: accountInfo.name,
          instanceId: connectionConfigResult.config.instanceId || accountId,
        },
        message: 'Instância já está conectada',
      }, 200)
    }
    
    // Não está conectada - verificar se broker suporta geração de QR Code
    if (!('generateQRCode' in broker) || typeof (broker as any).generateQRCode !== 'function') {
      return errorResponse('Broker não suporta geração de QR Code/Pair Code', 400)
    }
    
    // Conectar instância (gera QR Code ou Pair Code conforme phone)
    let result: { type: 'qrcode' | 'paircode'; qrCode?: string; code?: string; expiresAt: Date; instanceId: string }
    try {
      result = await (broker as any).generateQRCode(phone)
    } catch (genError) {
      const errMsg = genError instanceof Error ? genError.message : String(genError)
      console.warn('[Connect Instance Handler] generateQRCode failed:', errMsg)
      // Se UAZAPI falha por "já conectado" / "logged in" / sem QR, retornar connected com dados da conta
      const alreadyConnected =
        /já conectad|already connected|logged in|loggedIn|instance.*connected|already.*logged/i.test(errMsg) ||
        /QR Code não foi retornado|qrcode.*not.*returned/i.test(errMsg) ||
        /HTTP 40[0-9].*connected|HTTP 409/i.test(errMsg)
      if (alreadyConnected) {
        console.log('[Connect Instance Handler] Tratando como já conectado após falha em generateQRCode')
        return successResponse({
          success: true,
          type: 'connected',
          data: {
            status: 'connected',
            phoneNumber: account!.account_identifier || '',
            profileName: account!.account_name || undefined,
            instanceId: connectionConfigResult.config.instanceId || accountId,
          },
          message: 'Instância já está conectada',
        }, 200)
      }
      throw genError
    }
    
    // Atualizar status da conta para "connecting"
    await supabaseClient
      .from('messaging_accounts')
      .update({ status: 'connecting' })
      .eq('id', accountId)
    
    // Retornar resposta apropriada baseada no tipo
    if (result.type === 'paircode') {
      const timeoutMinutes = Math.floor(PAIR_CODE_TIMEOUT_MS / (60 * 1000))
      return successResponse({
        success: true,
        type: 'paircode',
        data: {
          code: result.code,
          expiresAt: result.expiresAt.toISOString(),
          instanceId: result.instanceId,
          phone: phone || account!.account_identifier,
        },
        message: `Use este código no WhatsApp: Configurações > Aparelhos conectados > Conectar um aparelho (expira em ${timeoutMinutes} minutos)`,
      }, 200)
    } else {
      const timeoutMinutes = Math.floor(QR_CODE_TIMEOUT_MS / (60 * 1000))
      return successResponse({
        success: true,
        type: 'qrcode',
        data: {
          qrCode: result.qrCode,
          expiresAt: result.expiresAt.toISOString(),
          instanceId: result.instanceId,
        },
        message: `Escaneie o QR Code com seu WhatsApp para conectar (expira em ${timeoutMinutes} minutos)`,
      }, 200)
    }
    
  } catch (error) {
    console.error('[Connect Instance Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao conectar instância',
      500
    )
  }
}

