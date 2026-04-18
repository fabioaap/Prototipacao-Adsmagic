<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Settings } from 'lucide-vue-next'
import { useProjectsStore } from '@/stores/projects'
import Button from '@/components/ui/Button.vue'

interface Props {
  contactsCount: number
  salesCount: number
  goalPercentage: number
  deltaPercentage: number
  hasGoal?: boolean // Indica se há meta configurada
  revenueGoal?: number // Meta de receita mensal
  currentRevenue?: number // Receita atual no período
}

const props = withDefaults(defineProps<Props>(), {
  hasGoal: false,
  revenueGoal: 0,
  currentRevenue: 0
})

const router = useRouter()
const projectStore = useProjectsStore()

// Calcula porcentagem real baseada na meta e receita atual
const realGoalPercentage = computed(() => {
  if (!props.revenueGoal || props.revenueGoal <= 0) return 0
  const percentage = (props.currentRevenue / props.revenueGoal) * 100
  return Math.min(Math.round(percentage), 100) // Cap em 100% para o gráfico
})

// Porcentagem real (pode passar de 100%)
const fullPercentage = computed(() => {
  if (!props.revenueGoal || props.revenueGoal <= 0) return 0
  return Math.round((props.currentRevenue / props.revenueGoal) * 100)
})

// Verifica se atingiu ou passou da meta
const hasReachedGoal = computed(() => fullPercentage.value >= 100)

// Valor que falta para atingir a meta
const remainingToGoal = computed(() => {
  const remaining = props.revenueGoal - props.currentRevenue
  return remaining > 0 ? remaining : 0
})

// Formata valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Debug detalhado
console.log('🎨 [SVG Debug]', {
  hasGoal: props.hasGoal,
  revenueGoal: props.revenueGoal,
  currentRevenue: props.currentRevenue,
  realGoalPercentage: realGoalPercentage.value,
  fullPercentage: fullPercentage.value
})

// Converte porcentagem em coordenadas para o círculo SVG
const getCircleCoordinates = (percentage: number) => {
  // Começamos do topo (270 graus ou -90 graus)
  // e giramos no sentido horário
  // Limita a 99.9% para evitar overlap completo
  const safePercentage = Math.min(percentage, 99.9)
  const angle = (safePercentage / 100) * 360 - 90
  const radians = (angle * Math.PI) / 180
  const x = 100 + 80 * Math.cos(radians)
  const y = 100 + 80 * Math.sin(radians)
  
  console.log('📐 [SVG Path Calc]', { percentage, safePercentage, angle, x, y })
  
  return { x, y, largeArc: safePercentage > 50 ? 1 : 0 }
}

// Path do arco azul (0 até realGoalPercentage)
const blueArcPath = computed(() => {
  if (realGoalPercentage.value === 0) {
    console.log('🔵 [Blue Arc] Skipped - 0%')
    return ''
  }
  const coords = getCircleCoordinates(realGoalPercentage.value)
  const path = `M 100 20 A 80 80 0 ${coords.largeArc} 1 ${coords.x} ${coords.y}`
  console.log('🔵 [Blue Arc]', { path, coords, percentage: realGoalPercentage.value })
  return path
})

// Path do arco verde (realGoalPercentage até 100%)
const greenArcPath = computed(() => {
  if (realGoalPercentage.value >= 100) {
    console.log('🟢 [Green Arc] Skipped - 100%+')
    return ''
  }
  const startCoords = getCircleCoordinates(realGoalPercentage.value)
  const endCoords = getCircleCoordinates(100)
  const largeArc = (100 - realGoalPercentage.value) > 50 ? 1 : 0
  const path = `M ${startCoords.x} ${startCoords.y} A 80 80 0 ${largeArc} 1 ${endCoords.x} ${endCoords.y}`
  console.log('🟢 [Green Arc]', { path, startCoords, endCoords, remaining: 100 - realGoalPercentage.value })
  return path
})

// Estilo do badge de comparação (verde para positivo, vermelho para negativo)
const badgeClass = computed(() => {
  if (props.deltaPercentage >= 0) {
    return 'bg-emerald-50 text-emerald-600'
  }
  return 'bg-destructive/10 text-destructive'
})

