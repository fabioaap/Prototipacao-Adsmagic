<script setup lang="ts">
import { computed, ref } from 'vue'
import { RefreshCcw, Download, Loader2 } from '@/composables/useIcons'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Select from '@/components/ui/Select.vue'
import Switch from '@/components/ui/Switch.vue'
import Table from '@/components/ui/TableLegacy.vue'
import Progress from '@/components/ui/Progress.vue'
import { exportDashboard } from '@/utils/dashboardExport'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const isExporting = ref(false)

const period = ref('30')
const source = ref('all')
const compareEnabled = ref(true)
const refreshTick = ref(0)

const periodOptions = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
]

const sourceOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'Google Ads', label: 'Google Ads' },
  { value: 'Meta Ads', label: 'Meta Ads' },
  { value: 'Organic', label: 'Orgânico' },
]

const baseKpis = { investment: 5200, revenue: 25500, leads: 460, sales: 52, roas: 4.9 }
const baseChannels = [
  { name: 'Google Ads', spend: 2400, leads: 120, cpl: 20 },
  { name: 'Meta Ads', spend: 1800, leads: 150, cpl: 12 },
  { name: 'Organic', spend: 0, leads: 45, cpl: 0 },
  { name: 'Email', spend: 200, leads: 30, cpl: 6.6 }
]
const baseFunnel = { impressions: 82000, clicks: 9600, leads: 480, opportunities: 190, sales: 52 }
const insights = [
  { tone: 'crit', title: 'CPL alto em Meta Ads', desc: 'CPL subiu 25% nos ultimos 2 dias; revisar criativos saturados.' },
  { tone: 'good', title: 'Meta organica batida', desc: 'Leads organicos superaram a meta semanal em 12%.' },
  { tone: 'warn', title: 'Orcamento limitando delivery', desc: 'Campanha Insti_Search limitada pelo orcamento diario.' }
]

const periodFactor = computed(() => (period.value === '7' ? 0.35 : period.value === '90' ? 3 : 1))
const sourceFactor = computed(() => (source.value === 'all' ? 1 : 0.6))

const kpis = computed(() => {
  const mult = periodFactor.value * sourceFactor.value
  return [
    { label: 'Investimento', value: formatCurrency(baseKpis.investment * mult), delta: '+8.4%' },
    { label: 'Receita', value: formatCurrency(baseKpis.revenue * mult), delta: '+12.1%' },
    { label: 'ROAS', value: `${(baseKpis.roas * sourceFactor.value).toFixed(2)}x`, delta: '+3.2%' },
    { label: 'Leads', value: formatNumber(baseKpis.leads * mult), delta: '+6.0%' },
    { label: 'Vendas', value: formatNumber(baseKpis.sales * mult), delta: '+4.5%' }
  ]
})

const acquisitionRows = computed(() => {
  const mult = periodFactor.value * sourceFactor.value
  return baseChannels.map((row, idx) => {
    const seed = seeded(idx + refreshTick.value)
    const spend = Math.max(0, row.spend * mult * (0.9 + seed * 0.2))
    const leads = Math.max(0, row.leads * mult * (0.9 + seed * 0.2))
    const cpl = leads === 0 ? 0 : spend / leads
    return { ...row, spend, leads, cpl }
  })
})

const funnelStages = computed(() => {
  const mult = periodFactor.value * sourceFactor.value
  const impressions = baseFunnel.impressions * mult
  const clicks = baseFunnel.clicks * mult
  const leads = baseFunnel.leads * mult
  const opportunities = baseFunnel.opportunities * mult
  const sales = baseFunnel.sales * mult
  const maxVal = impressions || 1
  return [
    { name: 'Impressoes', value: impressions, pct: (impressions / maxVal) * 100 },
    { name: 'Cliques', value: clicks, pct: (clicks / maxVal) * 100 },
    { name: 'Leads', value: leads, pct: (leads / maxVal) * 100 },
    { name: 'Oportunidades', value: opportunities, pct: (opportunities / maxVal) * 100 },
    { name: 'Vendas', value: sales, pct: (sales / maxVal) * 100 }
  ]
})

