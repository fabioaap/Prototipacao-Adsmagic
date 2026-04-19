/**
 * Conversations API Service
 *
 * Handles fetching conversation message history for a contact.
 *
 * @module services/api/conversations
 */

import { apiClient } from './client'
import type { ConversationMessage, Result } from '@/types'
import type { BackendConversationResponse } from '@/types/api/conversations.api'
import { mapBackendMessageToFrontend } from './adapters/conversationAdapter'

export interface ConversationMessagesResult {
  messages: ConversationMessage[]
  hasMore: boolean
  nextCursor: string | null
}

export interface GetConversationOptions {
  before?: string
  limit?: number
}

/**
 * Fetches conversation messages for a contact with cursor-based pagination.
 *
 * @param contactId - The contact's UUID
 * @param options.before - ISO timestamp cursor (returns messages before this time)
 * @param options.limit - Number of messages per page (default 30, max 100)
 */
export async function getConversationMessages(
  contactId: string,
  options: GetConversationOptions = {}
): Promise<Result<ConversationMessagesResult, Error>> {
  try {
    const params: Record<string, string> = {}
    if (options.before) params.before = options.before
    if (options.limit) params.limit = String(options.limit)

    const response = await apiClient.get<BackendConversationResponse>(
      `/messaging/conversations/${contactId}`,
      { params }
    )

    const data = response.data
    const messages = data.messages.map(mapBackendMessageToFrontend)

    return {
      ok: true,
      value: {
        messages,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
