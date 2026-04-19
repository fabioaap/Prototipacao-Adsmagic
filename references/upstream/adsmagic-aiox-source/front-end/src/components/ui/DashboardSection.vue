<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'

const dashboardSectionVariants = cva('w-full space-y-4', {
  variants: {
    variant: {
      default: '',
      padded: 'rounded-surface bg-card p-6',
      bordered: 'rounded-surface border border-border bg-card p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface Props {
  title: string
  description?: string
  actionLabel?: string
  variant?: VariantProps<typeof dashboardSectionVariants>['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  actionLabel: undefined,
  variant: 'default',
  class: undefined,
})

const emit = defineEmits<{
  action: []
}>()

const sectionClass = computed(() => cn(dashboardSectionVariants({ variant: props.variant }), props.class))

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <section :class="sectionClass">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-foreground sm:text-2xl">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-1 text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>

      <slot name="action">
        <Button
          v-if="actionLabel"
          variant="outline"
          size="sm"
          class="shrink-0"
          @click="handleAction"
        >
          {{ actionLabel }}
        </Button>
      </slot>
    </div>

    <div>
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t border-border pt-4">
      <slot name="footer" />
    </div>
  </section>
</template>
