<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, AlertCircle, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { SyncLog } from '@/types/models'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import Badge from '@/components/ui/Badge.vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface Props {
  /**
   * Lista de logs de sincronização
   */
  logs: SyncLog[]
  
  /**
   * Estado de loading
   */
  loading?: boolean
  
  /**
   * Plataforma para filtrar (opcional)
   */
  platform?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  platform: undefined,
})

const emit = defineEmits<{
  refresh: []
}>()

// Filters state
const statusFilter = ref<string>('')
const dateRange = ref<{ start: Date; end: Date } | undefined>()
const expandedLogId = ref<string | null>(null)

// Status options
const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'success', label: 'Sucesso' },
  { value: 'error', label: 'Erro' },
  { value: 'warning', label: 'Aviso' },
  { value: 'running', label: 'Em execução' },
]

// Filtered logs
const filteredLogs = computed(() => {
  let filtered = props.logs

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(log => log.status === statusFilter.value)
  }

  // Filter by date range
  if (dateRange.value) {
    filtered = filtered.filter(log => {
      const logDate = new Date(log.startedAt)
      return logDate >= dateRange.value!.start && logDate <= dateRange.value!.end
    })
  }

  return filtered
})

// Stats
const stats = computed(() => {
  const total = filteredLogs.value.length
  const success = filteredLogs.value.filter(l => l.status === 'success').length
  const error = filteredLogs.value.filter(l => l.status === 'error').length
  const warning = filteredLogs.value.filter(l => l.status === 'warning').length
  const running = filteredLogs.value.filter(l => l.status === 'running').length

  return { total, success, error, warning, running }
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDuration(durationMs?: number): string {
  if (!durationMs) return 'N/A'
  
  if (durationMs < 1000) {
    return `${durationMs}ms`
  }
  
  const seconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
  
  return `${seconds}s`
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'running':
      return Clock
    default:
      return Clock
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'destructive'
    case 'warning':
      return 'warning'
    case 'running':
      return 'default'
    default:
      return 'secondary'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'success':
      return 'Sucesso'
    case 'error':
      return 'Erro'
    case 'warning':
      return 'Aviso'
    case 'running':
      return 'Em execução'
    default:
      return status
  }
}

function toggleLogDetails(logId: string) {
  expandedLogId.value = expandedLogId.value === logId ? null : logId
}

function handleClearFilters() {
  statusFilter.value = ''
  dateRange.value = undefined
}

const hasActiveFilters = computed(() => {
  return statusFilter.value !== '' || dateRange.value !== undefined
})
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Logs de Sincronização</CardTitle>
          <CardDescription>
            Histórico de sincronizações com as plataformas integradas
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="emit('refresh')"
          :disabled="loading"
        >
          Atualizar
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="w-full sm:w-[200px]">
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Status"
          />
        </div>
        
        <div class="flex-1">
          <DateRangePicker
            v-model="dateRange"
            :show-presets="true"
            placeholder="Filtrar por período"
          />
        </div>

        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          @click="handleClearFilters"
        >
          Limpar Filtros
        </Button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="bg-muted/50 rounded-lg p-3">
          <p class="text-xs text-muted-foreground">Total</p>
          <p class="text-xl font-semibold">{{ stats.total }}</p>
        </div>
        <div class="bg-success/10 rounded-lg p-3">
          <p class="text-xs text-success">Sucesso</p>
          <p class="text-xl font-semibold text-success">{{ stats.success }}</p>
        </div>
        <div class="bg-destructive/10 rounded-lg p-3">
          <p class="text-xs text-destructive">Erros</p>
          <p class="text-xl font-semibold text-destructive">{{ stats.error }}</p>
        </div>
        <div class="bg-warning/10 rounded-lg p-3">
          <p class="text-xs text-warning">Avisos</p>
          <p class="text-xl font-semibold text-warning">{{ stats.warning }}</p>
        </div>
        <div class="bg-info/10 rounded-lg p-3">
          <p class="text-xs text-info">Em execução</p>
          <p class="text-xl font-semibold text-info">{{ stats.running }}</p>
        </div>
      </div>

      <!-- Logs List -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 bg-muted/50 rounded-lg animate-pulse" />
      </div>

      <div v-else-if="filteredLogs.length === 0" class="text-center py-12">
        <Clock class="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p class="text-muted-foreground">
          {{ hasActiveFilters ? 'Nenhum log encontrado com os filtros aplicados' : 'Nenhum log de sincronização disponível' }}
        </p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          class="border border-border rounded-lg overflow-hidden transition-all"
          :class="{ 'ring-2 ring-primary': expandedLogId === log.id }"
        >
          <!-- Log Header -->
          <button
            type="button"
            class="w-full p-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4"
            @click="toggleLogDetails(log.id)"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <component
                :is="getStatusIcon(log.status)"
                class="h-5 w-5 flex-shrink-0"
                :class="{
                  'text-success': log.status === 'success',
                  'text-destructive': log.status === 'error',
                  'text-warning': log.status === 'warning',
                  'text-info animate-spin': log.status === 'running'
                }"
              />
              
              <div class="flex-1 min-w-0 text-left">
                <div class="flex items-center gap-2 flex-wrap">
                  <Badge :variant="getStatusVariant(log.status)" size="sm">
                    {{ getStatusLabel(log.status) }}
                  </Badge>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(log.startedAt) }}
                  </span>
                </div>
                <p v-if="log.itemsSynced !== undefined" class="text-xs text-muted-foreground mt-1">
                  {{ log.itemsSynced }} item(s) sincronizado(s) · {{ formatDuration(log.durationMs) }}
                </p>
              </div>
            </div>

            <component
              :is="expandedLogId === log.id ? ChevronUp : ChevronDown"
              class="h-5 w-5 text-muted-foreground flex-shrink-0"
            />
          </button>

          <!-- Log Details (Expandable) -->
          <div
            v-if="expandedLogId === log.id"
            class="px-4 pb-4 pt-2 bg-muted/20 border-t border-border space-y-3"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-muted-foreground">Início</p>
                <p class="font-medium">{{ formatDate(log.startedAt) }}</p>
              </div>
              <div v-if="log.completedAt">
                <p class="text-muted-foreground">Conclusão</p>
                <p class="font-medium">{{ formatDate(log.completedAt) }}</p>
              </div>
              <div v-if="log.durationMs">
                <p class="text-muted-foreground">Duração</p>
                <p class="font-medium">{{ formatDuration(log.durationMs) }}</p>
              </div>
              <div v-if="log.itemsSynced !== undefined">
                <p class="text-muted-foreground">Items Sincronizados</p>
                <p class="font-medium">{{ log.itemsSynced }}</p>
              </div>
            </div>

            <div v-if="log.error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p class="text-sm font-medium text-destructive mb-1">Erro</p>
              <p class="text-sm text-destructive/90">{{ log.error }}</p>
            </div>

            <div v-if="log.details" class="bg-muted/50 rounded-lg p-3">
              <p class="text-sm font-medium mb-1">Detalhes</p>
              <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ log.details }}</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
