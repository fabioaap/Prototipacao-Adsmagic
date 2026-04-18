<script setup lang="ts">
import { computed, inject } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  value: string | number | boolean
  id?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Inject radio group context
interface RadioGroupContext {
  modelValue: { value: string | number | boolean }
  updateValue: (value: string | number | boolean) => void
}

const radioGroup = inject<RadioGroupContext | null>('radioGroup', null)

const isChecked = computed(() => {
  return radioGroup?.modelValue.value === props.value
})

const handleChange = () => {
  if (!props.disabled && radioGroup) {
    radioGroup.updateValue(props.value)
  }
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <input
      :id="id"
      type="radio"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :class="cn(
        'h-4 w-4 border border-primary text-primary ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
      @change="handleChange"
    />
    <label
      v-if="$slots.default"
      :for="id"
      :class="cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        disabled && 'cursor-not-allowed opacity-70'
      )"
    >
      <slot />
    </label>
  </div>
</template>
