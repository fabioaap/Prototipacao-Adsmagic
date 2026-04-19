<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total de Eventos -->
    <div class="bg-card border rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Total de Eventos</p>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold">
              {{ loading ? '...' : formatNumber(metrics.total) }}
            </p>
            <div v-if="!loading && metrics.previousTotal" class="flex items-center space-x-1">
              <component
                :is="metrics.total >= metrics.previousTotal ? TrendingUp : TrendingDown"
                class="h-3 w-3"
                :class="metrics.total >= metrics.previousTotal ? 'text-success' : 'text-destructive'"
              />
              <span 
                class="text-xs"
                :class="metrics.total >= metrics.previousTotal ? 'text-success' : 'text-destructive'"
              >
                {{ Math.abs(metrics.total - metrics.previousTotal) }}
              </span>
            </div>
          </div>
        </div>
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Activity class="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>

    <!-- Eventos com Sucesso -->
    <div class="bg-card border rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Sucessos</p>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold text-success">
              {{ loading ? '...' : formatNumber(metrics.success) }}
            </p>
            <div v-if="!loading && metrics.previousSuccess !== undefined" class="flex items-center space-x-1">
              <component
                :is="metrics.success >= metrics.previousSuccess ? TrendingUp : TrendingDown"
                class="h-3 w-3"
                :class="metrics.success >= metrics.previousSuccess ? 'text-success' : 'text-destructive'"
              />
              <span 
                class="text-xs"
                :class="metrics.success >= metrics.previousSuccess ? 'text-success' : 'text-destructive'"
              >
                {{ Math.abs(metrics.success - metrics.previousSuccess) }}
              </span>
            </div>
          </div>
          <div v-if="!loading && metrics.total > 0" class="text-xs text-muted-foreground mt-1">
            {{ formatPercentage((metrics.success / metrics.total) * 100) }}% do total
          </div>
        </div>
        <div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <CheckCircle class="h-5 w-5 text-success" />
        </div>
      </div>
    </div>

    <!-- Eventos Pendentes -->
    <div class="bg-card border rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Pendentes</p>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold text-warning">
              {{ loading ? '...' : formatNumber(metrics.pending) }}
            </p>
            <div v-if="!loading && metrics.previousPending !== undefined" class="flex items-center space-x-1">
              <component
                :is="metrics.pending >= metrics.previousPending ? TrendingUp : TrendingDown"
                class="h-3 w-3"
                :class="metrics.pending >= metrics.previousPending ? 'text-warning' : 'text-success'"
              />
              <span 
                class="text-xs"
                :class="metrics.pending >= metrics.previousPending ? 'text-warning' : 'text-success'"
              >
                {{ Math.abs(metrics.pending - metrics.previousPending) }}
              </span>
            </div>
          </div>
          <div v-if="!loading && metrics.total > 0" class="text-xs text-muted-foreground mt-1">
            {{ formatPercentage((metrics.pending / metrics.total) * 100) }}% do total
          </div>
        </div>
        <div class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <Clock class="h-5 w-5 text-warning" />
        </div>
      </div>
    </div>

    <!-- Eventos Falhados -->
    <div class="bg-card border rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Falhas</p>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold text-destructive">
              {{ loading ? '...' : formatNumber(metrics.failed) }}
            </p>
            <div v-if="!loading && metrics.previousFailed !== undefined" class="flex items-center space-x-1">
              <component
                :is="metrics.failed >= metrics.previousFailed ? TrendingUp : TrendingDown"
                class="h-3 w-3"
                :class="metrics.failed >= metrics.previousFailed ? 'text-destructive' : 'text-success'"
              />
              <span 
                class="text-xs"
                :class="metrics.failed >= metrics.previousFailed ? 'text-destructive' : 'text-success'"
              >
                {{ Math.abs(metrics.failed - metrics.previousFailed) }}
              </span>
            </div>
          </div>
          <div v-if="!loading && metrics.total > 0" class="text-xs text-muted-foreground mt-1">
            {{ formatPercentage((metrics.failed / metrics.total) * 100) }}% do total
          </div>
        </div>
        <div class="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
          <XCircle class="h-5 w-5 text-destructive" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-vue-next'
import { useFormat } from '@/composables/useFormat'

interface EventMetrics {
  total: number
  success: number
  pending: number
  failed: number
  previousTotal?: number
  previousSuccess?: number
  previousPending?: number
  previousFailed?: number
}

interface Props {
  /**
   * Métricas dos eventos
   */
  metrics: EventMetrics
  /**
   * Se true, indica loading state
   */
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatNumber, formatPercentage } = useFormat()
</script>
