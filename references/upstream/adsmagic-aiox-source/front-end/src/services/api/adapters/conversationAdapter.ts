/**
 * Conversation Adapter
 *
 * Pure functions for converting between backend and frontend conversation message formats.
 *
 * @module services/api/adapters/conversationAdapter
 */

import type { ConversationMessage } from '@/types'
import type { BackendConversationMessage } from '@/types/api/conversations.api'

/**
 * Converts a backend conversation message to frontend format
 *
 * @param backend - Message from backend API (snake_case)
 * @returns ConversationMessage in frontend format (camelCase)
 */
export function mapBackendMessageToFrontend(backend: BackendConversationMessage): ConversationMessage {
  return {
    id: backend.id,
    contactId: backend.contact_id,
    direction: backend.direction,
    contentType: backend.content_type,
    contentText: backend.content_text,
    mediaUrl: backend.media_url,
    caption: backend.caption,
    mimeType: backend.mime_type,
    fileName: backend.file_name,
    status: backend.status,
    quotedMessageId: backend.quoted_message_id,
    sentAt: backend.sent_at,
  }
}
