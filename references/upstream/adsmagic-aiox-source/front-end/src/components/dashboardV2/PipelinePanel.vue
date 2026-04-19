<script setup lang="ts">
import { ChevronRight, Clock, DollarSign } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useFormat } from '@/composables/useFormat'
import type { PipelineStageStats } from '@/types'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  /**
   * Pipeline stage statistics
   */
  stages: PipelineStageStats[]
  
  /**
   * Loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  stageClick: [stage: PipelineStageStats]
}>()

const { formatNumber, formatCurrency } = useFormat()

// Format time in days
function formatDays(days: number): string {
  if (days === 0) return '0 dias'
  if (days < 1) return `${Math.round(days * 24)}h`
  if (days === 1) return '1 dia'
  return `${days.toFixed(1)} dias`
}

// Get color for avg time
function getTimeColor(days: number): string {
  if (days <= 2) return 'text-success'
  if (days <= 4) return 'text-warning'
  return 'text-destructive'
}

// Handle stage click
function handleStageClick(stage: PipelineStageStats) {
  emit('stageClick', stage)
}
</script>

<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-base">Vendas</CardTitle>
      <CardDescription class="text-xs">
        Etapas com tempo médio e valor
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <!-- Loading State -->
      <div v-if="props.loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="space-y-2">
          <Skeleton class="h-6 w-40" />
          <Skeleton class="h-20 w-full" />
        </div>
      </div>

      <!-- Pipeline Stages -->
      <div v-else class="space-y-4" role="list">
        <button
          v-for="stage in props.stages"
          :key="stage.stageId"
          class="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/5 hover:border-accent transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="handleStageClick(stage)"
          role="listitem"
          :aria-label="`${stage.stageName}: ${formatNumber(stage.count)} negócios, valor total ${formatCurrency(stage.value)}, tempo médio ${formatDays(stage.avgTime)}`"
        >
          <!-- Stage Header -->
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="section-kicker mb-1">
                {{ stage.stageName }}
              </h4>
              <p class="text-xs text-muted-foreground">
                {{ formatNumber(stage.count) }} {{ stage.count === 1 ? 'negócio' : 'negócios' }}
              </p>
            </div>
            
            <ChevronRight
              class="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </div>

          <!-- Stage Metrics -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Value -->
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-surface bg-success/10 flex items-center justify-center flex-shrink-0"
              >
                <DollarSign class="h-4 w-4 text-success" aria-hidden="true" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Valor</p>
                <p class="section-kicker">
                  {{ formatCurrency(stage.value) }}
                </p>
              </div>
            </div>

            <!-- Avg Time -->
            <div class="flex items-center gap-2">
              <div
                :class="cn(
                  'w-8 h-8 rounded-surface flex items-center justify-center flex-shrink-0',
                  stage.avgTime <= 2 ? 'bg-success/10' :
                  stage.avgTime <= 4 ? 'bg-warning/10' :
                  'bg-destructive/10'
                )"
              >
                <Clock
                  :class="cn('h-4 w-4', getTimeColor(stage.avgTime))"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Tempo médio</p>
                <p
                  :class="cn('text-sm font-semibold', getTimeColor(stage.avgTime))"
                >
                  {{ formatDays(stage.avgTime) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Conversion Rate (if available) -->
          <div
            v-if="stage.conversionRate !== undefined"
            class="mt-3 pt-3 border-t border-border"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                Taxa de conversão
              </span>
              <span
                :class="cn(
                  'text-xs font-medium',
                  stage.conversionRate >= 50 ? 'text-success' :
                  stage.conversionRate >= 30 ? 'text-warning' :
                  'text-destructive'
                )"
              >
                {{ stage.conversionRate.toFixed(1) }}%
              </span>
            </div>
            
            <!-- Progress bar -->
            <div class="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                :class="cn(
                  'h-full transition-all',
                  stage.conversionRate >= 50 ? 'bg-success' :
                  stage.conversionRate >= 30 ? 'bg-warning' :
                  'bg-destructive'
                )"
                :style="{ width: `${stage.conversionRate}%` }"
              />
            </div>
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="!props.loading && props.stages.length === 0"
        class="py-8 text-center"
      >
        <p class="text-sm text-muted-foreground">
          Nenhuma etapa do pipeline disponível
        </p>
      </div>
    </CardContent>
  </Card>
</template>
