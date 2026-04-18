<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  class?: string
}

const props = defineProps<Props>()

const contentClass = computed(() => [
  'dialog-content',
  'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'z-50 w-[calc(100vw-1rem)] sm:w-full max-w-lg max-h-[calc(100vh-1rem)] sm:max-h-[85vh] overflow-auto',
  'bg-background rounded-xl sm:rounded-lg border shadow-lg',
  'p-4 sm:p-6',
  'animate-in fade-in-0 zoom-in-95',
  props.class
])
</script>

<template>
  <div :class="contentClass">
    <slot />
  </div>
</template>

<style scoped>
.dialog-content {
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes contentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
