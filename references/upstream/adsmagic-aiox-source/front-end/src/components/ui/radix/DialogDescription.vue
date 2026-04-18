<!--
  Dialog Description Component
  
  Provides description for Dialog with proper ARIA linking
  Used with aria-describedby in DialogContent
-->

<script setup lang="ts">
import { DialogDescription as RadixDialogDescription } from 'radix-vue'

interface DialogDescriptionProps {
  id?: string
}

const props = withDefaults(defineProps<DialogDescriptionProps>(), {
  id: 'dialog-description'
})
</script>

<template>
  <RadixDialogDescription
    :id="props.id"
    class="text-sm text-muted-foreground"
  >
    <slot />
  </RadixDialogDescription>
</template>