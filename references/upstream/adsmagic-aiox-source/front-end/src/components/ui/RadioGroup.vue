<script setup lang="ts">
import { provide, computed } from 'vue'

interface RadioGroupProps {
  modelValue: string | number | boolean
  name?: string
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<RadioGroupProps>(), {
  disabled: false,
  orientation: 'vertical',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

// Provide context to child Radio components
provide('radioGroup', {
  modelValue: computed(() => props.modelValue),
  name: computed(() => props.name),
  disabled: computed(() => props.disabled),
  updateValue: (value: string | number | boolean) => {
    emit('update:modelValue', value)
  },
})

const containerClass = computed(() => {
  return props.orientation === 'horizontal'
    ? 'flex flex-row items-center space-x-4'
    : 'flex flex-col space-y-3'
})
</script>

<template>
  <div
    role="radiogroup"
    :aria-orientation="orientation"
    :class="containerClass"
  >
    <slot />
  </div>
</template>
