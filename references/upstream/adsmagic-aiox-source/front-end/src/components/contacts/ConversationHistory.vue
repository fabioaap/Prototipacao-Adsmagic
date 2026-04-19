<script setup lang="ts">
import { ref, computed, toRef, nextTick, watch } from 'vue'
import { MessageSquare, Loader2 } from '@/composables/useIcons'
import ChatBubble from '@/components/contacts/ChatBubble.vue'
import { useConversationHistory } from '@/composables/useConversationHistory'
import { useI18n } from 'vue-i18n'

interface Props {
  contactId: string | null
}

const props = defineProps<Props>()
const { t } = useI18n()

const contactIdRef = toRef(props, 'contactId')
const scrollContainer = ref<HTMLElement | null>(null)

const {
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  groupedByDate,
  loadMessages,
  loadMore,
} = useConversationHistory(contactIdRef)

const isEmpty = computed(() => !isLoading.value && groupedByDate.value.length === 0)

/**
 * Handles scroll event for infinite scroll upward.
 * When user scrolls near the top, loads older messages.
 */
async function handleScroll() {
  const container = scrollContainer.value
  if (!container || isLoadingMore.value || !hasMore.value) return

  if (container.scrollTop < 100) {
    const prevScrollHeight = container.scrollHeight

    await loadMore()

    // Restore scroll position after DOM update
    await nextTick()
    const newScrollHeight = container.scrollHeight
    container.scrollTop = newScrollHeight - prevScrollHeight
  }
}

/**
 * Scrolls to bottom when messages are first loaded.
 */
watch(isLoading, (loading, wasLoading) => {
  if (wasLoading && !loading && groupedByDate.value.length > 0) {
    nextTick(() => {
      const container = scrollContainer.value
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }
})

// Initial load
if (props.contactId) {
  loadMessages()
}
</script>

<template>
  <div class="flex flex-col h-full min-h-[300px]">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center px-4">
      <p class="text-sm text-destructive text-center">{{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="isEmpty" class="flex-1 flex flex-col items-center justify-center px-4">
      <MessageSquare class="h-12 w-12 text-muted-foreground/30 mb-3" />
      <p class="text-sm text-muted-foreground">{{ t('contacts.conversation.empty') }}</p>
    </div>

    <!-- Messages -->
    <div
      v-else
      ref="scrollContainer"
      class="flex-1 overflow-y-auto px-3 py-4"
      @scroll="handleScroll"
    >
      <!-- Loading more indicator -->
      <div v-if="isLoadingMore" class="flex justify-center py-3">
        <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
      </div>

      <!-- Date groups -->
      <template v-for="group in groupedByDate" :key="group.date">
        <!-- Date separator -->
        <div class="flex items-center justify-center my-4">
          <span class="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {{ group.date }}
          </span>
        </div>

        <!-- Messages in group -->
        <ChatBubble
          v-for="msg in group.messages"
          :key="msg.id"
          :message="msg"
        />
      </template>
    </div>
  </div>
</template>
