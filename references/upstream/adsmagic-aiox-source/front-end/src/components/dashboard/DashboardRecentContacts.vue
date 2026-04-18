<script setup lang="ts">
import { computed } from 'vue'
import { User, Mail, Phone, ExternalLink } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Contact } from '@/types/models'
import { useFormat } from '@/composables/useFormat'

interface Props {
  contacts?: Contact[]
  loading?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  contacts: () => [],
  loading: false,
  maxItems: 5,
})

const emit = defineEmits<{
  contactClick: [contact: Contact]
  viewAll: []
}>()

const { formatDate } = useFormat()

const displayContacts = computed(() => {
  return props.contacts.slice(0, props.maxItems)
})

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    'lead': 'bg-blue-500',
    'qualificado': 'bg-purple-500',
    'proposta': 'bg-yellow-500',
    'negociação': 'bg-orange-500',
    'ganho': 'bg-green-500',
    'perdido': 'bg-red-500',
  }
  return colors[stage.toLowerCase()] || 'bg-gray-500'
}
</script>

<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="section-title-sm">Contatos Recentes</h3>
      <button
        @click="emit('viewAll')"
        class="text-sm text-primary hover:underline"
      >
        Ver todos
      </button>
    </div>

    <!-- Loading -->
    <div v-if="props.loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-32 bg-muted animate-pulse rounded"></div>
          <div class="h-3 w-24 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="displayContacts.length === 0"
      class="py-8 text-center text-muted-foreground"
    >
      <User class="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p class="text-sm">Nenhum contato recente</p>
    </div>

    <!-- Contacts List -->
    <div v-else class="space-y-3">
      <div
        v-for="contact in displayContacts"
        :key="contact.id"
        @click="emit('contactClick', contact)"
        class="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      >
        <!-- Avatar -->
        <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User class="h-5 w-5 text-primary" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <p class="section-kicker truncate">{{ contact.name }}</p>
            <Badge
              :class="getStageColor(contact.stage)"
              class="text-xs text-white px-2 py-0.5"
            >
              {{ contact.stage }}
            </Badge>
          </div>

          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <span v-if="contact.email" class="flex items-center gap-1">
              <Mail class="h-3 w-3" />
              {{ contact.email }}
            </span>
            <span v-if="contact.phone" class="flex items-center gap-1">
              <Phone class="h-3 w-3" />
              {{ contact.phone }}
            </span>
          </div>

          <p class="text-xs text-muted-foreground mt-1">
            {{ formatDate(contact.createdAt) }}
          </p>
        </div>

        <!-- Action -->
        <ExternalLink class="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  </Card>
</template>
