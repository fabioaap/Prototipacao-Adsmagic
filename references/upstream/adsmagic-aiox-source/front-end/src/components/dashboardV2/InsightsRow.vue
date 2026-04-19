<script setup lang="ts">
import { AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { DashboardInsight } from '@/types'

interface Props {
  /**
   * Insights to display
   */
  insights: DashboardInsight[]
  
  /**
   * Loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  insightClick: [insight: DashboardInsight]
}>()

// Get icon for severity
function getIcon(severity: DashboardInsight['severity']) {
  const icons = {
    crit: AlertCircle,
    warn: AlertTriangle,
    info: Info
  }
  return icons[severity]
}

// Get classes for severity
function getClasses(severity: DashboardInsight['severity']) {
  const classes = {
    crit: {
      container: 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20',
      icon: 'text-destructive',
      text: 'text-destructive'
    },
    warn: {
      container: 'bg-warning/10 border-warning/30 hover:bg-warning/20',
      icon: 'text-warning',
      text: 'text-warning-foreground'
    },
    info: {
      container: 'bg-info/10 border-info/30 hover:bg-info/20',
      icon: 'text-info',
      text: 'text-info-foreground'
    }
  }
  return classes[severity]
}

// Handle insight click
function handleClick(insight: DashboardInsight) {
  emit('insightClick', insight)
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="section-kicker">
      Insights Acionáveis
    </h3>

    <!-- Loading State -->
    <div v-if="props.loading" class="flex gap-3 overflow-x-auto pb-2">
      <div
        v-for="i in 3"
        :key="i"
        class="flex-shrink-0 w-full sm:w-auto"
      >
        <div class="h-20 w-full sm:w-80 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>

    <!-- Insights -->
    <div
      v-else-if="props.insights.length > 0"
      class="flex gap-3 overflow-x-auto pb-2"
      role="list"
    >
      <button
        v-for="insight in props.insights"
        :key="insight.id"
        :class="cn(
          'flex-shrink-0 w-full sm:w-auto max-w-md flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          getClasses(insight.severity).container
        )"
        role="listitem"
        @click="handleClick(insight)"
        :aria-label="`Insight: ${insight.title}`"
      >
        <component
          :is="getIcon(insight.severity)"
          :class="cn('h-5 w-5 mt-0.5 flex-shrink-0', getClasses(insight.severity).icon)"
          aria-hidden="true"
        />
        
        <div class="flex-1 text-left">
          <p
            :class="cn('text-sm font-medium', getClasses(insight.severity).text)"
          >
            {{ insight.title }}
          </p>
        </div>
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex items-center justify-center p-6 rounded-lg border border-dashed border-border"
    >
      <p class="text-sm text-muted-foreground">
        Nenhum insight disponível no momento
      </p>
    </div>
  </div>
</template>
