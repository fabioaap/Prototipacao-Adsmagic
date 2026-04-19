<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from '@/components/layout/AppShell.vue';
import { useAnalytics } from '@/composables/useAnalytics';
import { usePeriodFilter } from '@/composables/usePeriodFilter';
import ChartCard from '@/components/ui/ChartCard.vue';
import DashboardSection from '@/components/ui/DashboardSection.vue';
import DashboardMetrics from '@/components/features/analytics/DashboardMetrics.vue';
import SalesChart from '@/components/features/analytics/SalesChart.vue';
import FunnelChart from '@/components/features/analytics/FunnelChart.vue';
import OriginChart from '@/components/features/analytics/OriginChart.vue';
import PerformanceTable from '@/components/features/analytics/PerformanceTable.vue';
import RecentActivityTable from '@/components/features/analytics/RecentActivityTable.vue';
import FilterBar from '@/components/features/analytics/FilterBar.vue';

const route = useRoute();
const projectId = computed(() => route.params.projectId as string);

// Store helpers
const { fetchDashboard, refreshData, isLoading, error } = useAnalytics();
const filter = usePeriodFilter({
  projectId: projectId.value,
  autoFetch: true,
  syncRouteParams: true,
});

// Initial fetch
onMounted(() => {
  if (projectId.value) {
    fetchDashboard(projectId.value);
  }
});

const handlePeriodChange = (period: 'today' | 'week' | 'month') => {
  if (projectId.value) {
    filter.changePeriod(period);
    refreshData(projectId.value);
  }
};

const handleClear = () => {
  // Limpa filtros de origem/estágio no store se existirem
  // (store já tem clearFilters, expor futuramente no composable se necessário)
};
</script>

<template>
  <AppShell container-size="2xl">
    <div class="py-8 space-y-8">
      <FilterBar
        :periods="filter.periods.value"
        :current-period="filter.currentPeriod.value"
        :is-loading="isLoading"
        @update:period="handlePeriodChange"
        @clear="handleClear"
      />

      <DashboardSection
        title="Métricas Principais"
        description="Visão geral do desempenho do projeto no período selecionado"
        variant="bordered"
      >
        <DashboardMetrics :project-id="projectId" />
      </DashboardSection>

      <div class="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Vendas ao Longo do Tempo"
          subtitle="Evolução de vendas e conversões no período"
        >
          <SalesChart :project-id="projectId" />
        </ChartCard>
        <ChartCard
          title="Funil de Conversão"
          subtitle="Análise detalhada do funil de vendas por estágio"
        >
          <FunnelChart :project-id="projectId" />
        </ChartCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Origem dos Leads"
          subtitle="Distribuição de contatos por canal de origem"
        >
          <OriginChart :project-id="projectId" />
        </ChartCard>
        <ChartCard
          title="Desempenho por Origem"
          subtitle="Taxa de conversão e ROI por canal"
        >
          <PerformanceTable :project-id="projectId" />
        </ChartCard>
      </div>

      <ChartCard
        title="Atividade Recente"
        subtitle="Últimas interações e conversões registradas"
      >
        <RecentActivityTable :project-id="projectId" />
      </ChartCard>

      <div v-if="error" class="text-sm text-red-500">
        {{ error }}
      </div>
    </div>
  </AppShell>
</template>
