<script setup lang="ts">
import { cn } from '@/lib/utils'

const cardDescriptionClass = cn(
  'text-sm text-muted-foreground'
)
</script>

<template>
  <p :class="cardDescriptionClass">
    <slot />
  </p>
</template>
