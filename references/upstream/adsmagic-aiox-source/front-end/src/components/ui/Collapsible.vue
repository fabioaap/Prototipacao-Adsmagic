<script setup lang="ts">
import { ref, provide } from 'vue'

interface Props {
  defaultOpen?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  disabled: false
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

provide('collapsible', {
  isOpen,
  toggle,
  disabled: props.disabled
})
</script>

<template>
  <div class="collapsible" :data-state="isOpen ? 'open' : 'closed'" :data-disabled="disabled || undefined">
    <slot />
  </div>
</template>
