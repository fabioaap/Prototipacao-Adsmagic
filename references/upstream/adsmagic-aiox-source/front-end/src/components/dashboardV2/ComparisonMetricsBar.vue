<script setup lang="ts">
/**
 * ComparisonMetricsBar.vue
 * 
 * Exibe métricas comparativas de múltiplos períodos em formato compacto.
 * Usado abaixo dos KPI cards quando há períodos de comparação ativos.
 * 
 * @feature G5.7 — Comparação multi-período
 */
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import Skeleton from '@/components/ui/Skeleton.vue'

interface ComparisonValue {
  id: string
  label: string
  color: string
  value: number | null
  displayValue: string
  isLoading: boolean
}

interface Props {
  /** Nome da métrica */
  metricLabel: string
  /** Valor atual do período principal */
  currentValue: string
  /** Valores dos períodos de comparação */
  comparisonValues: ComparisonValue[]
}

const props = defineProps<Props>()

// Calcula a variação percentual em relação ao valor atual
const getVariation = (comparisonValue: number | null, currentValue: number): number => {
  if (comparisonValue === null || currentValue === 0 || comparisonValue === 0) return 0
  return ((currentValue - comparisonValue) / comparisonValue) * 100
}

// Extrai o valor numérico do displayValue
const parseNumericValue = (displayValue: string): number => {
  // Remove R$, %, x e outros caracteres não numéricos
  const cleaned = displayValue.replace(/[^0-9,.-]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

const currentNumericValue = computed(() => parseNumericValue(props.currentValue))
</script>

<template>
  <div v-if="comparisonValues.length > 0" class="comparison-metrics-bar">
    <div 
      v-for="comparison in comparisonValues" 
      :key="comparison.id"
      class="comparison-item"
    >
      <div 
        class="comparison-dot" 
        :style="{ backgroundColor: comparison.color }"
      />
      
      <span class="comparison-label">{{ comparison.label }}:</span>
      
      <template v-if="comparison.isLoading">
        <Skeleton class="h-4 w-12" />
      </template>
      <template v-else>
        <span class="comparison-value">{{ comparison.displayValue }}</span>
        
        <!-- Indicador de variação -->
        <span 
          v-if="comparison.value !== null"
          class="comparison-variation"
          :class="{
            'variation-positive': getVariation(comparison.value, currentNumericValue) > 0,
            'variation-negative': getVariation(comparison.value, currentNumericValue) < 0,
            'variation-neutral': getVariation(comparison.value, currentNumericValue) === 0
          }"
        >
          <TrendingUp 
            v-if="getVariation(comparison.value, currentNumericValue) > 0" 
            class="h-3 w-3" 
          />
          <TrendingDown 
            v-else-if="getVariation(comparison.value, currentNumericValue) < 0" 
            class="h-3 w-3" 
          />
          <Minus v-else class="h-3 w-3" />
          
          {{ Math.abs(getVariation(comparison.value, currentNumericValue) || 0).toFixed(1) }}%
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.comparison-metrics-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border);
}

.comparison-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: var(--muted-foreground);
}

.comparison-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.comparison-label {
  font-weight: 500;
}

.comparison-value {
  color: var(--foreground);
  font-weight: 600;
}

.comparison-variation {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-weight: 500;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
}

.variation-positive {
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}

.variation-negative {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.variation-neutral {
  color: var(--muted-foreground);
  background: var(--muted);
}
</style>
