<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-vue-next'

interface Props {
  label: string
  value: number
  unit?: string
  growth?: number | null
  isLoading?: boolean
  error?: string | null
  icon?: string
  trend?: 'up' | 'down' | 'flat'
  variant?: 'default' | 'accent' | 'success' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  growth: null,
  isLoading: false,
  error: null,
  icon: undefined,
  trend: 'flat',
  variant: 'default',
})

// Determine trend from growth if not explicitly set
const computedTrend = computed(() => {
  if (typeof props.growth !== 'undefined' && props.growth !== null) {
    return props.growth > 0 ? 'up' : props.growth < 0 ? 'down' : 'flat'
  }
  return 'flat'
})

// Format large numbers
const formattedValue = computed(() => {
  if (typeof props.value !== 'number') return '0'

  if (props.value >= 1_000_000) {
    return (props.value / 1_000_000).toFixed(1) + 'M'
  }
  if (props.value >= 1_000) {
    return (props.value / 1_000).toFixed(1) + 'K'
  }
  return props.value.toLocaleString('pt-BR')
})

// Color classes based on variant and trend
const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
    accent: 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
  }
  return variants[props.variant] || variants.default
})

const growthColorClass = computed(() => {
  if (!props.growth) return ''
  if (props.growth > 0) return 'text-green-600 dark:text-green-400'
  if (props.growth < 0) return 'text-red-600 dark:text-red-400'
  return 'text-slate-500 dark:text-slate-400'
})

const trendIconClass = computed(() => {
  if (props.growth === null || props.growth === undefined) return ''
  return props.growth > 0
    ? 'text-green-600 dark:text-green-400'
    : props.growth < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-slate-400 dark:text-slate-500'
})
</script>

<template>
  <div
    :class="cn(
      'p-6 rounded-lg border transition-all duration-200',
      'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500',
      variantClasses,
      props.isLoading && 'opacity-75 pointer-events-none',
      props.error && 'border-red-300 dark:border-red-700'
    )"
  >
    <!-- Header with label and icon -->
    <div class="flex items-center justify-between mb-3">
      <label class="text-sm font-medium text-slate-600 dark:text-slate-400">
        {{ props.label }}
      </label>
      <AlertCircle v-if="props.error" class="w-4 h-4 text-red-500" />
    </div>

    <!-- Value display -->
    <div v-if="!props.isLoading && !props.error" class="space-y-3">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {{ formattedValue }}
        </span>
        <span v-if="props.unit" class="text-sm text-slate-500 dark:text-slate-400">
          {{ props.unit }}
        </span>
      </div>

      <!-- Growth indicator -->
      <div v-if="props.growth !== null && props.growth !== undefined" class="flex items-center gap-1">
        <TrendingUp v-if="props.growth > 0" :class="cn('w-4 h-4', trendIconClass)" />
        <TrendingDown v-else-if="props.growth < 0" :class="cn('w-4 h-4', trendIconClass)" />
        <span v-else class="w-4 h-4" />

        <span :class="cn('text-sm font-semibold', growthColorClass)">
          {{ props.growth > 0 ? '+' : '' }}{{ props.growth.toFixed(1) }}%
        </span>

        <span class="text-xs text-slate-500 dark:text-slate-400">
          {{ computedTrend === 'up' ? 'em alta' : computedTrend === 'down' ? 'em queda' : 'estável' }}
        </span>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="props.isLoading" class="space-y-3">
      <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
    </div>

    <!-- Error state -->
    <div v-if="props.error" class="space-y-2">
      <p class="text-sm font-medium text-red-600 dark:text-red-400">
        Erro ao carregar
      </p>
      <p class="text-xs text-red-500 dark:text-red-400">
        {{ props.error }}
      </p>
    </div>
  </div>
</template>
