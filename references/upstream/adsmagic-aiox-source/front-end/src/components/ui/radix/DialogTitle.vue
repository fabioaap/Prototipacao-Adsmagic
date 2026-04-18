<!--
  Dialog Title Component
  
  Provides title for Dialog with proper ARIA linking
  Used with aria-labelledby in DialogContent
-->

<script setup lang="ts">
import { DialogTitle as RadixDialogTitle } from 'radix-vue'

interface DialogTitleProps {
  id?: string
}

const props = withDefaults(defineProps<DialogTitleProps>(), {
  id: 'dialog-title'
})
</script>

<template>
  <RadixDialogTitle
    :id="props.id"
    class="text-lg font-semibold leading-none tracking-tight"
  >
    <slot />
  </RadixDialogTitle>
</template>