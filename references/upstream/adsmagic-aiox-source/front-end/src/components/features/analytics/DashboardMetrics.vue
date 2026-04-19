<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import MetricCard from '@/components/features/analytics/MetricCard.vue';

interface Props {
  projectId: string;
  autoFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
});

const {
  growth,
  totalContacts,
  totalSales,
  totalRevenue,
  conversionRate,
  isLoading,
  error,
  fetchDashboard,
} = useAnalytics();

onMounted(() => {
  if (props.autoFetch) {
    fetchDashboard(props.projectId);
  }
});

const cards = computed(() => {
  return [
    {
      label: 'Contatos',
      value: totalContacts.value,
      growth: growth.value.contacts,
      unit: 'contatos',
    },
    {
      label: 'Vendas',
      value: totalSales.value,
      growth: growth.value.sales,
      unit: 'vendas',
    },
    {
      label: 'Receita',
      value: totalRevenue.value,
      growth: growth.value.revenue,
      unit: 'R$'
    },
    {
      label: 'Conversão',
      value: conversionRate.value,
      growth: growth.value.conversion,
      unit: '%',
    },
  ];
});
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <MetricCard
      v-for="card in cards"
      :key="card.label"
      :label="card.label"
      :value="card.value"
      :growth="card.growth"
      :unit="card.unit"
      :is-loading="isLoading"
      :error="error"
    />
  </div>
</template>
