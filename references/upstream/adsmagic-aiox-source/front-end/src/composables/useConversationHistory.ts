import { ref, computed, watch, type Ref } from 'vue'
import type { ConversationMessage } from '@/types'
import { getConversationMessages } from '@/services/api/conversations'

const PAGE_SIZE = 30

/**
 * Composable for managing conversation history with cursor-based pagination.
 *
 * Scoped to component lifetime — not a global Pinia store.
 * Supports infinite scroll upward (loading older messages).
 *
 * @param contactId - Reactive reference to the current contact ID
 */
export function useConversationHistory(contactId: Ref<string | null>) {
  const messages = ref<ConversationMessage[]>([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const hasMore = ref(false)
  const nextCursor = ref<string | null>(null)
  const error = ref<string | null>(null)

  /**
   * Groups messages by date for rendering date separators.
   * Returns entries sorted chronologically (oldest first).
   */
  const groupedByDate = computed(() => {
    const groups = new Map<string, ConversationMessage[]>()

    // Messages come from API in DESC order, reverse for chronological display
    const sorted = [...messages.value].reverse()

    for (const msg of sorted) {
      const dateKey = new Date(msg.sentAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(msg)
    }

    return Array.from(groups.entries()).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }))
  })

  /**
   * Loads the most recent messages (initial load).
   */
  async function loadMessages(): Promise<void> {
    const id = contactId.value
    if (!id) return

    isLoading.value = true
    error.value = null

    const result = await getConversationMessages(id, { limit: PAGE_SIZE })

    // Guard against stale responses (contact changed while loading)
    if (contactId.value !== id) return

    if (result.ok) {
      messages.value = result.value.messages
      hasMore.value = result.value.hasMore
      nextCursor.value = result.value.nextCursor
    } else {
      error.value = result.error.message
    }

    isLoading.value = false
  }

  /**
   * Loads older messages (infinite scroll upward).
   * Prepends to the existing messages array.
   */
  async function loadMore(): Promise<void> {
    const id = contactId.value
    if (!id || !hasMore.value || isLoadingMore.value || !nextCursor.value) return

    isLoadingMore.value = true

    const result = await getConversationMessages(id, {
      before: nextCursor.value,
      limit: PAGE_SIZE,
    })

    if (contactId.value !== id) return

    if (result.ok) {
      // Prepend older messages (they come in DESC order from API)
      messages.value = [...messages.value, ...result.value.messages]
      hasMore.value = result.value.hasMore
      nextCursor.value = result.value.nextCursor
    } else {
      error.value = result.error.message
    }

    isLoadingMore.value = false
  }

  // Reset and reload when contactId changes
  watch(contactId, (newId) => {
    messages.value = []
    nextCursor.value = null
    hasMore.value = false
    error.value = null
    if (newId) {
      loadMessages()
    }
  })

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    groupedByDate,
    loadMessages,
    loadMore,
  }
}
