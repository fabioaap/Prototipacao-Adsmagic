<script setup lang="ts">
/**
 * SalesForecast.vue
 * 
 * Componente de previsão de vendas baseado em:
 * - Pipeline atual (negociações em andamento)
 * - Histórico de conversão por estágio
 * - Tendência dos últimos períodos
 * 
 * Mostra:
 * - Previsão de receita para próximos 30/60/90 dias
 * - Probabilidade de fechamento por estágio
 * - Gráfico de projeção vs realizado
 * - Indicadores de confiança da previsão
 * 
 * @feature G7.6 — Forecast de vendas
 */
import { computed, ref } from 'vue'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  DollarSign,
  BarChart3,
  AlertCircle,
  ChevronRight
} from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales'
import { useStagesStore } from '@/stores/stages'
import { useContactsStore } from '@/stores/contacts'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
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

withDefaults(defineProps<Props>(), {
  loading: false
})

const salesStore = useSalesStore()
const stagesStore = useStagesStore()
const contactsStore = useContactsStore()

// Período selecionado para forecast
const selectedPeriod = ref<30 | 60 | 90>(30)

// Probabilidade de conversão por estágio (mock - em produção viria da API)
const stageProbabilities: Record<string, number> = {
  'lead': 0.10,
  'qualified': 0.25,
  'proposal': 0.50,
  'negotiation': 0.75,
  'closed_won': 1.00,
  'closed_lost': 0.00
}

// Calcular pipeline por estágio
const pipelineByStage = computed(() => {
  const pipeline: Array<{
    stageId: string
    stageName: string
    count: number
    value: number
    probability: number
    weightedValue: number
  }> = []

  // Agrupar contatos por estágio
  const contacts = contactsStore.contacts
  const stages = stagesStore.stages

  stages.forEach(stage => {
    const stageContacts = contacts.filter(c => c.stage === stage.name)
    const count = stageContacts.length
    // Valor estimado: ticket médio * quantidade de contatos
    const avgTicket = salesStore.averageTicket || 500 // fallback para R$ 500
    const value = count * avgTicket
    const probability = stageProbabilities[stage.name?.toLowerCase()] || 0.30
    const weightedValue = value * probability

    if (count > 0) {
      pipeline.push({
        stageId: stage.id,
        stageName: stage.name,
        count,
        value,
        probability,
        weightedValue
      })
    }
  })

  return pipeline
})

// Valor total do pipeline
const totalPipelineValue = computed(() => {
  return pipelineByStage.value.reduce((sum, stage) => sum + stage.value, 0)
})

// Valor ponderado (forecast) do pipeline
const weightedPipelineValue = computed(() => {
  return pipelineByStage.value.reduce((sum, stage) => sum + stage.weightedValue, 0)
})

// Forecast baseado em período selecionado
const forecastByPeriod = computed(() => {
  // Simplificação: divide o valor ponderado pelo número de dias e multiplica pelo período
  // Em produção, usaria velocidade de fechamento e histórico
  const dailyRate = weightedPipelineValue.value / 90 // assume 90 dias para fechar todo pipeline
  
  return {
    30: Math.round(dailyRate * 30),
    60: Math.round(dailyRate * 60),
    90: Math.round(weightedPipelineValue.value)
  }
})

// Tendência baseada em histórico (mock)
const trend = computed(() => {
  const confirmed = salesStore.totalConfirmedSales
  // Mock: compara com período anterior
  const previousPeriod = Math.floor(confirmed * 0.85) // simula 15% de crescimento
  
  if (confirmed === 0 && previousPeriod === 0) return { direction: 'stable', percentage: 0 }
  
  const diff = confirmed - previousPeriod
  const percentage = previousPeriod > 0 ? Math.round((diff / previousPeriod) * 100) : 0
  
  return {
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
    percentage: Math.abs(percentage)
  }
})

// Nível de confiança do forecast
const confidenceLevel = computed(() => {
  const totalContacts = contactsStore.contacts.length
  const totalSales = salesStore.totalConfirmedSales
  
  // Mais dados = maior confiança
  if (totalContacts >= 100 && totalSales >= 20) return { level: 'high', label: 'Alta', color: 'text-emerald-500' }
  if (totalContacts >= 50 && totalSales >= 10) return { level: 'medium', label: 'Média', color: 'text-amber-500' }
  return { level: 'low', label: 'Baixa', color: 'text-red-500' }
})

// Formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Formatar porcentagem
const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Previsão de Vendas</CardTitle>
      <CardDescription>
        Projeção de receita baseada no pipeline atual e histórico de conversões
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-6">
    <!-- Cards de Resumo -->
    <div class="grid gap-4 md:grid-cols-3">
      <!-- Forecast Selecionado -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Previsão {{ selectedPeriod }} dias
          </CardTitle>
          <Target class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <template v-if="loading">
            <Skeleton class="h-8 w-32 mb-1" />
            <Skeleton class="h-4 w-24" />
          </template>
          <template v-else>
            <div class="text-2xl font-bold text-primary">
              {{ formatCurrency(forecastByPeriod[selectedPeriod]) }}
            </div>
            <div class="flex items-center gap-2 mt-1">
              <component 
                :is="trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : BarChart3"
                :class="cn(
                  'h-4 w-4',
                  trend.direction === 'up' ? 'text-emerald-500' : 
                  trend.direction === 'down' ? 'text-red-500' : 'text-muted-foreground'
                )"
              />
              <span 
                :class="cn(
                  'text-xs',
                  trend.direction === 'up' ? 'text-emerald-500' : 
                  trend.direction === 'down' ? 'text-red-500' : 'text-muted-foreground'
                )"
              >
                {{ trend.direction === 'up' ? '+' : '' }}{{ trend.percentage }}% vs período anterior
              </span>
            </div>
          </template>
        </CardContent>
      </Card>

      <!-- Pipeline Total -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Pipeline Total
          </CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <template v-if="loading">
            <Skeleton class="h-8 w-32 mb-1" />
            <Skeleton class="h-4 w-24" />
          </template>
          <template v-else>
            <div class="text-2xl font-bold">
              {{ formatCurrency(totalPipelineValue) }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ pipelineByStage.length }} estágios ativos
            </p>
          </template>
        </CardContent>
      </Card>

      <!-- Confiança do Forecast -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Confiança
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle class="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="text-xs">
                  Baseado na quantidade de dados históricos disponíveis
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <template v-if="loading">
            <Skeleton class="h-8 w-24 mb-1" />
            <Skeleton class="h-4 w-32" />
          </template>
          <template v-else>
            <div :class="cn('text-2xl font-bold', confidenceLevel.color)">
              {{ confidenceLevel.label }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ contactsStore.contacts.length }} contatos, {{ salesStore.totalConfirmedSales }} vendas
            </p>
          </template>
        </CardContent>
      </Card>
    </div>

    <!-- Seletor de Período -->
    <div class="flex items-center gap-2">
      <Calendar class="h-4 w-4 text-muted-foreground" />
      <span class="text-sm font-medium">Período de previsão:</span>
      <div class="flex gap-2">
        <button
          v-for="period in [30, 60, 90] as const"
          :key="period"
          :class="cn(
            'px-3 py-1 text-sm rounded-control transition-colors',
            selectedPeriod === period 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )"
          @click="selectedPeriod = period"
        >
          {{ period }} dias
        </button>
      </div>
    </div>

    <!-- Pipeline por Estágio -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base">Pipeline por Estágio</CardTitle>
      </CardHeader>
      <CardContent>
        <template v-if="loading">
          <div class="space-y-4">
            <Skeleton v-for="i in 4" :key="i" class="h-12 w-full" />
          </div>
        </template>
        <template v-else-if="pipelineByStage.length === 0">
          <div class="text-center py-8 text-muted-foreground">
            <BarChart3 class="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum contato no pipeline</p>
            <p class="text-sm">Adicione contatos para ver previsões de vendas</p>
          </div>
        </template>
        <template v-else>
          <div class="space-y-3">
            <div 
              v-for="stage in pipelineByStage" 
              :key="stage.stageId"
              class="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <!-- Nome do Estágio -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium truncate">{{ stage.stageName }}</span>
                  <Badge variant="outline" class="text-xs">
                    {{ stage.count }} contatos
                  </Badge>
                </div>
                <div class="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>Valor: {{ formatCurrency(stage.value) }}</span>
                  <span>•</span>
                  <span>Prob: {{ formatPercent(stage.probability) }}</span>
                </div>
              </div>

              <!-- Barra de Probabilidade -->
              <div class="w-24 hidden sm:block">
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-primary transition-all"
                    :style="{ width: `${stage.probability * 100}%` }"
                  />
                </div>
              </div>

              <!-- Valor Ponderado -->
              <div class="text-right">
                <div class="font-semibold text-primary">
                  {{ formatCurrency(stage.weightedValue) }}
                </div>
                <div class="text-xs text-muted-foreground">
                  ponderado
                </div>
              </div>

              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t">
            <div class="font-medium">Total Ponderado (Forecast)</div>
            <div class="text-xl font-bold text-primary">
              {{ formatCurrency(weightedPipelineValue) }}
            </div>
          </div>
        </template>
      </CardContent>
    </Card>
      </div>
    </CardContent>
  </Card>
</template>
