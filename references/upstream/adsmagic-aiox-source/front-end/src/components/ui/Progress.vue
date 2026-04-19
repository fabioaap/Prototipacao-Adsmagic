<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  max: 100,
  variant: 'default',
  size: 'md',
  showLabel: false,
})

const percentage = computed(() => {
  const percent = Math.min(100, Math.max(0, (props.value / props.max) * 100))
  return Math.round(percent)
})

const containerClass = computed(() => {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return cn(
    'relative w-full overflow-hidden rounded-full bg-secondary',
    sizes[props.size]
  )
})

const barClass = computed(() => {
  const variants = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  }

  return cn(
    'h-full transition-all duration-300 ease-in-out',
    variants[props.variant]
  )
})
</script>

<template>
  <div class="w-full space-y-1">
    <!-- Label -->
    <div
      v-if="showLabel || label"
      class="flex items-center justify-between text-sm text-muted-foreground"
    >
      <span v-if="label">{{ label }}</span>
      <span v-if="showLabel">{{ percentage }}%</span>
    </div>

    <!-- Progress Bar -->
    <div
      :class="containerClass"
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-label="label || 'Progress'"
    >
      <div
        :class="barClass"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
