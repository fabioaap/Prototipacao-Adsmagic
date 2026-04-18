<script setup lang="ts">
/**
 * ROI Cell Component
 * Renderiza célula de ROI com cor condicional
 * - Verde: ROI > 2x
 * - Amarelo: ROI entre 1x e 2x
 * - Vermelho: ROI < 1x ou "N/A"
 */
import { computed } from 'vue'

interface Props {
  roi: number | null
}

const props = defineProps<Props>()

// Determina cor baseada no valor de ROI
const roiColor = computed(() => {
  if (props.roi === null) return '#ef4444' // red-500 para N/A
  if (props.roi > 2.0) return '#10b981' // green-500 para >2x
  if (props.roi >= 1.0) return '#f59e0b' // yellow-500 para 1-2x
  return '#ef4444' // red-500 para <1x
})

// Formata valor de ROI
const displayValue = computed(() => {
  if (props.roi === null) return 'N/A'
  return `${props.roi.toFixed(1)}x`
})
</script>

<template>
  <span 
    class="text-sm font-semibold" 
    :style="{ color: roiColor }"
  >
    {{ displayValue }}
  </span>
</template>
