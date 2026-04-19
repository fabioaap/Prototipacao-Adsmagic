<script setup lang="ts">
import { TooltipRoot as RadixTooltipRoot } from 'radix-vue'
import { computed } from 'vue'

interface Props {
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined
})

const emit = defineEmits<{
  'update:open': [value: boolean | undefined]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value ?? false)
})
</script>

<template>
  <RadixTooltipRoot v-model:open="isOpen">
    <slot />
  </RadixTooltipRoot>
</template>
