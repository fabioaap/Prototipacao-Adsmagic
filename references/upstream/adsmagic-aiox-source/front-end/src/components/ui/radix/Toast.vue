// @ts-nocheck
<template>
  <div class="toast-provider">
    <!-- Trigger slot for external controls -->
    <slot name="trigger" :addToast="addToast" :removeToast="removeToast" />

    <!-- Portal container for toasts -->
    <Teleport :to="portalTarget" :disabled="disablePortal">
      <div
        v-if="toasts.length > 0"
        class="toast-viewport"
        :style="{
          position: 'fixed',
          top: position === 'top-right' || position === 'top-left' ? '1rem' : 'auto',
          bottom: position === 'bottom-right' || position === 'bottom-left' ? '1rem' : 'auto',
          right: position === 'top-right' || position === 'bottom-right' ? '1rem' : 'auto',
          left: position === 'top-left' || position === 'bottom-left' ? '1rem' : 'auto',
          zIndex: 100,
          maxWidth: '420px',
          width: '100%',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }"
        :data-position="position"
        data-testid="viewport"
      >
        <div
          v-for="toast in visibleToasts"
          :key="toast.id"
          class="toast"
          :class="{
            'toast-success': toast.type === 'success',
            'toast-error': toast.type === 'error',
            'toast-warning': toast.type === 'warning',
            'toast-info': toast.type === 'info'
          }"
          :data-testid="`toast-${toast.id}`"
          :data-variant="toast.type || 'default'"
          :role="toast.type === 'error' ? 'alert' : 'status'"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
          :aria-atomic="true"
          @mouseenter="pauseTimer(toast.id)"
          @mouseleave="resumeTimer(toast.id)"
        >
          <!-- Toast content -->
          <div class="toast-content">
            <div v-if="toast.title" class="toast-title">
              {{ toast.title }}
            </div>
            <div v-if="toast.description" class="toast-description">
              {{ toast.description }}
            </div>
          </div>

          <!-- Action button -->
          <button
            v-if="toast.actionText"
            class="toast-action"
            @click="executeAction(toast)"
            :aria-label="toast.actionAriaLabel || 'Execute action'"
            data-testid="toast-action"
          >
            {{ toast.actionText }}
          </button>

          <!-- Close button -->
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            aria-label="Close"
            type="button"
            data-testid="toast-close"
          >
            ×
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onUnmounted } from 'vue'

interface ToastItem {
  id: number
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actionText?: string
  actionAriaLabel?: string
  action?: () => void
  persistent?: boolean
  open: boolean
}

interface ToastInternalItem extends ToastItem {
  createdAt: number
  timerId?: number
  isPaused?: boolean
}

interface ToastProps {
  defaultDuration?: number
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  portalTarget?: string
  disablePortal?: boolean
}

interface ToastEmits {
  'toast-added': [toast: ToastItem]
  'toast-removed': [id: number]
  'action-executed': [toast: ToastItem]
}

const props = withDefaults(defineProps<ToastProps>(), {
  defaultDuration: 5000,
  maxToasts: 5,
  position: 'bottom-right',
  portalTarget: 'body',
  disablePortal: false
})

const emit = defineEmits<ToastEmits>()

// Internal state
const toasts = ref<ToastInternalItem[]>([])
const nextId = ref(1)

// Computed visible toasts (limit by maxToasts and filter open)
const visibleToasts = computed(() => {
  return toasts.value.filter(t => t.open !== false).slice(-props.maxToasts)
})

// Add new toast
function addToast(toast: Omit<ToastItem, 'id'>): number {
  const id = nextId.value++
  
  const newToast: ToastInternalItem = {
    ...toast,
    id,
    open: true, // Ensure toast starts as open
    createdAt: Date.now(),
    duration: toast.duration ?? props.defaultDuration
  }

  toasts.value.push(newToast)
  emit('toast-added', newToast)

  // Auto-remove after duration (unless persistent)
  if (!newToast.persistent && newToast.duration > 0) {
    scheduleRemoval(newToast)
  }

  return id
}

// Schedule toast removal
function scheduleRemoval(toast: ToastInternalItem): void {
  if (toast.timerId) {
    clearTimeout(toast.timerId)
  }
  
  toast.timerId = window.setTimeout(() => {
    removeToast(toast.id)
  }, toast.duration)
}

// Remove toast
function removeToast(id: number): void {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) {
    if (toast.timerId) {
      clearTimeout(toast.timerId)
    }
    toast.open = false // Mark as closed instead of immediately removing
    emit('toast-removed', id)
    
    // Remove from array after a delay to allow for transition
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index !== -1) {
        toasts.value.splice(index, 1)
      }
    }, 300)
  }
}

// Pause timer on hover
function pauseTimer(id: number): void {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && toast.timerId) {
    clearTimeout(toast.timerId)
    toast.isPaused = true
  }
}

// Resume timer after hover
function resumeTimer(id: number): void {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && toast.isPaused && !toast.persistent) {
    toast.isPaused = false
    const elapsed = Date.now() - toast.createdAt
    const remaining = (toast.duration ?? props.defaultDuration) - elapsed
    
    if (remaining > 0) {
      scheduleRemoval({
        ...toast,
        duration: remaining
      })
    } else {
      removeToast(id)
    }
  }
}

// Execute toast action
function executeAction(toast: ToastInternalItem): void {
  if (toast.action) {
    toast.action()
  }
  emit('action-executed', toast)
}

// Convenience methods for common toast types
function showSuccess(message: string, options?: Partial<ToastItem>): number {
  return addToast({ 
    description: message, 
    type: 'success',
    ...options 
  })
}

function showError(message: string, options?: Partial<ToastItem>): number {
  return addToast({ 
    description: message, 
    type: 'error',
    persistent: true, // Errors should be persistent by default
    ...options 
  })
}

function showWarning(message: string, options?: Partial<ToastItem>): number {
  return addToast({ 
    description: message, 
    type: 'warning',
    ...options 
  })
}

function showInfo(message: string, options?: Partial<ToastItem>): number {
  return addToast({ 
    description: message, 
    type: 'info',
    ...options 
  })
}

// Clear all toasts
function clearAll(): void {
  toasts.value.forEach(toast => {
    if (toast.timerId) {
      clearTimeout(toast.timerId)
    }
  })
  toasts.value = []
}

// Global keyboard handler for ESC key
function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && toasts.value.length > 0) {
    // Close the most recent open toast
    const openToasts = toasts.value.filter(t => t.open !== false)
    if (openToasts.length > 0) {
      const lastToast = openToasts[openToasts.length - 1]
      removeToast(lastToast.id)
    }
  }
}

// Setup global keyboard listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleGlobalKeydown)
}

// Cleanup on unmount
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
  clearAll()
})

// Expose methods for external access
defineExpose({
  toasts: computed(() => toasts.value),
  addToast,
  removeToast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  clearAll
})
</script>

<style scoped>
.toast-provider {
  /* Provider container */
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  transition: all 0.3s ease;
  max-width: 100%;
  word-wrap: break-word;
}

.toast:hover {
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.2);
}

.toast-success {
  border-left: 4px solid hsl(var(--success));
}

.toast-error {
  border-left: 4px solid hsl(var(--destructive));
}

.toast-warning {
  border-left: 4px solid hsl(var(--warning));
}

.toast-info {
  border-left: 4px solid hsl(var(--info));
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.toast-description {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
}

.toast-action {
  padding: 0.25rem 0.75rem;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.toast-action:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.toast-close {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius) - 4px);
  font-size: 1.25rem;
  line-height: 1;
  color: hsl(var(--muted-foreground));
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
</style>