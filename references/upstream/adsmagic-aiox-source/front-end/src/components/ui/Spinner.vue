<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'muted'
  label?: string
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: 'md',
  variant: 'primary',
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    muted: 'text-muted-foreground',
  }
  return variants[props.variant]
})

const spinnerClass = computed(() => {
  return cn('animate-spin', sizeClasses.value, variantClasses.value)
})
</script>

<template>
  <div
    class="inline-flex items-center gap-2"
    role="status"
    aria-live="polite"
  >
    <Loader2 :class="spinnerClass" />
    <span
      v-if="label"
      class="text-sm text-muted-foreground"
    >
      {{ label }}
    </span>
    <span class="sr-only">Loading...</span>
  </div>
</template>
