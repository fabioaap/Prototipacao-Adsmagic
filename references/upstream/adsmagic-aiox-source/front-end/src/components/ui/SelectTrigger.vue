<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  id?: string
  disabled?: boolean
  size?: 'default' | 'sm' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'default',
})

const sizeClasses = computed(() => {
  const sizes = {
    default: 'h-10 px-3 py-2 text-sm',
    sm: 'h-8 px-2 py-1 text-xs',
    lg: 'h-12 px-4 py-3 text-base',
  }
  return sizes[props.size]
})
</script>

<template>
  <button
    :id="id"
    type="button"
    :disabled="disabled"
    :class="cn(
      'flex w-full items-center justify-between rounded-control border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      sizeClasses,
      props.class
    )"
  >
    <slot />
    <ChevronDown class="h-4 w-4 opacity-50" />
  </button>
</template>
