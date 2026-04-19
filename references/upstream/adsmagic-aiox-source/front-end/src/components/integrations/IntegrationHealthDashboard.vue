<script setup lang="ts">
/**
 * IntegrationHealthDashboard.vue
 * 
 * Dashboard de saúde das integrações mostrando:
 * - Status de cada integração (online/offline/degradado)
 * - Uptime (últimas 24h/7d/30d)
 * - Latência média de resposta
 * - Última sincronização bem-sucedida
 * - Alertas e incidentes recentes
 * 
 * @feature G9.6 — Dashboard health integrações
 */
import { computed, ref } from 'vue'
import { Activity, CheckCircle, XCircle, AlertTriangle, Clock, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import { useIntegrationsStore } from '@/stores/integrations'
import Badge from '@/components/ui/Badge.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const integrationsStore = useIntegrationsStore()

// Estado local para health data (mock por enquanto)
const isLoadingHealth = ref(false)

// Tipo para dados de saúde
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  uptime: number // porcentagem 0-100
  latency: number | null // ms
  lastSuccessfulSync: Date | null
  incidents: number // últimas 24h
  trend: 'up' | 'down' | 'stable'
}

// Mock de dados de saúde por plataforma
const healthData = computed<Record<string, HealthStatus>>(() => {
  const data: Record<string, HealthStatus> = {}
  
  integrationsStore.integrations.forEach(integration => {
    // Gera dados de saúde baseados no status da integração
    const isConnected = integration.status === 'connected'
    const hasError = integration.status === 'error'
    
    data[integration.platform] = {
      status: hasError ? 'down' : isConnected ? 'healthy' : 'unknown',
      uptime: hasError ? 85 + Math.random() * 10 : isConnected ? 98 + Math.random() * 2 : 0,
      latency: isConnected ? Math.floor(50 + Math.random() * 150) : null,
      lastSuccessfulSync: integration.lastSync ? new Date(integration.lastSync) : null,
      incidents: hasError ? Math.floor(1 + Math.random() * 3) : 0,
      trend: hasError ? 'down' : isConnected ? (Math.random() > 0.3 ? 'stable' : 'up') : 'stable'
    }
  })
  
  return data
})

// Resumo geral de saúde
const overallHealth = computed<{ status: HealthStatus['status'], score: number }>(() => {
  const platforms = Object.values(healthData.value)
  if (platforms.length === 0) return { status: 'unknown', score: 0 }
  
  const healthyCount = platforms.filter(p => p.status === 'healthy').length
  const score = Math.round((healthyCount / platforms.length) * 100)
  
  let status: HealthStatus['status'] = 'healthy'
  if (score < 50) status = 'down'
  else if (score < 90) status = 'degraded'
  
  return { status, score }
})

// Uptime médio
const averageUptime = computed(() => {
  const platforms = Object.values(healthData.value).filter(p => p.uptime > 0)
  if (platforms.length === 0) return 0
  return Math.round(platforms.reduce((acc, p) => acc + p.uptime, 0) / platforms.length * 10) / 10
})

// Latência média
const averageLatency = computed(() => {
  const platforms = Object.values(healthData.value).filter(p => p.latency !== null)
  if (platforms.length === 0) return null
  return Math.round(platforms.reduce((acc, p) => acc + (p.latency || 0), 0) / platforms.length)
})

// Total de incidentes
const totalIncidents = computed(() => {
  return Object.values(healthData.value).reduce((acc, p) => acc + p.incidents, 0)
})

// Formatação de tempo relativo
const formatRelativeTime = (date: Date | null): string => {
  if (!date) return 'Nunca'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'Agora mesmo'
  if (minutes < 60) return `${minutes}min atrás`
  if (hours < 24) return `${hours}h atrás`
  return `${days}d atrás`
}

// Cor do status
const getStatusColor = (status: HealthStatus['status']) => {
  switch (status) {
    case 'healthy': return 'text-emerald-500'
    case 'degraded': return 'text-amber-500'
    case 'down': return 'text-red-500'
    default: return 'text-muted-foreground'
  }
}

// Ícone do status
const getStatusIcon = (status: HealthStatus['status']) => {
  switch (status) {
    case 'healthy': return CheckCircle
    case 'degraded': return AlertTriangle
    case 'down': return XCircle
    default: return Clock
  }
}

// Label do status
const getStatusLabel = (status: HealthStatus['status']) => {
  switch (status) {
    case 'healthy': return 'Operacional'
    case 'degraded': return 'Degradado'
    case 'down': return 'Fora do ar'
    default: return 'Desconhecido'
  }
}

// Nome amigável da plataforma
const getPlatformName = (platform: string): string => {
  const names: Record<string, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    tiktok: 'TikTok Ads',
    whatsapp: 'WhatsApp'
  }
  return names[platform] || platform
}

