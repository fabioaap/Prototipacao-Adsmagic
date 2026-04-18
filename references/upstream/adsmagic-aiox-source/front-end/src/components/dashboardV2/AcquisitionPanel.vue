<script setup lang="ts">
import { computed } from 'vue'
import { Eye, MousePointer, TrendingUp, DollarSign } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useFormat } from '@/composables/useFormat'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  /**
   * Acquisition metrics
   */
  metrics: {
    impressions: number
    clicks: number
    ctr: number
    cpc: number
  }
  
  /**
   * Loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const { formatCurrency, formatPercentage, formatNumber } = useFormat()

// Mini metrics configuration
const miniMetrics = computed(() => [
  {
    id: 'impressions',
    label: 'Impressões',
    value: formatNumber(props.metrics.impressions),
    icon: Eye,
    color: 'text-info'
  },
  {
    id: 'clicks',
    label: 'Cliques',
    value: formatNumber(props.metrics.clicks),
    icon: MousePointer,
    color: 'text-success'
  },
  {
    id: 'ctr',
    label: 'CTR',
    value: formatPercentage(props.metrics.ctr),
    icon: TrendingUp,
    color: 'text-warning'
  },
  {
    id: 'cpc',
    label: 'CPC',
    value: formatCurrency(props.metrics.cpc),
    icon: DollarSign,
    color: 'text-destructive'
  }
])
</script>

<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-base">Aquisição</CardTitle>
      <CardDescription class="text-xs">
        Tráfego e custo de anúncios
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <!-- Loading State -->
      <div v-if="props.loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="space-y-2">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-8 w-full" />
        </div>
      </div>

      <!-- Mini Metrics Grid -->
      <div
        v-else
        class="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="list"
      >
        <div
          v-for="metric in miniMetrics"
          :key="metric.id"
          class="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
          role="listitem"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">
              {{ metric.label }}
            </span>
            <component
              :is="metric.icon"
              :class="cn('h-4 w-4', metric.color)"
              aria-hidden="true"
            />
          </div>
          
          <div class="text-xl font-bold text-foreground">
            {{ metric.value }}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
