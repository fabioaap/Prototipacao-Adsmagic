<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '@/composables/useFormat'
import { getRecentSales } from '@/mocks/dashboard'
import { MessageCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  limit?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 8,
  loading: false
})

const { t } = useI18n()
const { formatCurrency } = useFormat()

const recentSales = computed(() => {
  const projectId = localStorage.getItem('current_project_id') || '2'
  return getRecentSales(projectId, props.limit)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const truncateName = (name: string, maxLength: number = 25) => {
  if (name.length <= maxLength) return name
  return `${name.substring(0, maxLength)}...`
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('dashboard.latestSales.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 6" :key="i" class="flex items-center space-x-4">
          <Skeleton class="h-10 w-10 rounded-full" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
          </div>
          <Skeleton class="h-4 w-20" />
        </div>
      </div>

      <div v-else-if="recentSales.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <MessageCircle class="h-12 w-12 mb-2 opacity-50" />
        <p>{{ t('dashboard.latestSales.noSales') }}</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="sale in recentSales"
          :key="sale.id"
          class="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        >
          <Avatar class="h-10 w-10 bg-primary/10 flex items-center justify-center">
            <MessageCircle class="h-5 w-5 text-primary" />
          </Avatar>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ truncateName(sale.contactName) }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ formatDate(sale.createdAt) }}
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-sm font-semibold">
              {{ formatCurrency(sale.value) }}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