const chartData = computed(() => {
  const mult = periodFactor.value * sourceFactor.value
  const base = 180 * mult
  return Array.from({ length: 12 }).map((_, idx) => {
    const s = seeded(idx * 7 + refreshTick.value)
    return { label: `${idx + 1}${period.value === '7' ? 'h' : 'd'}`, value: base * (0.7 + s * 0.8), target: base * 0.95 }
  })
})

const chartPaths = computed(() => buildChartPaths(chartData.value))

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function seeded(seed: number) {
  const x = Math.sin(seed + period.value.length + source.value.length) * 10000
  return x - Math.floor(x)
}

function buildChartPaths(data: Array<{ label: string; value: number; target: number }>) {
  const width = 640
  const height = 220
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const step = width / Math.max(data.length - 1, 1)
  const points = data.map((d, idx) => ({ x: idx * step, y: height - (d.value / maxVal) * height, label: d.label, value: d.value, target: d.target }))
  const area = ['M 0', height, ...points.map(p => `L ${p.x} ${p.y}`), `L ${width} ${height}`, 'Z']
  const line = [`M ${points[0]?.x ?? 0} ${points[0]?.y ?? height}`, ...points.slice(1).map(p => `L ${p.x} ${p.y}`)]
  return { area: area.join(' '), line: line.join(' '), points, width, height }
}

function refreshData() {
  refreshTick.value += 1
}

