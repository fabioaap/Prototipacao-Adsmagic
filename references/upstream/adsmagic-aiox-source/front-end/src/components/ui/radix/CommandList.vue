<script setup lang="ts">
import { ref, inject, provide, onMounted } from 'vue'
import { cn } from '@/lib/utils'

const commandContext = inject<any>('command-context', {})
const listRef = ref<HTMLElement>()

// Provide list context for items
provide('command-list-context', {
  listRef
})

onMounted(() => {
  if (listRef.value && commandContext.selectedIndex) {
    // Set up scroll behavior for selected items
  }
})
</script>

<template>
  <div
    ref="listRef" 
    :class="cn('max-h-[300px] overflow-y-auto overflow-x-hidden')"
    role="listbox"
    data-testid="list"
  >
    <slot />
  </div>
</template>