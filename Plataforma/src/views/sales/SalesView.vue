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
  <div>
    <div class="mb-4 flex items-center gap-4">
      <p class="text-sm text-gray-500">
        Pipeline ativo:
        <span class="font-semibold text-gray-900">{{ formatCurrency(store.totalPipelineValue) }}</span>
      </p>
    </div>

    <div class="flex gap-3 overflow-x-auto pb-4">
      <div
        v-for="stage in store.stages"
        :key="stage.id"
        class="flex-none w-56"
      >
        <!-- Stage header -->
        <div class="flex items-center justify-between mb-2 px-1">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: stage.color }"></div>
            <span class="text-xs font-semibold text-gray-700">{{ stage.name }}</span>
          </div>
          <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {{ store.getSalesByStage(stage.id).length }}
          </span>
        </div>

        <!-- Cards column -->
        <div class="space-y-2 min-h-48 bg-gray-100 rounded-xl p-2">
          <div
            v-for="sale in store.getSalesByStage(stage.id)"
            :key="sale.id"
            class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            <p class="text-xs font-semibold text-gray-800 truncate">{{ sale.contactName }}</p>
            <p class="text-xs text-gray-500 mt-0.5 truncate">{{ sale.title }}</p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs font-bold text-primary-600">{{ formatCurrency(sale.value) }}</span>
              <span class="text-xs text-gray-400">{{ sale.probability }}%</span>
            </div>
            <div class="mt-1.5">
              <span class="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                {{ sale.origin }}
              </span>
            </div>
          </div>
          <div v-if="store.getSalesByStage(stage.id).length === 0" class="py-6 text-center text-xs text-gray-300">
            Sem oportunidades
          </div>
        </div>

        <!-- Stage total -->
        <div v-if="stageTotal(stage.id) > 0" class="mt-1.5 px-1 text-xs text-gray-500">
          Total: <span class="font-medium">{{ formatCurrency(stageTotal(stage.id)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
