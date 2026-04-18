<script setup lang="ts">
import { computed } from 'vue'
import { X, Check, AlertTriangle, Info } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from './Button.vue'
import type { Toast } from '@/stores/toast'

interface Props {
  toast: Toast
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string]
}>()

// Computed
const variantClasses = computed(() => {
  const variants = {
    default: 'border-border bg-card text-card-foreground',
    success: 'border-success/35 bg-success text-white',
    destructive: 'border-destructive/35 bg-destructive text-destructive-foreground',
    warning: 'border-warning/35 bg-warning text-black'
  }
  return variants[props.toast.variant]
})

const iconClasses = computed(() => {
  const variants = {
    default: 'text-primary',
    success: 'text-white',
    destructive: 'text-destructive-foreground',
    warning: 'text-black'
  }
  return variants[props.toast.variant]
})

const closeButtonClasses = computed(() => {
  const variants = {
    default: 'text-muted-foreground hover:text-foreground hover:bg-muted',
    success: 'text-white/80 hover:bg-black/10 hover:text-white',
    destructive: 'text-destructive-foreground/80 hover:bg-black/10 hover:text-destructive-foreground',
    warning: 'text-black/70 hover:bg-black/10 hover:text-black'
  }
  return variants[props.toast.variant]
})

const getIcon = computed(() => {
  const icons = {
    default: Info,
    success: Check,
    destructive: X,
    warning: AlertTriangle
  }
  return icons[props.toast.variant]
})

// Handlers
const handleRemove = () => {
  emit('remove', props.toast.id)
}

const toastClass = computed(() => cn(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-xl transition-all',
  variantClasses.value,
))
</script>

<template>
  <div :class="toastClass">
    <!-- Icon -->
    <div class="flex items-center gap-3">
      <div :class="cn('flex h-5 w-5 items-center justify-center', iconClasses)">
        <component :is="getIcon" class="h-4 w-4" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold">
          {{ toast.title }}
        </div>
        <div v-if="toast.description" class="text-sm opacity-90 mt-1">
          {{ toast.description }}
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <Button
      variant="ghost"
      size="sm"
      :class="cn('absolute right-2 top-2 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100', closeButtonClasses)"
      @click="handleRemove"
    >
      <X class="h-4 w-4" />
    </Button>
  </div>
</template>
