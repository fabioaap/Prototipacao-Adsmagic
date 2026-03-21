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
  <div class="space-y-6">
    <!-- Metric cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total de Leads</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ store.metrics.totalLeads }}</p>
        <p class="mt-1 text-xs text-green-600 font-medium">+{{ store.metrics.leadsThisMonth }} este mês</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Taxa de Conversão</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ store.metrics.conversionRate }}%</p>
        <p class="mt-1 text-xs text-gray-400">{{ store.metrics.activeDeals }} negócios ativos</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Receita Total</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ formatCurrency(store.metrics.totalRevenue) }}</p>
        <p class="mt-1 text-xs text-green-600 font-medium">{{ formatCurrency(store.metrics.revenueThisMonth) }} este mês</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">ROI Médio</p>
        <p class="mt-2 text-3xl font-bold text-primary-600">{{ store.metrics.roi }}%</p>
        <p class="mt-1 text-xs text-gray-400">Ticket médio {{ formatCurrency(store.metrics.avgDealValue) }}</p>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Leads by origin -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-5">Leads por Origem</h3>
        <div class="space-y-4">
          <div v-for="item in store.leadsByOrigin" :key="item.origin">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-700 font-medium">{{ item.origin }}</span>
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-gray-900">{{ item.count }}</span>
                <span class="text-xs text-gray-400 w-10 text-right">{{ item.percentage }}%</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="bg-primary-500 h-2 rounded-full transition-all"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue bar chart -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-5">Receita por Mês (R$)</h3>
        <div class="flex items-end gap-2 h-36">
          <div
            v-for="item in store.revenueByMonth"
            :key="item.month"
            class="flex-1 flex flex-col items-center gap-1 h-full justify-end"
          >
            <span class="text-xs text-gray-400 text-center leading-tight" style="font-size: 10px">
              {{ (item.value / 1000).toFixed(1) }}k
            </span>
            <div
              class="w-full bg-primary-500 rounded-t-md hover:bg-primary-600 transition-colors"
              :style="{ height: (item.value / maxRevenue * 100) + '%' }"
            ></div>
            <span class="text-xs text-gray-500 font-medium">{{ item.month }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
