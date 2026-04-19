<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'

interface Props {
  ariaLabel: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  class: undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <div
    :class="cn(
      'inline-flex h-[40px] w-[40px] items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
      $props.class
    )"
  >
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-[14px]"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @click="emit('click', $event)"
    >
      <slot />
    </Button>
  </div>
</template>