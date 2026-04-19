<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

// Export BadgeVariant for use in other components
export type BadgeVariant = 'default' | 'soft' | 'solid' | 'outline' | 'secondary' | 'success' | 'warning' | 'destructive'
type BadgeColor = 'default' | 'success' | 'warning' | 'info' | 'destructive'

interface Props {
  variant?: BadgeVariant
  color?: BadgeColor
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'soft',
  color: 'default',
})

const badgeClass = computed(() => {
  const base = 'inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5'

  // Map simplified variant to variant + color combination
  if (props.variant === 'default') {
    return cn(base, 'bg-muted text-muted-foreground')
  }
  if (props.variant === 'destructive') {
    return cn(base, 'bg-destructive text-destructive-foreground')
  }

  const colorVars: Record<BadgeColor, { bg: string; text: string; ring?: string; border?: string }> = {
    default: { bg: 'muted', text: 'muted-foreground' },
    success: { bg: 'success', text: 'white' },
    warning: { bg: 'warning', text: 'black' },
    info: { bg: 'info', text: 'white' },
    destructive: { bg: 'destructive', text: 'destructive-foreground' },
  }

  const c = colorVars[props.color]
  const softTextColor: Record<BadgeColor, string> = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    destructive: 'text-destructive',
  }

  const variants: Record<string, string> = {
    soft: cn(`bg-${c.bg}/15`, softTextColor[props.color]),
    solid: cn(`bg-${c.bg} text-${c.text}`),
    outline: cn(`border border-${c.bg} text-${c.bg}`),
    secondary: cn('bg-muted text-muted-foreground'),
    success: cn('bg-success text-white'),
    warning: cn('bg-warning text-black'),
  }

  return cn(base, variants[props.variant] || variants.soft)
})
</script>

<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>


