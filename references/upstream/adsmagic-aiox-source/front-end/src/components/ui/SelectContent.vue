<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  position?: 'item-aligned' | 'popper'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'popper'
})
</script>

<template>
  <div
    :class="cn(
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-control border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      props.class
    )"
  >
    <div class="p-1">
      <slot />
    </div>
  </div>
</template>
