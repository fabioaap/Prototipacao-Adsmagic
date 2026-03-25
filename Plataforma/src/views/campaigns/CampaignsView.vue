<script setup lang="ts">
import { mockCampaigns } from '@/data/campaigns'

const campaigns = mockCampaigns

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)
}

const statusLabels: Record<string, string> = { active: 'Ativa', paused: 'Pausada', ended: 'Encerrada' }
const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  paused: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  ended: 'bg-zinc-700/50 text-zinc-400',
}

const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0)
const avgCpl = totalSpend / totalLeads
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Mídia paga</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Campanhas</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Acompanhe o investimento, geração de leads e CPL de cada campanha ativa nos canais de mídia.
        </p>
      </div>
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400">
        <span class="font-semibold text-zinc-100">{{ campaigns.length }}</span> campanhas
      </div>
    </section>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Total Investido</p>
        <p class="mt-2 text-2xl font-bold text-zinc-50">{{ formatCurrency(totalSpend) }}</p>
      </div>
      <div class="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Total de Leads</p>
        <p class="mt-2 text-2xl font-bold text-zinc-50">{{ totalLeads }}</p>
      </div>
      <div class="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">CPL Médio</p>
        <p class="mt-2 text-2xl font-bold text-primary-300">{{ formatCurrency(avgCpl) }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-3xl border border-zinc-800 bg-zinc-900/70 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <div class="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-zinc-100">Todas as campanhas</h3>
        <span class="text-xs text-zinc-500">{{ campaigns.length }} registros</span>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b border-zinc-800">
          <tr>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Nome</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Plataforma</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Status</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Gastos</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Leads</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">CPL</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800">
          <tr v-for="c in campaigns" :key="c.id" class="hover:bg-zinc-900/90 transition-colors">
            <td class="px-4 py-3 font-medium text-zinc-100">{{ c.name }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="c.platform === 'meta'
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                  : 'bg-red-500/15 text-red-300 border border-red-500/20'"
              >
                {{ c.platform === 'meta' ? '📘 Meta Ads' : '🔴 Google Ads' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" :class="statusColors[c.status]">
                {{ statusLabels[c.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-zinc-300">{{ formatCurrency(c.spend) }}</td>
            <td class="px-4 py-3 text-right font-medium text-zinc-300">{{ c.leads }}</td>
            <td class="px-4 py-3 text-right font-semibold text-zinc-100">{{ formatCurrency(c.cpl) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
