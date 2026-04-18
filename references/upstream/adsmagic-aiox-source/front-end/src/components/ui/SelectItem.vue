<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  value: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// This would normally be injected from a Select context
// For now, we'll handle it as a simple clickable item
const handleClick = () => {
  if (!props.disabled) {
    // Emit event to parent
    // This would normally be handled by the Select component
  }
}
</script>

<template>
  <div
    :class="cn(
      'relative flex w-full cursor-default select-none items-center rounded-control py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
    :data-disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </div>
</template>
