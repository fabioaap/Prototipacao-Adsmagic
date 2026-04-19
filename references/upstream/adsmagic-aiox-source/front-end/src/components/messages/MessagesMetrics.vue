<script setup lang="ts">
import { computed } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import Card from '@/components/ui/Card.vue'

const messagesStore = useMessagesStore()

// Métricas tipadas
const metricsCards = computed(() => [
  {
    id: 'google-ads',
    label: 'Google Ads',
    value: messagesStore.metrics.find((m) => m.originId === 'origin-google-ads')
      ?.contactsCount || 0,
  },
  {
    id: 'meta-ads',
    label: 'Meta Ads',
    value: messagesStore.metrics.find((m) => m.originId === 'origin-meta-ads')
      ?.contactsCount || 0,
  },
  {
    id: 'tiktok-ads',
    label: 'TikTok Ads',
    value: messagesStore.metrics.find((m) => m.originId === 'origin-tiktok-ads')
      ?.contactsCount || 0,
  },
  {
    id: 'organic',
    label: 'Organic',
    value: messagesStore.metrics.find((m) => m.originId === 'origin-organic')
      ?.contactsCount || 0,
  },
  {
    id: 'other',
    label: 'Outros',
    value: messagesStore.metrics.find((m) => m.originId === 'origin-other')
      ?.contactsCount || 0,
  },
])
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-2">
    <Card
      v-for="metric in metricsCards"
      :key="metric.id"
      class="min-w-[140px] flex-1 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="text-sm font-medium text-muted-foreground mb-1">
          {{ metric.label }}
        </div>
        <div class="text-2xl font-bold">{{ metric.value }}</div>
      </div>
    </Card>
  </div>
</template>
