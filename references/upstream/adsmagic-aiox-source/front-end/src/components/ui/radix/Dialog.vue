<!--
  Dialog Root Component (Radix Vue Wrapper)
  
  Main dialog container that manages open state and provides context.
  Use with DialogTrigger, DialogContent, DialogTitle, etc.
  
  Based on TDD tests: Dialog.spec.ts
-->

<script setup lang="ts">
import { computed } from 'vue'
import {
  DialogRoot
} from 'radix-vue'

interface DialogProps {
  open?: boolean
  modal?: boolean
}

interface DialogEmits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<DialogProps>(), {
  open: false,
  modal: true,
})

const emit = defineEmits<DialogEmits>()

// Computed
const computedOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const handleOpenChange = (open: boolean) => {
  emit('update:open', open)
}
</script>

<template>
  <DialogRoot 
    :open="computedOpen" 
    :modal="modal"
    @update:open="handleOpenChange"
  >
    <slot />
  </DialogRoot>
</template>

<!--
  Usage:
  
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    
    <DialogContent>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
      <div>Content here</div>
    </DialogContent>
  </Dialog>
-->