<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Percentual de progresso (0-100) */
  percent: number
  /** Altura da barra (px/rem classes Tailwind) */
  height?: string
  /** Cor da barra de progresso */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 'h-1.5',
  color: '#22C55E',
})

const clampedPercent = computed(() => {
  if (props.percent < 0) return 0
  if (props.percent > 100) return 100
  return Math.round(props.percent)
})
</script>

<template>
  <div class="fixed left-0 right-0 top-0 bg-muted z-40" :class="height" aria-hidden="true">
    <div
      class="h-full transition-all duration-300"
      :style="{ width: clampedPercent + '%', background: color }"
    />
  </div>
</template>

<style scoped>
div > div {
  will-change: width;
}
</style>


