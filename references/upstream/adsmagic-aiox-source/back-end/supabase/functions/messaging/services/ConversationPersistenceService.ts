import {
  ConversationMessageRepository,
  type MessageContentType,
  type MessageDirection,
  type MessageStatus,
} from '../repositories/ConversationMessageRepository.ts'
import type { NormalizedMessage } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export interface PersistMessageParams {
  normalizedMessage: NormalizedMessage
  direction: MessageDirection
  projectId: string
  contactId: string
  messagingAccountId: string
}

/**
 * Serviço responsável por persistir mensagens normalizadas na tabela conversation_messages.
 *
 * Mapeia NormalizedMessage → CreateConversationMessageParams e delega ao repository.
 * Segue SRP: responsabilidade única de converter e persistir.
 */
export class ConversationPersistenceService {
  private repository: ConversationMessageRepository

  constructor(supabaseClient: SupabaseDbClient) {
    this.repository = new ConversationMessageRepository(supabaseClient)
  }

  /**
   * Persiste uma mensagem normalizada no banco de dados.
   * Retorna o ID da mensagem criada, ou null em caso de dedup/erro.
   */
  async persistMessage(params: PersistMessageParams): Promise<string | null> {
    const { normalizedMessage: msg, direction, projectId, contactId, messagingAccountId } = params

    return this.repository.create({
      projectId,
      contactId,
      messagingAccountId,
      direction,
      externalMessageId: msg.externalMessageId || null,
      brokerType: msg.brokerId,
      contentType: msg.content.type as MessageContentType,
      contentText: msg.content.text || null,
      mediaUrl: msg.content.mediaUrl || null,
      caption: msg.content.caption || null,
      mimeType: msg.content.mimeType || null,
      fileName: msg.content.fileName || null,
      locationLat: msg.content.location?.latitude || null,
      locationLng: msg.content.location?.longitude || null,
      locationName: msg.content.location?.name || null,
      status: (msg.status || 'sent') as MessageStatus,
      quotedMessageId: msg.context?.quotedMessageId || null,
      metadata: msg.context?.metadata || {},
      sentAt: msg.timestamp instanceof Date
        ? msg.timestamp.toISOString()
        : String(msg.timestamp),
    })
  }

  /**
   * Atualiza o status de uma mensagem pelo ID externo do broker.
   */
  async updateStatus(externalMessageId: string, status: MessageStatus): Promise<void> {
    await this.repository.updateStatusByExternalId(externalMessageId, status)
  }
}
