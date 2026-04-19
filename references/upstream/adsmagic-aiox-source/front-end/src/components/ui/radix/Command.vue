// @ts-nocheck
<template>
  <div
    ref="commandRef" 
    data-testid="command"
    :class="cn('command-wrapper flex h-full w-full flex-col overflow-hidden rounded-control bg-popover text-popover-foreground', isDialog ? 'bg-background' : '')"
    :role="isDialog ? 'dialog' : 'combobox'"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-haspopup="true"
    :aria-label="ariaLabel"
    tabindex="-1"
    @keydown="handleGlobalKeydown"
  >
    <slot :filtered-items="filteredItems" :search="searchTerm" :selected-index="selectedIndex" />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'

// Types
interface CommandItem {
  value: string
  label?: string
  description?: string
  icon?: any
  shortcut?: string
  disabled?: boolean
  keywords?: string[]
}

interface CommandGroup {
  heading?: string
  items: CommandItem[]
}

interface Props {
  items?: CommandItem[]
  groups?: CommandGroup[]
  placeholder?: string
  emptyText?: string
  query?: string
  open?: boolean
  headless?: boolean
  caseSensitive?: boolean
  filterFunction?: (item: CommandItem, query: string) => boolean
  onSelect?: (item: CommandItem) => void
  testId?: string
  isDialog?: boolean
  ariaLabel?: string
  // Styling
  inputClass?: string
  inputContainerClass?: string
  listClass?: string
  itemClass?: string
  groupClass?: string
  groupHeadingClass?: string
  iconClass?: string
  shortcutClass?: string
  emptyClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  groups: () => [],
  placeholder: 'Type a command or search...',
  emptyText: 'No results found.',
  query: '',
  open: false,
  headless: false,
  caseSensitive: false,
  isDialog: false,
  ariaLabel: 'Command palette'
})

const emit = defineEmits<{
  'update:query': [query: string]
  'update:open': [open: boolean]
  select: [item: CommandItem]
  close: []
}>()

// Template refs
const commandRef = ref<HTMLDivElement>()
const commandInputRef = ref<HTMLInputElement>()
const commandListRef = ref<HTMLDivElement>()

// State
const query = ref(props.query)
const isOpen = ref(props.open)
const selectedIndex = ref(-1)
const listPosition = ref<Record<string, string>>({})

// Computed
const filteredItems = computed(() => {
  if (!query.value) return props.items

  return props.items.filter(item => {
    if (props.filterFunction) {
      return props.filterFunction(item, query.value)
    }

    return defaultFilter(item, query.value)
  })
})

const filteredGroups = computed(() => {
  if (!query.value) return props.groups

  return props.groups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (props.filterFunction) {
          return props.filterFunction(item, query.value)
        }
        return defaultFilter(item, query.value)
      })
    }))
    .filter(group => group.items.length > 0)
})

const allItems = computed(() => {
  const items = [...filteredItems.value]
  filteredGroups.value.forEach(group => {
    items.push(...group.items)
  })
  return items
})

// Methods
function defaultFilter(item: CommandItem, searchQuery: string): boolean {
  const query = props.caseSensitive ? searchQuery : searchQuery.toLowerCase()
  
  const searchIn = [
    item.label,
    item.description,
    item.value,
    ...(item.keywords || [])
  ].filter(Boolean)

  return searchIn.some(text => {
    const searchText = props.caseSensitive ? text : text!.toLowerCase()
    return searchText.includes(query)
  })
}

function highlightMatch(text: string, searchQuery: string): string {
  if (!searchQuery) return text

  const query = props.caseSensitive ? searchQuery : searchQuery.toLowerCase()
  const searchText = props.caseSensitive ? text : text.toLowerCase()
  
  const index = searchText.indexOf(query)
  if (index === -1) return text

  const before = text.substring(0, index)
  const match = text.substring(index, index + query.length)
  const after = text.substring(index + query.length)

  return `${before}<mark class="bg-yellow-200 text-yellow-900">${match}</mark>${after}`
}

