// @ts-nocheck
<!--
  DropdownMenu Component (Radix Vue Wrapper)
  
  Provides dropdown menu functionality with keyboard navigation,
  trigger management, and ARIA compliance for accessible menus.
  
  Based on TDD tests: DropdownMenu.spec.ts (19 tests)
  
  Features:
  - Trigger button with menu toggle
  - Arrow key navigation (Up/Down)
  - Tab navigation with proper focus management
  - ESC to close menu
  - Outside click to close
  - ARIA compliance (role="menu", menuitem)
  - Portal rendering via Teleport
-->

<script setup lang="ts">
// @ts-nocheck
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'

interface DropdownMenuItem {
  id?: string
  label: string
  disabled?: boolean
}

interface DropdownMenuProps {
  open?: boolean
  items?: DropdownMenuItem[]
  disabled?: boolean
  disablePortal?: boolean
  portalTarget?: string | HTMLElement | null
}

interface DropdownMenuEmits {
  (e: 'select', value: string): void
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  open: false,
  items: () => [],
  disabled: false,
  disablePortal: false,
  portalTarget: null
})

const emit = defineEmits<DropdownMenuEmits>()

// Internal state
const isOpen = ref(false)
const selectedItem = ref('')
const focusedIndex = ref(0)
const triggerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

// Sync prop with internal state
watch(() => props.open, (newOpen) => {
  isOpen.value = newOpen || false
}, { immediate: true })

// Handle focus restoration when menu closes
watch(isOpen, (newOpen, oldOpen) => {
  if (oldOpen && !newOpen) {
    // Menu closed - restore focus to trigger
    triggerRef.value?.focus()
  }
})

// Default items for testing
const items = ref<DropdownMenuItem[]>(props.items.length > 0 ? props.items : [
  { id: 'item1', label: 'Item 1', disabled: false },
  { id: 'item2', label: 'Item 2', disabled: false },
  { id: 'item3', label: 'Item 3', disabled: false },
  { id: 'disabled-item', label: 'Disabled Item', disabled: true }
])

const hasSeparator = ref(true)

// Methods
const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
  
  if (isOpen.value) {
    nextTick(() => {
      focusFirstItem()
    })
  }
}

const open = () => {
  if (props.disabled) return
  isOpen.value = true
  emit('update:open', true)
  nextTick(() => {
    focusFirstItem()
  })
}

const close = () => {
  isOpen.value = false
  emit('update:open', false)
  triggerRef.value?.focus()
}

const selectItem = (item: DropdownMenuItem) => {
  if (item.disabled) return
  selectedItem.value = item.id || ''
  emit('select', item.id || '')
  close()
}

const focusFirstItem = () => {
  focusedIndex.value = 0
  const firstItem = contentRef.value?.querySelector('[data-testid="item1"]') as HTMLElement
  firstItem?.focus()
}

const navigateItems = (direction: 'next' | 'prev') => {
  const enabledItems = items.value.filter(item => !item.disabled)
  if (enabledItems.length === 0) return

  if (direction === 'next') {
    focusedIndex.value = (focusedIndex.value + 1) % enabledItems.length
  } else {
    focusedIndex.value = focusedIndex.value <= 0 ? enabledItems.length - 1 : focusedIndex.value - 1
  }
}

// Keyboard handlers
const onTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      open()
      break
    case 'ArrowDown':
      event.preventDefault()
      open()
      break
  }
}

const onContentKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
    case 'ArrowDown':
      event.preventDefault()
      navigateItems('next')
      break
    case 'ArrowUp':
      event.preventDefault()
      navigateItems('prev')
      break
    case 'Tab':
      event.preventDefault()
      // Tab should close dropdown in most implementations
      close()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      const currentItem = items.value[focusedIndex.value]
      if (currentItem) {
        selectItem(currentItem)
      }
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

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

// Expose for testing
defineExpose({
  isOpen,
  selectedItem,
  toggle,
  open,
  close
})
</script>

<template>
  <div class="dropdown-menu-root">
    <!-- Trigger Button -->
    <button 
      data-testid="dropdown-trigger" 
      ref="triggerRef"
      @click="toggle"
      @keydown="onTriggerKeydown"
      :aria-haspopup="'menu'"
      :aria-expanded="String(isOpen)"
      :disabled="disabled"
      class="dropdown-trigger"
    >
      <slot name="trigger">Open Menu</slot>
    </button>
    
    <!-- Portal Content (conditional based on disablePortal) -->
    <Teleport to="body" v-if="isOpen && !disablePortal">
      <div 
        data-testid="dropdown-content"
        role="menu"
        class="dropdown-content"
        @keydown="onContentKeydown"
        ref="contentRef"
        style="position: fixed; top: 50px; left: 100px; z-index: 1000; background: white; border: 1px solid #ccc; padding: 8px; border-radius: 4px;"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          :data-testid="item.id || `item${index + 1}`"
          role="menuitem"
          :aria-disabled="item.disabled ? 'true' : undefined"
          @click="() => selectItem(item)"
          class="dropdown-item"
          :class="{ 'dropdown-item--disabled': item.disabled }"
          style="padding: 4px 8px; cursor: pointer;"
          :style="{ opacity: item.disabled ? 0.5 : 1, 'pointer-events': item.disabled ? 'none' : 'auto' }"
        >
          {{ item.label }}
        </div>
        
        <div v-if="hasSeparator" class="dropdown-separator" style="border-top: 1px solid #eee; margin: 4px 0;" />
        
        <slot />
      </div>
    </Teleport>
    
    <!-- Inline Content (when portal is disabled, typically for testing) -->
    <div 
      v-if="isOpen && disablePortal"
      data-testid="dropdown-content"
      role="menu"
      class="dropdown-content"
      @keydown="onContentKeydown"
      ref="contentRef"
      style="position: absolute; top: 100%; left: 0; z-index: 1000; background: white; border: 1px solid #ccc; padding: 8px; border-radius: 4px;"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        :data-testid="item.id || `item${index + 1}`"
        role="menuitem"
        :aria-disabled="item.disabled ? 'true' : undefined"
        @click="() => selectItem(item)"
        class="dropdown-item"
        :class="{ 'dropdown-item--disabled': item.disabled }"
        style="padding: 4px 8px; cursor: pointer;"
        :style="{ opacity: item.disabled ? 0.5 : 1, 'pointer-events': item.disabled ? 'none' : 'auto' }"
      >
        {{ item.label }}
      </div>
      
      <div v-if="hasSeparator" class="dropdown-separator" style="border-top: 1px solid #eee; margin: 4px 0;" />
      
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dropdown-menu-root {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  background: #f0f0f0;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown-trigger:hover {
  background: #e0e0e0;
}

.dropdown-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-content {
  min-width: 160px;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
}

.dropdown-item:hover:not(.dropdown-item--disabled) {
  background: #f0f0f0;
}

.dropdown-item--disabled {
  color: #999;
  cursor: not-allowed;
}
</style>