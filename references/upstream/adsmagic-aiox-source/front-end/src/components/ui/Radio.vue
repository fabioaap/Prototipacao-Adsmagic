<script setup lang="ts">
import { computed, inject } from 'vue'
import { Circle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface RadioGroupContext {
  modelValue: { value: string | number | boolean }
  name: { value?: string }
  disabled: { value: boolean }
  updateValue: (value: string | number | boolean) => void
}

interface RadioProps {
  modelValue?: string | number | boolean
  value: string | number | boolean
  label?: string
  name?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<RadioProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

// Try to get RadioGroup context (if inside a RadioGroup)
const radioGroup = inject<RadioGroupContext | undefined>('radioGroup', undefined)

// Use RadioGroup context if available, otherwise use props
const modelValue = computed(() => radioGroup?.modelValue.value ?? props.modelValue)
const isDisabled = computed(() => radioGroup?.disabled.value ?? props.disabled)

const isChecked = computed(() => {
  const currentValue = modelValue.value
  if (currentValue === undefined) return false
  return currentValue === props.value
})

const handleClick = () => {
  if (isDisabled.value) return
  
  if (radioGroup) {
    // Inside RadioGroup, use context update
    radioGroup.updateValue(props.value)
  } else {
    // Standalone, emit event
    emit('update:modelValue', props.value)
  }
}

const radioClass = computed(() => {
  return cn(
    'h-4 w-4 rounded-full border border-primary',
    'ring-offset-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'flex items-center justify-center',
    'transition-all duration-200',
    isChecked.value ? 'bg-primary' : 'bg-background'
  )
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      type="button"
      role="radio"
      :aria-checked="isChecked"
      :aria-label="label"
      :disabled="isDisabled"
      :class="radioClass"
      @click="handleClick"
      @keydown.space.prevent="handleClick"
    >
      <Circle
        v-if="isChecked"
        :class="cn('h-2 w-2 fill-primary-foreground text-primary-foreground')"
      />
    </button>

    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      @click="handleClick"
    >
      {{ label }}
    </label>
  </div>
</template>
