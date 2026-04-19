<script setup lang="ts">
import { computed } from 'vue'
import { Check, Minus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  indeterminate?: boolean
  id?: string
  name?: string
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: false,
  disabled: false,
  indeterminate: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

const checkboxClass = computed(() => {
  return cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-primary',
    'ring-offset-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200',
    props.modelValue || props.indeterminate
      ? 'bg-primary text-primary-foreground'
      : 'bg-background'
  )
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      type="button"
      role="checkbox"
      :aria-checked="indeterminate ? 'mixed' : modelValue"
      :aria-label="label"
      :disabled="disabled"
      :class="checkboxClass"
      @click="handleChange"
      @keydown.space.prevent="handleChange"
    >
      <Minus
        v-if="indeterminate"
        class="h-3 w-3"
      />
      <Check
        v-else-if="modelValue"
        class="h-3 w-3"
      />
    </button>

    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      @click="handleChange"
    >
      {{ label }}
    </label>
  </div>
</template>
