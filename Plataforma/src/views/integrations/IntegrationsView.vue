<script setup lang="ts">
import { computed } from 'vue'
import { mockIntegrations, type Integration } from '@/data/integrations'

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

function statusLabel(status: Integration['status']) {
  if (status === 'connected') return 'Mapeado'
  if (status === 'error') return 'Risco'
  return 'Em estudo'
}

function actionLabel(status: Integration['status']) {
  if (status === 'connected') return 'Abrir contexto'
  if (status === 'error') return 'Revisar risco'
  return 'Planejar prototipo'
}
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Superficie hospedada</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Integrações do Adsmagic</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Este workspace organiza o recorte AS-IS das conexoes atuais e as hipoteses TO-BE das integracoes que o time de produto quer validar.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
        <span class="font-semibold text-emerald-300">{{ connectedCount }}</span> recorte{{ connectedCount !== 1 ? 's' : '' }} consolidado{{ connectedCount !== 1 ? 's' : '' }}
        <template v-if="errorCount > 0">
          · <span class="font-semibold text-rose-300">{{ errorCount }}</span> com risco
        </template>
        · <span class="font-semibold text-slate-400">{{ disconnectedCount }}</span> em estudo
      </div>
    </section>

    <section class="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 px-5 py-4">
      <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Leitura do workspace</p>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        Estes cards nao representam uma central operacional em producao. Eles registram conectores ja entendidos, lacunas do cenario atual e frentes que ainda precisam de prototipo ou especificacao.
      </p>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="integration in mockIntegrations"
        :key="integration.id"
        class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
      >
        <div class="mb-4 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ platformEmoji[integration.platform] }}</span>
            <div>
              <h3 class="font-semibold text-slate-100">{{ integration.name }}</h3>
              <p v-if="integration.accountName" class="mt-0.5 text-xs text-slate-500">{{ integration.accountName }}</p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            :class="integration.status === 'connected'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
              : integration.status === 'error'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/20'
                : 'bg-slate-700/50 text-slate-400 border-slate-700/50'"
          >
            <span class="inline-block h-1.5 w-1.5 rounded-full"
              :class="integration.status === 'connected' ? 'bg-emerald-400' : integration.status === 'error' ? 'bg-rose-400' : 'bg-slate-500'"
            />
            {{ statusLabel(integration.status) }}
          </span>
        </div>

        <div v-if="integration.lastSync" class="mb-5 text-xs text-slate-500">
          Ultima revisao registrada: <span class="text-slate-400">{{ formatDate(integration.lastSync) }}</span>
        </div>
        <div v-else class="mb-5 text-xs text-slate-600 italic">
          Recorte ainda nao consolidado
        </div>

        <button
          class="rounded-2xl px-4 py-2 text-sm font-medium transition-colors"
          :class="integration.status === 'connected'
            ? 'border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300'
            : 'bg-primary-600 hover:bg-primary-700 text-white'"
        >
          {{ actionLabel(integration.status) }}
        </button>
      </div>
    </div>
  </div>
</template>
