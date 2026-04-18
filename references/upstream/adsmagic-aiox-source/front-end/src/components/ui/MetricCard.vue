<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  change: undefined,
  changeLabel: undefined,
  icon: undefined,
  trend: 'neutral',
  loading: false,
  class: undefined
})

const changeColor = computed(() => {
  if (!props.change) return 'text-muted-foreground'
  if (props.trend === 'up') return props.change >= 0 ? 'text-success' : 'text-destructive'
  if (props.trend === 'down') return props.change <= 0 ? 'text-success' : 'text-destructive'
  return 'text-muted-foreground'
})

const containerClass = computed(() =>
  cn(
    'bg-card text-card-foreground rounded-surface border border-border p-4 sm:p-5 shadow-card',
    'hover:shadow-md transition-shadow duration-200 flex flex-col justify-between',
    props.class
  )
)
</script>

<template>
  <div :class="containerClass">
    <!-- Header com label e ícone -->
    <div class="flex items-start justify-between mb-2 sm:mb-3">
      <label class="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate" :title="label">
        {{ label }}
      </label>
    </div>

    <!-- Value and Change -->
    <div v-if="!loading" class="space-y-1 sm:space-y-2">
      <!-- Valor Principal -->
      <div class="text-lg sm:text-2xl font-bold text-foreground truncate" :title="String(value)">
        {{ value }}
      </div>

      <!-- Change Indicator -->
      <div v-if="change !== undefined" class="flex items-center gap-1">
        <div :class="cn('flex items-center gap-0.5', changeColor)">
          <ArrowUp v-if="trend === 'up' && change >= 0" class="w-3 h-3" />
          <ArrowDown v-else-if="trend === 'up' && change < 0" class="w-3 h-3" />
          <ArrowUp v-else-if="trend === 'down' && change <= 0" class="w-3 h-3" />
          <ArrowDown v-else-if="trend === 'down' && change > 0" class="w-3 h-3" />
          <span class="text-xs font-semibold">{{ Math.abs(change) }}%</span>
        </div>
        <span class="text-xs text-muted-foreground">{{ changeLabel }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="space-y-2">
      <div class="h-8 bg-muted rounded animate-pulse" />
      <div class="h-4 w-1/3 bg-muted rounded animate-pulse" />
    </div>
  </div>
</template>

<style scoped>
/* Sem estilos adicionais - Tailwind + CSS variables */
</style>
