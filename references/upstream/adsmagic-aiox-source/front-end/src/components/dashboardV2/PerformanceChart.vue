<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { TimeSeriesPoint } from '@/types'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import SelectTrigger from '@/components/ui/SelectTrigger.vue'
import SelectValue from '@/components/ui/SelectValue.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useResponsiveChart } from '@/composables/useResponsiveChart'

interface Props {
  /**
   * Time series data
   */
  data: TimeSeriesPoint[]
  
  /**
   * Chart title
   */
  title?: string
  
  /**
   * Chart description
   */
  description?: string
  
  /**
   * Selected metric
   */
  metric?: 'contacts' | 'sales' | 'revenue' | 'spend'
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Whether to show comparison line
   */
  showComparison?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Performance ao Longo do Tempo',
  description: 'Evolução das métricas no período selecionado',
  metric: 'contacts',
  loading: false,
  showComparison: false
})

const emit = defineEmits<{
  'update:metric': [value: 'contacts' | 'sales' | 'revenue' | 'spend']
  'drilldown': [date: string, metric: 'contacts' | 'sales' | 'revenue' | 'spend', value: number]
}>()

// Responsive chart hook
const { isMobile, isTablet, dimensions } = useResponsiveChart()
const chartHeight = computed(() => dimensions.value.height)

// Metric options
const metricOptions = [
  { value: 'contacts', label: 'Contatos' },
  { value: 'sales', label: 'Vendas' },
  { value: 'revenue', label: 'Receita' },
  { value: 'spend', label: 'Gastos' }
]

// Chart options
const chartOptions = computed(() => {
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const { fontSize, showLabels, padding } = dimensions.value

  return {
    chart: {
      type: 'line' as const,
      height: chartHeight.value,
      toolbar: {
        show: !isMobile.value,
        tools: {
          download: !isMobile.value,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      background: 'transparent',
      fontFamily: 'inherit',
      events: {
        dataPointSelection: (_event: any, _chartContext: any, config: any) => {
          const dataPointIndex = config.dataPointIndex
          if (dataPointIndex >= 0 && dataPointIndex < props.data.length) {
            const point = props.data[dataPointIndex]
            if (point) {
              emit('drilldown', point.date, props.metric, point.value)
            }
          }
        },
        markerClick: (_event: any, _chartContext: any, config: any) => {
          const dataPointIndex = config.dataPointIndex
          if (dataPointIndex >= 0 && dataPointIndex < props.data.length) {
            const point = props.data[dataPointIndex]
            if (point) {
              emit('drilldown', point.date, props.metric, point.value)
            }
          }
        }
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: isMobile.value ? [2, 1.5] : [3, 2]
    },
    colors: props.showComparison ? ['hsl(var(--info))', 'hsl(var(--muted-foreground))'] : ['hsl(var(--info))'],
    dataLabels: {
      enabled: false
    },
    markers: {
      size: isMobile.value ? 3 : 4,
      strokeWidth: isMobile.value ? 1 : 2,
      hover: {
        size: isMobile.value ? 5 : 6
      }
    },
    xaxis: {
      categories: props.data.map(d => d.date),
      labels: {
        show: showLabels,
        style: {
          colors: isDark ? '#94a3b8' : '#64748b',
          fontSize: `${fontSize}px`
        },
        formatter: (value: string) => {
          const date = new Date(value)
          if (isMobile.value) {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'numeric' })
          }
          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        },
        rotate: isMobile.value ? -45 : 0,
        rotateAlways: isMobile.value
      },
      axisBorder: {
        show: showLabels
      },
      axisTicks: {
        show: showLabels
      }
    },
    yaxis: {
      labels: {
        show: showLabels,
        style: {
          colors: isDark ? '#94a3b8' : '#64748b',
          fontSize: `${fontSize}px`
        },
        formatter: (value: number) => {
          if (props.metric === 'revenue' || props.metric === 'spend') {
            if (isMobile.value) {
              return `R$ ${(value / 1000).toFixed(0)}k`
            }
            return `R$ ${value.toLocaleString('pt-BR')}`
          }
          return value.toFixed(0)
        }
      }
    },
    grid: {
      borderColor: isDark ? '#334155' : '#e2e8f0',
      strokeDashArray: 4,
      padding: {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding
      },
      xaxis: {
        lines: {
          show: !isMobile.value
        }
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: `${fontSize}px`
      },
      x: {
        formatter: (_value: any, { dataPointIndex }: any) => {
          if (dataPointIndex >= props.data.length) return ''
          const date = new Date(props.data[dataPointIndex]?.date || '')
          return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })
        }
      },
      y: {
        formatter: (value: number) => {
          if (props.metric === 'revenue' || props.metric === 'spend') {
            return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
          return value.toFixed(0)
        }
      }
    },
    legend: {
      show: props.showComparison,
      position: isMobile.value ? 'bottom' as const : (isTablet.value ? 'bottom' as const : 'top' as const),
      horizontalAlign: 'right' as const,
      fontSize: `${fontSize}px`,
      labels: {
        colors: isDark ? '#94a3b8' : '#64748b'
      },
      itemMargin: {
        horizontal: isMobile.value ? 8 : 12,
        vertical: isMobile.value ? 4 : 8
      }
    }
  }
})

// Chart series
const chartSeries = computed(() => {
  const series: any[] = [
    {
      name: 'Atual',
      data: props.data.map(d => d.value)
    }
  ]

  if (props.showComparison) {
    series.push({
      name: 'Anterior',
      data: props.data.map(d => d.compareValue || 0)
    })
  }

  return series
})

// Handle metric change
function handleMetricChange(value: string) {
  emit('update:metric', value as 'contacts' | 'sales' | 'revenue' | 'spend')
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle class="text-base sm:text-lg">{{ props.title }}</CardTitle>
          <CardDescription class="text-xs sm:text-sm">{{ props.description }}</CardDescription>
        </div>

        <Select
          :model-value="props.metric"
          @update:model-value="handleMetricChange"
        >
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue placeholder="Selecione a métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in metricOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    
    <CardContent class="px-2 sm:px-6">
      <!-- Loading State -->
      <div v-if="props.loading" class="space-y-4">
        <Skeleton :class="`h-[${chartHeight}px] w-full`" />
      </div>

      <!-- Chart -->
      <div v-else-if="props.data.length > 0" class="overflow-x-auto">
        <VueApexCharts
          type="line"
          :height="chartHeight"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        :class="`flex items-center justify-center h-[${chartHeight}px]`"
      >
        <p class="text-sm text-muted-foreground text-center px-4">
          Nenhum dado disponível para o gráfico
        </p>
      </div>
    </CardContent>
  </Card>
</template>
