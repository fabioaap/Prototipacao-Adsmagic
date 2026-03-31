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
  ended: 'bg-slate-700/50 text-slate-400',
}

const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0)
const avgCpl = totalSpend / totalLeads
const activeCount = campaigns.filter(campaign => campaign.status === 'active').length
const platformCount = new Set(campaigns.map(campaign => campaign.platform)).size
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Superficie hospedada</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Campanhas do Adsmagic</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Este painel consolida um recorte navegavel de investimento, geracao de leads e CPL para orientar a leitura do AS-IS e apoiar os prototipos de gestao multi-plataforma.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
        <span class="font-semibold text-slate-100">{{ campaigns.length }}</span> campanhas mapeadas
      </div>
    </section>

    <section class="rounded-[1.75rem] border border-slate-800 bg-slate-900/60 px-5 py-4">
      <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Leitura do workspace</p>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        Este modulo nao tenta reproduzir a operacao final do Adsmagic. Ele hospeda o recorte que produto usa para comparar canais, registrar lacunas e testar a direcao de uma visao unificada de campanhas.
      </p>
    </section>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Investimento mapeado</p>
        <p class="mt-2 text-2xl font-bold text-slate-50">{{ formatCurrency(totalSpend) }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Volume usado como referencia para leitura do recorte atual.</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Campanhas em curso</p>
        <p class="mt-2 text-2xl font-bold text-slate-50">{{ activeCount }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Frentes ainda relevantes para leitura e comparacao do time.</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Plataformas observadas</p>
        <p class="mt-2 text-2xl font-bold text-primary-300">{{ platformCount }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Canais ja comparados dentro da leitura hospedada.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total de Leads</p>
        <p class="mt-2 text-2xl font-bold text-slate-50">{{ totalLeads }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Sinal consolidado para discutir volume e distribuicao por canal.</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">CPL Medio</p>
        <p class="mt-2 text-2xl font-bold text-primary-300">{{ formatCurrency(avgCpl) }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">Indicador de referencia para sustentar hipoteses de otimização.</p>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-100">Recorte de campanhas</h3>
          <p class="mt-1 text-xs leading-5 text-slate-500">Base usada para comparar performance atual e orientar a direcao do modulo unificado.</p>
        </div>
        <span class="text-xs text-slate-500">{{ campaigns.length }} registros</span>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b border-slate-800">
          <tr>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Nome</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Plataforma</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Status</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Gastos</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Leads</th>
            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">CPL</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr v-for="c in campaigns" :key="c.id" class="hover:bg-slate-900/90 transition-colors">
            <td class="px-4 py-3 font-medium text-slate-100">{{ c.name }}</td>
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
            <td class="px-4 py-3 text-right text-slate-300">{{ formatCurrency(c.spend) }}</td>
            <td class="px-4 py-3 text-right font-medium text-slate-300">{{ c.leads }}</td>
            <td class="px-4 py-3 text-right font-semibold text-slate-100">{{ formatCurrency(c.cpl) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
