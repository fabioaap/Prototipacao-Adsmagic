/**
 * Handler para verificar status de conexão detalhado
 * GET /messaging/connection-status/:accountId
 * 
 * Refatorado para usar helpers compartilhados (corrige violações SRP e DRY).
 * Elimina lógica específica de UAZAPI misturada no handler.
 * Delega validação para broker via validateConfiguration().
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import {
  validateAccountAccess,
  extractBrokerConnectionConfig,
  createBrokerConfigForConnection
} from '../utils/connection-helpers.ts'
import type { 
  ConnectionStatusResponse,
  ConnectionStatus as BrokerConnectionStatus,
  AccountInfo
} from '../types.ts'

/**
 * Obtém informações da conta com fallback para dados do banco
 * Segue SRP: responsabilidade única de obter account info
 */
async function getAccountInfoWithFallback(
  broker: ReturnType<typeof WhatsAppBrokerFactory.create>,
  account: NonNullable<Awaited<ReturnType<MessagingAccountRepository['findById']>>>
): Promise<AccountInfo> {
  try {
    return await broker.getAccountInfo()
  } catch (error) {
    console.warn('[Connection Status Handler] Could not get account info from broker, using fallback:', error)
    return {
      phoneNumber: account.account_identifier || '',
      name: account.account_name || '',
      status: account.status,
    }
  }
}

/**
 * Determina o status da conexão baseado no status do broker e da conta
 * Segue SRP: responsabilidade única de determinar status
 * Prioridade: connected > timeout > connecting > disconnected
 */
function determineConnectionStatus(
  connectionStatus: BrokerConnectionStatus,
  accountStatus: string
): 'connected' | 'disconnected' | 'connecting' | 'timeout' {
  // Prioridade 1: Se broker indica conectado, sempre retornar connected
  if (connectionStatus.connected) {
    return 'connected'
  }
  
  // Prioridade 2: Verificar timeout antes de connecting
  if (connectionStatus.error?.includes('expirada') || connectionStatus.error?.includes('timeout')) {
    return 'timeout'
  }
  
  // Prioridade 3: Se conta está em connecting, manter como connecting
  if (accountStatus === 'connecting') {
    return 'connecting'
  }
  
  // Prioridade 4: Default para disconnected
  return 'disconnected'
}

/**
 * Atualiza o status da conta no banco quando conectado
 * Segue SRP: responsabilidade única de atualizar status no banco
 */
async function updateAccountStatusWhenConnected(
  supabaseClient: SupabaseDbClient,
  accountId: string,
  accountInfo: AccountInfo,
  account: NonNullable<Awaited<ReturnType<MessagingAccountRepository['findById']>>>
): Promise<void> {
  const updateResult = await supabaseClient
    .from('messaging_accounts')
    .update({ 
      status: 'active',
      account_identifier: accountInfo.phoneNumber || account.account_identifier,
      account_name: accountInfo.name || account.account_name,
    })
    .eq('id', accountId)
    .select()
  
  if (updateResult.error) {
    console.error('[Connection Status Handler] Erro ao atualizar status da conta:', updateResult.error)
    throw new Error(`Falha ao atualizar status da conta: ${updateResult.error.message}`)
  }
}

export async function handleConnectionStatus(
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
    if (!accessValidation.valid || !account) {
      const statusCode = accessValidation.error === 'Authentication required' ? 401 :
                        accessValidation.error === 'Conta não encontrada' ? 404 : 403
      return errorResponse(accessValidation.error || 'Acesso negado', statusCode)
    }
    
    // Extrair configuração do broker usando helper compartilhado
    const connectionConfigResult = extractBrokerConnectionConfig(account)
    if (!connectionConfigResult.config) {
      return errorResponse(connectionConfigResult.error || 'Erro ao extrair configuração do broker', 400)
    }
    
    // Criar configuração completa do broker usando helper compartilhado
    const brokerConfig = createBrokerConfigForConnection(account!, connectionConfigResult.config)
    
    // Criar broker usando Factory
    const broker = WhatsAppBrokerFactory.create(
      account.broker_type,
      brokerConfig,
      accountId
    )
    
    // Obter status de conexão
    const connectionStatus = await broker.getConnectionStatus()
    
    console.log('[Connection Status Handler] Connection status from broker:', {
      accountId,
      connected: connectionStatus.connected,
      error: connectionStatus.error,
      currentAccountStatus: account.status,
    })
    
    // Obter informações da conta (número de telefone, etc.)
    const accountInfo = await getAccountInfoWithFallback(broker, account)
    
    // Determinar status geral e atualizar banco se necessário
    const status = determineConnectionStatus(connectionStatus, account.status)
    
    // Atualizar status no banco quando conectado
    if (connectionStatus.connected && account.status !== 'active') {
      await updateAccountStatusWhenConnected(
        supabaseClient,
        accountId,
        accountInfo,
        account
      )
    }
    
    // Determinar mensagem: não incluir erros 404 durante processo de conexão
    // Erros 404 da API externa são esperados quando a instância ainda está sendo criada/conectada
    let message: string | undefined = undefined
    if (connectionStatus.connected) {
      message = 'Conectado com sucesso'
    } else if (connectionStatus.error) {
      // Filtrar erros 404 quando status é "connecting" (processo de conexão em andamento)
      const is404Error = connectionStatus.error.includes('404') || connectionStatus.error.includes('Not Found')
      if (status === 'connecting' && is404Error) {
        // Não incluir erro 404 durante conexão - é esperado
        message = undefined
      } else {
        // Incluir outros erros (timeout, etc.)
        message = connectionStatus.error
      }
    }
    
    const response: ConnectionStatusResponse = {
      instanceId: connectionConfigResult.config.instanceId || accountId,
      connected: connectionStatus.connected,
      status,
      phoneNumber: accountInfo.phoneNumber || undefined,
      profileName: accountInfo.name || undefined,
      message,
    }
    
    console.log('[Connection Status Handler] Status verificado:', {
      accountId,
      status,
      connected: connectionStatus.connected,
      brokerError: connectionStatus.error,
    })
    
    return successResponse(response, 200)
    
  } catch (error) {
    console.error('[Connection Status Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao verificar status',
      500
    )
  }
}