// Cor do uptime bar
const getUptimeColor = (uptime: number) => {
  if (uptime >= 99) return 'bg-emerald-500'
  if (uptime >= 95) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="integration-health-dashboard">
    <!-- Header com resumo -->
    <div class="health-summary">
      <div class="summary-card">
        <div class="flex items-center gap-2 mb-1">
          <Activity class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium text-muted-foreground">Status Geral</span>
        </div>
        <div class="flex items-center gap-2">
          <component 
            :is="getStatusIcon(overallHealth.status)" 
            :class="cn('h-5 w-5', getStatusColor(overallHealth.status))"
          />
          <span class="text-lg font-semibold">{{ getStatusLabel(overallHealth.status) }}</span>
          <Badge 
            :variant="overallHealth.status === 'healthy' ? 'default' : overallHealth.status === 'degraded' ? 'secondary' : 'destructive'"
            class="ml-2"
          >
            {{ overallHealth.score }}%
          </Badge>
        </div>
      </div>

      <div class="summary-card">
        <div class="flex items-center gap-2 mb-1">
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium text-muted-foreground">Uptime Médio</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">{{ averageUptime }}%</span>
          <span class="text-xs text-muted-foreground">(últimos 30 dias)</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="flex items-center gap-2 mb-1">
          <Zap class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium text-muted-foreground">Latência Média</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">
            {{ averageLatency !== null ? `${averageLatency}ms` : '—' }}
          </span>
          <Badge v-if="averageLatency && averageLatency < 100" variant="outline" class="text-emerald-600">
            <ArrowDownRight class="h-3 w-3 mr-0.5" />
            Bom
          </Badge>
          <Badge v-else-if="averageLatency && averageLatency < 200" variant="outline" class="text-amber-600">
            Normal
          </Badge>
          <Badge v-else-if="averageLatency" variant="outline" class="text-red-600">
            <ArrowUpRight class="h-3 w-3 mr-0.5" />
            Alto
          </Badge>
        </div>
      </div>

      <div class="summary-card">
        <div class="flex items-center gap-2 mb-1">
          <AlertTriangle class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium text-muted-foreground">Incidentes (24h)</span>
        </div>
        <div class="flex items-center gap-2">
          <span :class="cn('text-lg font-semibold', totalIncidents > 0 ? 'text-amber-600' : 'text-emerald-600')">
            {{ totalIncidents }}
          </span>
          <span v-if="totalIncidents === 0" class="text-xs text-emerald-600">Nenhum problema</span>
          <span v-else class="text-xs text-amber-600">Requer atenção</span>
        </div>
      </div>
    </div>

    <!-- Tabela de status por integração -->
    <div class="health-table">
      <div class="table-header">
        <span>Plataforma</span>
        <span>Status</span>
        <span>Uptime</span>
        <span>Latência</span>
        <span>Última Sync</span>
        <span>Incidentes</span>
      </div>

      <template v-if="props.loading || isLoadingHealth">
        <div v-for="i in 4" :key="i" class="table-row">
          <Skeleton class="h-5 w-24" />
          <Skeleton class="h-5 w-20" />
          <Skeleton class="h-5 w-16" />
          <Skeleton class="h-5 w-14" />
          <Skeleton class="h-5 w-20" />
          <Skeleton class="h-5 w-10" />
        </div>
      </template>

      <template v-else>
        <div 
          v-for="(health, platform) in healthData" 
          :key="platform"
          class="table-row"
        >
          <!-- Plataforma -->
          <div class="platform-cell">
            <span class="font-medium">{{ getPlatformName(platform) }}</span>
          </div>

          <!-- Status -->
          <div class="status-cell">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div class="flex items-center gap-1.5">
                    <component 
                      :is="getStatusIcon(health.status)" 
                      :class="cn('h-4 w-4', getStatusColor(health.status))"
                    />
                    <span :class="cn('text-sm', getStatusColor(health.status))">
                      {{ getStatusLabel(health.status) }}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Status: {{ getStatusLabel(health.status) }}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <!-- Uptime -->
          <div class="uptime-cell">
            <div class="flex items-center gap-2">
              <div class="uptime-bar">
                <div 
                  class="uptime-fill" 
                  :class="getUptimeColor(health.uptime)"
                  :style="{ width: `${health.uptime}%` }"
                />
              </div>
              <span class="text-sm tabular-nums">{{ health.uptime.toFixed(1) }}%</span>
            </div>
          </div>

          <!-- Latência -->
          <div class="latency-cell">
            <span v-if="health.latency !== null" class="text-sm tabular-nums">
              {{ health.latency }}ms
            </span>
            <span v-else class="text-sm text-muted-foreground">—</span>
          </div>

          <!-- Última Sync -->
          <div class="sync-cell">
            <span class="text-sm text-muted-foreground">
              {{ formatRelativeTime(health.lastSuccessfulSync) }}
            </span>
          </div>

          <!-- Incidentes -->
          <div class="incidents-cell">
            <Badge 
              :variant="health.incidents === 0 ? 'outline' : 'destructive'"
              :class="health.incidents === 0 ? 'text-muted-foreground' : ''"
            >
              {{ health.incidents }}
            </Badge>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="!props.loading && Object.keys(healthData).length === 0" class="empty-state">
        <Activity class="h-8 w-8 text-muted-foreground mb-2" />
        <p class="text-sm text-muted-foreground">Nenhuma integração configurada</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.integration-health-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.health-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1rem;
  background: var(--muted);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}

.health-table {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr 0.8fr 1fr 0.8fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr 0.8fr 1fr 0.8fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--muted);
}

.uptime-bar {
  width: 60px;
  height: 6px;
  background: var(--muted);
  border-radius: 3px;
  overflow: hidden;
}

.uptime-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .table-header > span:nth-child(n+4),
  .table-row > div:nth-child(n+4) {
    display: none;
  }
}
</style>
