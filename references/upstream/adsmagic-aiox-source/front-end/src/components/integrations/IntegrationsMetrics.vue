<script setup lang="ts">
import { computed } from 'vue'
import { useIntegrationsStore } from '@/stores/integrations'
import StatGrid from '@/components/ui/StatGrid.vue'
import MetricCard from '@/components/ui/MetricCard.vue'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const integrationsStore = useIntegrationsStore()

const totalIntegrations = computed(() => integrationsStore.integrations.length)

const connectedIntegrations = computed(() => 
  integrationsStore.integrations.filter(i => i.status === 'connected').length
)

const disconnectedIntegrations = computed(() => 
  integrationsStore.integrations.filter(i => i.status === 'disconnected' || i.status === 'error').length
)

const connectionRate = computed(() => {
  if (totalIntegrations.value === 0) return 0
  return Math.round((connectedIntegrations.value / totalIntegrations.value) * 100)
})

const metrics = computed(() => [
  {
    id: 'total',
    label: 'Integrações Disponíveis',
    value: totalIntegrations.value,
    change: undefined,
  },
  {
    id: 'connected',
    label: 'Conectadas',
    value: connectedIntegrations.value,
    change: 20,
  },
  {
    id: 'disconnected',
    label: 'Pendentes',
    value: disconnectedIntegrations.value,
    change: -10,
  },
  {
    id: 'rate',
    label: 'Taxa de Conexão',
    value: `${connectionRate.value}%`,
    change: 15,
  },
])
</script>

<template>
  <StatGrid gap="md" cols="responsive">
    <MetricCard
      v-for="metric in metrics"
      :key="metric.id"
      :label="metric.label"
      :value="props.loading ? '—' : metric.value"
      :change="props.loading ? undefined : metric.change"
    />
  </StatGrid>
</template>
