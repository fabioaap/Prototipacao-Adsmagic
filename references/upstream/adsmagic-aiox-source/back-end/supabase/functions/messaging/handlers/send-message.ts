/**
 * Handler para enviar mensagens
 * POST /messaging/send
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { WhatsAppSender } from '../core/sender.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import { SupabaseContactRepository } from '../repositories/ContactRepository.ts'
import { ConversationPersistenceService } from '../services/ConversationPersistenceService.ts'
import { extractPhoneNumber } from '../utils/identifier-normalizer.ts'
import type { SendMessageDTO, NormalizedMessage } from '../types.ts'
import { sendMessageSchema, extractValidationErrors } from '../validators/messaging.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleSendMessage(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }
    
    // Parse e validação
    const body = await req.json()
    const validationResult = sendMessageSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }
    
    const data: SendMessageDTO = validationResult.data
    
    // Buscar conta
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const account = await accountRepo.findById(data.accountId)
    
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
    
    // Criar mensagem normalizada
    const normalizedMessage: NormalizedMessage = {
      messageId: '', // Será gerado pelo broker
      externalMessageId: '',
      brokerId: account.broker_type,
      accountId: account.id,
      from: {
        phoneNumber: account.account_identifier,
        name: account.account_name,
      },
      to: {
        phoneNumber: data.to,
        accountName: account.account_name,
      },
      content: {
        type: data.mediaType || 'text',
        text: data.text,
        mediaUrl: data.mediaUrl,
        caption: data.caption,
      },
      timestamp: new Date(),
      status: 'sent',
      isGroup: false,
    }
    
    // Enviar mensagem
    const sender = new WhatsAppSender()
    const result = await sender.sendMessage(account, normalizedMessage)
    
    // Atualizar o externalMessageId com o ID retornado pelo broker
    normalizedMessage.externalMessageId = result.messageId || ''

    // Persistir mensagem outbound no histórico de conversas (non-blocking)
    try {
      const contactRepo = new SupabaseContactRepository(supabaseClient)
      const parsedPhone = extractPhoneNumber(data.to)
      const recipientContact = await contactRepo.findByAnyIdentifier({
        projectId: account.project_id,
        phone: parsedPhone.phone,
        countryCode: parsedPhone.countryCode,
      })

      if (recipientContact) {
        const conversationPersistence = new ConversationPersistenceService(supabaseClient)
        await conversationPersistence.persistMessage({
          normalizedMessage,
          direction: 'outbound',
          projectId: account.project_id,
          contactId: recipientContact.id,
          messagingAccountId: account.id,
        })
      }
    } catch (persistError) {
      console.error('[Send Message Handler] Error persisting message (non-blocking):', persistError)
    }

    // Atualizar estatísticas
    await accountRepo.updateStats(data.accountId, {
      totalMessages: account.total_messages + 1,
      lastMessageAt: new Date().toISOString(),
    })

    return successResponse({
      messageId: result.messageId,
      status: result.status,
      timestamp: result.timestamp.toISOString(),
    })
    
  } catch (error) {
    console.error('[Send Message Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido',
      500
    )
  }
}
