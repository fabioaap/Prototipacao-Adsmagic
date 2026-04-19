<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dashboardSectionVariants = cva(
  'w-full space-y-4',
  {
    variants: {
      variant: {
        default: '',
        padded: 'p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800',
        bordered: 'border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface Props {
  title: string
  description?: string
  actionLabel?: string
  variant?: VariantProps<typeof dashboardSectionVariants>['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: undefined,
})

const emit = defineEmits<{
  action: []
}>()

const sectionClass = computed(() =>
  cn(dashboardSectionVariants({ variant: props.variant }), props.class)
)

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <section :class="sectionClass">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ description }}
        </p>
      </div>
      <button
        v-if="actionLabel"
        type="button"
        class="shrink-0 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
    </div>

    <!-- Content -->
    <div>
      <slot />
    </div>

    <!-- Footer (Optional) -->
    <div v-if="$slots.footer" class="border-t border-gray-200 dark:border-gray-800 pt-4">
      <slot name="footer" />
    </div>
  </section>
</template>
