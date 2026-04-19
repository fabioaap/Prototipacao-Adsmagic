<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, TrendingDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useFormat } from '@/composables/useFormat'
import type { FunnelStageStats } from '@/types'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  /**
   * Funnel stage statistics
   */
  stages: FunnelStageStats[]
  
  /**
   * Loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  stageClick: [stage: FunnelStageStats]
}>()

const { formatNumber, formatPercentage } = useFormat()

// Calculate max count for width scaling
const maxCount = computed(() => {
  if (props.stages.length === 0) return 1
  return Math.max(...props.stages.map(s => s.count))
})

// Calculate width percentage for each stage
function getWidthPercentage(count: number): number {
  return (count / maxCount.value) * 100
}

// Handle stage click
function handleStageClick(stage: FunnelStageStats) {
  emit('stageClick', stage)
}
</script>

<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-base">Conversão</CardTitle>
      <CardDescription class="text-xs">
        Taxas entre etapas da jornada
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <!-- Loading State -->
      <div v-if="props.loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="space-y-2">
          <Skeleton class="h-6 w-32" />
          <Skeleton class="h-16 w-full" />
        </div>
      </div>

      <!-- Funnel Stages -->
      <div v-else class="space-y-6" role="list">
        <div
          v-for="(stage, index) in props.stages"
          :key="stage.stageId"
          class="relative"
          role="listitem"
        >
          <!-- Stage Bar -->
          <button
            class="w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            @click="handleStageClick(stage)"
            :aria-label="`${stage.stageName}: ${formatNumber(stage.count)} itens, taxa de conversão ${formatPercentage(stage.conversionRate)}`"
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-foreground">
                  {{ stage.stageName }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ formatNumber(stage.count) }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <span
                  v-if="index > 0"
                  :class="cn(
                    'text-xs font-medium',
                    stage.conversionRate >= 50 ? 'text-success' : 
                    stage.conversionRate >= 25 ? 'text-warning' : 
                    'text-destructive'
                  )"
                >
                  {{ formatPercentage(stage.conversionRate) }} conversão
                </span>
                <ChevronRight
                  class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="relative h-12 bg-muted rounded-lg overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 bg-gradient-to-r from-info/80 to-info transition-all duration-300 group-hover:from-info group-hover:to-info/90"
                :style="{ width: `${getWidthPercentage(stage.count)}%` }"
              >
                <div class="flex items-center justify-center h-full px-4">
                  <span class="text-sm font-semibold text-white">
                    {{ formatPercentage((stage.count / (props.stages[0]?.count ?? 1)) * 100) }}
                  </span>
                </div>
              </div>
            </div>
          </button>

          <!-- Drop-off Indicator (between stages) -->
          <div
            v-if="index < props.stages.length - 1 && stage.conversionRate < 100"
            class="flex items-center gap-2 mt-2 mb-1 ml-4"
          >
            <TrendingDown class="h-3 w-3 text-destructive" aria-hidden="true" />
            <span class="text-xs text-muted-foreground">
              {{ formatPercentage(100 - stage.conversionRate) }} de abandono
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!props.loading && props.stages.length === 0"
        class="py-8 text-center"
      >
        <p class="text-sm text-muted-foreground">
          Nenhuma etapa do funil disponível
        </p>
      </div>
    </CardContent>
  </Card>
</template>
