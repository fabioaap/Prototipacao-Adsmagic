<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import ChartContainer from '@/components/features/analytics/ChartContainer.vue';

interface Props {
  projectId: string;
  autoFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
});

const { funnel, isLoading, error, isEmpty, fetchDashboard } = useAnalytics();

onMounted(() => {
  if (props.autoFetch) {
    fetchDashboard(props.projectId);
  }
});
</script>

<template>
  <ChartContainer
    title="Funil de conversão"
    :is-loading="isLoading"
    :error="error"
    :is-empty="isEmpty || funnel.length === 0"
    height="md"
  >
    <div class="flex flex-col gap-3 px-6 py-4">
      <div
        v-for="(stage, index) in funnel"
        :key="stage.id"
        class="flex items-center gap-3"
      >
        <div class="w-28 text-xs text-slate-600 dark:text-slate-300">
          {{ index + 1 }}. {{ stage.name }}
        </div>
        <div class="flex-1">
          <div
            class="h-6 rounded-full bg-blue-500/80 dark:bg-blue-400"
            :style="{ width: `${Math.max(stage.percentage, 3)}%` }"
          />
        </div>
        <div class="w-32 text-right text-xs text-slate-600 dark:text-slate-300">
          {{ stage.contactCount }} contatos
        </div>
        <div class="w-24 text-right text-xs font-semibold" :class="stage.conversionFromPrevious > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'">
          {{ stage.conversionFromPrevious.toFixed(1) }}%
        </div>
      </div>
    </div>
  </ChartContainer>
</template>
