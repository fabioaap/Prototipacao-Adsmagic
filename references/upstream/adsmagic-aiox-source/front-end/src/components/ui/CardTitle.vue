<script setup lang="ts">
import { cn } from '@/lib/utils'

const cardTitleClass = cn(
  'text-2xl font-semibold leading-none tracking-tight'
)
</script>

<template>
  <h3 :class="cardTitleClass">
    <slot />
  </h3>
</template>
