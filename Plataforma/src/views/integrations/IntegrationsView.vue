<script setup lang="ts">
import { mockIntegrations } from '@/data/integrations'

const platformEmoji: Record<string, string> = {
  meta: '📘',
  google: '🔍',
  whatsapp: '💬',
  tiktok: '🎵',
}

const platformBg: Record<string, string> = {
  meta: 'border-blue-200 bg-blue-50',
  google: 'border-red-200 bg-red-50',
  whatsapp: 'border-green-200 bg-green-50',
  tiktok: 'border-gray-200 bg-gray-50',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="integration in mockIntegrations"
        :key="integration.id"
        class="bg-white rounded-xl border p-5 transition-shadow hover:shadow-sm"
        :class="platformBg[integration.platform]"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ platformEmoji[integration.platform] }}</span>
            <div>
              <h3 class="font-semibold text-gray-900">{{ integration.name }}</h3>
              <p v-if="integration.accountName" class="text-xs text-gray-500 mt-0.5">{{ integration.accountName }}</p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            :class="integration.status === 'connected'
              ? 'bg-green-100 text-green-700'
              : integration.status === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-500'"
          >
            <span class="text-xs">{{ integration.status === 'connected' ? '●' : '○' }}</span>
            {{ integration.status === 'connected' ? 'Conectado' : integration.status === 'error' ? 'Erro' : 'Desconectado' }}
          </span>
        </div>

        <div v-if="integration.lastSync" class="mb-4 text-xs text-gray-400">
          Última sincronização: {{ formatDate(integration.lastSync) }}
        </div>
        <div v-else class="mb-4 text-xs text-gray-400 italic">
          Não sincronizado ainda
        </div>

        <button
          class="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          :class="integration.status === 'connected'
            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'bg-primary-600 text-white hover:bg-primary-700'"
        >
          {{ integration.status === 'connected' ? 'Gerenciar' : 'Conectar' }}
        </button>
      </div>
    </div>
  </div>
</template>
