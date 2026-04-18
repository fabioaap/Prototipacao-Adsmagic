<script setup lang="ts">
import { DollarSign, TrendingUp, Users, ShoppingCart, MousePointerClick, Eye } from 'lucide-vue-next'
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard.vue'
import DashboardChart from '@/components/dashboard/DashboardChart.vue'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'
import DashboardRecentContacts from '@/components/dashboard/DashboardRecentContacts.vue'
import DashboardTopOrigins from '@/components/dashboard/DashboardTopOrigins.vue'
import type { ApexOptions } from 'apexcharts'
import type { Contact } from '@/types/models'

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    projectId: 'project-1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '987654321',
    countryCode: '+55',
    stage: '1',
    origin: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    projectId: 'project-1',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '912345678',
    countryCode: '+55',
    stage: '2',
    origin: '2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    projectId: 'project-1',
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    phone: '999998888',
    countryCode: '+55',
    stage: '3',
    origin: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

const mockOrigins = [
  { name: 'Facebook Ads', count: 45, percentage: 35, color: 'bg-blue-500' },
  { name: 'Google Ads', count: 38, percentage: 30, color: 'bg-red-500' },
  { name: 'Instagram', count: 25, percentage: 20, color: 'bg-pink-500' },
  { name: 'WhatsApp', count: 13, percentage: 10, color: 'bg-green-500' },
  { name: 'Indicação', count: 6, percentage: 5, color: 'bg-purple-500' },
]

// Time Series Chart
const timeSeriesOptions: ApexOptions = {
  chart: {
    type: 'area' as const,
    height: 350,
    zoom: { enabled: false },
  },
  xaxis: {
    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  },
  yaxis: {
    title: { text: 'Receita (R$)' },
  },
  title: {
    text: 'Receita ao Longo do Ano',
    align: 'left',
  },
}

const timeSeriesData = [
  {
    name: 'Receita',
    data: [15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000],
  },
]

// Funnel Chart
const funnelOptions: ApexOptions = {
  chart: {
    type: 'bar',
    height: 350,
  },
  plotOptions: {
    bar: {
      horizontal: true,
    },
  },
  xaxis: {
    categories: ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Ganho'],
  },
  title: {
    text: 'Funil de Vendas',
    align: 'left',
  },
}

const funnelData = [
  {
    name: 'Contatos',
    data: [250, 180, 120, 80, 45],
  },
]

// Origin Chart (Donut)
const originOptions: ApexOptions = {
  chart: {
    type: 'donut' as const,
    height: 350,
  },
  labels: mockOrigins.map(o => o.name),
  title: {
    text: 'Contatos por Origem',
    align: 'left',
  },
  legend: {
    position: 'bottom',
  },
}

const originData = mockOrigins.map(o => o.count)

const handleAction = (action: string) => {
  console.log('Action:', action)
}

const handleContactClick = (contact: Contact) => {
  console.log('Contact clicked:', contact)
}

const handleOriginClick = (origin: any) => {
  console.log('Origin clicked:', origin)
}
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight mb-2">Dashboard Components Test</h1>
      <p class="text-muted-foreground">
        Teste de componentes de dashboard com métricas, gráficos e widgets
      </p>
    </div>

    <!-- Metrics Cards -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">Metric Cards</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardMetricCard
          title="Receita"
          value="R$ 45.230"
          :icon="DollarSign"
          :change="12.5"
          variant="success"
        />
        <DashboardMetricCard
          title="Vendas"
          value="127"
          :icon="TrendingUp"
          :change="8.3"
          variant="success"
        />
        <DashboardMetricCard
          title="Novos Contatos"
          value="348"
          :icon="Users"
          :change="-3.2"
          variant="destructive"
        />
        <DashboardMetricCard
          title="Taxa de Conversão"
          value="18.5%"
          :icon="ShoppingCart"
          :change="2.1"
          variant="info"
        />
        <DashboardMetricCard
          title="Cliques"
          value="2.458"
          :icon="MousePointerClick"
          :change="0"
          variant="default"
        />
        <DashboardMetricCard
          title="Impressões"
          value="45.2k"
          :icon="Eye"
          :change="15.7"
          variant="warning"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <DashboardQuickActions @action="handleAction" />

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Time Series -->
      <div class="rounded-lg border border-border bg-card p-6">
        <DashboardChart
          type="area" as const
          :series="timeSeriesData"
          :options="timeSeriesOptions"
          :height="300"
        />
      </div>

      <!-- Funnel -->
      <div class="rounded-lg border border-border bg-card p-6">
        <DashboardChart
          type="bar"
          :series="funnelData"
          :options="funnelOptions"
          :height="300"
        />
      </div>

      <!-- Origin Donut -->
      <div class="rounded-lg border border-border bg-card p-6">
        <DashboardChart
          type="donut" as const
          :series="originData"
          :options="originOptions"
          :height="300"
        />
      </div>

      <!-- Top Origins Widget -->
      <DashboardTopOrigins
        :origins="mockOrigins"
        @origin-click="handleOriginClick"
        @view-all="() => console.log('View all origins')"
      />
    </div>

    <!-- Recent Contacts -->
    <DashboardRecentContacts
      :contacts="mockContacts"
      @contact-click="handleContactClick"
      @view-all="() => console.log('View all contacts')"
    />

    <!-- Loading States -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">Loading States</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardMetricCard
          title="Loading Metric"
          value="0"
          :loading="true"
        />
        <DashboardRecentContacts :loading="true" />
        <DashboardTopOrigins :loading="true" />
      </div>
    </div>
  </div>
</template>
