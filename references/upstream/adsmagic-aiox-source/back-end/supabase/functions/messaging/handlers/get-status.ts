/**
 * Handler para obter status da conta
 * GET /messaging/status/:accountId
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import type { AccountStatusResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleGetStatus(
  req: Request,
  supabaseClient: SupabaseDbClient,
  accountId: string
) {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }
    
    // Buscar conta
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(accountId)
    
    if (!account) {
      return errorResponse('Conta não encontrada', 404)
    }
    
    // Verificar se usuário tem acesso ao projeto
    const { data: projectCheck } = await supabaseClient
      .from('project_users')
      .select('project_id')
      .eq('project_id', account.project_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    if (!projectCheck) {
      return errorResponse('Acesso negado ao projeto', 403)
    }
    
    // Obter status da conexão do broker
    try {
      const broker = WhatsAppBrokerFactory.create(
        account.broker_type,
        {
          ...account.broker_config,
          accountName: account.account_name,
          apiKey: account.api_key || undefined,
          accessToken: account.access_token || undefined,
        },
        accountId
      )
      
      const connectionStatus = await broker.getConnectionStatus()
      
      const response: AccountStatusResponse = {
        accountId: account.id,
        status: account.status,
        connected: connectionStatus.connected,
        lastMessageAt: account.last_message_at || undefined,
        totalMessages: account.total_messages,
        totalContacts: account.total_contacts,
      }
      
      return successResponse(response)
    } catch (error) {
      // Se não conseguir obter status do broker, retorna status básico
      const response: AccountStatusResponse = {
        accountId: account.id,
        status: account.status,
        connected: account.status === 'active',
        lastMessageAt: account.last_message_at || undefined,
        totalMessages: account.total_messages,
        totalContacts: account.total_contacts,
      }
      
      return successResponse(response)
    }
    
  } catch (error) {
    console.error('[Get Status Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido',
      500
    )
  }
}
