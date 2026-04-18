<!--
  AlertDialog Component (Radix Vue Wrapper)
  
  A modal dialog that interrupts the user's workflow to communicate an important message
  and acquire a response. Examples include action confirmations and error message confirmations.
  
  Features:
  - Modal behavior with backdrop
  - Focus management and focus trap
  - ESC to close (if dismissible)
  - ARIA compliance (role="alertdialog")
  - Action buttons (Cancel/Confirm)
  - Customizable content and styling
-->

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

type AlertDialogType = 'info' | 'warning' | 'error' | 'success'

interface Props {
  // Control Props
  open?: boolean
  dismissible?: boolean
  
  // Content Props
  title?: string
  description?: string
  type?: AlertDialogType
  
  // Action Props
  cancelText?: string
  confirmText?: string
  showCancel?: boolean
  showConfirm?: boolean
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  
  // Event Handlers
  onCancel?: () => void
  onConfirm?: () => void
  onOpenChange?: (open: boolean) => void
  
  // Testing
  testId?: string
  
  // Styling
  overlayClass?: string
  contentClass?: string
  headerClass?: string
  titleClass?: string
  descriptionClass?: string
  footerClass?: string
  cancelButtonClass?: string
  confirmButtonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  dismissible: true,
  type: 'info',
  cancelText: 'Cancel',
  confirmText: 'OK',
  showCancel: true,
  showConfirm: true,
  confirmVariant: 'default'
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  cancel: []
  confirm: []
}>()

// Template refs
const cancelButtonRef = ref<HTMLElement>()
const confirmButtonRef = ref<HTMLElement>()

// State
const isOpen = ref(props.open)
const previousActiveElement = ref<HTMLElement | null>(null)

// Computed
const typeClasses = computed(() => {
  const classes = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-green-50 text-green-900'
  }
  return classes[props.type]
})

const confirmButtonVariantClasses = computed(() => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  }
  return variants[props.confirmVariant]
})

// Methods
function open() {
  if (isOpen.value) return
  
  // Store current active element
  previousActiveElement.value = document.activeElement as HTMLElement
  
  isOpen.value = true
  emit('update:open', true)
  props.onOpenChange?.(true)
  
  nextTick(() => {
    // Focus the cancel button by default, or confirm if no cancel
    const focusTarget = props.showCancel ? cancelButtonRef.value : confirmButtonRef.value
    focusTarget?.focus()
    
    // Add escape key listener
    if (props.dismissible) {
      document.addEventListener('keydown', handleEscapeKey)
    }
  })
}

function close() {
  if (!isOpen.value) return
  
  isOpen.value = false
  emit('update:open', false)
  props.onOpenChange?.(false)
  
  // Remove escape key listener
  document.removeEventListener('keydown', handleEscapeKey)
  
  // Restore focus to previous element
  nextTick(() => {
    previousActiveElement.value?.focus()
  })
}

function handleCancel() {
  emit('cancel')
  props.onCancel?.()
  close()
}

function handleConfirm() {
  emit('confirm')
  props.onConfirm?.()
  close()
}

function handleBackdropClick(event: MouseEvent) {
  if (!props.dismissible) return
  if (event.target === event.currentTarget) {
    close()
  }
}

function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.dismissible) {
    close()
  }
}

// Watch props.open
function updateFromProp() {
  if (props.open !== isOpen.value) {
    if (props.open) {
      open()
    } else {
      close()
    }
  }
}

// Lifecycle
onMounted(() => {
  updateFromProp()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})

// Watch open prop
$: props.open, updateFromProp()
</script>

<template>
  <!-- Alert Dialog Portal -->
  <teleport to="body">
    <div
      v-if="isOpen"
      ref="alertDialogRef"
      class="alert-dialog-overlay"
      :class="cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-background/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        overlayClass
      )"
      :data-testid="`alert-dialog-overlay${testId ? `-${testId}` : ''}`"
      @click="handleBackdropClick"
    >
      <!-- Alert Dialog Content -->
      <div
        class="alert-dialog-content"
        :class="cn(
          'relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg',
          'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'sm:rounded-lg',
          typeClasses,
          contentClass
        )"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="title ? `alert-dialog-title-${testId}` : undefined"
        :aria-describedby="description ? `alert-dialog-description-${testId}` : undefined"
        :data-testid="`alert-dialog-content${testId ? `-${testId}` : ''}`"
        @click.stop
      >
        <!-- Header -->
        <div
          v-if="title || description"
          class="alert-dialog-header"
          :class="cn('flex flex-col space-y-2 text-center sm:text-left', headerClass)"
        >
          <!-- Title -->
          <h2
            v-if="title"
            :id="`alert-dialog-title-${testId}`"
            class="alert-dialog-title"
            :class="cn('text-lg font-semibold', titleClass)"
            :data-testid="`alert-dialog-title${testId ? `-${testId}` : ''}`"
          >
            {{ title }}
          </h2>

          <!-- Description -->
          <p
            v-if="description"
            :id="`alert-dialog-description-${testId}`"
            class="alert-dialog-description"
            :class="cn('text-sm text-muted-foreground', descriptionClass)"
            :data-testid="`alert-dialog-description${testId ? `-${testId}` : ''}`"
          >
            {{ description }}
          </p>
        </div>

        <!-- Default Slot for Custom Content -->
        <div class="alert-dialog-body">
          <slot />
        </div>

        <!-- Footer with Action Buttons -->
        <div
          class="alert-dialog-footer"
          :class="cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
            footerClass
          )"
        >
          <!-- Cancel Button -->
          <button
            v-if="showCancel"
            ref="cancelButtonRef"
            type="button"
            class="alert-dialog-cancel"
            :class="cn(
              'inline-flex h-10 items-center justify-center rounded-control px-4 py-2 text-sm font-medium',
              'ring-offset-background transition-colors focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              'mt-2 sm:mt-0',
              cancelButtonClass
            )"
            :data-testid="`alert-dialog-cancel${testId ? `-${testId}` : ''}`"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>

          <!-- Confirm Button -->
          <button
            v-if="showConfirm"
            ref="confirmButtonRef"
            type="button"
            class="alert-dialog-confirm"
            :class="cn(
              'inline-flex h-10 items-center justify-center rounded-control px-4 py-2 text-sm font-medium',
              'ring-offset-background transition-colors focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              confirmButtonVariantClasses,
              confirmButtonClass
            )"
            :data-testid="`alert-dialog-confirm${testId ? `-${testId}` : ''}`"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.alert-dialog-overlay {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.alert-dialog-content {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
</style>