/**
 * Handler para sincronizar contatos
 * POST /messaging/sync-contacts/:accountId
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleSyncContacts(
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
    
    // Obter informações da conta do broker
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
      
      const accountInfo = await broker.getAccountInfo()
      
      // Atualizar informações da conta
      const { error: updateError } = await supabaseClient
        .from('messaging_accounts')
        .update({
          account_display_name: accountInfo.name,
          status: accountInfo.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId)
      
      if (updateError) {
        console.error('[Sync Contacts] Error updating account:', updateError)
      }
      
      return successResponse({
        success: true,
        accountInfo: {
          phoneNumber: accountInfo.phoneNumber,
          name: accountInfo.name,
          status: accountInfo.status,
        },
      })
    } catch (error) {
      console.error('[Sync Contacts] Error:', error)
      return errorResponse(
        error instanceof Error ? error.message : 'Erro ao sincronizar contatos',
        500
      )
    }
    
  } catch (error) {
    console.error('[Sync Contacts Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido',
      500
    )
  }
}
