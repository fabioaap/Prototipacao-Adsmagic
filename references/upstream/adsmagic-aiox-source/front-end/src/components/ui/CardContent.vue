<script setup lang="ts">
import { cn } from '@/lib/utils'

const cardContentClass = cn(
  'p-[var(--sym-space-7)] pt-0'
)
</script>

<template>
  <div :class="cardContentClass">
    <slot />
  </div>
</template>
