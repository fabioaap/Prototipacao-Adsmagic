<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
})

const orientationClass = computed(() =>
  props.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full'
)
</script>

<template>
  <div
    role="none"
    v-bind="$attrs"
    :class="cn('shrink-0 bg-border', orientationClass, props.class)"
  />
</template>