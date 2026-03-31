<script setup lang="ts">
import { useSalesStore } from '@/stores/sales'

const store = useSalesStore()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)
}

function stageTotal(stageId: string) {
  return store.getSalesByStage(stageId).reduce((sum, s) => sum + s.value, 0)
}
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Quadro operacional</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Kanban de oportunidades</h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Visualize o valor em aberto, a densidade por estágio e o contexto de cada oportunidade em um quadro kanban contínuo.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
        Total em aberto:
        <span class="font-semibold text-slate-100">{{ formatCurrency(store.totalPipelineValue) }}</span>
      </div>
    </section>

    <div class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="stage in store.stages"
        :key="stage.id"
        class="w-72 flex-none"
      >
        <div class="mb-3 flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: stage.color }"></div>
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ stage.name }}</span>
          </div>
          <span class="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-500">
            {{ store.getSalesByStage(stage.id).length }}
          </span>
        </div>

        <div class="min-h-48 space-y-3 rounded-3xl border border-slate-800 bg-slate-900/72 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <div
            v-for="sale in store.getSalesByStage(stage.id)"
            :key="sale.id"
            class="cursor-default rounded-2xl border border-slate-800 bg-slate-950/90 p-4 transition-all hover:border-slate-700 hover:bg-slate-950"
          >
            <p class="truncate text-sm font-semibold text-slate-100">{{ sale.contactName }}</p>
            <p class="mt-1 truncate text-xs text-slate-500">{{ sale.title }}</p>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs font-bold text-primary-600">{{ formatCurrency(sale.value) }}</span>
              <span class="text-xs text-slate-500">{{ sale.probability }}%</span>
            </div>
            <div class="mt-2.5">
              <span class="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-400">
                {{ sale.origin }}
              </span>
            </div>
          </div>
          <div v-if="store.getSalesByStage(stage.id).length === 0" class="py-8 text-center text-xs text-slate-600">
            Sem oportunidades
          </div>
        </div>

        <div v-if="stageTotal(stage.id) > 0" class="mt-2 px-1 text-xs text-slate-500">
          Total: <span class="font-medium text-slate-300">{{ formatCurrency(stageTotal(stage.id)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
