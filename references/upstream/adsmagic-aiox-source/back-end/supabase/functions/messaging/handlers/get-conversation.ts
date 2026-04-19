/**
 * Handler para buscar histórico de conversas de um contato
 * GET /messaging/conversations/:contactId
 *
 * Query params:
 * - before: ISO timestamp cursor para paginação (retorna mensagens antes deste timestamp)
 * - limit: quantidade de mensagens por página (default 30, max 100)
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { ConversationMessageRepository } from '../repositories/ConversationMessageRepository.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleGetConversation(
  req: Request,
  supabaseClient: SupabaseDbClient,
  contactId: string
): Promise<Response> {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Verificar que o contato existe e pertence a um projeto acessível pelo usuário
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      return errorResponse('Contato não encontrado', 404)
    }

    // Verificar acesso ao projeto do contato
    const { data: projectAccess } = await supabaseClient
      .from('project_users')
      .select('project_id')
      .eq('project_id', contact.project_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!projectAccess) {
      return errorResponse('Acesso negado ao projeto', 403)
    }

    // Parse query params
    const url = new URL(req.url)
    const before = url.searchParams.get('before') || undefined
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 30, 100) : 30

    // Buscar mensagens
    const repository = new ConversationMessageRepository(supabaseClient)
    const messages = await repository.findByContactId(contactId, {
      before,
      limit: limit + 1, // +1 para detectar se há mais
    })

    const hasMore = messages.length > limit
    const resultMessages = hasMore ? messages.slice(0, limit) : messages

    // O nextCursor é o sent_at da última mensagem retornada (mais antiga)
    const nextCursor = resultMessages.length > 0
      ? resultMessages[resultMessages.length - 1].sent_at
      : null

    return successResponse({
      messages: resultMessages,
      hasMore,
      nextCursor,
    })
  } catch (error) {
    console.error('[Get Conversation Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido',
      500
    )
  }
}
