// @ts-nocheck
<script setup lang="ts">
// @ts-nocheck
import { inject, provide, ref, computed, onMounted, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { CommandItem } from './CommandRoot.vue'

interface Props {
  heading?: string
  value?: string
}

const props = defineProps<Props>()

const commandContext = inject<any>('command-context', {})
const groupItems = ref<CommandItem[]>([])

// Provide group context for items
provide('command-group-context', {
  groupItems,
  addItem: (item: CommandItem) => {
    groupItems.value.push(item)
    updateFilteredItems()
  },
  removeItem: (value: string) => {
    groupItems.value = groupItems.value.filter(item => item.value !== value)
    updateFilteredItems()
  }
})

const updateFilteredItems = () => {
  if (commandContext.setFilteredItems) {
    const searchTerm = commandContext.searchTerm?.value?.toLowerCase() || ''
    const filtered = groupItems.value.filter(item => 
      !searchTerm || item.label.toLowerCase().includes(searchTerm)
    )
    commandContext.setFilteredItems(filtered)
  }
}

// Watch search term changes
watch(() => commandContext.searchTerm?.value, () => {
  updateFilteredItems()
}, { immediate: true })
</script>

<template>
  <div 
    role="group" 
    :aria-labelledby="heading ? 'group-heading' : undefined" 
    :aria-label="!heading ? 'Command group' : heading"
    data-testid="group"
  >
    <div
      v-if="heading"
      id="group-heading"
      :class="cn('px-2 py-1.5 text-xs font-medium text-muted-foreground')"
      aria-label="Group heading"
    >
      {{ heading }}
    </div>
    <slot />
  </div>
</template>