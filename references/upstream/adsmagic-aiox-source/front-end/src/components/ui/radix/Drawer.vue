// @ts-nocheck
<template>
  <div class="drawer-wrapper">
    <!-- Drawer Trigger -->
    <component
      :is="triggerElement"
      v-if="!headless"
      v-bind="triggerProps"
      @click="open"
      :data-testid="`drawer-trigger${testId ? `-${testId}` : ''}`"
    >
      <slot name="trigger">
        <button
          type="button"
          class="drawer-trigger-button"
          :class="cn(
            'inline-flex items-center justify-center rounded-control text-sm font-medium',
            'ring-offset-background transition-colors focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'h-10 px-4 py-2',
            triggerButtonClass
          )"
        >
          {{ triggerText || 'Open Drawer' }}
        </button>
      </slot>
    </component>

    <!-- Drawer Portal -->
    <teleport to="body">
      <div
        v-if="isOpen"
        ref="drawerContainerRef"
        class="drawer-portal"
        :class="cn(
          'fixed inset-0 z-50 flex',
          getPlacementClasses()
        )"
        :data-testid="`drawer-container${testId ? `-${testId}` : ''}`"
        @keydown="handleKeydown"
        tabindex="-1"
      >
        <!-- Backdrop/Overlay -->
        <div
          class="drawer-backdrop"
          :class="cn(
            'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            backdropClass
          )"
          :data-state="isOpen ? 'open' : 'closed'"
          :data-testid="`drawer-backdrop${testId ? `-${testId}` : ''}`"
          @click="handleBackdropClick"
        />

        <!-- Drawer Content -->
        <div
          ref="drawerContentRef"
          class="drawer-content"
          :class="cn(
            'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:duration-300 data-[state=open]:duration-500',
            getContentClasses(),
            getAnimationClasses(),
            contentClass
          )"
          :data-state="isOpen ? 'open' : 'closed'"
          :data-testid="`drawer-content${testId ? `-${testId}` : ''}`"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <!-- Close Button -->
          <button
            v-if="showCloseButton"
            type="button"
            class="drawer-close-button"
            :class="cn(
              'absolute ring-offset-background transition-opacity hover:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:pointer-events-none data-[state=open]:bg-accent',
              'data-[state=open]:text-muted-foreground',
              getCloseButtonPosition(),
              closeButtonClass
            )"
            @click="close"
            :aria-label="closeButtonLabel"
            :data-testid="`drawer-close${testId ? `-${testId}` : ''}`"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="sr-only">Close</span>
          </button>

          <!-- Drawer Header -->
          <div
            v-if="$slots.header || title || description"
            class="drawer-header"
            :class="cn('flex flex-col space-y-1.5 text-center sm:text-left', headerClass)"
          >
            <slot name="header">
              <!-- Title -->
              <h2
                v-if="title"
                :id="titleId"
                class="drawer-title"
                :class="cn(
                  'text-lg font-semibold leading-none tracking-tight',
                  titleClass
                )"
                :data-testid="`drawer-title${testId ? `-${testId}` : ''}`"
              >
                {{ title }}
              </h2>

              <!-- Description -->
              <p
                v-if="description"
                :id="descriptionId"
                class="drawer-description"
                :class="cn('text-sm text-muted-foreground', descriptionClass)"
                :data-testid="`drawer-description${testId ? `-${testId}` : ''}`"
              >
                {{ description }}
              </p>
            </slot>
          </div>

          <!-- Drawer Body -->
          <div
            class="drawer-body"
            :class="cn('flex-1 overflow-auto', bodyClass)"
            :data-testid="`drawer-body${testId ? `-${testId}` : ''}`"
          >
            <slot />
          </div>

          <!-- Drawer Footer -->
          <div
            v-if="$slots.footer"
            class="drawer-footer"
            :class="cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', footerClass)"
            :data-testid="`drawer-footer${testId ? `-${testId}` : ''}`"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

