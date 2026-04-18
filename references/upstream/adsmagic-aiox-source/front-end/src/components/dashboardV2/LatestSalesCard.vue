<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Sale {
  customerName: string
  plan: string
  value: number
}

interface Props {
  sales: Sale[]
}

defineProps<Props>()

const emit = defineEmits<{
  export: []
  saleClick: [sale: Sale]
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
</script>

<template>
  <div class="card-shadow rounded-3xl border border-slate-200 bg-white p-6">
    <div class="flex items-start justify-between">
      <div>
        <h2 class="section-title-sm">Últimas vendas</h2>
        <p class="text-xs text-slate-500">Negócios fechados recentemente.</p>
      </div>
      <Button
        variant="outline"
        class="text-xs text-slate-600 hover:text-slate-700"
        @click="emit('export')"
      >
        Exportar
      </Button>
    </div>
    
    <ul class="mt-6 space-y-3 text-sm text-slate-600">
      <li
        v-for="(sale, index) in sales"
        :key="index"
        class="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50"
        @click="emit('saleClick', sale)"
      >
        <div>
          <p class="font-medium text-slate-900">{{ sale.customerName }}</p>
          <p class="text-xs text-slate-500">{{ sale.plan }}</p>
        </div>
        <p class="text-sm section-title-sm">{{ formatCurrency(sale.value) }}</p>
      </li>
    </ul>
  </div>
</template>
