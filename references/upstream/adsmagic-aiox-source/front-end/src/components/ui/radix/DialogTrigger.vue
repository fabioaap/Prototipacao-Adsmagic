<!--
  Dialog Trigger Component
  
  Trigger element for Dialog (button, link, etc.)
  Supports as-child for flexible trigger types
-->

<script setup lang="ts">
import { DialogTrigger as RadixDialogTrigger } from 'radix-vue'

interface DialogTriggerProps {
  asChild?: boolean
}

const props = withDefaults(defineProps<DialogTriggerProps>(), {
  asChild: false
})
</script>

<template>
  <RadixDialogTrigger :as-child="props.asChild">
    <slot />
  </RadixDialogTrigger>
</template>