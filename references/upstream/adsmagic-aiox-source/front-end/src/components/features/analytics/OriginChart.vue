<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import ChartContainer from '@/components/features/analytics/ChartContainer.vue';

interface Props {
  projectId: string;
  autoFetch?: boolean;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
  limit: 10,
});

const { topOrigins, isLoading, error, isEmpty, fetchDashboard } = useAnalytics();

onMounted(() => {
  if (props.autoFetch) {
    fetchDashboard(props.projectId);
  }
});

const origins = computed(() => {
  const list = topOrigins.value || [];
  return list.slice(0, props.limit);
});

const maxValue = computed(() => {
  const values = origins.value.map(o => o.revenue || 0);
  return Math.max(...values, 0);
});
</script>

<template>
  <ChartContainer
    title="Receita por origem"
    :is-loading="isLoading"
    :error="error"
    :is-empty="isEmpty || origins.length === 0"
    height="md"
  >
    <div class="flex flex-col gap-3 px-6 py-4">
      <div
        v-for="origin in origins"
        :key="origin.id"
        class="flex items-center gap-3"
      >
        <div class="w-32 text-sm font-medium text-slate-800 dark:text-slate-100 truncate" :title="origin.name">
          {{ origin.name }}
        </div>
        <div class="flex-1">
          <div
            class="h-4 rounded-full bg-blue-500/80 dark:bg-blue-400"
            :style="{ width: `${maxValue === 0 ? 5 : Math.max((origin.revenue / maxValue) * 100, 5)}%` }"
          />
        </div>
        <div class="w-28 text-right text-sm text-slate-700 dark:text-slate-200">
          R$ {{ origin.revenue.toLocaleString('pt-BR') }}
        </div>
        <div class="w-16 text-right text-xs font-semibold" :class="origin.conversionRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'">
          {{ origin.conversionRate.toFixed(1) }}%
        </div>
      </div>
    </div>
  </ChartContainer>
</template>
