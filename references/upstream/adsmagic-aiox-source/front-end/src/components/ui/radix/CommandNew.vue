// @ts-nocheck
<script setup lang="ts">
// @ts-nocheck
import { ref, computed, inject, onMounted } from 'vue'
import { cn } from '@/lib/utils'

// Command Root Component
defineOptions({ name: 'CommandRoot' })

export interface CommandItem {
  id?: string | number
  value: string
  label: string
  disabled?: boolean
}

interface CommandRootProps {
  open?: boolean
  searchTerm?: string
  loop?: boolean
  shouldFilter?: boolean
  filter?: (value: string, search: string) => number
  defaultValue?: string
  value?: string
  disablePointerSelection?: boolean
  vimBindings?: boolean
}

const props = withDefaults(defineProps<CommandRootProps>(), {
  open: true,
  searchTerm: '',
  loop: true,
  shouldFilter: true,
  disablePointerSelection: false,
  vimBindings: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:searchTerm': [value: string]
  'update:value': [value: string]
}>()

const commandRef = ref<HTMLElement>()
const selectedIndex = ref(0)
const filteredItems = ref<CommandItem[]>([])
const isDialog = ref(false)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const searchTerm = computed({
  get: () => props.searchTerm,
  set: (value) => emit('update:searchTerm', value)
})

const ariaLabel = computed(() => 'Command menu')

// Global keyboard handler for Command component
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return
  
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Home':
    case 'End':
    case 'Enter':
    case ' ':
      event.preventDefault()
      break
  }
}

onMounted(() => {
  if (commandRef.value) {
    commandRef.value.focus()
  }
})
</script>

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