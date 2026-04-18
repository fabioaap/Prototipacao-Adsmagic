<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string
  height?: string
  className?: string
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: 'text',
})

const skeletonClass = computed(() => {
  const baseClass = 'animate-pulse bg-muted'

  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  }

  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height

  return {
    class: cn(baseClass, variants[props.variant], props.className),
    style,
  }
})
</script>

<template>
  <div
    :class="skeletonClass.class"
    :style="skeletonClass.style"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
