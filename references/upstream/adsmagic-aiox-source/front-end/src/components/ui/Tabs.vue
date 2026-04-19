<script setup lang="ts">
import { provide, ref, computed, watch } from 'vue'
import { cn } from '@/lib/utils'

interface TabsProps {
  modelValue: string
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<TabsProps>(), {
  orientation: 'horizontal',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref(props.modelValue)
const baseId = `tabs-${Math.random().toString(36).slice(2, 9)}`

watch(
  () => props.modelValue,
  (value) => {
    activeTab.value = value
  }
)

const updateActiveTab = (value: string) => {
  activeTab.value = value
  emit('update:modelValue', value)
}

// Provide context to child components
provide('tabs', {
  activeTab: computed(() => activeTab.value),
  baseId,
  orientation: computed(() => props.orientation),
  updateActiveTab,
})

const containerClass = computed(() => {
  return cn(
    'w-full',
    props.orientation === 'vertical' && 'flex gap-4'
  )
})
</script>

<template>
  <div
    :class="containerClass"
    :data-orientation="orientation"
  >
    <slot />
  </div>
</template>
