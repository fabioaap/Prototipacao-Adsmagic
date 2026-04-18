<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { AlertTriangle } from 'lucide-vue-next'
import FunnelBar from '@/components/ui/FunnelBar.vue'
import DashboardSection from '@/components/ui/DashboardSection.vue'
import StatGrid from '@/components/ui/StatGrid.vue'
import MetricCard from '@/components/ui/MetricCard.vue'

const dashboardStore = useDashboardStore()

/**
 * Identifica gargalos (etapas com alta taxa de abandono)
 * Considera gargalo se dropOffRate > 40%
 */
const bottlenecks = computed(() => {
  return dashboardStore.stageFunnelMetrics.filter(
    stage => stage.dropOffRate > 40 && stage.conversionRate < 100
  )
})

/**
 * Formata número com separador de milhares
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR')
}

/**
 * Formata percentual com 1 casa decimal
 */
const formatPercent = (num: number): string => {
  return num.toFixed(1) + '%'
}

/**
 * Transforma stageFunnelMetrics em formato para FunnelBar component
 */
const funnelSteps = computed(() => {
  return dashboardStore.stageFunnelMetrics.map(stage => ({
    label: stage.stageName,
    value: stage.count
  }))
})
</script>

<template>
  <DashboardSection
    title="Funil de Conversão - Etapas de Vendas"
    description="Visualize a distribuição de contatos por etapa e identifique gargalos no processo"
    variant="bordered"
  >
    <!-- Alerta de gargalos -->
    <div 
      v-if="bottlenecks.length > 0" 
      class="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-800 dark:bg-orange-950/20"
    >
      <div class="flex items-start gap-3">
        <AlertTriangle class="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-500 mt-0.5" />
        <div class="flex-1 space-y-1">
          <h4 class="text-sm font-semibold text-orange-900 dark:text-orange-100">
            Gargalos Identificados
          </h4>
          <p class="text-sm leading-relaxed text-orange-700 dark:text-orange-300">
            As seguintes etapas apresentam alta taxa de abandono:
            <strong class="font-semibold">
              {{ bottlenecks.map(b => b.stageName).join(', ') }}
            </strong>
          </p>
        </div>
      </div>
    </div>

    <FunnelBar :steps="funnelSteps" />

    <!-- Resumo de performance -->
    <template #footer>
      <StatGrid gap="md" cols="fixed3" class="mt-2">
        <MetricCard
          label="Total de Contatos"
          :value="formatNumber(dashboardStore.totalContacts)"
        />
        <MetricCard
          label="Taxa de Conversão Geral"
          :value="formatPercent(dashboardStore.conversionRate)"
        />
        <MetricCard
          label="Gargalos Detectados"
          :value="bottlenecks.length"
          :change="bottlenecks.length > 0 ? -1 : 0"
        />
      </StatGrid>
    </template>
  </DashboardSection>
</template>
