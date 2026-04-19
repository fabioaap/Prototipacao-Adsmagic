<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione...'
})

const displayValue = computed(() => {
  // This will be overridden by the parent Select component
  return props.placeholder
})
</script>

<template>
  <span class="block truncate">
    {{ displayValue }}
  </span>
</template>
