<template>
  <DashboardSection
    title="Testes A/B"
    description="Compare versões de landing pages e otimize suas conversões"
    variant="bordered"
  >
    <template #action>
      <Button @click="handleCreateTest" :disabled="loading">
        <Plus class="h-4 w-4 mr-2" />
        Novo Teste A/B
      </Button>
    </template>

    <div class="space-y-6">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <!-- Empty State -->
      <div v-else-if="tests.length === 0" class="text-center py-12 border-2 border-dashed rounded-lg">
        <FlaskConical class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="section-title-sm mb-2">Nenhum teste A/B configurado</h3>
        <p class="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Crie testes A/B para descobrir qual versão da sua landing page converte melhor.
        </p>
        <Button @click="handleCreateTest">
          <Plus class="h-4 w-4 mr-2" />
          Criar primeiro teste
        </Button>
      </div>

      <!-- Lista de Testes -->
      <div v-else class="space-y-4">
        <div
          v-for="test in tests"
          :key="test.id"
          class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="section-title-sm">{{ test.name }}</h4>
                <Badge :variant="getStatusVariant(test.status)">
                  {{ getStatusLabel(test.status) }}
                </Badge>
                <Badge v-if="test.stats?.winner" variant="success">
                  <Trophy class="h-3 w-3 mr-1" />
                  Variante {{ test.stats.winner }} venceu
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground mt-1">
                Criado em {{ formatDate(test.createdAt) }}
              </p>
            </div>

            <!-- Ações -->
            <div class="flex items-center gap-2">
              <Button
                v-if="test.status === 'draft'"
                variant="default"
                size="sm"
                @click="handleStartTest(test)"
              >
                <Play class="h-4 w-4 mr-1" />
                Iniciar
              </Button>
              <Button
                v-if="test.status === 'running'"
                variant="outline"
                size="sm"
                @click="handlePauseTest(test)"
              >
                <Pause class="h-4 w-4 mr-1" />
                Pausar
              </Button>
              <Button
                v-if="test.status === 'paused'"
                variant="outline"
                size="sm"
                @click="handleResumeTest(test)"
              >
                <Play class="h-4 w-4 mr-1" />
                Retomar
              </Button>
              <Button variant="ghost" size="sm" @click="handleEditTest(test)">
                <Pencil class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleDeleteTest(test)">
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <!-- Variantes e Stats -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Variante A -->
            <div class="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Badge variant="secondary" class="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    A
                  </Badge>
                  <span class="text-sm font-medium">{{ test.nameA }}</span>
                </div>
                <span class="text-xs text-muted-foreground">{{ test.splitPercentage }}%</span>
              </div>
              
              <p class="text-xs text-muted-foreground truncate mb-2" :title="test.urlA">
                {{ test.urlA }}
              </p>

              <div v-if="test.stats" class="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <p class="text-xs text-muted-foreground">Visitas</p>
                  <p class="font-semibold">{{ test.stats.variantA.visits.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Conversões</p>
                  <p class="font-semibold">{{ test.stats.variantA.conversions.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Taxa</p>
                  <p class="font-semibold" :class="getConversionRateClass(test, 'A')">
                    {{ (test.stats.variantA.conversionRate * 100).toFixed(2) }}%
                  </p>
                </div>
              </div>
            </div>

            <!-- Variante B -->
            <div class="p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Badge variant="secondary" class="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    B
                  </Badge>
                  <span class="text-sm font-medium">{{ test.nameB }}</span>
                </div>
                <span class="text-xs text-muted-foreground">{{ 100 - test.splitPercentage }}%</span>
              </div>
              
              <p class="text-xs text-muted-foreground truncate mb-2" :title="test.urlB">
                {{ test.urlB }}
              </p>

              <div v-if="test.stats" class="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <p class="text-xs text-muted-foreground">Visitas</p>
                  <p class="font-semibold">{{ test.stats.variantB.visits.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Conversões</p>
                  <p class="font-semibold">{{ test.stats.variantB.conversions.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Taxa</p>
                  <p class="font-semibold" :class="getConversionRateClass(test, 'B')">
                    {{ (test.stats.variantB.conversionRate * 100).toFixed(2) }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Barra de Progresso e Confiança -->
          <div v-if="test.stats && test.status !== 'draft'" class="mt-4 pt-4 border-t">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div>
                  <p class="text-xs text-muted-foreground">Confiança Estatística</p>
                  <p class="font-semibold" :class="test.stats.confidence >= 95 ? 'text-green-600' : 'text-amber-600'">
                    {{ test.stats.confidence.toFixed(1) }}%
                  </p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Meta</p>
                  <p class="font-medium">{{ getGoalLabel(test.conversionGoal) }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Visitas Mínimas</p>
                  <p class="font-medium">{{ test.minVisitsPerVariant }}/variante</p>
                </div>
              </div>

              <div v-if="test.stats.winner" class="text-right">
                <p class="text-xs text-muted-foreground">Melhoria</p>
                <p class="font-bold text-green-600">
                  +{{ calculateImprovement(test).toFixed(1) }}%
                </p>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="mt-3">
              <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso do teste</span>
                <span>{{ getProgressPercentage(test) }}%</span>
              </div>
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary rounded-full transition-all duration-300"
                  :style="{ width: `${getProgressPercentage(test)}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de criação/edição -->
    <ABTestModal
      v-model="isModalOpen"
      :test="editingTest"
      @saved="handleTestSaved"
    />

    <!-- Modal de confirmação de exclusão -->
    <Modal
      v-model:open="isDeleteModalOpen"
      title="Excluir Teste A/B"
      :description="`Tem certeza que deseja excluir o teste \"${testToDelete?.name ?? ''}\"? Todos os dados de estatísticas serão perdidos.`"
      size="md"
    >
      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" @click="isDeleteModalOpen = false">
            Cancelar
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="isDeleting">
            <Loader2 v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
            Excluir
          </Button>
        </div>
      </template>
    </Modal>
  </DashboardSection>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Plus,
  Loader2,
  FlaskConical,
  Trophy,
  Play,
  Pause,
  Pencil,
  Trash2
} from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import DashboardSection from '@/components/ui/DashboardSection.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import ABTestModal, { type ABTest } from './ABTestModal.vue'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

// ============================================================================
// STORES
// ============================================================================

const toast = useToastStore()

// ============================================================================
// STATE
// ============================================================================

const tests = ref<ABTest[]>([
  // Mock data
  {
    id: 'ab-1',
    name: 'Homepage vs Landing Page Promo',
    urlA: 'https://meusite.com/',
    urlB: 'https://meusite.com/promo-natal',
    nameA: 'Homepage Original',
    nameB: 'Landing Promoção',
    splitPercentage: 50,
    conversionGoal: 'contact',
    minVisitsPerVariant: 500,
    maxDurationDays: 14,
    confidenceLevel: 95,
    autoPauseOnWinner: true,
    addUtmTags: true,
    status: 'running',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      variantA: {
        visits: 1234,
        conversions: 45,
        conversionRate: 0.0365
      },
      variantB: {
        visits: 1189,
        conversions: 67,
        conversionRate: 0.0564
      },
      winner: 'B',
      confidence: 94.7
    }
  },
  {
    id: 'ab-2',
    name: 'CTA Verde vs Azul',
    urlA: 'https://meusite.com/checkout?cta=green',
    urlB: 'https://meusite.com/checkout?cta=blue',
    nameA: 'Botão Verde',
    nameB: 'Botão Azul',
    splitPercentage: 50,
    conversionGoal: 'sale',
    minVisitsPerVariant: 200,
    maxDurationDays: 30,
    confidenceLevel: 95,
    autoPauseOnWinner: false,
    addUtmTags: true,
    status: 'completed',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      variantA: {
        visits: 856,
        conversions: 34,
        conversionRate: 0.0397
      },
      variantB: {
        visits: 891,
        conversions: 52,
        conversionRate: 0.0584
      },
      winner: 'B',
      confidence: 98.2
    }
  },
  {
    id: 'ab-3',
    name: 'Form Curto vs Completo',
    urlA: 'https://meusite.com/cadastro',
    urlB: 'https://meusite.com/cadastro-simples',
    nameA: 'Formulário Completo',
    nameB: 'Formulário Simples',
    splitPercentage: 50,
    conversionGoal: 'contact',
    minVisitsPerVariant: 300,
    maxDurationDays: 21,
    confidenceLevel: 95,
    autoPauseOnWinner: true,
    addUtmTags: true,
    status: 'draft',
    createdAt: new Date().toISOString()
  }
])

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingTest = ref<ABTest | null>(null)
const testToDelete = ref<ABTest | null>(null)
const isDeleting = ref(false)

// ============================================================================
// HELPERS
// ============================================================================

function getStatusVariant(status: ABTest['status']) {
  const variants: Record<ABTest['status'], 'secondary' | 'default' | 'warning' | 'success'> = {
    draft: 'secondary',
    running: 'default',
    paused: 'warning',
    completed: 'success'
  }
  return variants[status]
}

function getStatusLabel(status: ABTest['status']) {
  const labels: Record<ABTest['status'], string> = {
    draft: 'Rascunho',
    running: 'Em execução',
    paused: 'Pausado',
    completed: 'Concluído'
  }
  return labels[status]
}

function getGoalLabel(goal: ABTest['conversionGoal']) {
  const labels: Record<ABTest['conversionGoal'], string> = {
    click: 'Clique',
    contact: 'Contato',
    sale: 'Venda',
    custom: 'Customizado'
  }
  return labels[goal]
}

function getConversionRateClass(test: ABTest, variant: 'A' | 'B') {
  if (!test.stats || !test.stats.winner) return ''
  return test.stats.winner === variant ? 'text-green-600' : 'text-muted-foreground'
}

function calculateImprovement(test: ABTest) {
  if (!test.stats) return 0
  const rateA = test.stats.variantA.conversionRate
  const rateB = test.stats.variantB.conversionRate
  if (test.stats.winner === 'B') {
    return ((rateB - rateA) / rateA) * 100
  }
  return ((rateA - rateB) / rateB) * 100
}

function getProgressPercentage(test: ABTest) {
  if (!test.stats) return 0
  const totalVisits = test.stats.variantA.visits + test.stats.variantB.visits
  const targetVisits = test.minVisitsPerVariant * 2
  return Math.min(100, Math.round((totalVisits / targetVisits) * 100))
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ============================================================================
// HANDLERS
// ============================================================================

function handleCreateTest() {
  editingTest.value = null
  isModalOpen.value = true
}

function handleEditTest(test: ABTest) {
  editingTest.value = test
  isModalOpen.value = true
}

function handleDeleteTest(test: ABTest) {
  testToDelete.value = test
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (!testToDelete.value) return

  isDeleting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tests.value = tests.value.filter(t => t.id !== testToDelete.value!.id)
    toast.addToast({
      title: 'Sucesso',
      description: 'Teste A/B excluído',
      variant: 'success'
    })
    isDeleteModalOpen.value = false
    testToDelete.value = null
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao excluir teste',
      variant: 'destructive'
    })
  } finally {
    isDeleting.value = false
  }
}

async function handleStartTest(test: ABTest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = tests.value.findIndex(t => t.id === test.id)
    if (index !== -1 && tests.value[index]) {
      tests.value[index].status = 'running'
      tests.value[index].stats = {
        variantA: { visits: 0, conversions: 0, conversionRate: 0 },
        variantB: { visits: 0, conversions: 0, conversionRate: 0 },
        winner: null,
        confidence: 0
      }
    }
    toast.addToast({
      title: 'Sucesso',
      description: 'Teste A/B iniciado!',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao iniciar teste',
      variant: 'destructive'
    })
  }
}

async function handlePauseTest(test: ABTest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = tests.value.findIndex(t => t.id === test.id)
    if (index !== -1) {
      if (tests.value[index]) {
        tests.value[index].status = 'paused'
      }
    }
    toast.addToast({
      title: 'Sucesso',
      description: 'Teste A/B pausado',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao pausar teste',
      variant: 'destructive'
    })
  }
}

async function handleResumeTest(test: ABTest) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = tests.value.findIndex(t => t.id === test.id)
    if (index !== -1 && tests.value[index]) {
      tests.value[index].status = 'running'
    }
    toast.addToast({
      title: 'Sucesso',
      description: 'Teste A/B retomado',
      variant: 'success'
    })
  } catch (error) {
    toast.addToast({
      title: 'Erro',
      description: 'Erro ao retomar teste',
      variant: 'destructive'
    })
  }
}

function handleTestSaved(test: ABTest) {
  const index = tests.value.findIndex(t => t.id === test.id)
  if (index !== -1) {
    tests.value[index] = test
  } else {
    tests.value.unshift(test)
  }
}
</script>
