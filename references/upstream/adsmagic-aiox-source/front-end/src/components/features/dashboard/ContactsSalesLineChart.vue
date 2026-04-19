<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import apexchart from 'vue3-apexcharts'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const { t } = useI18n()
const dashboardStore = useDashboardStore()

const chartOptions = ref({
  chart: {
    type: 'line' as const,
    fontFamily: 'inherit',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  xaxis: {
    categories: [] as string[],
    labels: {
      rotate: -45,
      rotateAlways: false
    }
  },
  yaxis: {
    title: {
      text: t('dashboard.charts.contacts')
    },
    labels: {
      formatter: (val: number) => Math.round(val).toString()
    }
  },
  stroke: {
    curve: 'smooth' as const,
    width: 3
  },
  colors: ['#3B82F6', '#10B981'],
  dataLabels: {
    enabled: false
  },
  legend: {
    position: 'bottom' as const,
    horizontalAlign: 'center' as const
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => Math.round(val).toString()
    }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      xaxis: {
        labels: {
          rotate: -90
        }
      }
    }
  }]
})

const chartSeries = computed(() => {
  const timeSeries = dashboardStore.timeSeriesData
  
  if (!timeSeries || timeSeries.length === 0) {
    return []
  }

  return [
    {
      name: t('dashboard.charts.contacts'),
      data: timeSeries.map(item => item.contacts)
    },
    {
      name: t('dashboard.charts.sales'),
      data: timeSeries.map(item => item.sales)
    }
  ]
})

const chartCategories = computed(() => {
  const timeSeries = dashboardStore.timeSeriesData
  
  if (!timeSeries || timeSeries.length === 0) {
    return []
  }

  return timeSeries.map(item => {
    const date = new Date(item.date)
    return `${date.getDate()}/${date.getMonth() + 1}`
  })
})

watch([chartCategories], ([newCategories]) => {
  chartOptions.value = {
    ...chartOptions.value,
    xaxis: {
      ...chartOptions.value.xaxis,
      categories: newCategories
    }
  }
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('dashboard.charts.contactsVsSales') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="dashboardStore.isLoading" class="flex items-center justify-center py-12">
        <Skeleton class="h-80 w-full" />
      </div>
      <div v-else-if="chartSeries.length === 0" class="flex items-center justify-center py-12 text-muted-foreground">
        {{ t('dashboard.originTable.noData') }}
      </div>
      <apexchart
        v-else
        type="line"
        :options="chartOptions"
        :series="chartSeries"
        height="350"
      />
    </CardContent>
  </Card>
</template>
