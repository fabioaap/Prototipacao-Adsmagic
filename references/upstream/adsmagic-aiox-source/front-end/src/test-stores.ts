/**
 * Teste Programático das Stores Pinia
 *
 * Execute este arquivo para validar todas as 7 stores criadas na Sessão 1.5.5
 *
 * Como executar:
 * 1. No console do navegador, importe este módulo
 * 2. Ou use o componente TestStoresView.vue
 */

import { createPinia, setActivePinia } from 'pinia'
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
  passed: boolean
  message: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    results.push({
      name,
      passed: true,
      message: '✅ Passou',
      duration
    })
    console.log(`✅ ${name} - ${duration}ms`)
  } catch (error) {
    const duration = Date.now() - start
    const message = error instanceof Error ? error.message : String(error)
    results.push({
      name,
      passed: false,
      message: `❌ ${message}`,
      duration
    })
    console.error(`❌ ${name} - ${message}`)
  }
}

export async function testAllStores(): Promise<TestResult[]> {
  console.log('🧪 Iniciando testes das stores Pinia...\n')

  // Inicializa Pinia
  const pinia = createPinia()
  setActivePinia(pinia)

  // ========================================================================
  // TESTE 1: STAGES STORE
  // ========================================================================
  console.group('📋 Stages Store')

  await runTest('Stages - fetchStages()', async () => {
    const stagesStore = useStagesStore()
    await stagesStore.fetchStages()
    if (stagesStore.stages.length === 0) {
      throw new Error('Nenhuma stage carregada')
    }
    console.log(`   → ${stagesStore.stages.length} stages carregadas`)
  })

  await runTest('Stages - activeStages getter', async () => {
    const stagesStore = useStagesStore()
    const active = stagesStore.activeStages
    if (!active || !Array.isArray(active)) {
      throw new Error('activeStages não está retornando array')
    }
    console.log(`   → ${active.length} stages ativas`)
  })

  await runTest('Stages - kanbanStages getter', async () => {
    const stagesStore = useStagesStore()
    const kanban = stagesStore.kanbanStages
    if (!kanban || !Array.isArray(kanban)) {
      throw new Error('kanbanStages não está retornando array')
    }
    console.log(`   → ${kanban.length} stages para kanban`)
  })

  await runTest('Stages - saleStage e lostStage getters', async () => {
    const stagesStore = useStagesStore()
    if (!stagesStore.saleStage) {
      throw new Error('saleStage não encontrada')
    }
    if (!stagesStore.lostStage) {
      throw new Error('lostStage não encontrada')
    }
    console.log(`   → saleStage: ${stagesStore.saleStage.name}`)
    console.log(`   → lostStage: ${stagesStore.lostStage.name}`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 2: ORIGINS STORE
  // ========================================================================
  console.group('🎯 Origins Store')

  await runTest('Origins - fetchOrigins()', async () => {
    const originsStore = useOriginsStore()
    await originsStore.fetchOrigins()
    if (originsStore.origins.length === 0) {
      throw new Error('Nenhuma origem carregada')
    }
    console.log(`   → ${originsStore.origins.length} origens carregadas`)
  })

  await runTest('Origins - systemOrigins e customOrigins getters', async () => {
    const originsStore = useOriginsStore()
    const system = originsStore.systemOrigins
    const custom = originsStore.customOrigins
    if (!Array.isArray(system) || !Array.isArray(custom)) {
      throw new Error('Getters não retornam arrays')
    }
    console.log(`   → ${system.length} origens do sistema`)
    console.log(`   → ${custom.length} origens customizadas`)
  })

  await runTest('Origins - validação de limite (20 custom)', async () => {
    const originsStore = useOriginsStore()
    if (originsStore.canCreateMore === undefined) {
      throw new Error('canCreateMore não está definido')
    }
    console.log(`   → canCreateMore: ${originsStore.canCreateMore}`)
    console.log(`   → remainingSlots: ${originsStore.remainingSlots}`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 3: CONTACTS STORE
  // ========================================================================
  console.group('👥 Contacts Store')

  await runTest('Contacts - fetchContacts()', async () => {
    const contactsStore = useContactsStore()
    await contactsStore.fetchContacts()
    if (contactsStore.contacts.length === 0) {
      throw new Error('Nenhum contato carregado')
    }
    console.log(`   → ${contactsStore.contacts.length} contatos carregados`)
  })

  await runTest('Contacts - paginação', async () => {
    const contactsStore = useContactsStore()
    if (contactsStore.totalContacts === 0) {
      throw new Error('totalContacts é 0')
    }
    if (contactsStore.totalPages === 0) {
      throw new Error('totalPages é 0')
    }
    console.log(`   → Total: ${contactsStore.totalContacts} contatos`)
    console.log(`   → Páginas: ${contactsStore.totalPages}`)
    console.log(`   → Página atual: ${contactsStore.currentPage}`)
  })

  await runTest('Contacts - contactsByStage getter', async () => {
    const contactsStore = useContactsStore()
    const byStage = contactsStore.contactsByStage
    if (!byStage || typeof byStage !== 'object') {
      throw new Error('contactsByStage não está retornando objeto')
    }
    const stageCount = Object.keys(byStage).length
    console.log(`   → Contatos agrupados em ${stageCount} stages`)
  })

  await runTest('Contacts - contactsByOrigin getter', async () => {
    const contactsStore = useContactsStore()
    const byOrigin = contactsStore.contactsByOrigin
    if (!byOrigin || typeof byOrigin !== 'object') {
      throw new Error('contactsByOrigin não está retornando objeto')
    }
    const originCount = Object.keys(byOrigin).length
    console.log(`   → Contatos agrupados em ${originCount} origens`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 4: SALES STORE
  // ========================================================================
  console.group('💰 Sales Store')

  await runTest('Sales - fetchSales()', async () => {
    const salesStore = useSalesStore()
    await salesStore.fetchSales()
    console.log(`   → ${salesStore.sales.length} vendas carregadas (pode ser 0 no mock)`)
  })

  await runTest('Sales - getters de métricas', async () => {
    const salesStore = useSalesStore()
    if (salesStore.totalRevenue === undefined) {
      throw new Error('totalRevenue não definido')
    }
    if (salesStore.averageTicket === undefined) {
      throw new Error('averageTicket não definido')
    }
    if (salesStore.conversionRate === undefined) {
      throw new Error('conversionRate não definido')
    }
    console.log(`   → Receita total: R$ ${salesStore.totalRevenue.toFixed(2)}`)
    console.log(`   → Ticket médio: R$ ${salesStore.averageTicket.toFixed(2)}`)
    console.log(`   → Taxa de conversão: ${salesStore.conversionRate.toFixed(2)}%`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 5: DASHBOARD STORE
  // ========================================================================
  console.group('📊 Dashboard Store')

  await runTest('Dashboard - fetchMetrics()', async () => {
    const dashboardStore = useDashboardStore()
    await dashboardStore.fetchMetrics()
    if (!dashboardStore.metrics) {
      throw new Error('Métricas não foram carregadas')
    }
    console.log(`   → Métricas carregadas para período: ${dashboardStore.selectedPeriod}`)
  })

  await runTest('Dashboard - fetchTimeSeriesData()', async () => {
    const dashboardStore = useDashboardStore()
    await dashboardStore.fetchTimeSeriesData()
    if (dashboardStore.timeSeriesData.length === 0) {
      throw new Error('Time series data vazia')
    }
    console.log(`   → ${dashboardStore.timeSeriesData.length} pontos na série temporal`)
  })

  await runTest('Dashboard - fetchOriginPerformance()', async () => {
    const dashboardStore = useDashboardStore()
    await dashboardStore.fetchOriginPerformance()
    if (dashboardStore.originPerformanceData.length === 0) {
      throw new Error('Origin performance data vazia')
    }
    console.log(`   → Performance de ${dashboardStore.originPerformanceData.length} origens`)
  })

  await runTest('Dashboard - getters de métricas', async () => {
    const dashboardStore = useDashboardStore()
    if (dashboardStore.totalContacts === undefined) {
      throw new Error('totalContacts não definido')
    }
    console.log(`   → Total contatos: ${dashboardStore.totalContacts}`)
    console.log(`   → Total vendas: ${dashboardStore.totalSales}`)
    console.log(`   → Taxa conversão: ${dashboardStore.conversionRate.toFixed(2)}%`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 6: LINKS STORE
  // ========================================================================
  console.group('🔗 Links Store')

  await runTest('Links - fetchLinks()', async () => {
    const linksStore = useLinksStore()
    await linksStore.fetchLinks()
    console.log(`   → ${linksStore.links.length} links carregados (pode ser 0 no mock)`)
  })

  await runTest('Links - validação de limite (50)', async () => {
    const linksStore = useLinksStore()
    if (linksStore.canCreateMore === undefined) {
      throw new Error('canCreateMore não definido')
    }
    console.log(`   → canCreateMore: ${linksStore.canCreateMore}`)
    console.log(`   → remainingSlots: ${linksStore.remainingSlots}`)
    console.log(`   → MAX_LINKS: ${linksStore.MAX_LINKS}`)
  })

  await runTest('Links - getters de estatísticas', async () => {
    const linksStore = useLinksStore()
    if (linksStore.totalClicks === undefined) {
      throw new Error('totalClicks não definido')
    }
    if (linksStore.totalConversions === undefined) {
      throw new Error('totalConversions não definido')
    }
    console.log(`   → Total clicks: ${linksStore.totalClicks}`)
    console.log(`   → Total conversions: ${linksStore.totalConversions}`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 7: EVENTS STORE
  // ========================================================================
  console.group('📡 Events Store')

  await runTest('Events - fetchEvents()', async () => {
    const eventsStore = useEventsStore()
    await eventsStore.fetchEvents()
    console.log(`   → ${eventsStore.events.length} eventos carregados (pode ser 0 no mock)`)
  })

  await runTest('Events - getters de estatísticas', async () => {
    const eventsStore = useEventsStore()
    if (eventsStore.successRate === undefined) {
      throw new Error('successRate não definido')
    }
    if (eventsStore.failureRate === undefined) {
      throw new Error('failureRate não definido')
    }
    console.log(`   → Taxa de sucesso: ${eventsStore.successRate.toFixed(2)}%`)
    console.log(`   → Taxa de falha: ${eventsStore.failureRate.toFixed(2)}%`)
  })

  console.groupEnd()

  // ========================================================================
  // TESTE 8: INTEGRAÇÃO ENTRE STORES
  // ========================================================================
  console.group('🔄 Integração entre Stores')

  await runTest('Integração - Contacts usa Stages e Origins', async () => {
    const contactsStore = useContactsStore()
    const stagesStore = useStagesStore()
    const originsStore = useOriginsStore()

    if (contactsStore.contacts.length > 0) {
      const contact = contactsStore.contacts[0]
      if (!contact) {
        throw new Error('Nenhum contato encontrado para teste')
      }

      // Verifica se a stage do contato existe
      const stageExists = stagesStore.stages.some(s => s.id === contact.stage)
      if (!stageExists) {
        throw new Error(`Stage '${contact.stage}' do contato não encontrada em stagesStore`)
      }

      // Verifica se a origin do contato existe
      const originExists = originsStore.origins.some(o => o.id === contact.origin)
      if (!originExists) {
        throw new Error(`Origin '${contact.origin}' do contato não encontrada em originsStore`)
      }

      console.log(`   → Contato "${contact.name}" valida integração com stages e origins`)
    }
  })

  console.groupEnd()

  // ========================================================================
  // RESUMO
  // ========================================================================
  console.log('\n📈 RESUMO DOS TESTES')
  console.log('='.repeat(50))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => r.passed === false).length
  const total = results.length

  console.log(`✅ Sucessos: ${passed}`)
  console.log(`❌ Falhas: ${failed}`)
  console.log(`📊 Total: ${total}`)
  console.log(`🎯 Taxa de sucesso: ${((passed / total) * 100).toFixed(2)}%`)

  if (failed > 0) {
    console.log('\n❌ Testes que falharam:')
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.message}`)
      })
  }

  console.log('='.repeat(50))

  return results
}

// Auto-execução se estiver em contexto de teste
if (import.meta.env.DEV) {
  console.log('💡 Para executar os testes, chame: testAllStores()')
}

export default testAllStores
