<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'
import { cn } from '@/lib/utils'

const tabs = inject<{
  activeTab: ComputedRef<string>
  orientation: ComputedRef<'horizontal' | 'vertical'>
  updateActiveTab: (value: string) => void
}>('tabs')

const listClass = computed(() => {
  return cn(
    'inline-flex items-center justify-center rounded-control bg-muted p-1 text-muted-foreground',
    tabs?.orientation.value === 'horizontal'
      ? 'h-10 gap-1'
      : 'flex-col h-auto gap-1'
  )
})
</script>

<template>
  <div
    :class="listClass"
    role="tablist"
    :aria-orientation="tabs?.orientation.value"
  >
    <slot />
  </div>
</template>
