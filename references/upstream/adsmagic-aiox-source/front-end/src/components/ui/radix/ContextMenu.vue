<template>
  <div class="context-menu-root">
    <!-- Trigger area that responds to right-click -->
    <div
      @contextmenu="onRightClick"
      class="context-menu-trigger"
    >
      <slot name="trigger" />
    </div>

    <!-- Portal content that renders at document level -->
    <Teleport to="body" v-if="isOpen">
      <div
        ref="contentRef"
        class="context-menu-content"
        :style="{
          position: 'fixed',
          top: `${position.y}px`,
          left: `${position.x}px`,
          zIndex: 50,
          minWidth: '8rem',
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          padding: '0.25rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }"
        @click="onContentClick"
        @keydown="onKeydown"
        tabindex="-1"
        role="menu"
        :aria-expanded="isOpen"
      >
        <slot name="content" :close="close" :items="items" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'

interface ContextMenuProps {
  items?: Array<{
    id: string | number
    label: string
    value: string
    disabled?: boolean
    separator?: boolean
  }>
  closeOnSelect?: boolean
  open?: boolean
}

interface ContextMenuEmits {
  open: []
  close: []
  select: [item: any]
  'update:open': [open: boolean]
}

const props = withDefaults(defineProps<ContextMenuProps>(), {
  items: () => [],
  closeOnSelect: true
})

const emit = defineEmits<ContextMenuEmits>()

// Internal state
const isOpen = ref(false)
const position = ref({ x: 0, y: 0 })
const contentRef = ref<HTMLElement>()

// Watch for external open prop changes (strategy from perfect components)
watch(() => props.open, (newValue) => {
  if (newValue !== undefined) {
    isOpen.value = newValue
  }
}, { immediate: true })

// Open context menu at cursor position
function onRightClick(event: MouseEvent) {
  event.preventDefault()
  
  position.value = {
    x: event.clientX,
    y: event.clientY
  }
  
  isOpen.value = true
  emit('update:open', true)
  emit('open')
  
  nextTick(() => {
    contentRef.value?.focus()
  })
}

// Close context menu
function close() {
  isOpen.value = false
  emit('update:open', false)
  emit('close')
}

// Handle content clicks (prevent closing when clicking inside)
function onContentClick(event: Event) {
  event.stopPropagation()
}

// Handle keyboard navigation
function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusNextItem()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousItem()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectCurrentItem()
      break
  }
}

// Focus management for menu items
function focusNextItem() {
  const items = contentRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
  if (!items?.length) return
  
  const currentIndex = Array.from(items).findIndex(item => item === document.activeElement)
  const nextIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1
  ;(items[nextIndex] as HTMLElement)?.focus()
}

function focusPreviousItem() {
  const items = contentRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])')
  if (!items?.length) return
  
  const currentIndex = Array.from(items).findIndex(item => item === document.activeElement)
  const prevIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1
  ;(items[prevIndex] as HTMLElement)?.focus()
}

function selectCurrentItem() {
  const activeElement = document.activeElement as HTMLElement
  if (activeElement?.getAttribute('role') === 'menuitem') {
    activeElement.click()
  }
}

// Handle item selection
function onItemSelect(item: any) {
  emit('select', item)
  if (props.closeOnSelect) {
    close()
  }
}

// Close on outside click
function onOutsideClick(event: Event) {
  if (!contentRef.value?.contains(event.target as Node)) {
    close()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', onOutsideClick)
  document.addEventListener('contextmenu', onOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
  document.removeEventListener('contextmenu', onOutsideClick)
})

// Expose for testing
defineExpose({
  isOpen,
  close,
  position,
  onRightClick,
  onItemSelect
})
</script>

<style scoped>
.context-menu-trigger {
  display: contents;
}

.context-menu-content {
  outline: none;
}

.context-menu-content [role="menuitem"] {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.5rem;
  border-radius: calc(var(--radius) - 2px);
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-menu-content [role="menuitem"]:hover,
.context-menu-content [role="menuitem"]:focus {
  background-color: hsl(var(--accent));
  outline: none;
}

.context-menu-content [role="menuitem"][disabled] {
  pointer-events: none;
  opacity: 0.5;
}

.context-menu-separator {
  height: 1px;
  background-color: hsl(var(--border));
  margin: 0.25rem -0.25rem;
}
</style>