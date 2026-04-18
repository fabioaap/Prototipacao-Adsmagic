<script setup lang="ts">
/**
 * Origins Performance Table Component
 * Tabela de desempenho por origem de tráfego no Dashboard V2
 *
 * Dados vêm de dashboardStore.originsPerformance, carregados por loadDashboardData()
 * (GET /dashboard/origin-performance). Botão "Tentar novamente" chama fetchOriginsPerformance().
 *
 * Features P1 (MVP):
 * - Visualização por origem (origins do projeto)
 * - 6 métricas: ORIGEM, GASTOS, CONTATOS, VENDAS, TAXA DE CONVERSÃO, ROI
 * - Formatação adequada (R$, %, multiplicador)
 * - Skeleton loading durante fetch
 */
import { storeToRefs } from 'pinia'
import { useDashboardV2Store } from '@/stores/dashboardV2'
import OriginBadge from '@/components/dashboard/OriginBadge.vue'
import ROICell from '@/components/dashboard/ROICell.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const store = useDashboardV2Store()
const { originsPerformance, originsPerformanceLoading, originsError } = storeToRefs(store)

// Formatadores
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(1).replace('.', ',')}%`
}
</script>

<template>
  <div class="card-shadow rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="section-title-sm">
          Desempenho por Origem
        </h2>
        <p class="text-xs text-slate-500">
          Análise detalhada de performance de cada origem de tráfego
        </p>
      </div>
    </div>

    <!-- Error State (Etapa 6: originsError por bloco; retry recarrega apenas origens) -->
    <div v-if="originsError && !originsPerformanceLoading" class="p-4 border border-destructive/50 bg-destructive/10 rounded-lg mb-4" role="alert">
      <p class="text-sm text-destructive">{{ originsError }}</p>
      <button
        type="button"
        @click="store.fetchOriginsPerformance()"
        class="mt-2 text-sm underline text-destructive hover:text-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border border-slate-200 rounded-xl">
      <Table class="min-w-[720px]">
        <TableHeader>
          <TableRow class="hover:bg-transparent border-slate-200">
            <TableHead class="w-[180px] font-semibold text-xs uppercase text-slate-500">
              Origem
            </TableHead>
            <TableHead class="text-right font-semibold text-xs uppercase text-slate-500">
              Gastos
            </TableHead>
            <TableHead class="text-right font-semibold text-xs uppercase text-slate-500">
              Contatos
            </TableHead>
            <TableHead class="text-right font-semibold text-xs uppercase text-slate-500">
              Vendas
            </TableHead>
            <TableHead class="text-right font-semibold text-xs uppercase text-slate-500">
              Taxa de Conversão
            </TableHead>
            <TableHead class="text-right font-semibold text-xs uppercase text-slate-500">
              ROI
            </TableHead>
          </TableRow>
        </TableHeader>

        <!-- Loading State (Skeleton) -->
        <TableBody v-if="originsPerformanceLoading">
          <TableRow v-for="i in 6" :key="i">
            <TableCell>
              <div class="flex items-center gap-2">
                <Skeleton class="h-3 w-3 rounded-full" />
                <Skeleton class="h-4 w-[120px]" />
              </div>
            </TableCell>
            <TableCell class="text-right">
              <Skeleton class="h-4 w-[80px] ml-auto" />
            </TableCell>
            <TableCell class="text-right">
              <Skeleton class="h-4 w-[60px] ml-auto" />
            </TableCell>
            <TableCell class="text-right">
              <Skeleton class="h-4 w-[50px] ml-auto" />
            </TableCell>
            <TableCell class="text-right">
              <Skeleton class="h-4 w-[60px] ml-auto" />
            </TableCell>
            <TableCell class="text-right">
              <Skeleton class="h-4 w-[50px] ml-auto" />
            </TableCell>
          </TableRow>
        </TableBody>

        <!-- Empty State: 0 origens = projeto sem origens ativas (backend retorna [] nesse caso) -->
        <TableBody v-else-if="!originsError && originsPerformance.length === 0">
          <TableRow>
            <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
              <p class="text-sm">Nenhuma origem ativa no projeto.</p>
              <p class="text-xs mt-1">Adicione ou ative origens em Configurações do projeto para ver o desempenho por canal.</p>
            </TableCell>
          </TableRow>
        </TableBody>

        <!-- Data Rows -->
        <TableBody v-else>
          <TableRow 
            v-for="origin in originsPerformance" 
            :key="origin.id || origin.origin"
            class="hover:bg-slate-50 transition-colors border-slate-200"
          >
            <TableCell class="py-3">
              <OriginBadge :origin="origin" />
            </TableCell>
            <TableCell class="text-right text-sm text-slate-600 py-3">
              {{ (origin.spent ?? origin.investment) === 0 ? 'R$ 0,00' : formatCurrency(origin.spent ?? origin.investment ?? 0) }}
            </TableCell>
            <TableCell class="text-right text-sm font-medium text-slate-900 py-3">
              {{ origin.contacts.toLocaleString('pt-BR') }}
            </TableCell>
            <TableCell class="text-right text-sm font-medium text-slate-900 py-3">
              {{ origin.sales.toLocaleString('pt-BR') }}
            </TableCell>
            <TableCell class="text-right text-sm text-slate-600 py-3">
              {{ formatPercent(origin.conversionRate) }}
            </TableCell>
            <TableCell class="text-right py-3">
              <ROICell :roi="origin.roi" />
            </TableCell>
          </TableRow>
        </TableBody>

        <!-- Caption -->
        <TableCaption v-if="!originsPerformanceLoading && !originsError && originsPerformance.length > 0" class="text-slate-500">
          Mostrando 1 a {{ originsPerformance.length }} de {{ originsPerformance.length }} resultados
        </TableCaption>
      </Table>
    </div>
  </div>
</template>
