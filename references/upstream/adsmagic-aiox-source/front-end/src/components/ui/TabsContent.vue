<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'
import { cn } from '@/lib/utils'

interface TabsContentProps {
  value: string
}

const props = defineProps<TabsContentProps>()

const tabs = inject<{
  activeTab: ComputedRef<string>
  baseId: string
  orientation: ComputedRef<'horizontal' | 'vertical'>
  updateActiveTab: (value: string) => void
}>('tabs')

const isActive = computed(() => tabs?.activeTab.value === props.value)

const contentClass = cn(
  'mt-2 ring-offset-background',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
)
</script>

<template>
  <div
    v-if="isActive"
    :id="`${tabs?.baseId}-panel-${value}`"
    role="tabpanel"
    :aria-labelledby="`${tabs?.baseId}-tab-${value}`"
    :class="contentClass"
    tabindex="0"
  >
    <slot />
  </div>
</template>
