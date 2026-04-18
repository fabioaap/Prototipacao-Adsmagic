<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import StatTable from '@/components/features/analytics/StatTable.vue';

type ColumnDef = {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
};

interface Props {
  projectId: string;
  autoFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
});

// NOTE: Store não tem endpoints de recentes ainda; usamos timeline como proxy simples.
// Quando o backend expor recentes, basta trocar para dados reais.
const { timeline, isLoading, error, isEmpty, fetchDashboard } = useAnalytics();

onMounted(() => {
  if (props.autoFetch) {
    fetchDashboard(props.projectId);
  }
});

const columns: ColumnDef[] = [
  { key: 'date', label: 'Data', sortable: true },
  { key: 'contacts', label: 'Novos Contatos', sortable: true, align: 'right' },
  { key: 'sales', label: 'Vendas', sortable: true, align: 'right' },
  { key: 'revenue', label: 'Receita', sortable: true, align: 'right', format: (v: number) => `R$ ${v.toLocaleString('pt-BR')}` },
];

const rows = computed(() => timeline.value || []);
</script>

<template>
  <StatTable
    title="Atividade recente (proxy)"
    :columns="columns"
    :rows="rows"
    :is-loading="isLoading"
    :is-empty="isEmpty || rows.length === 0"
    :error="error"
    :page-size="10"
  />
</template>
