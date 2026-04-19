<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useFormat } from '@/composables/useFormat'
import MetricCard from './MetricCard.vue'
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Users,
  Target,
  Eye,
  MousePointer,
  CreditCard,
  Receipt
} from 'lucide-vue-next'

const { t } = useI18n()
const dashboardStore = useDashboardStore()
const { formatCurrency, formatNumber } = useFormat()

const metrics = computed(() => {
  const data = dashboardStore.metrics
  
  if (!data) {
    return []
  }

  return [
    {
      label: t('dashboard.metrics.adSpend'),
      value: formatCurrency(data.financial.adSpend),
      icon: CreditCard,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.revenue'),
      value: formatCurrency(data.revenue.current),
      icon: DollarSign,
      comparison: data.revenue.change,
      variant: 'success' as const
    },
    {
      label: t('dashboard.metrics.averageTicket'),
      value: formatCurrency(data.averageTicket),
      icon: Receipt,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.roi'),
      value: `${data.roi.current.toFixed(1)}x`,
      icon: TrendingUp,
      comparison: data.roi.change,
      variant: 'warning' as const
    },
    {
      label: t('dashboard.metrics.costPerSale'),
      value: formatCurrency(data.costPerSale),
      icon: Target,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.newContacts'),
      value: formatNumber(data.totalContacts),
      icon: Users,
      comparison: data.contactsGrowth || 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.sales'),
      value: formatNumber(data.sales.current),
      icon: ShoppingCart,
      comparison: data.sales.change,
      variant: 'success' as const
    },
    {
      label: t('dashboard.metrics.salesRate'),
      value: `${data.conversionRate.toFixed(2)}%`,
      icon: Percent,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.impressions'),
      value: formatNumber(data.impressions),
      icon: Eye,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.clicks'),
      value: formatNumber(data.clicks),
      icon: MousePointer,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.costPerClick'),
      value: formatCurrency(data.cpc),
      icon: CreditCard,
      comparison: 0,
      variant: 'default' as const
    },
    {
      label: t('dashboard.metrics.clickThroughRate'),
      value: `${data.ctr.toFixed(2)}%`,
      icon: Percent,
      comparison: 0,
      variant: 'default' as const
    }
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <MetricCard
      v-for="(metric, index) in metrics"
      :key="index"
      :label="metric.label"
      :value="metric.value"
      :icon="metric.icon"
      :comparison="metric.comparison"
      :variant="metric.variant"
      :loading="dashboardStore.isLoading"
    />
  </div>
</template>
