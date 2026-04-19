<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, BarChart3, TrendingUp, Users, MousePointer, Calendar, Globe, Smartphone } from 'lucide-vue-next'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Link } from '@/types/models'
import { useFormat } from '@/composables/useFormat'
import { useTrackingStore } from '@/stores/tracking'

interface Props {
  /**
   * Controla a abertura do drawer
   */
  open: boolean
  /**
   * Link de rastreamento para exibir estatísticas
   */
  link: Link | null
}

const props = withDefaults(defineProps<Props>(), {
  link: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { formatDate, formatNumber } = useFormat()
const trackingStore = useTrackingStore()

// True from the moment drawer opens until fetch completes
const pendingFetch = ref(false)
const loading = computed(() => pendingFetch.value || trackingStore.isLoadingStats)

// Computed
const conversionRate = computed(() => {
  const details = trackingStore.selectedLinkDetailedStats
  if (details) return details.conversionRate
  if (!props.link || props.link.stats.clicks === 0) return 0
  return (props.link.stats.contacts / props.link.stats.clicks) * 100
})

const isActive = computed(() => props.link?.isActive ?? false)

const stats = computed(() => {
  const details = trackingStore.selectedLinkDetailedStats

  if (!details) {
    return {
      totalClicks: props.link?.stats.clicks ?? 0,
      totalConversions: props.link?.stats.sales ?? 0,
      conversionRate: conversionRate.value,
      uniqueVisitors: props.link?.stats.clicks ?? 0,
      topCountries: [] as Array<{ country: string; clicks: number }>,
      topDevices: [] as Array<{ device: string; clicks: number }>,
      dailyClicks: [] as Array<{ date: string; clicks: number }>,
    }
  }

  return {
    totalClicks: details.clicksCount,
    totalConversions: details.salesCount,
    conversionRate: details.conversionRate,
    uniqueVisitors: details.clicksCount,
    topCountries: details.accessesByCountry.map((item) => ({
      country: item.country,
      clicks: item.count
    })),
    topDevices: details.accessesByDevice.map((item) => ({
      device: item.device,
      clicks: item.count
    })),
    dailyClicks: details.accessesByDay.map((item) => ({
      date: item.date,
      clicks: item.count
    })),
  }
})

// Handlers
const handleClose = () => {
  emit('update:open', false)
}

const fetchStats = async () => {
  if (!props.link) return

  try {
    await trackingStore.fetchLinkStats(props.link.id)
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
  } finally {
    pendingFetch.value = false
  }
}

// Show loading immediately on open, fetch after animation (300ms)
watch(
  [() => props.open, () => props.link],
  ([isOpen, link], [wasOpen]) => {
    if (isOpen && link) {
      pendingFetch.value = true
      const delay = !wasOpen ? 320 : 0
      setTimeout(() => fetchStats(), delay)
    } else if (!isOpen) {
      pendingFetch.value = false
    }
  },
)
</script>

<template>
  <Drawer :open="props.open" size="lg" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-6 sm:min-w-[28rem]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <BarChart3 class="h-5 w-5 text-primary" />
            <h2 class="section-title-sm">Estatísticas do Link</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            :disabled="loading"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Link Info -->
        <div v-if="props.link" class="mb-6 p-4 bg-muted/20 rounded-lg">
          <h3 class="section-title-sm mb-2">{{ props.link.name }}</h3>
          <p class="text-xs text-muted-foreground mb-2">{{ props.link.shortUrl }}</p>
          <div class="flex items-center gap-2">
            <Badge :variant="isActive ? 'success' : 'secondary'">
              {{ isActive ? 'Ativo' : 'Inativo' }}
            </Badge>
            <span class="text-xs text-muted-foreground">
              Criado em {{ formatDate(props.link.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="h-20 bg-muted animate-pulse rounded" />
        </div>

        <!-- Stats Content -->
        <div v-else class="space-y-6">
          <!-- Overview Stats -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-card border border-border rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <MousePointer class="h-4 w-4 text-primary" />
                <span class="text-sm font-medium">Total de Cliques</span>
              </div>
              <p class="text-2xl font-bold">{{ formatNumber(stats.totalClicks) }}</p>
            </div>

            <div class="p-4 bg-card border border-border rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <TrendingUp class="h-4 w-4 text-primary" />
                <span class="text-sm font-medium">Conversões</span>
              </div>
              <p class="text-2xl font-bold">{{ formatNumber(stats.totalConversions) }}</p>
            </div>

            <div class="p-4 bg-card border border-border rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <Users class="h-4 w-4 text-primary" />
                <span class="text-sm font-medium">Visitantes Únicos</span>
              </div>
              <p class="text-2xl font-bold">{{ formatNumber(stats.uniqueVisitors) }}</p>
            </div>

            <div class="p-4 bg-card border border-border rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <BarChart3 class="h-4 w-4 text-primary" />
                <span class="text-sm font-medium">Taxa de Conversão</span>
              </div>
              <p class="text-2xl font-bold">{{ stats.conversionRate.toFixed(1) }}%</p>
            </div>
          </div>

          <!-- Top Countries -->
          <div v-if="stats.topCountries.length > 0" class="space-y-3">
            <h4 class="section-kicker">Países com Mais Cliques</h4>
            <div class="space-y-2">
              <div
                v-for="country in stats.topCountries"
                :key="country.country"
                class="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <Globe class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">{{ country.country }}</span>
                </div>
                <span class="text-sm font-semibold">{{ formatNumber(country.clicks) }}</span>
              </div>
            </div>
          </div>

          <!-- Top Devices -->
          <div v-if="stats.topDevices.length > 0" class="space-y-3">
            <h4 class="section-kicker">Dispositivos</h4>
            <div class="space-y-2">
              <div
                v-for="device in stats.topDevices"
                :key="device.device"
                class="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <Smartphone class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">{{ device.device }}</span>
                </div>
                <span class="text-sm font-semibold">{{ formatNumber(device.clicks) }}</span>
              </div>
            </div>
          </div>

          <!-- Daily Clicks Chart -->
          <div v-if="stats.dailyClicks.length > 0" class="space-y-3">
            <h4 class="section-kicker">Cliques por Dia (Últimos 7 dias)</h4>
            <div class="space-y-2">
              <div
                v-for="day in stats.dailyClicks"
                :key="day.date"
                class="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm font-medium">{{ formatDate(day.date, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary transition-all duration-300"
                      :style="{ width: `${(day.clicks / Math.max(...stats.dailyClicks.map(d => d.clicks))) * 100}%` }"
                    />
                  </div>
                  <span class="text-sm font-semibold">{{ formatNumber(day.clicks) }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>
  </Drawer>
</template>
