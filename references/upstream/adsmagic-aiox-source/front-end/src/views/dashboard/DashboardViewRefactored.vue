<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useFormat } from '@/composables/useFormat'

// Componentes UI
import StatGrid from '@/components/ui/StatGrid.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import FunnelBar from '@/components/ui/FunnelBar.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import DashboardSection from '@/components/dashboard/DashboardSection.vue'

// Componentes de features
import DashboardChartsTabs from '@/components/dashboard/DashboardChartsTabs.vue'
import DashboardLatestActivities from '@/components/dashboard/DashboardLatestActivities.vue'
import DashboardOriginPerformanceTable from '@/components/dashboard/DashboardOriginPerformanceTable.vue'
import DashboardFinancialMetrics from '@/components/dashboard/DashboardFinancialMetrics.vue'
import DashboardStagesFunnel from '@/components/dashboard/DashboardStagesFunnel.vue'

const dashboardStore = useDashboardStore()
const { formatCurrency } = useFormat()

const responsiveCols = 'auto' as const

// Dados principais
const metrics = computed(() => dashboardStore.metrics)

// Métricas principais (4 cards no topo)
const primaryMetrics = computed(() => {
  const m = metrics.value
  if (!m) return []

  return [
    {
      label: 'Gastos em Anúncios',
      value: formatCurrency(m.totalInvestment ?? 0),
      change: 4.3,
      changeLabel: 'vs. período anterior',
      trend: 'down' // Queremos que caia
    },
    {
      label: 'Receita Total',
      value: formatCurrency(m.revenue?.current ?? m.totalRevenue ?? 0),
      change: m.revenue?.change ?? 9.8,
      changeLabel: 'vs. período anterior',
      trend: 'up'
    },
    {
      label: 'ROI',
      value: `${(m.roi?.current ?? 0).toFixed(1)}x`,
      change: m.roi?.change ?? 0.7,
      changeLabel: 'vs. período anterior',
      trend: 'up'
    },
    {
      label: 'Taxa de Conversão',
      value: `${m.conversionRate?.toFixed(2) ?? '0'}%`,
      change: 1.6,
      changeLabel: 'vs. período anterior',
      trend: 'up'
    }
  ]
})

// Métricas secundárias (grid de 4 cards)
const secondaryMetrics = computed(() => {
  const m = metrics.value
  if (!m) return []

  return [
    {
      label: 'Custo por Venda',
      value: formatCurrency(m.costPerSale ?? 0),
      change: -3.1,
      changeLabel: 'Redução',
      trend: 'down'
    },
    {
      label: 'Contatos Gerados',
      value: m.totalContacts ?? 0,
      change: m.contactsGrowth ?? 12,
      changeLabel: 'Crescimento',
      trend: 'up'
    },
    {
      label: 'Vendas Realizadas',
      value: m.totalSales ?? 0,
      change: m.salesGrowth ?? 2,
      changeLabel: 'Crescimento',
      trend: 'up'
    },
    {
      label: 'Ticket Médio',
      value: formatCurrency(m.averageTicket ?? 0),
      change: 5.2,
      changeLabel: 'Aumento',
      trend: 'up'
    }
  ]
})

// Dados do funil (se existir)
const funnelData = computed(() => {
  const m = metrics.value
  if (!m) return []

  return [
    { label: 'Impressões', value: m.impressions ?? 0 },
    { label: 'Cliques', value: m.clicks ?? 0 },
    { label: 'Contatos', value: m.totalContacts ?? 0 },
    { label: 'Vendas', value: m.totalSales ?? 0 }
  ]
})

onMounted(async () => {
  // Dados já são carregados reativamente pela store
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Container principal com padding responsivo -->
    <div class="page-shell section-stack-lg">
      
      <!-- Header -->
      <PageHeader
        title="Visão Geral"
        description="Acompanhe o desempenho das suas campanhas"
      />

      <!-- Seção 1: Métricas Principais (4 cards) -->
      <DashboardSection title="Métricas Principais">
        <StatGrid :columns="responsiveCols" gap="md" class="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            v-for="metric in primaryMetrics"
            :key="metric.label"
            :label="metric.label"
            :value="metric.value"
            :change="metric.change"
            :change-label="metric.changeLabel"
            :trend="metric.trend as 'up' | 'down' | 'neutral'"
          />
        </StatGrid>
      </DashboardSection>

      <!-- Seção 2: Gráficos (Layout 2x1) -->
      <DashboardSection title="Análise de Desempenho">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Gráfico 1: Contatos vs Vendas -->
          <ChartCard
            title="Contatos e Vendas"
            subtitle="Distribuição temporal do período"
          >
            <DashboardChartsTabs />
          </ChartCard>

          <!-- Gráfico 2: Receita -->
          <ChartCard
            title="Receita"
            subtitle="Evolução da receita ao longo do tempo"
          >
            <div class="h-48 bg-muted rounded-surface flex items-center justify-center">
              <span class="text-muted-foreground">Gráfico de linha (receita)</span>
            </div>
          </ChartCard>
        </div>
      </DashboardSection>

      <!-- Seção 3: Funil de Vendas + Métricas Secundárias -->
      <DashboardSection title="Análise de Funil e Métricas">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Funil -->
          <ChartCard
            title="Funil de Vendas"
            subtitle="Distribuição de contatos por etapa"
          >
            <FunnelBar 
              :steps="funnelData"
              :colors="[
                'hsl(var(--primary))',
                'hsl(var(--info))',
                'hsl(var(--success))',
                'hsl(var(--warning))',
              ]"
            />
          </ChartCard>

          <!-- Métricas Secundárias -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-foreground">Métricas Adicionais</h3>
            <StatGrid :columns="2" gap="md" class="grid-cols-1 sm:grid-cols-2">
              <MetricCard
                v-for="metric in secondaryMetrics"
                :key="metric.label"
                :label="metric.label"
                :value="metric.value"
                :change="metric.change"
                :change-label="metric.changeLabel"
                :trend="metric.trend as 'up' | 'down' | 'neutral'"
              />
            </StatGrid>
          </div>
        </div>
      </DashboardSection>

      <!-- Seção 4: Detalhes Financeiros -->
      <DashboardSection title="Análise Financeira">
        <div class="bg-card rounded-surface border border-border p-4 sm:p-6">
          <DashboardFinancialMetrics />
        </div>
      </DashboardSection>

      <!-- Seção 5: Desempenho por Origem -->
      <DashboardSection title="Desempenho por Origem" action="Ver tudo">
        <div class="bg-card rounded-surface border border-border overflow-hidden">
          <DashboardOriginPerformanceTable />
        </div>
      </DashboardSection>

      <!-- Seção 6: Atividades Recentes -->
      <DashboardSection title="Atividades Recentes">
        <div class="bg-card rounded-surface border border-border p-4 sm:p-6">
          <DashboardLatestActivities />
        </div>
      </DashboardSection>

      <!-- Seção 7: Funil de Estágios -->
      <DashboardSection title="Funil de Estágios de Vendas">
        <div class="bg-card rounded-surface border border-border p-6">
          <DashboardStagesFunnel />
        </div>
      </DashboardSection>

    </div>
  </div>
</template>

<style scoped>
/* Sem estilos adicionais - Tailwind apenas */
</style>
