// @ts-nocheck
<!--
  Tabs Component (Radix Vue Wrapper)
  
  Implements foundation tabs functionality with:
  - Horizontal/vertical orientation
  - Arrow key navigation (ArrowLeft/Right for horizontal, ArrowUp/Down for vertical)
  - Home/End key support
  - ARIA compliance (role="tablist", role="tab", role="tabpanel")
  - Automatic activation on focus
  
  Based on TDD tests: Tabs.spec.ts (26 tests)
  Supports: keyboard navigation, accessibility, orientation
-->

<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'radix-vue'

interface TabsProps {
  modelValue?: string
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  activationMode?: 'automatic' | 'manual'
  disablePortal?: boolean
  portalTarget?: string | HTMLElement | null
}

interface TabsEmits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<TabsProps>(), {
  modelValue: '',
  orientation: 'horizontal',
  disabled: false,
  activationMode: 'automatic',
  disablePortal: false,
  portalTarget: null
})

const emit = defineEmits<TabsEmits>()

// Computed
const computedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleValueChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <TabsRoot 
    :model-value="computedValue"
    :orientation="orientation"
    :activation-mode="activationMode"
    :disabled="disabled"
    @update:model-value="handleValueChange"
  >
    <slot />
  </TabsRoot>
</template>

<!--
  Usage:
  
  <Tabs v-model="activeTab" orientation="horizontal">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
  </Tabs>
-->