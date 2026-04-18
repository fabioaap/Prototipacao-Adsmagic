<script setup lang="ts">
import { inject, type Ref } from 'vue'

interface CollapsibleContext {
  isOpen: Ref<boolean>
  toggle: () => void
  disabled: boolean
}

const collapsible = inject<CollapsibleContext>('collapsible')

const handleClick = () => {
  collapsible?.toggle()
}
</script>

<template>
  <button
    type="button"
    class="collapsible-trigger"
    :aria-expanded="collapsible?.isOpen.value"
    :disabled="collapsible?.disabled"
    :data-state="collapsible?.isOpen.value ? 'open' : 'closed'"
    :data-disabled="collapsible?.disabled || undefined"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.collapsible-trigger {
  @apply flex items-center justify-between w-full cursor-pointer;
}

.collapsible-trigger:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
