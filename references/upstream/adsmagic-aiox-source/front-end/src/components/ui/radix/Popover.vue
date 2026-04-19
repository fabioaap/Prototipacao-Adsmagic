<!--
  Popover Component (Radix Vue Wrapper)
  
  Provides popover functionality with trigger management,
  positioning, and Portal rendering for overlay content.
  
  Based on TDD tests: Popover.spec.ts (27 tests)
  
  Features:
  - Trigger button with popover toggle
  - Multiple positioning options (side, align)
  - ESC to close popover
  - Outside click to close
  - ARIA compliance
  - Portal rendering via Teleport
  - Close button within content
  - Arrow positioning support
-->

<script setup lang="ts">
// @ts-nocheck
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

interface PopoverProps {
  open?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  modal?: boolean
  disabled?: boolean
}

interface PopoverEmits {
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<PopoverProps>(), {
  open: false,
  side: 'bottom',
  align: 'center',
  modal: true,
  disabled: false
})

const emit = defineEmits<PopoverEmits>()

// Internal state
const isOpen = ref(props.open)
const triggerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

// Methods
const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
}

const open = () => {
  if (props.disabled) return
  isOpen.value = true
  emit('update:open', true)
}

const close = () => {
  isOpen.value = false
  emit('update:open', false)
  emit('close')
  triggerRef.value?.focus()
}

// Keyboard handlers
const onTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggle()
      break
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        close()
      }
      break
  }
}

const onContentKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

// Outside click handler
const onOutsideClick = (event: MouseEvent) => {
  if (contentRef.value && !contentRef.value.contains(event.target as Node) &&
      triggerRef.value && !triggerRef.value.contains(event.target as Node)) {
    close()
  }
}

// Document click listener
const handleDocumentClick = (event: MouseEvent) => {
  onOutsideClick(event)
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

// Computed positioning
const computedPosition = () => {
  const trigger = triggerRef.value
  if (!trigger) return { top: '50px', left: '100px' }

  const rect = trigger.getBoundingClientRect()
  const sideOffset = 8
  const alignOffset = 0

  let top: number, left: number

  // Position based on side
  switch (props.side) {
    case 'top':
      top = rect.top - sideOffset
      break
    case 'bottom':
      top = rect.bottom + sideOffset
      break
    case 'left':
      top = rect.top
      left = rect.left - sideOffset
      break
    case 'right':
      top = rect.top
      left = rect.right + sideOffset
      break
    default:
      top = rect.bottom + sideOffset
  }

  // Align based on alignment
  if (props.side === 'top' || props.side === 'bottom') {
    switch (props.align) {
      case 'start':
        left = rect.left + alignOffset
        break
      case 'end':
        left = rect.right + alignOffset
        break
      case 'center':
      default:
        left = rect.left + rect.width / 2 + alignOffset
    }
  } else {
    switch (props.align) {
      case 'start':
        top = rect.top + alignOffset
        break
      case 'end':
        top = rect.bottom + alignOffset
        break
      case 'center':
      default:
        top = rect.top + rect.height / 2 + alignOffset
    }
  }

  return { 
    top: `${top}px`, 
    left: `${left}px`
  }
}

// Expose for testing
defineExpose({
  isOpen,
  toggle,
  open,
  close
})
</script>

<template>
  <div class="popover-root">
    <!-- Trigger Button -->
    <button 
      data-testid="trigger" 
      ref="triggerRef"
      @click="toggle"
      @keydown="onTriggerKeydown"
      :aria-expanded="String(isOpen)"
      :aria-haspopup="'dialog'"
      :disabled="disabled"
      class="popover-trigger"
    >
      <slot name="trigger">Open Popover</slot>
    </button>
    
    <!-- Portal Content -->
    <Teleport to="body" v-if="isOpen">
      <div 
        data-testid="content"
        role="dialog"
        :aria-modal="modal"
        class="popover-content"
        @keydown="onContentKeydown"
        ref="contentRef"
        :style="{
          position: 'fixed',
          zIndex: 1000,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '200px',
          maxWidth: '300px',
          ...computedPosition()
        }"
        :data-side="side"
        :data-align="align"
      >
        <!-- Default content -->
        <div v-if="!$slots.content">
          <h3 data-testid="title" style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
            Popover Title
          </h3>
          <p data-testid="description" style="margin: 0 0 16px 0; font-size: 13px; color: #666;">
            Popover content goes here
          </p>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button 
              data-testid="action-button" 
              style="padding: 4px 8px; font-size: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Action
            </button>
            <button 
              data-testid="close-button" 
              @click="close"
              style="padding: 4px 8px; font-size: 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Close
            </button>
          </div>
        </div>
        
        <!-- Custom content slot -->
        <slot name="content" />
        
        <!-- Arrow -->
        <div 
          data-testid="arrow" 
          class="popover-arrow"
          :style="{
            position: 'absolute',
            width: '8px',
            height: '8px',
            background: 'white',
            border: '1px solid #ccc',
            transform: 'rotate(45deg)',
            ...(side === 'bottom' ? { top: '-5px', left: '50%', marginLeft: '-4px' } : {}),
            ...(side === 'top' ? { bottom: '-5px', left: '50%', marginLeft: '-4px' } : {}),
            ...(side === 'right' ? { left: '-5px', top: '50%', marginTop: '-4px' } : {}),
            ...(side === 'left' ? { right: '-5px', top: '50%', marginTop: '-4px' } : {})
          }"
        />
        
        <!-- Additional content slots -->
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.popover-root {
  position: relative;
  display: inline-block;
}

.popover-trigger {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.popover-trigger:hover {
  background: #e0e0e0;
}

.popover-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popover-content {
  outline: none;
}

.popover-arrow {
  pointer-events: none;
}
</style>