<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface SwitchProps {
  modelValue?: boolean
  disabled?: boolean
  label?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleToggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

const switchClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-8',
    md: 'h-5 w-10',
    lg: 'h-6 w-12',
  }

  return cn(
    'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
    'transition-colors duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizes[props.size],
    props.modelValue
      ? 'bg-primary'
      : 'bg-input'
  )
})

const thumbClass = computed(() => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const translateX = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-6',
  }

  return cn(
    'pointer-events-none block rounded-full bg-background shadow-lg ring-0',
    'transition-transform duration-200 ease-in-out',
    sizes[props.size],
    props.modelValue ? translateX[props.size] : 'translate-x-0'
  )
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label"
      :disabled="disabled"
      :class="switchClass"
      @click="handleToggle"
      @keydown.space.prevent="handleToggle"
      @keydown.enter.prevent="handleToggle"
    >
      <span :class="thumbClass" />
    </button>

    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      @click="handleToggle"
    >
      {{ label }}
    </label>
  </div>
</template>
