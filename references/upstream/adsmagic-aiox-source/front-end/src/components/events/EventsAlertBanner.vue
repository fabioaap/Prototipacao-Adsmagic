<script setup lang="ts">
/**
 * EventsAlertBanner.vue
 * 
 * Banner de alerta que aparece quando eventos estão falhando em massa.
 * Mostra:
 * - Taxa de falha atual
 * - Quantidade de eventos falhados
 * - Plataformas afetadas
 * - Ações rápidas (ver detalhes, reprocessar todos)
 * 
 * @feature G8.6 — Alertas automáticos de falhas em eventos
 */
import { computed } from 'vue'
import { RefreshCw, ExternalLink, TrendingDown, Activity } from 'lucide-vue-next'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { cn } from '@/lib/utils'

interface FailureAlert {
  severity: 'warning' | 'critical'
  failedCount: number
  totalCount: number
  failureRate: number
  affectedPlatforms: string[]
  lastFailureTime: Date | null
  trend: 'increasing' | 'stable' | 'decreasing'
}

interface Props {
  alert: FailureAlert | null
  loading?: boolean
  isRetrying?: boolean
}

interface Emits {
  (e: 'view-failures'): void
  (e: 'retry-all'): void
  (e: 'dismiss'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isRetrying: false
})

const emit = defineEmits<Emits>()

// Mapeamento de plataformas para nomes legíveis
const platformNames: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  linkedin_ads: 'LinkedIn Ads',
  webhook: 'Webhooks'
}

// Formatar nome da plataforma
const formatPlatformName = (platform: string): string => {
  return platformNames[platform] || platform
}

// Cor do alerta baseada na severidade
const alertVariant = computed<'warning' | 'destructive'>(() => {
  if (!props.alert) return 'warning'
  return props.alert.severity === 'critical' ? 'destructive' : 'warning'
})

// Título do alerta
const alertTitle = computed(() => {
  if (!props.alert) return ''
  return props.alert.severity === 'critical' 
    ? 'Falha Crítica em Eventos' 
    : 'Alta Taxa de Falha em Eventos'
})

// Descrição do alerta
const alertDescription = computed(() => {
  if (!props.alert) return ''
  const { failedCount, failureRate, affectedPlatforms } = props.alert
  
  const platformText = affectedPlatforms.length > 0
    ? ` nas plataformas: ${affectedPlatforms.map(formatPlatformName).join(', ')}`
    : ''
    
  return `${failedCount} eventos falharam (${failureRate.toFixed(1)}% de falha)${platformText}`
})

// Tempo desde última falha
const timeSinceLastFailure = computed(() => {
  if (!props.alert?.lastFailureTime) return null
  const now = new Date()
  const diff = now.getTime() - props.alert.lastFailureTime.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Agora mesmo'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  return `${hours}h atrás`
})

// Indicador de tendência
const trendInfo = computed(() => {
  if (!props.alert) return null
  switch (props.alert.trend) {
    case 'increasing':
      return { label: 'Aumentando', color: 'text-red-500', icon: TrendingDown }
    case 'decreasing':
      return { label: 'Diminuindo', color: 'text-emerald-500', icon: Activity }
    default:
      return { label: 'Estável', color: 'text-amber-500', icon: Activity }
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <Alert
      v-if="alert && !loading"
      :variant="alertVariant"
      class="mb-4"
    >
      <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="section-title-sm">{{ alertTitle }}</h4>
            
            <!-- Badge de severidade -->
            <Badge 
              :variant="alert.severity === 'critical' ? 'destructive' : 'warning'"
              class="text-xs"
            >
              {{ alert.severity === 'critical' ? 'Crítico' : 'Atenção' }}
            </Badge>
            
            <!-- Indicador de tendência -->
            <div 
              v-if="trendInfo"
              :class="cn('flex items-center gap-1 text-xs', trendInfo.color)"
            >
              <component :is="trendInfo.icon" class="h-3 w-3" />
              {{ trendInfo.label }}
            </div>
          </div>
          
          <p class="text-sm mt-1 text-muted-foreground">
            {{ alertDescription }}
          </p>
          
          <!-- Detalhes adicionais -->
          <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span v-if="timeSinceLastFailure">
              Última falha: {{ timeSinceLastFailure }}
            </span>
            <span>
              Taxa: <strong :class="alert.failureRate >= 50 ? 'text-red-500' : 'text-amber-500'">
                {{ alert.failureRate.toFixed(1) }}%
              </strong>
            </span>
          </div>
          
          <!-- Ações -->
          <div class="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              @click="emit('view-failures')"
            >
              <ExternalLink class="h-3.5 w-3.5 mr-1.5" />
              Ver Falhas
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              :disabled="isRetrying"
              @click="emit('retry-all')"
            >
              <RefreshCw 
                class="h-3.5 w-3.5 mr-1.5" 
                :class="{ 'animate-spin': isRetrying }"
              />
              {{ isRetrying ? 'Reprocessando...' : 'Reprocessar Todos' }}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              class="ml-auto"
              @click="emit('dismiss')"
            >
              Dispensar
            </Button>
          </div>
      </div>
    </Alert>
  </Transition>
</template>
