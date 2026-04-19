<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'
import { cn } from '@/lib/utils'

interface TabsTriggerProps {
  value: string
  disabled?: boolean
}

const props = withDefaults(defineProps<TabsTriggerProps>(), {
  disabled: false,
})

const tabs = inject<{
  activeTab: ComputedRef<string>
  baseId: string
  orientation: ComputedRef<'horizontal' | 'vertical'>
  updateActiveTab: (value: string) => void
}>('tabs')

const isActive = computed(() => tabs?.activeTab.value === props.value)

const handleClick = () => {
  if (!props.disabled && tabs) {
    tabs.updateActiveTab(props.value)
  }
}

const triggerClass = computed(() => {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium ring-offset-background',
    'transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    isActive.value
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
  )
})
</script>

<template>
  <button
    type="button"
    :id="`${tabs?.baseId}-tab-${value}`"
    role="tab"
    :aria-selected="isActive"
    :aria-controls="`${tabs?.baseId}-panel-${value}`"
    :disabled="disabled"
    :class="triggerClass"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
