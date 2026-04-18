<script setup lang="ts">
import { computed } from 'vue'

type ContainerSize = 'md' | 'lg' | 'xl' | '2xl'

interface Props {
  size?: ContainerSize
  fluid?: boolean
  noPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: '2xl',
  fluid: false,
  noPadding: false,
})

const containerClass = computed(() => {
  if (props.fluid) {
    return 'sym-page-container sym-page-container--fluid'
  }

  return `sym-page-container sym-page-container--${props.size}`
})
</script>

<template>
  <div :class="[containerClass, { 'sym-page-container--no-padding': noPadding }]">
    <slot />
  </div>
</template>
