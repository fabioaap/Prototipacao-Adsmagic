<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import { computed } from 'vue'

const store = useDashboardStore()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)
}

const maxRevenue = computed(() => Math.max(...store.revenueByMonth.map(m => m.value)))
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Visão executiva</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Dashboard de conversão</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Acompanhe volume, receita e eficiência do funil em uma superfície mais analítica e alinhada à nova interface.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
        Ticket médio <span class="font-semibold text-slate-100">{{ formatCurrency(store.metrics.avgDealValue) }}</span>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-3xl border border-slate-800 bg-slate-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Total de Leads</p>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-50">{{ store.metrics.totalLeads }}</p>
        <p class="mt-2 text-xs font-medium text-emerald-300">+{{ store.metrics.leadsThisMonth }} este mês</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Taxa de Conversão</p>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-50">{{ store.metrics.conversionRate }}%</p>
        <p class="mt-2 text-xs text-slate-500">{{ store.metrics.activeDeals }} negócios ativos</p>
      </div>
      <div class="rounded-3xl border border-slate-800 bg-slate-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Receita Total</p>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-50">{{ formatCurrency(store.metrics.totalRevenue) }}</p>
        <p class="mt-2 text-xs font-medium text-emerald-300">{{ formatCurrency(store.metrics.revenueThisMonth) }} este mês</p>
      </div>
      <div class="rounded-3xl border border-primary-500/20 bg-primary-500/8 p-5 shadow-[0_12px_30px_rgba(76,29,149,0.12)]">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-200/70">ROI Médio</p>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-primary-200">{{ store.metrics.roi }}%</p>
        <p class="mt-2 text-xs text-primary-200/70">Ticket médio {{ formatCurrency(store.metrics.avgDealValue) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="rounded-3xl border border-slate-800 bg-slate-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h3 class="text-sm font-semibold text-slate-200">Leads por Origem</h3>
          <span class="text-xs uppercase tracking-[0.2em] text-slate-500">Distribuição</span>
        </div>
        <div class="space-y-4">
          <div v-for="item in store.leadsByOrigin" :key="item.origin">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-slate-300">{{ item.origin }}</span>
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-slate-100">{{ item.count }}</span>
                <span class="w-10 text-right text-xs text-slate-500">{{ item.percentage }}%</span>
              </div>
            </div>
            <div class="h-2 w-full rounded-full bg-slate-800">
              <div
                class="h-2 rounded-full bg-gradient-to-r from-primary-400 to-cyan-400 transition-all"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-800 bg-slate-900/72 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h3 class="text-sm font-semibold text-slate-200">Receita por Mês</h3>
          <span class="text-xs uppercase tracking-[0.2em] text-slate-500">R$ acumulado</span>
        </div>
        <div class="flex h-40 items-end gap-3">
          <div
            v-for="item in store.revenueByMonth"
            :key="item.month"
            class="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span class="text-center text-[10px] leading-tight text-slate-500">
              {{ (item.value / 1000).toFixed(1) }}k
            </span>
            <div
              class="w-full rounded-t-2xl bg-gradient-to-t from-primary-700 via-primary-500 to-cyan-400 transition-all hover:brightness-110"
              :style="{ height: (item.value / maxRevenue * 100) + '%' }"
            ></div>
            <span class="text-xs font-medium text-slate-400">{{ item.month }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
