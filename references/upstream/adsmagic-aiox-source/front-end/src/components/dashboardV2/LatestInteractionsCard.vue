<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Interaction {
  name: string
  message: string
  time: string
  channel: 'Chat' | 'Email' | 'Ligação'
}

interface Props {
  interactions: Interaction[]
}

defineProps<Props>()

const emit = defineEmits<{
  viewHistory: []
  interactionClick: [interaction: Interaction]
}>()
</script>

<template>
  <div class="card-shadow rounded-3xl border border-slate-200 bg-white p-6">
    <div class="flex items-start justify-between">
      <div>
        <h2 class="section-title-sm">Últimas interações</h2>
        <p class="text-xs text-slate-500">Comunicações mais recentes com prospects.</p>
      </div>
      <Button
        variant="outline"
        class="text-xs text-slate-600 hover:text-slate-700"
        @click="emit('viewHistory')"
      >
        Ver histórico
      </Button>
    </div>
    
    <ul class="mt-6 space-y-4 text-sm text-slate-600">
      <li
        v-for="(interaction, index) in interactions"
        :key="index"
        class="flex items-start justify-between rounded-2xl border px-4 py-3 cursor-pointer transition-colors"
        :class="index === 0 ? 'border-slate-100 bg-slate-50' : 'border-slate-100 bg-white hover:bg-slate-50'"
        @click="emit('interactionClick', interaction)"
      >
        <div>
          <p class="font-medium text-slate-900">{{ interaction.name }}</p>
          <p class="text-xs text-slate-500">{{ interaction.message }}</p>
        </div>
        <div class="text-right text-xs text-slate-400">
          <p>{{ interaction.time }}</p>
          <p>{{ interaction.channel }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
