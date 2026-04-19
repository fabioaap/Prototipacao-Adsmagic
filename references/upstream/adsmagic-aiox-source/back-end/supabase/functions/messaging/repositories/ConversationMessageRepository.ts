import type { SupabaseDbClient } from '../types-db.ts'

export type MessageDirection = 'inbound' | 'outbound'
export type MessageContentType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface CreateConversationMessageParams {
  projectId: string
  contactId: string
  messagingAccountId: string
  direction: MessageDirection
  externalMessageId?: string | null
  brokerType: string
  contentType: MessageContentType
  contentText?: string | null
  mediaUrl?: string | null
  caption?: string | null
  mimeType?: string | null
  fileName?: string | null
  locationLat?: number | null
  locationLng?: number | null
  locationName?: string | null
  status: MessageStatus
  quotedMessageId?: string | null
  metadata?: Record<string, unknown>
  sentAt: string
}

export interface ConversationMessageRow {
  id: string
  project_id: string
  contact_id: string
  messaging_account_id: string
  direction: MessageDirection
  external_message_id: string | null
  broker_type: string
  content_type: MessageContentType
  content_text: string | null
  media_url: string | null
  caption: string | null
  mime_type: string | null
  file_name: string | null
  location_lat: number | null
  location_lng: number | null
  location_name: string | null
  status: MessageStatus
  quoted_message_id: string | null
  metadata: Record<string, unknown>
  sent_at: string
  created_at: string
  updated_at: string
}

export interface FindMessagesOptions {
  before?: string
  limit?: number
}

export class ConversationMessageRepository {
  private supabaseClient: SupabaseDbClient

  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }

  /**
   * Insere uma mensagem na tabela conversation_messages via RPC.
   * Usa função SQL que bypassa PostgREST e trata dedup via ON CONFLICT DO NOTHING.
   * Retorna UUID da mensagem criada, ou null em caso de dedup/erro.
   */
  async create(params: CreateConversationMessageParams): Promise<string | null> {
    const { data, error } = await this.supabaseClient.rpc('insert_conversation_message', {
      p_project_id: params.projectId,
      p_contact_id: params.contactId,
      p_messaging_account_id: params.messagingAccountId,
      p_direction: params.direction,
      p_external_message_id: params.externalMessageId || null,
      p_broker_type: params.brokerType,
      p_content_type: params.contentType,
      p_content_text: params.contentText || null,
      p_media_url: params.mediaUrl || null,
      p_caption: params.caption || null,
      p_mime_type: params.mimeType || null,
      p_file_name: params.fileName || null,
      p_location_lat: params.locationLat || null,
      p_location_lng: params.locationLng || null,
      p_location_name: params.locationName || null,
      p_status: params.status,
      p_quoted_message_id: params.quotedMessageId || null,
      p_metadata: params.metadata || {},
      p_sent_at: params.sentAt,
    })

    if (error) {
      console.error('[ConversationMessageRepository] RPC insert error:', JSON.stringify({
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }))
      return null
    }

    const resultId = data as string | null
    if (!resultId) {
      console.log('[ConversationMessageRepository] Duplicate message ignored (dedup):', params.externalMessageId)
    }
    return resultId
  }

  /**
   * Busca mensagens de um contato com paginação por cursor (sent_at DESC).
   *
   * @param contactId - ID do contato
   * @param options.before - Cursor: retorna mensagens com sent_at < before
   * @param options.limit - Quantidade de mensagens (default 30, max 100)
   */
  async findByContactId(
    contactId: string,
    options: FindMessagesOptions = {}
  ): Promise<ConversationMessageRow[]> {
    const limit = Math.min(options.limit || 30, 100)

    let query = this.supabaseClient
      .from('conversation_messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (options.before) {
      query = query.lt('sent_at', options.before)
    }

    const { data, error } = await query

    if (error) {
      console.error('[ConversationMessageRepository] Error fetching messages:', error)
      return []
    }

    return (data as ConversationMessageRow[]) || []
  }

  /**
   * Atualiza o status de uma mensagem pelo external_message_id do broker.
   * Usado quando recebemos webhooks de status (delivered, read, failed).
   */
  async updateStatusByExternalId(
    externalMessageId: string,
    status: MessageStatus
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from('conversation_messages')
      .update({ status })
      .eq('external_message_id', externalMessageId)

    if (error) {
      console.error('[ConversationMessageRepository] Error updating message status:', error)
    }
  }
}
