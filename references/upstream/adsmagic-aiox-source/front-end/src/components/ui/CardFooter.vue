<script setup lang="ts">
import { cn } from '@/lib/utils'

const footerClass = cn('flex items-center p-[var(--sym-space-7)] pt-0')
</script>

<template>
  <div :class="footerClass">
    <slot />
  </div>
  
</template>


