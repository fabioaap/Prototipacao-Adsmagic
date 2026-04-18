<script setup lang="ts">
import { inject, computed, onMounted, onUnmounted, ref } from 'vue'
import { cn } from '@/lib/utils'
import type { CommandItem } from './CommandRoot.vue'

interface Props {
  value: string
  disabled?: boolean
  onSelect?: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  select: [value: string]
}>()

const commandContext = inject<any>('command-context', {})
const groupContext = inject<any>('command-group-context', {})
const itemRef = ref<HTMLElement>()

const item: CommandItem = {
  value: props.value,
  label: '', // Will be set from slot content
  disabled: props.disabled
}

const isSelected = computed(() => {
  return commandContext.selectedValue?.value === props.value
})

const handleClick = () => {
  if (props.disabled) return
  
  emit('select', props.value)
  if (props.onSelect) {
    props.onSelect(props.value)
  }
  if (commandContext.selectItem) {
    commandContext.selectItem(item)
  }
}

const handleMouseEnter = () => {
  if (props.disabled) return
  
  const filteredItems = commandContext.filteredItems?.value || []
  const itemIndex = filteredItems.findIndex((i: CommandItem) => i.value === props.value)
  if (itemIndex !== -1 && commandContext.setSelectedIndex) {
    commandContext.setSelectedIndex(itemIndex)
  }
}

onMounted(() => {
  // Get text content from slot for the label
  if (itemRef.value) {
    item.label = itemRef.value.textContent?.trim() || props.value
  }
  
  // Add item to group
  if (groupContext?.addItem) {
    groupContext.addItem(item)
  }
  
  // Register item with command context and auto-select first item
  if (commandContext?.setFilteredItems) {
    const currentItems = commandContext.filteredItems?.value || []
    const itemExists = currentItems.some((i: CommandItem) => i.value === props.value)
    
    if (!itemExists) {
      const newItems = [...currentItems, item]
      commandContext.setFilteredItems(newItems)
      
      // If this is the first item and no selection exists, select it
      if (newItems.length === 1 && !commandContext.selectedValue?.value) {
        commandContext.setSelectedValue(props.value)
      }
    }
  }
})

onUnmounted(() => {
  // Remove item from group
  if (groupContext?.removeItem) {
    groupContext.removeItem(props.value)
  }
})
</script>

<template>
  <div
    ref="itemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-control px-2 py-1.5 text-sm outline-none',
      isSelected && 'bg-accent text-accent-foreground',
      disabled && 'pointer-events-none opacity-50'
    )"
    role="option"
    :aria-selected="isSelected ? 'true' : 'false'"
    :data-selected="isSelected ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    :data-testid="`item-${value}`"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
  >
    <slot />
  </div>
</template>