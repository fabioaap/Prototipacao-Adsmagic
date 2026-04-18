<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardChart from './DashboardChart.vue'
import { BarChart3, PieChart, TrendingUp } from 'lucide-vue-next'
import { formatSafeDate } from '@/utils/formatters'
import ChartCard from '@/components/ui/ChartCard.vue'

// Tab ativa
const activeTab = ref('performance')

// Dados mock para os gráficos
const performanceData = computed(() => {
  return {
    series: [
      {
        name: 'Contatos',
        data: [12, 19, 15, 25, 22, 18, 24, 20, 16, 23, 19, 21, 17, 25, 22, 18, 24, 20, 16, 23, 19, 21, 17, 25, 22, 18, 24, 20, 16, 23]
      },
      {
        name: 'Vendas',
        data: [2, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2]
      }
    ],
    categories: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return formatSafeDate(date, { day: '2-digit', month: '2-digit' })
    })
  }
})

const originsData = computed(() => {
  return {
    sales: [
      { name: 'Google Ads', value: 5, color: '#4285f4' },
      { name: 'Meta Ads', value: 4, color: '#0084ff' },
      { name: 'TikTok Ads', value: 2, color: '#000000' },
      { name: 'Organic', value: 1, color: '#10b981' },
      { name: 'Direct', value: 1, color: '#374151' }
    ],
    revenue: [
      { name: 'Google Ads', value: 3750, color: '#4285f4' },
      { name: 'Meta Ads', value: 3000, color: '#0084ff' },
      { name: 'TikTok Ads', value: 1500, color: '#000000' },
      { name: 'Organic', value: 750, color: '#10b981' },
      { name: 'Direct', value: 1000, color: '#374151' }
    ]
  }
})

const historyData = computed(() => {
  return {
    series: [
      {
        name: 'Receita',
        data: [8500, 9200, 8800, 10500, 9800, 11200, 10800, 12500, 11800, 13200, 12800, 14500, 14200, 15800, 15200, 16800, 16200, 17800, 17200, 18800, 18200, 19800, 19200, 20800, 20200, 21800, 21200, 22800, 22200, 23800]
      }
    ],
    categories: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return formatSafeDate(date, { day: '2-digit', month: '2-digit' })
    })
  }
})

// Toggle para filtrar séries
const showContacts = ref(true)
const showSales = ref(true)

const filteredPerformanceData = computed(() => {
  const series = []
  if (showContacts.value) {
    series.push(performanceData.value.series[0])
  }
  if (showSales.value) {
    series.push(performanceData.value.series[1])
  }
  return {
    series,
    categories: performanceData.value.categories
  }
})

// Configurações dos gráficos
const performanceChartOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    height: 350,
    toolbar: { show: false }
  },
  stroke: {
    width: 3,
    curve: 'smooth' as const
  },
  colors: ['#3b82f6', '#10b981'],
  fill: {
    type: 'gradient' as const,
    gradient: {
      shade: 'light' as const,
      type: 'vertical' as const,
      shadeIntensity: 0.5,
      gradientToColors: ['#3b82f6', '#10b981'],
      inverseColors: false,
      opacityFrom: 0.1,
      opacityTo: 0.3,
      stops: [0, 100]
    }
  },
  xaxis: {
    categories: filteredPerformanceData.value.categories,
    labels: { style: { fontSize: '12px' } }
  },
  yaxis: {
    labels: { style: { fontSize: '12px' } }
  },
  legend: { show: false },
  tooltip: {
    shared: true,
    intersect: false
  }
}))

const originsChartOptions = computed(() => ({
  chart: {
    type: 'pie' as const,
    height: 300
  },
  colors: originsData.value.sales.map(item => item.color),
  labels: originsData.value.sales.map(item => item.name),
  legend: {
    position: 'bottom' as const,
    fontSize: '12px'
  },
  tooltip: {
    y: {
      formatter: (value: number) => `${value} vendas`
    }
  }
}))

const revenueChartOptions = computed(() => ({
  chart: {
    type: 'pie' as const,
    height: 300
  },
  colors: originsData.value.revenue.map(item => item.color),
  labels: originsData.value.revenue.map(item => item.name),
  legend: {
    position: 'bottom' as const,
    fontSize: '12px'
  },
  tooltip: {
    y: {
      formatter: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
    }
  }
}))

const historyChartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    height: 350,
    toolbar: { show: false }
  },
  colors: ['#3b82f6'],
  xaxis: {
    categories: historyData.value.categories,
    labels: { style: { fontSize: '12px' } }
  },
  yaxis: {
    labels: {
      style: { fontSize: '12px' },
      formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`
    }
  },
  tooltip: {
    y: {
      formatter: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
    }
  }
}))
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <!-- Header -->
    <div class="border-b border-border p-6">
      <h3 class="section-title-sm">Análises e Gráficos</h3>
      <p class="text-sm text-muted-foreground">
        Visualizações detalhadas de performance, origens e histórico
      </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-border">
      <nav class="flex space-x-8 px-6" aria-label="Tabs">
        <button
          @click="activeTab = 'performance'"
          :class="[
            'flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors',
            activeTab === 'performance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          ]"
        >
          <TrendingUp class="h-4 w-4" />
          Performance
        </button>
        
        <button
          @click="activeTab = 'origins'"
          :class="[
            'flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors',
            activeTab === 'origins'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          ]"
        >
          <PieChart class="h-4 w-4" />
          Origens
        </button>
        
        <button
          @click="activeTab = 'history'"
          :class="[
            'flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors',
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          ]"
        >
          <BarChart3 class="h-4 w-4" />
          Histórico
        </button>
      </nav>
    </div>

    <!-- Conteúdo das Tabs -->
    <div class="p-6">
      <!-- Tab Performance -->
      <div v-if="activeTab === 'performance'" class="space-y-4">
        <ChartCard
          title="Performance de Contatos e Vendas"
          subtitle="Últimos 30 dias"
        >
          <!-- Toggle para filtrar séries -->
          <div class="flex items-center gap-4 mb-4">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Mostrar:</span>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="showContacts"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
              />
              <span class="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Contatos</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="showSales"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
              />
              <span class="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Vendas</span>
            </label>
          </div>

          <!-- Gráfico de Performance -->
          <DashboardChart
            type="area" as const
            :options="performanceChartOptions"
            :series="filteredPerformanceData.series"
          />
        </ChartCard>
      </div>

      <!-- Tab Origens -->
      <div v-if="activeTab === 'origins'" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Vendas por Origem -->
        <ChartCard
          title="Vendas por Origem"
          subtitle="Distribuição de vendas"
        >
          <DashboardChart
            type="donut" as const
            :options="originsChartOptions"
            :series="originsData.sales.map(item => item.value)"
          />
        </ChartCard>

        <!-- Receita por Origem -->
        <ChartCard
          title="Receita por Origem"
          subtitle="Distribuição de receita"
        >
          <DashboardChart
            type="donut" as const
            :options="revenueChartOptions"
            :series="originsData.revenue.map(item => item.value)"
          />
        </ChartCard>
      </div>

      <!-- Tab Histórico -->
      <div v-if="activeTab === 'history'">
        <ChartCard
          title="Evolução Semanal de Receita"
          subtitle="Últimos 30 dias"
        >
          <DashboardChart
            type="line" as const
            :options="historyChartOptions"
            :series="historyData.series"
          />
        </ChartCard>
      </div>
    </div>
  </div>
</template>
