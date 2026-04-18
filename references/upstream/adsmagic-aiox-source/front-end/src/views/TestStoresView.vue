<template>
  <div class="test-stores">
    <h1>🧪 Teste de Stores Pinia</h1>
    <p class="subtitle">Validação de todas as 7 stores criadas na Sessão 1.5.5</p>

    <div class="test-controls">
      <button @click="runAllTests" :disabled="isRunning" class="btn-primary">
        {{ isRunning ? 'Executando...' : 'Executar Todos os Testes' }}
      </button>
      <button @click="clearResults" :disabled="isRunning" class="btn-secondary">
        Limpar Resultados
      </button>
    </div>

    <div v-if="results.length > 0" class="test-results">
      <h2>Resultados dos Testes</h2>

      <div class="summary">
        <div class="stat success">
          <span class="label">✅ Sucessos:</span>
          <span class="value">{{ successCount }}</span>
        </div>
        <div class="stat failure">
          <span class="label">❌ Falhas:</span>
          <span class="value">{{ failureCount }}</span>
        </div>
        <div class="stat total">
          <span class="label">📊 Total:</span>
          <span class="value">{{ results.length }}</span>
        </div>
      </div>

      <div v-for="result in results" :key="result.name" class="test-result" :class="result.status">
        <div class="test-header">
          <span class="test-icon">{{ result.status === 'success' ? '✅' : '❌' }}</span>
          <span class="test-name">{{ result.name }}</span>
          <span class="test-duration">{{ result.duration }}ms</span>
        </div>
        <div v-if="result.message" class="test-message">{{ result.message }}</div>
        <div v-if="result.error" class="test-error">{{ result.error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useStagesStore,
  useOriginsStore,
  useContactsStore,
  useSalesStore,
  useDashboardStore,
  useLinksStore,
  useEventsStore
} from '@/stores'

interface TestResult {
  name: string
  status: 'success' | 'failure'
  message?: string
  error?: string
  duration: number
}

const results = ref<TestResult[]>([])
const isRunning = ref(false)

const successCount = computed(() => results.value.filter(r => r.status === 'success').length)
const failureCount = computed(() => results.value.filter(r => r.status === 'failure').length)

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    results.value.push({
      name,
      status: 'success',
      message: 'Teste passou com sucesso',
      duration
    })
  } catch (error) {
    const duration = Date.now() - start
    results.value.push({
      name,
      status: 'failure',
      error: error instanceof Error ? error.message : String(error),
      duration
    })
  }
}

