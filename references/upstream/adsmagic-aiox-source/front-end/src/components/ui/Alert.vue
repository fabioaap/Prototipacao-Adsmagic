<script setup lang="ts">
import { computed } from 'vue'
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

type AlertVariant = 'info' | 'success' | 'warning' | 'destructive'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  description?: string
  closable?: boolean
  icon?: boolean
}

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'info',
  closable: false,
  icon: true,
})

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}

const alertIcon = computed(() => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    destructive: XCircle,
  }
  return icons[props.variant]
})

const alertClass = computed(() => {
  const base = 'relative w-full rounded-lg border p-4'

  const variants: Record<AlertVariant, string> = {
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  return cn(base, variants[props.variant])
})

const iconClass = computed(() => {
  return 'h-4 w-4'
})
</script>

<template>
  <div :class="alertClass" role="alert">
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <component
        :is="alertIcon"
        v-if="icon"
        :class="iconClass"
        class="mt-0.5"
      />

      <!-- Content -->
      <div class="flex-1">
        <h5
          v-if="title"
          class="mb-1 font-medium leading-none tracking-tight"
        >
          {{ title }}
        </h5>
        <div
          v-if="description || $slots.default"
          class="text-sm opacity-90"
        >
          <slot>{{ description }}</slot>
        </div>
      </div>

      <!-- Close button -->
      <button
        v-if="closable"
        type="button"
        class="opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        @click="handleClose"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>
    </div>
  </div>
</template>