// Types
type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
  // Control Props
  open?: boolean
  placement?: DrawerPlacement
  size?: DrawerSize
  dismissible?: boolean
  headless?: boolean
  
  // Content Props
  title?: string
  description?: string
  
  // Trigger Props
  triggerElement?: string
  triggerProps?: Record<string, any>
  triggerText?: string
  
  // Close Button Props
  showCloseButton?: boolean
  closeButtonLabel?: string
  
  // Event Handlers
  onClose?: () => void
  onOpen?: () => void
  
  // Testing
  testId?: string
  
  // Styling Classes
  contentClass?: string
  backdropClass?: string
  headerClass?: string
  bodyClass?: string
  footerClass?: string
  titleClass?: string
  descriptionClass?: string
  triggerButtonClass?: string
  closeButtonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  placement: 'right',
  size: 'md',
  dismissible: true,
  headless: false,
  triggerElement: 'div',
  triggerProps: () => ({}),
  showCloseButton: true,
  closeButtonLabel: 'Close drawer'
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  open: []
  close: []
}>()

// Template refs
const drawerContainerRef = ref<HTMLDivElement>()
const drawerContentRef = ref<HTMLDivElement>()

// State
const isOpen = ref(props.open)
const previousActiveElement = ref<HTMLElement | null>(null)

// Computed
const titleId = computed(() => `drawer-title-${Math.random().toString(36).substr(2, 9)}`)
const descriptionId = computed(() => `drawer-description-${Math.random().toString(36).substr(2, 9)}`)

// Methods
function getPlacementClasses(): string {
  const base = 'items-center justify-center'
  
  switch (props.placement) {
    case 'top':
      return 'items-start justify-center'
    case 'right':
      return 'items-center justify-end'
    case 'bottom':
      return 'items-end justify-center'
    case 'left':
      return 'items-center justify-start'
    default:
      return base
  }
}

function getContentClasses(): string {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }
  
  const placementClasses = {
    top: 'inset-x-0 top-0 border-b',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
    bottom: 'inset-x-0 bottom-0 border-t',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm'
  }

  if (props.placement === 'right' || props.placement === 'left') {
    return `${placementClasses[props.placement]} ${sizeClasses[props.size]}`
  }
  
  return `${placementClasses[props.placement]} ${sizeClasses[props.size]}`
}

function getAnimationClasses(): string {
  const animations = {
    top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    right: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
    bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
  }

  return animations[props.placement]
}

function getCloseButtonPosition(): string {
  const positions = {
    top: 'right-4 top-4',
    right: 'left-4 top-4',
    bottom: 'right-4 top-4',
    left: 'right-4 top-4'
  }

  return positions[props.placement]
}

function open() {
  if (isOpen.value) return

  // Store current active element for restoration
  previousActiveElement.value = document.activeElement as HTMLElement

  isOpen.value = true
  emit('update:open', true)
  emit('open')

  if (props.onOpen) {
    props.onOpen()
  }

  // Focus management
  nextTick(() => {
    const firstFocusable = drawerContentRef.value?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement

    if (firstFocusable) {
      firstFocusable.focus()
    } else {
      drawerContentRef.value?.focus()
    }
  })
}

function close() {
  if (!isOpen.value) return

  isOpen.value = false
  emit('update:open', false)
  emit('close')

  if (props.onClose) {
    props.onClose()
  }

  // Restore focus to previously active element
  nextTick(() => {
    if (previousActiveElement.value) {
      previousActiveElement.value.focus()
      previousActiveElement.value = null
    }
  })
}

function handleBackdropClick() {
  if (props.dismissible) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.dismissible) {
    event.preventDefault()
    close()
    return
  }

  // Tab trap logic
  if (event.key === 'Tab') {
    const focusableElements = drawerContentRef.value?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (!focusableElements || focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift+Tab: if on first element, go to last
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: if on last element, go to first
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (isOpen.value && event.key === 'Escape' && props.dismissible) {
    event.preventDefault()
    close()
  }
}

// Watchers
watch(() => props.open, (newOpen) => {
  if (newOpen && !isOpen.value) {
    open()
  } else if (!newOpen && isOpen.value) {
    close()
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
  
  // Cleanup focus restoration
  if (previousActiveElement.value) {
    previousActiveElement.value.focus()
  }
})

// Expose for template access
defineExpose({
  isOpen,
  open,
  close,
  titleId,
  descriptionId
})
</script>

<style scoped>
.drawer-wrapper {
  @apply relative;
}

.drawer-portal {
  @apply pointer-events-auto;
}

.drawer-content {
  @apply border;
}

/* Focus trap styles */
.drawer-content:focus {
  @apply outline-none;
}

/* Slide animations - these would be defined in your global CSS */
@keyframes slide-in-from-top {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes slide-out-to-top {
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
}

@keyframes slide-in-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-out-to-right {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slide-out-to-bottom {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

@keyframes slide-in-from-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slide-out-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
</style>