async function runAllTests() {
  isRunning.value = true
  results.value = []

  // Teste 1: Stages Store
  await runTest('Stages Store - fetchStages()', async () => {
    const stagesStore = useStagesStore()
    await stagesStore.fetchStages()
    if (stagesStore.stages.length === 0) throw new Error('Nenhuma stage carregada')
  })

  await runTest('Stages Store - getters (activeStages, kanbanStages)', async () => {
    const stagesStore = useStagesStore()
    if (!stagesStore.activeStages) throw new Error('activeStages getter não está funcionando')
    if (!stagesStore.kanbanStages) throw new Error('kanbanStages getter não está funcionando')
  })

  // Teste 2: Origins Store
  await runTest('Origins Store - fetchOrigins()', async () => {
    const originsStore = useOriginsStore()
    await originsStore.fetchOrigins()
    if (originsStore.origins.length === 0) throw new Error('Nenhuma origem carregada')
  })

  await runTest('Origins Store - getters (systemOrigins, customOrigins)', async () => {
    const originsStore = useOriginsStore()
    if (!originsStore.systemOrigins) throw new Error('systemOrigins getter não está funcionando')
    if (!originsStore.customOrigins) throw new Error('customOrigins getter não está funcionando')
  })

  // Teste 3: Contacts Store
  await runTest('Contacts Store - fetchContacts()', async () => {
    const contactsStore = useContactsStore()
    await contactsStore.fetchContacts()
    if (contactsStore.contacts.length === 0) throw new Error('Nenhum contato carregado')
  })

  await runTest('Contacts Store - getters (contactsByStage, contactsByOrigin)', async () => {
    const contactsStore = useContactsStore()
    if (!contactsStore.contactsByStage) throw new Error('contactsByStage getter não está funcionando')
    if (!contactsStore.contactsByOrigin) throw new Error('contactsByOrigin getter não está funcionando')
  })

  await runTest('Contacts Store - paginação', async () => {
    const contactsStore = useContactsStore()
    if (contactsStore.totalContacts === 0) throw new Error('totalContacts é 0')
    if (contactsStore.totalPages === 0) throw new Error('totalPages é 0')
  })

  // Teste 4: Sales Store
  await runTest('Sales Store - fetchSales()', async () => {
    const salesStore = useSalesStore()
    await salesStore.fetchSales()
    // Sales pode estar vazio no mock, então apenas verificamos se não deu erro
  })

  await runTest('Sales Store - getters (totalRevenue, averageTicket)', async () => {
    const salesStore = useSalesStore()
    if (salesStore.totalRevenue === undefined) throw new Error('totalRevenue getter não está funcionando')
    if (salesStore.averageTicket === undefined) throw new Error('averageTicket getter não está funcionando')
  })

  // Teste 5: Dashboard Store
  await runTest('Dashboard Store - fetchMetrics()', async () => {
    const dashboardStore = useDashboardStore()
    await dashboardStore.fetchMetrics()
    if (!dashboardStore.metrics) throw new Error('Métricas não foram carregadas')
  })

  await runTest('Dashboard Store - fetchTimeSeriesData()', async () => {
    const dashboardStore = useDashboardStore()
    await dashboardStore.fetchTimeSeriesData()
    if (dashboardStore.timeSeriesData.length === 0) throw new Error('Time series data vazia')
  })

  await runTest('Dashboard Store - fetchOriginPerformance()', async () => {
    const dashboardStore = useDashboardStore()
    await dashboardStore.fetchOriginPerformance()
    if (dashboardStore.originPerformanceData.length === 0) throw new Error('Origin performance data vazia')
  })

  // Teste 6: Links Store
  await runTest('Links Store - fetchLinks()', async () => {
    const linksStore = useLinksStore()
    await linksStore.fetchLinks()
    // Links pode estar vazio no mock, então apenas verificamos se não deu erro
  })

  await runTest('Links Store - getters (canCreateMore, remainingSlots)', async () => {
    const linksStore = useLinksStore()
    if (linksStore.canCreateMore === undefined) throw new Error('canCreateMore getter não está funcionando')
    if (linksStore.remainingSlots === undefined) throw new Error('remainingSlots getter não está funcionando')
  })

  // Teste 7: Events Store
  await runTest('Events Store - fetchEvents()', async () => {
    const eventsStore = useEventsStore()
    await eventsStore.fetchEvents()
    // Events pode estar vazio no mock, então apenas verificamos se não deu erro
  })

  await runTest('Events Store - getters (successRate, failureRate)', async () => {
    const eventsStore = useEventsStore()
    if (eventsStore.successRate === undefined) throw new Error('successRate getter não está funcionando')
    if (eventsStore.failureRate === undefined) throw new Error('failureRate getter não está funcionando')
  })

  // Teste 8: Integração entre stores
  await runTest('Integração - Contacts usa Stages e Origins', async () => {
    const contactsStore = useContactsStore()
    const stagesStore = useStagesStore()
    const originsStore = useOriginsStore()

    if (contactsStore.contacts.length > 0) {
      const contact = contactsStore.contacts[0]
      if (!contact) return

      // Verifica se a stage do contato existe
      const stageExists = stagesStore.stages.some(s => s.id === contact.stage)
      if (!stageExists) throw new Error('Stage do contato não encontrada em stagesStore')

      // Verifica se a origin do contato existe
      const originExists = originsStore.origins.some(o => o.id === contact.origin)
      if (!originExists) throw new Error('Origin do contato não encontrada em originsStore')
    }
  })

  isRunning.value = false
}

function clearResults() {
  results.value = []
}
</script>

<style scoped>
.test-stores {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-results {
  margin-top: 2rem;
}

.test-results h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat .value {
  font-size: 2rem;
  font-weight: bold;
}

.stat.success .value {
  color: #4CAF50;
}

.stat.failure .value {
  color: #f44336;
}

.stat.total .value {
  color: #2196F3;
}

.test-result {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.test-result.success {
  background-color: #f1f8f4;
  border-left-color: #4CAF50;
}

.test-result.failure {
  background-color: #fff5f5;
  border-left-color: #f44336;
}

.test-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.test-icon {
  font-size: 1.25rem;
}

.test-name {
  flex: 1;
}

.test-duration {
  color: #999;
  font-size: 0.875rem;
}

.test-message {
  margin-top: 0.5rem;
  color: #4CAF50;
  font-size: 0.875rem;
}

.test-error {
  margin-top: 0.5rem;
  color: #f44336;
  font-size: 0.875rem;
  font-family: monospace;
  white-space: pre-wrap;
}
</style>
