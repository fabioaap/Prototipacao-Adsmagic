<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TextareaProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
}

withDefaults(defineProps<TextareaProps>(), {
  disabled: false,
  required: false,
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const textareaClass = cn(
  'flex min-h-[80px] w-full rounded-control border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'resize-y'
)
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :rows="rows"
    :maxlength="maxLength"
    :class="textareaClass"
    @input="handleInput"
  />
</template>
