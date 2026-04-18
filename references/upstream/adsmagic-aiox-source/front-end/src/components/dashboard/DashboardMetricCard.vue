<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Título da métrica
   */
  title: string
  /**
   * Valor principal da métrica
   */
  value: string | number
  /**
   * Ícone da métrica (componente Lucide)
   */
  icon?: any
  /**
   * Variação percentual
   */
  change?: number
  /**
   * Descrição/label da variação
   */
  changeLabel?: string
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  /**
   * Formato da métrica: default, currency, percentage
   */
  format?: 'default' | 'currency' | 'percentage'
  /**
   * Cor do ícone e destaque
   */
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  change: undefined,
  changeLabel: 'vs. mês anterior',
  loading: false,
  format: 'default',
  variant: 'default',
})

// Determina se a variação é positiva, negativa ou neutra
const trendType = computed(() => {
  if (props.change === undefined || props.change === 0) return 'neutral'
  return props.change > 0 ? 'positive' : 'negative'
})

// Ícone do trend
const trendIcon = computed(() => {
  if (trendType.value === 'positive') return TrendingUp
  if (trendType.value === 'negative') return TrendingDown
  return Minus
})

// Classes do trend
const trendClass = computed(() => {
  return cn(
    'inline-flex items-center gap-1 text-xs font-medium',
    {
      'text-success': trendType.value === 'positive',
      'text-destructive': trendType.value === 'negative',
      'text-muted-foreground': trendType.value === 'neutral',
    }
  )
})

// Classes do ícone variant
const iconColorClass = computed(() => {
  const colors = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    info: 'text-info',
  }
  return colors[props.variant]
})
</script>

<template>
  <div
    class="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm font-medium text-muted-foreground">
        {{ props.title }}
      </p>
      <component
        :is="props.icon"
        v-if="props.icon"
        :class="cn('h-5 w-5', iconColorClass)"
      />
    </div>

    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-3">
      <div class="h-8 w-32 bg-muted animate-pulse rounded"></div>
      <div class="h-4 w-24 bg-muted animate-pulse rounded"></div>
    </div>

    <!-- Value -->
    <div v-else class="space-y-2">
      <p class="text-3xl font-bold text-foreground">
        {{ props.value }}
      </p>

      <!-- Change Indicator -->
      <div v-if="props.change !== undefined" class="flex items-center gap-2">
        <span :class="trendClass">
          <component :is="trendIcon" class="h-3 w-3" />
          {{ Math.abs(props.change) }}%
        </span>
        <span class="text-xs text-muted-foreground">
          {{ props.changeLabel }}
        </span>
      </div>
    </div>
  </div>
</template>
