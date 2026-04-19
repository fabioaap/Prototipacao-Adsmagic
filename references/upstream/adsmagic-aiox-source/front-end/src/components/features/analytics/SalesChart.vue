<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import ChartContainer from '@/components/features/analytics/ChartContainer.vue';

interface Props {
  projectId: string;
  autoFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
});

const { timeline, isLoading, error, isEmpty, fetchDashboard } = useAnalytics();

onMounted(() => {
  if (props.autoFetch) {
    fetchDashboard(props.projectId);
  }
});

const normalized = computed(() => {
  const points = timeline.value || [];
  const maxRevenue = Math.max(...points.map(p => p.revenue || 0), 0);
  return points.map(p => ({
    date: p.date,
    revenue: p.revenue,
    sales: p.sales,
    contacts: p.contacts,
    height: maxRevenue > 0 ? Math.round((p.revenue / maxRevenue) * 100) : 0,
  }));
});
</script>

<template>
  <ChartContainer
    title="Receita por dia"
    :is-loading="isLoading"
    :error="error"
    :is-empty="isEmpty || (normalized.length === 0)"
    height="md"
  >
    <div class="flex items-end gap-2 h-full">
      <div
        v-for="point in normalized"
        :key="point.date"
        class="flex-1 flex flex-col items-center gap-2"
      >
        <div
          class="w-full rounded-t-md bg-blue-500/80 dark:bg-blue-400"
          :style="{ height: `${Math.max(point.height, 4)}%` }"
        />
        <span class="text-[10px] text-slate-500 dark:text-slate-400">
          {{ point.date.slice(5) }}
        </span>
        <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">
          R$ {{ point.revenue.toLocaleString('pt-BR') }}
        </span>
      </div>
    </div>
  </ChartContainer>
</template>
