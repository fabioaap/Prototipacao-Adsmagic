<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface FunnelStep {
  label: string
  value: number
  percentage?: number
}

interface Props {
  steps: FunnelStep[]
  colors?: string[]
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => [
    'hsl(var(--primary))',
    'hsl(var(--info))',
    'hsl(var(--success))',
  ],
  class: undefined
})

// Calcular percentuais se não fornecidos
const processedSteps = computed(() => {
  const maxValue = Math.max(...props.steps.map(s => s.value))
  return props.steps.map((step, index) => ({
    ...step,
    percentage: step.percentage ?? (step.value / maxValue) * 100,
    color: props.colors[index % props.colors.length]
  }))
})

const containerClass = computed(() =>
  cn('space-y-3', props.class)
)
</script>

<template>
  <div :class="containerClass">
    <div v-for="(step, index) in processedSteps" :key="index" class="space-y-1">
      <!-- Label e valor -->
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium text-muted-foreground">
          {{ step.label }}
        </label>
        <span class="text-xs font-semibold text-foreground">
          {{ step.value.toLocaleString() }}
          <span v-if="step.percentage" class="text-muted-foreground font-normal">
            ({{ step.percentage.toFixed(1) }}%)
          </span>
        </span>
      </div>

      <!-- Barra -->
      <div class="w-full h-8 bg-muted rounded-surface overflow-hidden">
        <div
          class="h-full transition-all duration-300 ease-out flex items-center justify-end pr-3"
          :style="{
            width: `${step.percentage}%`,
            backgroundColor: step.color
          }"
        >
          <span v-if="step.percentage > 20" class="text-xs font-semibold text-white">
            {{ step.percentage.toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sem estilos adicionais - Tailwind */
</style>
