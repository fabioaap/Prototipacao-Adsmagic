<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const funnelBarVariants = cva(
  'w-full space-y-3',
  {
    variants: {
      variant: {
        default: '',
        compact: 'space-y-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface Step {
  label: string
  count: number
}

interface Props {
  steps: Step[]
  variant?: VariantProps<typeof funnelBarVariants>['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  variant: 'default',
  class: undefined,
})

const maxCount = computed(() => {
  if (props.steps.length === 0) return 0
  return props.steps[0]?.count || 1
})

const calculatePercentage = (count: number): number => {
  if (maxCount.value === 0) return 0
  return Math.round((count / maxCount.value) * 100)
}

const calculateWidth = (count: number): string => {
  return `${calculatePercentage(count)}%`
}

const containerClass = computed(() =>
  cn(funnelBarVariants({ variant: props.variant }), props.class)
)
</script>

<template>
  <div :class="containerClass">
    <div
      v-for="(step, index) in steps"
      :key="`step-${index}`"
      class="flex items-center gap-3"
    >
      <div class="min-w-[120px] flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ step.label }}
      </div>
      <div class="relative flex-1">
        <div class="h-8 w-full rounded bg-gray-100 dark:bg-gray-800">
          <div
            class="h-full rounded bg-primary transition-all duration-300 dark:bg-primary-foreground"
            :style="{ width: calculateWidth(step.count) }"
          />
        </div>
        <div class="absolute inset-0 flex items-center justify-end pr-2">
          <span class="text-xs font-semibold text-gray-900 dark:text-white">
            {{ calculatePercentage(step.count) }}%
          </span>
        </div>
      </div>
      <div class="min-w-[60px] flex-shrink-0 text-right text-sm font-semibold text-gray-900 dark:text-white">
        {{ step.count.toLocaleString('en-US') }}
      </div>
    </div>
    <div v-if="steps.length === 0" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
      Nenhum dado disponível
    </div>
  </div>
</template>
