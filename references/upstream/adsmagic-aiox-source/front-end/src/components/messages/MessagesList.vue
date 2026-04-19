<script setup lang="ts">
import { useMessagesStore } from '@/stores'
import { useOriginsStore } from '@/stores/origins'
import { MoreHorizontal } from 'lucide-vue-next'
import type { Message } from '@/types'

interface Props {
  onEdit?: (message: Message) => void
  onDelete?: (message: Message) => void
}

const props = defineProps<Props>()
const messagesStore = useMessagesStore()
const originsStore = useOriginsStore()

const getOriginName = (originId: string) => {
  const origin = originsStore.origins.find((o) => o.id === originId)
  return origin?.name || originId
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="rounded-surface border">
    <table class="w-full">
      <thead class="bg-muted/50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Nome
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Origem
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Contatos
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Vendas
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ticket médio
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Data de criação
          </th>
          <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ações
          </th>
        </tr>
      </thead>
      <tbody class="divide-y">
        <tr v-if="messagesStore.isLoading">
          <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
            Carregando...
          </td>
        </tr>
        <tr v-else-if="messagesStore.messages.length === 0">
          <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
            Nenhuma mensagem encontrada
          </td>
        </tr>
        <tr
          v-for="message in messagesStore.messages"
          v-else
          :key="message.id"
          class="hover:bg-muted/30"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                <span class="text-xs font-medium">{{ message.name[0] }}</span>
              </div>
              <span class="font-medium">{{ message.name }}</span>
            </div>
          </td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-info/10 text-info">
              {{ getOriginName(message.originId) }}
            </span>
          </td>
          <td class="px-4 py-3">{{ message.contactsCount }}</td>
          <td class="px-4 py-3">{{ message.salesCount }}</td>
          <td class="px-4 py-3">{{ formatCurrency(message.averageTicket) }}</td>
          <td class="px-4 py-3">{{ formatDate(message.createdAt) }}</td>
          <td class="px-4 py-3 text-right">
            <button
              class="inline-flex items-center justify-center h-8 w-8 rounded-control hover:bg-muted"
              @click="() => props.onEdit?.(message)"
            >
              <MoreHorizontal :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
