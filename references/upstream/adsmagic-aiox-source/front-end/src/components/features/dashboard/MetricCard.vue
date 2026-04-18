<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  label: string
  value: string | number
  icon?: LucideIcon
  comparison?: number
  loading?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  variant: 'default'
})

const comparisonIcon = computed(() => {
  if (!props.comparison) return Minus
  return props.comparison > 0 ? TrendingUp : TrendingDown
})

const comparisonColor = computed(() => {
  if (!props.comparison) return 'text-muted-foreground'
  return props.comparison > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
})

const iconColor = computed(() => {
  const colors = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    danger: 'text-red-600 dark:text-red-500'
  }
  return colors[props.variant]
})
</script>

<template>
  <Card :class="cn('hover:shadow-md transition-shadow')">
    <CardContent class="p-6">
      <div class="flex items-start justify-between space-x-4">
        <div class="flex-1 space-y-2">
          <p class="text-sm font-medium text-muted-foreground">
            {{ label }}
          </p>
          <div v-if="loading">
            <Skeleton class="h-8 w-24" />
          </div>
          <div v-else>
            <p class="text-2xl font-bold">
              {{ value }}
            </p>
          </div>
          <div v-if="comparison !== undefined && !loading" class="flex items-center space-x-1">
            <component :is="comparisonIcon" :class="cn('h-4 w-4', comparisonColor)" />
            <span :class="cn('text-sm font-medium', comparisonColor)">
              {{ Math.abs(comparison).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div v-if="icon" :class="cn('rounded-full bg-primary/10 p-3', iconColor)">
          <component :is="icon" class="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
