<script setup lang="ts">
import { cn } from '@/lib/utils'
import { computed } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cardVariants } from '@/components/ui/card.variants'

interface Props {
  variant?: 'default' | 'elevated' | 'outlined'
  padded?: boolean
  as?: 'div' | 'section' | 'article'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padded: false,
  as: 'div',
  class: undefined,
})

const cardClass = computed(() => {
  return cn(
    cardVariants({ variant: props.variant, padded: props.padded }),
    props.class,
  )
})
</script>

<template>
  <component :is="props.as" :class="cardClass">
    <slot />
  </component>
</template>
