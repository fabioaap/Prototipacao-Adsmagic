<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from './Button.vue'

interface AlertDialogProps {
  modelValue: boolean
  title?: string
  description?: string
  variant?: 'warning' | 'destructive'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<AlertDialogProps>(), {
  modelValue: false,
  variant: 'warning',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleCancel()
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

const variantClasses = computed(() => {
  const variants = {
    warning: 'text-warning',
    destructive: 'text-destructive',
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
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        @click="handleCancel"
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
                      variant === 'destructive' ? 'bg-destructive/10' : 'bg-warning/10'
                    )"
                  >
                    <AlertTriangle :class="cn('h-5 w-5', variantClasses)" />
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
                  variant="outline"
                  :disabled="loading"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </Button>
                <Button
                  :variant="variant === 'destructive' ? 'destructive' : 'default'"
                  :disabled="loading"
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
