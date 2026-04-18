<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useFormat } from '@/composables/useFormat'
import apexchart from 'vue3-apexcharts'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const { t } = useI18n()
const dashboardStore = useDashboardStore()
const { formatCurrency } = useFormat()

const chartOptions = ref({
  chart: {
    type: 'donut' as const,
    fontFamily: 'inherit',
    toolbar: {
      show: false
    }
  },
  labels: [] as string[],
  colors: ['#F97316', '#3B82F6', '#EF4444', '#10B981', '#1F2937', '#6B7280', '#D1D5DB'],
  legend: {
    position: 'bottom' as const,
    horizontalAlign: 'center' as const
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 700,
            formatter: (val: string) => formatCurrency(parseFloat(val))
          },
          total: {
            show: true,
            label: t('dashboard.charts.totalRevenue'),
            fontSize: '14px',
            fontWeight: 600,
            formatter: (w: { globals: { seriesTotals: number[] } }) => {
              const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
              return formatCurrency(total)
            }
          }
        }
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 300
      },
      legend: {
        position: 'bottom' as const
      }
    }
  }]
})

const chartSeries = computed(() => {
  const performance = dashboardStore.originPerformanceData
  if (!performance || performance.length === 0) {
    return []
  }
  
  return performance.map(item => item.revenue)
})

const chartLabels = computed(() => {
  const performance = dashboardStore.originPerformanceData
  if (!performance || performance.length === 0) {
    return []
  }
  
  return performance.map(item => item.origin)
})

watch([chartLabels], ([newLabels]) => {
  chartOptions.value = {
    ...chartOptions.value,
    labels: newLabels
  }
})

const totalRevenue = computed(() => {
  const total = chartSeries.value.reduce((sum, val) => sum + val, 0)
  return formatCurrency(total)
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('dashboard.charts.revenueByOrigin') }}</CardTitle>
      <p class="text-sm text-muted-foreground">
        {{ t('dashboard.charts.totalRevenue') }}: {{ totalRevenue }}
      </p>
    </CardHeader>
    <CardContent>
      <div v-if="dashboardStore.isLoading" class="flex items-center justify-center py-12">
        <Skeleton class="h-64 w-64 rounded-full" />
      </div>
      <div v-else-if="chartSeries.length === 0" class="flex items-center justify-center py-12 text-muted-foreground">
        {{ t('dashboard.originTable.noData') }}
      </div>
      <apexchart
        v-else
        type="donut"
        :options="chartOptions"
        :series="chartSeries"
        height="350"
      />
    </CardContent>
  </Card>
</template>
