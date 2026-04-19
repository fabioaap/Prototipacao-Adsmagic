// @ts-nocheck
<template>
  <div>
    <!-- Trigger Button -->
    <button
      v-if="!disableTrigger"
      :class="cn(
        'inline-flex items-center justify-center rounded-control text-sm font-medium',
        'ring-offset-background transition-colors focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2'
      )"
      :data-testid="testId ? `drawer-trigger-${testId}` : 'drawer-trigger'"
      @click="handleOpen"
    >
      {{ triggerText || 'Open Drawer' }}
    </button>

    <!-- Backdrop/Overlay -->
    <div
      v-if="isOpen && !disablePortal"
      :class="cn(
        'fixed inset-0 z-50 bg-black/80',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
      )"
      :data-state="isOpen ? 'open' : 'closed'"
      :data-testid="testId ? `drawer-backdrop-${testId}` : 'drawer-backdrop'"
      @click="handleOutsideClick"
    />

    <!-- Drawer Content -->
    <div
      v-if="isOpen"
      :class="cn(
        'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:duration-300 data-[state=open]:duration-500',
        // Side-specific positioning
        placement === 'top' && [
          'inset-x-0 top-0 border-b',
          'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top'
        ],
        placement === 'bottom' && [
          'inset-x-0 bottom-0 border-t',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
        ],
        placement === 'left' && [
          'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
        ],
        placement === 'right' && [
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
        ]
      )"
      role="dialog"
      :aria-modal="true"
      :aria-labelledby="title ? titleId : undefined"
      :aria-describedby="description ? descId : undefined"
      :data-state="isOpen ? 'open' : 'closed'"
      :data-testid="testId ? `drawer-content-${testId}` : 'drawer-content'"
      @click.stop
    >
      <!-- Close Button -->
      <button
        v-if="!disableClose"
        :class="cn(
          'absolute right-4 top-4 rounded-control opacity-70 ring-offset-background',
          'transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
          'focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
          'data-[state=open]:bg-secondary'
        )"
        :aria-label="closeLabel || 'Close drawer'"
        :data-testid="testId ? `drawer-close-${testId}` : 'drawer-close'"
        @click="handleClose"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Header -->
      <div v-if="title || description" class="grid gap-1.5">
        <h2
          v-if="title"
          :id="titleId"
          :class="cn('text-lg font-semibold leading-none tracking-tight')"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          :id="descId"
          :class="cn('text-sm text-muted-foreground')"
        >
          {{ description }}
        </p>
      </div>

      <!-- Content Slot -->
      <div :class="cn('grid gap-4 py-4')">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="showFooter" :class="cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2')">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right'
  title?: string
  description?: string
  triggerText?: string
  closeLabel?: string
  showFooter?: boolean
  disableTrigger?: boolean
  disableClose?: boolean
  disablePortal?: boolean
  testId?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
  (e: 'open'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  placement: 'right',
  showFooter: true,
  disableTrigger: false,
  disableClose: false,
  disablePortal: false
})

const emit = defineEmits<Emits>()

const isOpen = ref(props.open)
const titleId = computed(() => `drawer-title-${Math.random().toString(36).substr(2, 9)}`)
const descId = computed(() => `drawer-desc-${Math.random().toString(36).substr(2, 9)}`)

// Methods
const handleOpen = () => {
  isOpen.value = true
  emit('update:open', true)
  emit('open')
  
  nextTick(() => {
    // Focus management - focus first focusable element
    const content = document.querySelector(`[data-testid="${props.testId ? `drawer-content-${props.testId}` : 'drawer-content'}"]`)
    if (content) {
      const focusable = content.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusable instanceof HTMLElement) {
        focusable.focus()
      }
    }
  })
}

const handleClose = () => {
  isOpen.value = false
  emit('update:open', false)
  emit('close')
  
  // Restore focus to trigger
  nextTick(() => {
    const trigger = document.querySelector(`[data-testid="${props.testId ? `drawer-trigger-${props.testId}` : 'drawer-trigger'}"]`)
    if (trigger instanceof HTMLElement) {
      trigger.focus()
    }
  })
}

const handleOutsideClick = () => {
  handleClose()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return
  
  if (event.key === 'Escape') {
    handleClose()
    return
  }
  
  // Focus trap
  if (event.key === 'Tab') {
    const content = document.querySelector(`[data-testid="${props.testId ? `drawer-content-${props.testId}` : 'drawer-content'}"]`)
    if (!content) return
    
    const focusable = Array.from(content.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[]
    
    if (focusable.length === 0) return
    
    const firstFocusable = focusable[0]
    const lastFocusable = focusable[focusable.length - 1]
    
    if (event.shiftKey) {
      // Shift+Tab - move backward
      if (document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab - move forward
      if (document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }
  }
}

// Watchers
watch(() => props.open, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:open', newValue)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>