function getGlobalIndex(group: CommandGroup, localIndex: number): number {
  let globalIndex = filteredItems.value.length

  for (const g of filteredGroups.value) {
    if (g === group) {
      return globalIndex + localIndex
    }
    globalIndex += g.items.length
  }

  return globalIndex + localIndex
}

function updatePosition() {
  if (!commandInputRef.value || !commandListRef.value) return

  const inputRect = commandInputRef.value.getBoundingClientRect()
  const listElement = commandListRef.value
  const listRect = listElement.getBoundingClientRect()

  let top = inputRect.bottom + window.scrollY + 4
  let left = inputRect.left + window.scrollX

  // Adjust if list goes off screen
  if (left + listRect.width > window.innerWidth) {
    left = window.innerWidth - listRect.width - 8
  }

  if (top + listRect.height > window.innerHeight + window.scrollY) {
    top = inputRect.top + window.scrollY - listRect.height - 4
  }

  listPosition.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${inputRect.width}px`
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  query.value = target.value
  emit('update:query', query.value)

  selectedIndex.value = -1
  
  if (!isOpen.value && query.value) {
    open()
  }
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value && (filteredItems.value.length > 0 || filteredGroups.value.length > 0)) {
        open()
      } else {
        selectedIndex.value = Math.min(selectedIndex.value + 1, allItems.value.length - 1)
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break

    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && allItems.value[selectedIndex.value]) {
        selectItem(allItems.value[selectedIndex.value])
      }
      break

    case 'Escape':
      event.preventDefault()
      close()
      break

    case 'Tab':
      if (isOpen.value) {
        event.preventDefault()
        close()
      }
      break
  }
}

function handleListKeydown(event: KeyboardEvent) {
  // Delegate to input handler for consistency
  handleKeydown(event)
}

function handleFocus() {
  if (query.value && (filteredItems.value.length > 0 || filteredGroups.value.length > 0)) {
    open()
  }
}

function handleBlur(event: FocusEvent) {
  // Don't close if focus moved to command list
  const relatedTarget = event.relatedTarget as HTMLElement
  if (relatedTarget && commandListRef.value?.contains(relatedTarget)) {
    return
  }

  // Delay closing to allow for clicks
  setTimeout(() => {
    close()
  }, 150)
}

function open() {
  isOpen.value = true
  emit('update:open', true)
  
  nextTick(() => {
    updatePosition()
  })
}

function close() {
  isOpen.value = false
  selectedIndex.value = -1
  emit('update:open', false)
  emit('close')
}

function selectItem(item: CommandItem) {
  if (item.disabled) return

  emit('select', item)
  
  if (props.onSelect) {
    props.onSelect(item)
  }

  close()

  // Focus back to input
  nextTick(() => {
    commandInputRef.value?.focus()
  })
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  
  if (
    commandInputRef.value?.contains(target) ||
    commandListRef.value?.contains(target)
  ) {
    return
  }

  close()
}

// Watchers
watch(() => props.query, (newQuery) => {
  query.value = newQuery
})

watch(() => props.open, (newOpen) => {
  if (newOpen && !isOpen.value) {
    open()
  } else if (!newOpen && isOpen.value) {
    close()
  }
})

watch(query, () => {
  if (isOpen.value) {
    nextTick(() => {
      updatePosition()
    })
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updatePosition)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updatePosition)
  window.removeEventListener('resize', updatePosition)
})

// Expose for template access
defineExpose({
  query,
  isOpen,
  selectedIndex,
  filteredItems,
  filteredGroups,
  allItems,
  open,
  close,
  selectItem
})
</script>

<style scoped>
.command-wrapper {
  @apply relative w-full;
}

.command-input {
  @apply w-full;
}

.command-list-portal {
  @apply max-h-80 overflow-y-auto;
}

.command-item:focus,
.command-item[aria-selected="true"] {
  @apply bg-accent text-accent-foreground;
}

/* Mark highlighting styles */
:deep(mark) {
  @apply bg-yellow-200 text-yellow-900 rounded px-0.5;
}
</style>