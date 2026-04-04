<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
        warning: 'border-amber-500/20 bg-amber-500/15 text-amber-300',
        info: 'border-blue-500/20 bg-blue-500/15 text-blue-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

interface Props {
  variant?: BadgeVariants['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {})
</script>

<template>
  <div
    :class="cn(badgeVariants({ variant: props.variant }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
