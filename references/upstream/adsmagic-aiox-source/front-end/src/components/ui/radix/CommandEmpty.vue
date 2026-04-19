// @ts-nocheck
<script setup lang="ts">
// @ts-nocheck
import { inject } from 'vue'
import { cn } from '@/lib/utils'

const commandContext = inject<any>('command-context', {})
</script>

<template>
  <div
    :class="cn('px-2 py-6 text-center text-sm text-muted-foreground')"
    data-testid="empty"
  >
    <slot />
  </div>
</template>