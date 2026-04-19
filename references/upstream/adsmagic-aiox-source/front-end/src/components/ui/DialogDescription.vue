<script setup lang="ts">
import { cn } from '@/lib/utils'

interface DialogDescriptionProps {
  class?: string
}

const props = defineProps<DialogDescriptionProps>()
</script>

<template>
  <p :class="cn('text-sm text-muted-foreground', props.class)">
    <slot />
  </p>
</template>
