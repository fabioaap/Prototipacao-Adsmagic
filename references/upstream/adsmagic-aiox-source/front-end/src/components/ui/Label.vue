<script setup lang="ts">
import { cn } from '@/lib/utils'

interface LabelProps {
  for?: string
  required?: boolean
}

defineProps<LabelProps>()

const labelClass = cn(
  'text-sm font-medium leading-none',
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)
</script>

<template>
  <label
    :for="for"
    :class="labelClass"
  >
    <slot />
    <span v-if="required" class="text-destructive ml-1">*</span>
  </label>
</template>