async function handleExport() {
  if (isExporting.value) return
  
  isExporting.value = true
  try {
    await exportDashboard('dashboard-content')
    toast({
      title: 'Exportação concluída',
      description: 'Dashboard exportado como PNG com sucesso'
    })
  } catch (error) {
    console.error('Erro ao exportar dashboard:', error)
    toast({
      title: 'Erro na exportação',
      description: 'Não foi possível exportar o dashboard',
      variant: 'destructive'
    })
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 pb-12">
      <section class="flex flex-col gap-6 rounded-[32px] bg-gradient-to-b from-slate-100 via-white to-white px-5 sm:px-6 py-6 sm:py-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:flex-row md:items-start md:justify-between">
        <div class="space-y-2">
          <Badge variant="soft" color="info" class="uppercase tracking-[0.3em]">KPIs</Badge>
          <h1 class="text-3xl font-bold leading-8 text-foreground">Dashboard Performance</h1>
          <p class="text-sm text-muted-foreground">Acompanhe o fluxo completo: Resumo → Diagnóstico → Ação.</p>
        </div>
        <div class="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-3 items-start">
          <div class="w-full">
            <Select v-model="period" :options="periodOptions" size="sm" />
          </div>
          <div class="w-full">
            <Select v-model="source" :options="sourceOptions" size="sm" />
          </div>
          <div class="w-full flex items-center justify-between rounded-lg border px-3 py-2 sm:px-4 sm:py-3">
            <span class="text-sm font-medium text-muted-foreground">Comparar</span>
            <Switch v-model="compareEnabled" label="" size="md" />
          </div>
          <Button variant="outline" size="sm" class="gap-2 w-full" @click="refreshData">
            <RefreshCcw class="h-4 w-4" /> Atualizar
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            class="gap-2 w-full" 
            :disabled="isExporting"
            @click="handleExport"
          >
            <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
            <Download v-else class="h-4 w-4" />
            {{ isExporting ? 'Exportando...' : 'Exportar' }}
          </Button>
        </div>
      </section>

      <!-- Conteúdo do dashboard para exportação -->
      <div id="dashboard-content">
      <section class="space-y-3 rounded-[32px] border border-slate-100 bg-white/90 p-4 sm:p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div class="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
          <Badge variant="soft" color="info">KPIs</Badge>
          <span>Resumo executivo</span>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card
            v-for="item in kpis"
            :key="item.label"
            class="border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
          >
            <CardContent class="space-y-2 p-5">
              <div class="flex items-start justify-between text-muted-foreground">
                <span class="text-sm font-semibold">{{ item.label }}</span>
                <Badge v-if="compareEnabled" variant="soft" color="success">{{ item.delta }}</Badge>
              </div>
              <p class="text-3xl font-bold tracking-tight text-foreground">{{ item.value }}</p>
              <p class="text-xs text-muted-foreground">Total acumulado</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Badge variant="soft" color="info">Diagnóstico</Badge>
            <span>Funil e insights</span>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card class="border-border/70">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Aquisição por canal</CardTitle>
              <CardDescription>Investimento, leads e CPL</CardDescription>
            </CardHeader>
            <CardContent>
              <Table density="compact">
                <template #head>
                  <th class="px-3 py-2 text-left">Canal</th>
                  <th class="px-3 py-2 text-right">Inv.</th>
                  <th class="px-3 py-2 text-right">Leads</th>
                  <th class="px-3 py-2 text-right">CPL</th>
                </template>
                <tr v-for="row in acquisitionRows" :key="row.name" class="hover:bg-muted/40">
                  <td class="px-3 py-2">
                    <div class="font-semibold text-foreground">{{ row.name }}</div>
                    <div class="text-xs text-muted-foreground">Status: Ativo</div>
                  </td>
                  <td class="px-3 py-2 text-right font-mono text-sm">{{ formatCurrency(row.spend) }}</td>
                  <td class="px-3 py-2 text-right font-mono text-sm">{{ formatNumber(row.leads) }}</td>
                  <td class="px-3 py-2 text-right font-mono text-sm">{{ row.cpl === 0 ? '-' : formatCurrency(row.cpl) }}</td>
                </tr>
              </Table>
            </CardContent>
          </Card>

          <Card class="border-border/70">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Eficiência do funil</CardTitle>
              <CardDescription>Topo para base</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div v-for="stage in funnelStages" :key="stage.name" class="space-y-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-foreground">{{ stage.name }}</p>
                  <span class="text-xs text-muted-foreground">{{ stage.pct.toFixed(1) }}%</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="font-mono text-sm text-foreground">{{ formatNumber(stage.value) }}</span>
                  <Progress :value="stage.pct" :max="100" size="sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border-border/70">
            <CardHeader class="pb-2">
              <CardTitle class="text-base">Insights</CardTitle>
              <CardDescription>Sugestões rápidas</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div
                v-for="insight in insights"
                :key="insight.title"
                class="cursor-pointer rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-primary/40 hover:bg-background"
              >
                <div class="flex items-center justify-between">
                  <Badge
                    class="uppercase"
                    :variant="insight.tone === 'crit' ? 'destructive' : 'soft'"
                    :color="insight.tone === 'crit' ? 'destructive' : insight.tone === 'warn' ? 'warning' : 'success'"
                  >
                    {{ insight.tone === 'crit' ? 'Crítico' : insight.tone === 'warn' ? 'Atenção' : 'Positivo' }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">Detalhar</span>
                </div>
                <p class="mt-2 text-sm font-semibold text-foreground">{{ insight.title }}</p>
                <p class="text-xs text-muted-foreground">{{ insight.desc }}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Badge variant="soft" color="info">Tendência</Badge>
            <span>Evolução temporal</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-primary"></span> Vendas</span>
            <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full border border-border"></span> Meta</span>
          </div>
        </div>
        <Card class="border-border/70">
          <CardHeader class="pb-1">
            <CardTitle class="text-base">Investimento vs Vendas</CardTitle>
            <CardDescription>Linha e área com meta</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="relative">
              <svg class="h-64 w-full" preserveAspectRatio="none" :viewBox="`0 0 ${chartPaths.width} ${chartPaths.height}`">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path :d="chartPaths.area" fill="url(#areaFill)" stroke="none" />
                <path :d="chartPaths.line" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" />
                <g>
                  <circle
                    v-for="point in chartPaths.points"
                    :key="point.label"
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    fill="#fff"
                    stroke="#4f46e5"
                    stroke-width="2"
                  />
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>
      </section>
      </div><!-- fim dashboard-content -->
    </div>
  </AppLayout>
</template>