<script setup lang="ts">
import { cn } from '@/lib/utils'

const cardHeaderClass = cn(
  'flex flex-col space-y-1.5 p-[var(--sym-space-7)]'
)
</script>

<template>
  <div :class="cardHeaderClass">
    <slot />
  </div>
</template>
