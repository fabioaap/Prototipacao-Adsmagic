<script setup lang="ts">
/**
 * @deprecated Use Alert.vue instead. This component will be removed in Phase 3.
 * 
 * Migration guide:
 * ```diff
 * - <AlertSimple type="error" message="Something went wrong" />
 * + <Alert variant="destructive" title="Error">Something went wrong</Alert>
 * ```
 * 
 * See specs/005-design-system-consolidation/quickstart.md for details.
 */
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { Info, AlertTriangle } from '@/composables/useIcons'
import { cn } from '@/lib/utils'
import Button from './Button.vue'

interface AlertSimpleProps {
  modelValue: boolean
  title?: string
  description?: string
  variant?: 'warning' | 'destructive' | 'info'
  confirmText?: string
}

const props = withDefaults(defineProps<AlertSimpleProps>(), {
  modelValue: false,
  variant: 'info',
  confirmText: 'OK',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleConfirm()
  }
}

// Lock body scroll when dialog is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

const iconComponent = computed(() => {
  switch (props.variant) {
    case 'info':
      return Info
    case 'warning':
    case 'destructive':
    default:
      return AlertTriangle
  }
})

const variantClasses = computed(() => {
  const variants = {
    info: 'text-info',
    warning: 'text-warning',
    destructive: 'text-destructive',
  }
  return variants[props.variant]
})

const backgroundClasses = computed(() => {
  const variants = {
    info: 'bg-info/10',
    warning: 'bg-warning/10',
    destructive: 'bg-destructive/10',
  }
  return variants[props.variant]
})

const dialogClass = cn(
  'relative bg-card text-card-foreground rounded-lg shadow-lg',
  'border',
  'w-full max-w-md'
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/50"
        @click="handleConfirm"
      >
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              :class="dialogClass"
              role="alertdialog"
              aria-modal="true"
              :aria-labelledby="title ? 'alert-dialog-title' : undefined"
              :aria-describedby="description ? 'alert-dialog-description' : undefined"
              @click.stop
            >
              <!-- Content -->
              <div class="p-6">
                <div class="flex items-start gap-4">
                  <!-- Icon -->
                  <div
                    :class="cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      backgroundClasses
                    )"
                  >
                    <component :is="iconComponent" :class="cn('h-5 w-5', variantClasses)" />
                  </div>

                  <!-- Text Content -->
                  <div class="flex-1 space-y-2">
                    <h2
                      v-if="title"
                      id="alert-dialog-title"
                      class="text-lg font-semibold leading-none tracking-tight"
                    >
                      {{ title }}
                    </h2>
                    <p
                      v-if="description"
                      id="alert-dialog-description"
                      class="text-sm text-muted-foreground"
                    >
                      {{ description }}
                    </p>
                    <div v-if="$slots.default">
                      <slot />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-end gap-2 p-6 border-t">
                <Button
                  :variant="variant === 'destructive' ? 'destructive' : 'default'"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </Button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>