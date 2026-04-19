<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const chartCardVariants = cva(
  'rounded-lg border p-6 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800',
        outlined: 'bg-transparent border-gray-300 dark:border-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface Props {
  title: string
  subtitle?: string
  loading?: boolean
  actionLabel?: string
  variant?: VariantProps<typeof chartCardVariants>['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  variant: 'default',
  class: undefined,
})

const emit = defineEmits<{
  action: []
}>()

const cardClass = computed(() =>
  cn(chartCardVariants({ variant: props.variant }), props.class)
)

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <div :class="cardClass">
    <!-- Header -->
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
      <button
        v-if="actionLabel"
        type="button"
        class="shrink-0 text-sm font-medium text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:text-primary-foreground"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
    </div>

    <!-- Content or Skeleton -->
    <div class="relative">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>

      <!-- Content Slot -->
      <div v-else class="min-h-[200px]">
        <slot />
      </div>
    </div>

    <!-- Footer Slot (Optional) -->
    <div v-if="$slots.footer" class="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
      <slot name="footer" />
    </div>
  </div>
</template>
