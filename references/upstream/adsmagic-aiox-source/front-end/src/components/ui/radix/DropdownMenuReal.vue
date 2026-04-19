<template>
  <div class="relative">
    <!-- Trigger -->
    <button
      :class="cn(
        'inline-flex items-center justify-center rounded-control text-sm font-medium',
        'ring-offset-background transition-colors focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2'
      )"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :data-testid="testId ? `dropdown-trigger-${testId}` : 'dropdown-trigger'"
      @click="toggleOpen"
      @keydown="handleTriggerKeydown"
    >
      {{ triggerText || 'Open Menu' }}
      <svg
        class="ml-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Content -->
    <div
      v-if="isOpen"
      :class="cn(
        'absolute right-0 z-50 min-w-[8rem] overflow-hidden rounded-control border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        placement === 'top' && 'bottom-full mb-1',
        placement === 'bottom' && 'top-full mt-1',
        placement === 'left' && 'right-full mr-1',
        placement === 'right' && 'left-full ml-1'
      )"
      role="menu"
      :data-state="isOpen ? 'open' : 'closed'"
      :data-side="placement"
      :data-testid="testId ? `dropdown-content-${testId}` : 'dropdown-content'"
      @click.stop
    >
      <!-- Menu Items -->
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        :class="cn(
          'relative flex cursor-pointer select-none items-center rounded-control px-2 py-1.5 text-sm',
          'outline-none transition-colors focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          focusedIndex === index && 'bg-accent text-accent-foreground',
          item.disabled && 'pointer-events-none opacity-50'
        )"
        role="menuitem"
        :tabindex="focusedIndex === index ? 0 : -1"
        :data-disabled="item.disabled"
        :data-highlighted="focusedIndex === index"
        :data-testid="`${testId ? testId : 'dropdown'}-item-${item.id || index + 1}`"
        @click="handleItemClick(item, index)"
        @keydown="handleItemKeydown($event, item, index)"
        @mouseover="handleItemHover(index)"
      >
        {{ item.label }}
      </div>

      <!-- Submenu items -->
      <div v-if="hasSubmenus">
        <div
          v-for="(submenu, subIndex) in submenus"
          :key="`sub-${subIndex}`"
          :class="cn(
            'relative flex cursor-pointer select-none items-center rounded-control px-2 py-1.5 text-sm',
            'outline-none transition-colors hover:bg-accent hover:text-accent-foreground'
          )"
          role="menuitem"
          :data-testid="`${testId ? testId : 'dropdown'}-sub-${subIndex + 1}`"
        >
          {{ submenu.label }}
          <svg class="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Backdrop for mobile -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="handleOutsideClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

interface DropdownItem {
  id?: string | number
  label: string
  value?: string
  disabled?: boolean
  action?: () => void
}

interface Submenu {
  label: string
  items: DropdownItem[]
}

interface Props {
  open?: boolean
  triggerText?: string
  items?: DropdownItem[]
  submenus?: Submenu[]
  placement?: 'top' | 'bottom' | 'left' | 'right'
  testId?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'select', item: DropdownItem): void
  (e: 'open'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  triggerText: 'Open Menu',
  items: () => [],
  submenus: () => [],
  placement: 'bottom'
})

const emit = defineEmits<Emits>()

const isOpen = ref(props.open)
const focusedIndex = ref(0)

// Computed
const hasSubmenus = computed(() => props.submenus && props.submenus.length > 0)

// Methods
const toggleOpen = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    focusedIndex.value = 0
    emit('open')
  } else {
    emit('close')
  }
  emit('update:open', isOpen.value)
}

const handleClose = () => {
  isOpen.value = false
  emit('update:open', false)
  emit('close')
  
  // Return focus to trigger
  nextTick(() => {
    const trigger = document.querySelector(`[data-testid="${props.testId ? `dropdown-trigger-${props.testId}` : 'dropdown-trigger'}"]`)
    if (trigger instanceof HTMLElement) {
      trigger.focus()
    }
  })
}

const handleOutsideClick = () => {
  handleClose()
}

const handleItemClick = (item: DropdownItem, index: number) => {
  if (item.disabled) return
  
  focusedIndex.value = index
  emit('select', item)
  
  if (item.action) {
    item.action()
  }
  
  handleClose()
}

const handleItemHover = (index: number) => {
  focusedIndex.value = index
}

const handleTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        toggleOpen()
      } else if (event.key === 'ArrowDown') {
        focusNextItem()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        toggleOpen()
      } else {
        focusPreviousItem()
      }
      break
    case 'Escape':
      if (isOpen.value) {
        handleClose()
      }
      break
  }
}

const handleItemKeydown = (event: KeyboardEvent, item: DropdownItem, index: number) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleItemClick(item, index)
      break
    case 'ArrowDown':
      event.preventDefault()
      focusNextItem()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousItem()
      break
    case 'Escape':
      event.preventDefault()
      handleClose()
      break
    case 'Tab':
      if (event.shiftKey) {
        focusPreviousItem()
      } else {
        focusNextItem()
      }
      break
  }
}

const focusNextItem = () => {
  const availableItems = props.items.filter(item => !item.disabled)
  if (focusedIndex.value < availableItems.length - 1) {
    focusedIndex.value++
  } else {
    focusedIndex.value = 0
  }
  focusCurrentItem()
}

const focusPreviousItem = () => {
  const availableItems = props.items.filter(item => !item.disabled)
  if (focusedIndex.value > 0) {
    focusedIndex.value--
  } else {
    focusedIndex.value = availableItems.length - 1
  }
  focusCurrentItem()
}

const focusCurrentItem = () => {
  nextTick(() => {
    const currentItem = document.querySelector(
      `[data-testid="${props.testId ? props.testId : 'dropdown'}-item-${props.items[focusedIndex.value]?.id || focusedIndex.value + 1}"]`
    )
    if (currentItem instanceof HTMLElement) {
      currentItem.focus()
    }
  })
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (isOpen.value && event.key === 'Escape') {
    handleClose()
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
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>