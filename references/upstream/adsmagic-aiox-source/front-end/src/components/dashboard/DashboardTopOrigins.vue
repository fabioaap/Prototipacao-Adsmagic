<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Progress from '@/components/ui/Progress.vue'

interface OriginStat {
  name: string
  count: number
  percentage: number
  color?: string
}

interface Props {
  origins?: OriginStat[]
  loading?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  origins: () => [],
  loading: false,
  maxItems: 5,
})

const emit = defineEmits<{
  originClick: [origin: OriginStat]
  viewAll: []
}>()

const displayOrigins = computed(() => {
  return props.origins.slice(0, props.maxItems)
})

const total = computed(() => {
  return props.origins.reduce((sum, origin) => sum + origin.count, 0)
})
</script>

<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="section-title-sm">Top Origens</h3>
      <button
        @click="emit('viewAll')"
        class="text-sm text-primary hover:underline"
      >
        Ver todas
      </button>
    </div>

    <!-- Loading -->
    <div v-if="props.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="space-y-2">
        <div class="h-4 w-32 bg-muted animate-pulse rounded"></div>
        <div class="h-2 w-full bg-muted animate-pulse rounded"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="displayOrigins.length === 0"
      class="py-8 text-center text-muted-foreground"
    >
      <TrendingUp class="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p class="text-sm">Nenhuma origem registrada</p>
    </div>

    <!-- Origins List -->
    <div v-else class="space-y-4">
      <div
        v-for="origin in displayOrigins"
        :key="origin.name"
        @click="emit('originClick', origin)"
        class="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div
              :class="origin.color || 'bg-primary'"
              class="h-3 w-3 rounded-full"
            ></div>
            <span class="text-sm font-medium">{{ origin.name }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="font-semibold">{{ origin.count }}</span>
            <span>({{ origin.percentage.toFixed(1) }}%)</span>
          </div>
        </div>

        <Progress
          :value="origin.percentage"
          :max="100"
          variant="default"
          size="sm"
        />
      </div>

      <!-- Total -->
      <div class="pt-3 border-t border-border">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">Total</span>
          <span class="font-semibold">{{ total }} contatos</span>
        </div>
      </div>
    </div>
  </Card>
</template>
