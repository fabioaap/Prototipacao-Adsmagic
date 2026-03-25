<script setup lang="ts">
import { computed } from 'vue'
import { mockIntegrations } from '@/data/integrations'

const platformEmoji: Record<string, string> = {
  meta: '📘',
  google: '🔍',
  whatsapp: '💬',
  tiktok: '🎵',
}

const connectedCount = computed(() => mockIntegrations.filter(i => i.status === 'connected').length)
const errorCount = computed(() => mockIntegrations.filter(i => i.status === 'error').length)
const disconnectedCount = computed(() => mockIntegrations.filter(i => i.status === 'disconnected').length)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Conexões externas</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Integrações</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Gerencie as conexões com plataformas de mídia e canais de comunicação utilizados nas campanhas.
        </p>
      </div>
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400">
        <span class="font-semibold text-emerald-300">{{ connectedCount }}</span> conectada{{ connectedCount !== 1 ? 's' : '' }}
        <template v-if="errorCount > 0">
          · <span class="font-semibold text-rose-300">{{ errorCount }}</span> com erro
        </template>
        · <span class="font-semibold text-zinc-400">{{ disconnectedCount }}</span> desconectada{{ disconnectedCount !== 1 ? 's' : '' }}
      </div>
    </section>

    <!-- Integration Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="integration in mockIntegrations"
        :key="integration.id"
        class="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ platformEmoji[integration.platform] }}</span>
            <div>
              <h3 class="font-semibold text-zinc-100">{{ integration.name }}</h3>
              <p v-if="integration.accountName" class="text-xs text-zinc-500 mt-0.5">{{ integration.accountName }}</p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            :class="integration.status === 'connected'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
              : integration.status === 'error'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/20'
                : 'bg-zinc-700/50 text-zinc-400 border-zinc-700/50'"
          >
            <span class="inline-block h-1.5 w-1.5 rounded-full"
              :class="integration.status === 'connected' ? 'bg-emerald-400' : integration.status === 'error' ? 'bg-rose-400' : 'bg-zinc-500'"
            />
            {{ integration.status === 'connected' ? 'Conectado' : integration.status === 'error' ? 'Erro' : 'Desconectado' }}
          </span>
        </div>

        <div v-if="integration.lastSync" class="mb-5 text-xs text-zinc-500">
          Última sincronização: <span class="text-zinc-400">{{ formatDate(integration.lastSync) }}</span>
        </div>
        <div v-else class="mb-5 text-xs text-zinc-600 italic">
          Não sincronizado ainda
        </div>

        <button
          class="text-sm px-4 py-2 rounded-2xl font-medium transition-colors"
          :class="integration.status === 'connected'
            ? 'border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
            : 'bg-primary-600 hover:bg-primary-700 text-white'"
        >
          {{ integration.status === 'connected' ? 'Gerenciar' : 'Conectar' }}
        </button>
      </div>
    </div>
  </div>
</template>
