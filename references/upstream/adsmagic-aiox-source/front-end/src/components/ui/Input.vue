<script setup lang="ts">
import { computed } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { inputVariants } from '@/components/ui/input.variants'

interface InputProps {
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  variant?: 'default' | 'subtle' | 'invalid'
  size?: 'sm' | 'md' | 'lg'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  disabled: false,
  required: false,
  variant: 'default',
  size: 'md',
  class: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const inputClass = computed(() =>
  cn(
    inputVariants({ variant: props.variant, size: props.size }),
    props.class,
  )
)
</script>

<template>
  <input
    :value="props.modelValue"
    :type="props.type"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :required="props.required"
    :class="inputClass"
    :aria-invalid="props.variant === 'invalid' ? 'true' : undefined"
    @input="handleInput"
  />
</template>