const deltaSign = computed(() => props.deltaPercentage >= 0 ? '+' : '')

// Navegar para configurações
function goToSettings() {
  const projectId = projectStore.currentProject?.id || router.currentRoute.value.params.projectId
  const locale = router.currentRoute.value.params.locale || 'pt'
  
  if (projectId && locale) {
    router.push({
      name: 'settings-general',
      params: { 
        locale,
        projectId 
      }
    })
  }
}
</script>

<template>
  <div class="card-shadow flex flex-col gap-5 rounded-3xl border border-slate-200/60 bg-white p-4 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="section-title-md mb-0.5">Receita</h2>
        <p class="text-sm text-slate-500">Comparativo com meta</p>
      </div>
      <span 
        v-if="hasGoal"
        :class="badgeClass"
        class="self-start rounded-full px-3 py-1 text-xs font-medium transition-colors"
      >
        {{ deltaSign }}{{ deltaPercentage.toFixed(1) }}%
      </span>
    </div>
    
    <!-- Estado vazio: sem meta configurada -->
    <div v-if="!hasGoal" class="flex flex-1 flex-col items-center justify-center py-12 text-center">
      <div class="rounded-full bg-slate-100 p-4 mb-4">
        <Settings class="h-8 w-8 text-slate-400" />
      </div>
      <p class="text-sm text-slate-600 mb-1 font-medium">Nenhuma meta configurada</p>
      <p class="text-xs text-slate-500 mb-6 max-w-xs">
        Defina uma meta mensal de receita para acompanhar o progresso da sua equipe
      </p>
      <Button variant="secondary" @click="goToSettings">
        <Settings :size="16" class="mr-2" />
        Configurar meta
      </Button>
    </div>
    
    <!-- Gráfico circular: com meta configurada -->
    <div v-else class="flex flex-1 flex-col items-center justify-center py-4">
      <div class="relative inline-block">
        <svg 
          viewBox="0 0 200 200" 
          class="h-40 w-40 sm:h-48 sm:w-48"
          xmlns="http://www.w3.org/2000/svg"
          style="display: block !important;"
        >
          <!-- Fundo do círculo (cinza claro) - sempre visível -->
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            stroke="#E5E7EB" 
            stroke-width="24" 
          />
          
          <!-- Arco azul: representa o progresso -->
          <path
            v-if="realGoalPercentage > 0 && blueArcPath"
            :d="blueArcPath"
            fill="none"
            stroke="#3b82f6"
            stroke-width="24"
            stroke-linecap="round"
          />
          
          <!-- Arco verde claro: representa o restante -->
          <path
            v-if="realGoalPercentage < 100 && realGoalPercentage > 0 && greenArcPath"
            :d="greenArcPath"
            fill="none"
            stroke="#86efac"
            stroke-width="24"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- Texto central sobre o gráfico -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <p class="text-4xl font-bold text-slate-900">{{ fullPercentage }}%</p>
            <p class="text-xs text-slate-500 mt-1">da meta</p>
          </div>
        </div>
      </div>
      
      <!-- Métricas abaixo do gráfico -->
      <div class="mt-5 w-full max-w-xs">
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600">Receita atual:</span>
            <span class="section-title-sm">{{ formatCurrency(currentRevenue) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600">Meta mensal:</span>
            <span class="section-title-sm">{{ formatCurrency(revenueGoal) }}</span>
          </div>
          <div v-if="!hasReachedGoal" class="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
            <span class="text-slate-600">Faltam:</span>
            <span class="font-semibold text-warning">{{ formatCurrency(remainingToGoal) }}</span>
          </div>
          <div v-else class="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
            <span class="text-success font-medium">✓ Meta atingida!</span>
            <button
              @click="goToSettings"
              class="text-xs text-info hover:text-primary underline"
            >
              Configurar nova meta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Garante que o SVG renderize corretamente */
svg {
  display: block !important;
}

svg circle,
svg path {
  display: inline !important;
}
</style>
