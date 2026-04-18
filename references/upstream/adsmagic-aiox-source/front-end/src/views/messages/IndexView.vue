<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { useOriginsStore } from '@/stores/origins'
import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import MessagesMetrics from '@/components/messages/MessagesMetrics.vue'
import MessagesList from '@/components/messages/MessagesList.vue'
import MessageFormModal from '@/components/messages/MessageFormModal.vue'
import { RefreshCw, Plus } from '@/composables/useIcons'
import type { Message, CreateMessageDTO, UpdateMessageDTO } from '@/types'

const messagesStore = useMessagesStore()
const originsStore = useOriginsStore()

const isFormModalOpen = ref(false)
const selectedMessage = ref<Message | null>(null)
const startDate = ref('')
const endDate = ref('')

onMounted(async () => {
  try {
    await originsStore.fetchOrigins()
    await messagesStore.fetchMessages()
    await messagesStore.fetchMetrics()
  } catch (error) {
    console.error('[Messages] Erro ao carregar dados:', error)
  }
})

const handleRefresh = () => {
  messagesStore.fetchMessages()
  messagesStore.fetchMetrics()
}

const handleCreateNew = () => {
  selectedMessage.value = null
  isFormModalOpen.value = true
}

const handleEdit = (message: Message) => {
  selectedMessage.value = message
  isFormModalOpen.value = true
}

const handleSubmit = async (data: CreateMessageDTO | UpdateMessageDTO) => {
  if (selectedMessage.value) {
    await messagesStore.updateMessage(selectedMessage.value.id, data as UpdateMessageDTO)
  } else {
    await messagesStore.createMessage(data as CreateMessageDTO)
  }
  isFormModalOpen.value = false
}

const handleDateFilter = () => {
  messagesStore.setFilters({ startDate: startDate.value, endDate: endDate.value })
}
</script>

<template>
  <AppShell container-size="2xl">
    <div class="w-full section-stack-md">
      <!-- Header -->
      <PageHeader title="Mensagens">
        <template #actions>
          <button
            class="inline-flex items-center justify-center h-8 w-8 rounded-control hover:bg-muted"
            aria-label="Atualizar mensagens"
            @click="handleRefresh"
          >
            <RefreshCw :size="16" />
          </button>
        </template>
      </PageHeader>

      <!-- Section: Origem contatos iniciados rastreados -->
      <div>
        <h2 class="section-kicker mb-3">
          Origem contatos iniciados rastreados
        </h2>
        <MessagesMetrics />
      </div>

      <!-- Filters and Actions -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">Data início</label>
          <Input
            v-model="startDate"
            type="date"
            class="w-40"
            @change="handleDateFilter"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">Data fim</label>
          <Input
            v-model="endDate"
            type="date"
            class="w-40"
            @change="handleDateFilter"
          />
        </div>
        <div class="ml-auto">
          <Button size="sm" @click="handleCreateNew">
            <Plus :size="16" class="mr-2" />
            Criar mensagem
          </Button>
        </div>
      </div>

      <!-- Resultados count -->
      <div class="text-sm text-muted-foreground">
        Resultados: <span class="font-medium">{{ messagesStore.total }}</span>
      </div>

      <!-- Messages List -->
      <MessagesList :on-edit="handleEdit" />

      <!-- Pagination -->
      <div
        v-if="messagesStore.totalPages > 1"
        class="flex justify-center items-center gap-2"
      >
        <Button
          variant="outline"
          size="sm"
          :disabled="messagesStore.currentPage === 1"
          @click="messagesStore.previousPage"
        >
          Anterior
        </Button>
        <span class="text-sm">
          Página {{ messagesStore.currentPage }} de {{ messagesStore.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!messagesStore.hasMore"
          @click="messagesStore.nextPage"
        >
          Próxima
        </Button>
      </div>

      <!-- Form Modal -->
      <MessageFormModal
        :open="isFormModalOpen"
        :message="selectedMessage"
        @update:open="(val) => (isFormModalOpen = val)"
        @submit="handleSubmit"
      />
    </div>
  </AppShell>
</template>
