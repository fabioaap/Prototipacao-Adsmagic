<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const metricCardVariants = cva(
  'rounded-lg border p-6 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800',
        secondary: 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const trendVariants = cva(
  'inline-flex items-center gap-1 text-sm font-medium',
  {
    variants: {
      direction: {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        neutral: 'text-gray-600 dark:text-gray-400',
      },
    },
    defaultVariants: {
      direction: 'neutral',
    },
  }
)

interface Props {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  variant?: VariantProps<typeof metricCardVariants>['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: undefined,
})

const computedTrend = computed(() => {
  if (props.trend) return props.trend
  if (props.change === undefined || props.change === null) return 'neutral'
  if (props.change > 0) return 'up'
  if (props.change < 0) return 'down'
  return 'neutral'
})

const trendIcon = computed(() => {
  switch (computedTrend.value) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    default:
      return ''
  }
})

const formattedChange = computed(() => {
  if (props.change === undefined || props.change === null) return ''
  const absChange = Math.abs(props.change)
  return `${trendIcon.value} ${absChange}%`
})

const cardClass = computed(() =>
  cn(metricCardVariants({ variant: props.variant }), props.class)
)

const trendClass = computed(() =>
  trendVariants({ direction: computedTrend.value })
)
</script>

<template>
  <div :class="cardClass">
    <div class="space-y-2">
      <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
        {{ label }}
      </p>
      <div class="flex items-baseline justify-between">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ value }}
        </p>
        <span v-if="formattedChange" :class="trendClass">
          {{ formattedChange }}
        </span>
      </div>
    </div>
  </div>
</template>
