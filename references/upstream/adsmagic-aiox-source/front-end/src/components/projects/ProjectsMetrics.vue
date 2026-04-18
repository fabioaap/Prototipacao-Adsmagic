<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '@/composables/useFormat'
import StatGrid from '@/components/ui/StatGrid.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import type { Project } from '@/types/project'

interface Props {
  /** Projetos para agregar métricas (ex: filteredProjects) */
  projects?: Project[]
  /** Estado de carregamento */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  loading: false,
})

const { t } = useI18n()
const { formatCurrency, formatNumber } = useFormat()

/** Métricas agregadas a partir dos projetos (investment, contacts, sales, revenue) */
const aggregatedMetrics = computed(() => {
  const projects = props.projects
  return projects.reduce(
    (acc, p) => ({
      investment: acc.investment + (p.metrics?.investment ?? 0),
      contacts: acc.contacts + (p.metrics?.contacts ?? 0),
      sales: acc.sales + (p.metrics?.sales ?? 0),
      revenue: acc.revenue + (p.metrics?.revenue ?? 0),
    }),
    { investment: 0, contacts: 0, sales: 0, revenue: 0 }
  )
})

const metrics = computed(() => [
  {
    id: 'investment',
    label: t('projects.metrics.investment'),
    value: formatCurrency(aggregatedMetrics.value.investment),
  },
  {
    id: 'contacts',
    label: t('projects.metrics.contacts'),
    value: formatNumber(aggregatedMetrics.value.contacts),
  },
  {
    id: 'sales',
    label: t('projects.metrics.sales'),
    value: formatNumber(aggregatedMetrics.value.sales),
  },
  {
    id: 'revenue',
    label: t('projects.metrics.revenue'),
    value: formatCurrency(aggregatedMetrics.value.revenue),
  },
])
</script>

<template>
  <StatGrid gap="md" cols="responsive" class="grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-4">
    <MetricCard
      v-for="metric in metrics"
      :key="metric.id"
      :label="metric.label"
      :value="props.loading ? '—' : metric.value"
    />
  </StatGrid>
</template>
