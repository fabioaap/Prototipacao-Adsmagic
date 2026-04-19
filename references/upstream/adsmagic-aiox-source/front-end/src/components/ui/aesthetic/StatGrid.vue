<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statGridVariants = cva(
  'grid w-full',
  {
    variants: {
      gap: {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
      },
      cols: {
        responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        responsive2: 'grid-cols-1 md:grid-cols-2',
        responsive3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        fixed2: 'grid-cols-2',
        fixed3: 'grid-cols-3',
        fixed4: 'grid-cols-4',
      },
    },
    defaultVariants: {
      gap: 'md',
      cols: 'responsive',
    },
  }
)

interface Props {
  gap?: VariantProps<typeof statGridVariants>['gap']
  cols?: VariantProps<typeof statGridVariants>['cols']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  gap: 'md',
  cols: 'responsive',
  class: undefined,
})

const gridClass = computed(() =>
  cn(statGridVariants({ gap: props.gap, cols: props.cols }), props.class)
)
</script>

<template>
  <div :class="gridClass">
    <slot />
  </div>
</template>
