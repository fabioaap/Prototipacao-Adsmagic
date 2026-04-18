<script setup lang="ts">
import { inject, type Ref } from 'vue'

interface CollapsibleContext {
  isOpen: Ref<boolean>
  toggle: () => void
  disabled: boolean
}

const collapsible = inject<CollapsibleContext>('collapsible')
</script>

<template>
  <div
    v-if="collapsible?.isOpen.value"
    class="collapsible-content"
    :data-state="collapsible?.isOpen.value ? 'open' : 'closed'"
  >
    <slot />
  </div>
</template>

<style scoped>
.collapsible-content {
  @apply overflow-hidden;
}

.collapsible-content[data-state='open'] {
  animation: slideDown 200ms ease-out;
}

.collapsible-content[data-state='closed'] {
  animation: slideUp 200ms ease-out;
}

@keyframes slideDown {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}
</style>
