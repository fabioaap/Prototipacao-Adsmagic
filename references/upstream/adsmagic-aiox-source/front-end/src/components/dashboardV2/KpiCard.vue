<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Tooltip from '@/components/ui/Tooltip.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  /**
   * KPI title
   */
  title: string

  /**
   * Main value to display
   */
  value: string | number

  /**
   * Icon component (from lucide-vue-next)
   */
  icon?: any

  /**
   * Change percentage (delta) vs previous period
   */
  delta?: number | null

  /**
   * Comparison label
   */
  deltaLabel?: string

  /**
   * Tooltip text with formula/explanation
   */
  tooltip?: string

  /**
   * Loading state
   */
  loading?: boolean

  /**
   * Visual variant
   */
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive'

  /**
   * Small helper text below the value (e.g., "Total acumulado")
   */
  subtitle?: string

  /**
   * Whether lower values are better (e.g., CAC, CPC)
   */
  lowerIsBetter?: boolean

  /**
   * Whether to show the delta badge
   */
  showDelta?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  delta: undefined,
  deltaLabel: 'vs. período anterior',
  tooltip: undefined,
  loading: false,
  variant: 'default',
  lowerIsBetter: false,
  subtitle: 'Total acumulado',
  showDelta: true
})

// Determine trend type
const trendType = computed(() => {
  if (props.delta === undefined || props.delta === null || props.delta === 0) {
    return 'neutral'
  }

  // If lower is better, invert the logic
  if (props.lowerIsBetter) {
    return props.delta > 0 ? 'negative' : 'positive'
  }

  return props.delta > 0 ? 'positive' : 'negative'
})

// Trend icon
const trendIcon = computed(() => {
  if (trendType.value === 'positive') return TrendingUp
  if (trendType.value === 'negative') return TrendingDown
  return Minus
})

// Badge classes for delta
const badgeClass = computed(() => {
  return cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors',
    {
      'bg-green-100 text-green-700 border border-green-200': trendType.value === 'positive',
      'bg-red-100 text-red-700 border border-red-200': trendType.value === 'negative',
      'bg-slate-100 text-slate-600 border border-slate-200': trendType.value === 'neutral',
    }
  )
})

// Format delta value with sign
const formatDelta = (delta: number | null | undefined) => {
  if (delta === null || delta === undefined) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}%`
}

// Icon color class based on variant
const iconColorClass = computed(() => {
  const colors: Record<string, string> = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    destructive: 'text-destructive',
  }
  return colors[props.variant]
})
</script>

<template>
  <div
    class="h-full rounded-lg border border-border bg-card p-4 sm:p-6 transition-all hover:shadow-md"
    role="article"
    :aria-label="`${props.title}: ${props.value}`"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium text-muted-foreground">
          {{ props.title }}
        </p>
        
        <!-- Tooltip with formula -->
        <Tooltip v-if="props.tooltip" :content="props.tooltip">
          <button
            class="inline-flex items-center justify-center rounded-control hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Mais informações"
          >
            <Info class="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </Tooltip>
      </div>

      <component
        :is="props.icon"
        v-if="props.icon"
        :class="cn('h-5 w-5', iconColorClass)"
        aria-hidden="true"
      />
    </div>

    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-3">
      <Skeleton class="h-8 w-32" />
      <Skeleton class="h-4 w-24" />
    </div>

    <!-- Value -->
    <div v-else class="space-y-1.5">
      <p class="text-3xl font-bold text-foreground leading-tight">
        {{ props.value }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ props.subtitle }}
      </p>

      <!-- Change Indicator -->
      <div
        v-if="props.showDelta && props.delta !== undefined && props.delta !== null"
        class="flex items-center gap-2 mt-2"
      >
        <span :class="badgeClass">
          <component :is="trendIcon" class="h-3 w-3" aria-hidden="true" />
          <span>{{ formatDelta(props.delta) }}</span>
        </span>
        <span class="text-xs text-muted-foreground">
          {{ props.deltaLabel }}
        </span>
      </div>
    </div>
  </div>
</template>
