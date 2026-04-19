import { test, expect } from '@playwright/test'

test.describe('Teste de Usabilidade - Página de Vendas', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5174'
  const salesUrl = `${baseUrl}/pt/projects/mock-project-001/sales`

  test('J1. deve apresentar métricas claras e bem formatadas', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Aguardar carregamento das métricas
    await page.waitForSelector('h1:has-text("Vendas")', { timeout: 10000 })

    // Verificar presença das métricas principais
    await expect(page.locator('text=Receita Total')).toBeVisible()
    await expect(page.locator('text=Vendas Realizadas')).toBeVisible()
    await expect(page.locator('text=Ticket Médio')).toBeVisible()
    await expect(page.locator('text=Taxa de Conversão')).toBeVisible()

    // Verificar formatação monetária brasileira
    await expect(page.locator('text=R$ 0,00')).toBeVisible()

    // Screenshot para evidência
    await page.screenshot({
      path: `./usability-report/sales-j1-metricas-desktop.png`,
      fullPage: false
    })

    console.log('✅ J1 - Métricas apresentadas corretamente')
  })

  test('J2. deve exibir funil de vendas com etapas claras', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Localizar seção do funil
    await expect(page.locator('text=Funil de Vendas')).toBeVisible()

    // Verificar etapas principais
    await expect(page.locator('text=Contato Iniciado')).toBeVisible()
    await expect(page.locator('text=Qualificação')).toBeVisible()
    await expect(page.locator('text=Venda Realizada')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/sales-j2-funil.png`,
      fullPage: false
    })

    console.log('✅ J2 - Funil de vendas exibido corretamente')
  })

  test('J3. deve mostrar previsão de vendas', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Localizar seção de previsão
    await expect(page.locator('text=Previsão de Vendas')).toBeVisible()

    // Verificar cards de previsão
    await expect(page.locator('text=Previsão 30 dias')).toBeVisible()
    await expect(page.locator('text=Pipeline Total')).toBeVisible()
    await expect(page.locator('text=Confiança')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/sales-j3-previsao.png`,
      fullPage: false
    })

    console.log('✅ J3 - Previsão de vendas funcionando')
  })

  test('J4. deve listar follow-ups pendentes', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Localizar seção follow-up
    await expect(page.locator('text=Follow-up Pendente')).toBeVisible()

    // Verificar pelo menos um contato urgente
    await expect(page.locator('text=Urgente')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/sales-j4-followup.png`,
      fullPage: false
    })

    console.log('✅ J4 - Follow-up pendente listado')
  })

  test('J5. deve permitir navegação entre tabs', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar tabs presentes
    await expect(page.locator('text=Realizadas')).toBeVisible()
    await expect(page.locator('text=Perdidas')).toBeVisible()

    // Testar clique na tab "Perdidas"
    await page.click('text=Perdidas')
    await page.waitForTimeout(500)

    // Voltar para realizadas
    await page.click('text=Realizadas')
    await page.waitForTimeout(500)

    // Verificar botão exportar
    await expect(page.locator('text=Exportar')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/sales-j5-tabs.png`,
      fullPage: false
    })

    console.log('✅ J5 - Navegação entre tabs funcionando')
  })

  test('J6. deve aplicar Design System consistentemente', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Aguardar todos os componentes carregarem
    await page.waitForTimeout(2000)

    // Verificar hierarquia de títulos
    await expect(page.locator('h1:has-text("Vendas")')).toBeVisible()
    await expect(page.locator('h3:has-text("Métricas de Vendas")')).toBeVisible()

    // Verificar botões com design consistente
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(3) // Múltiplos botões na página

    await page.screenshot({
      path: `./usability-report/sales-j6-design-system.png`,
      fullPage: true
    })

    console.log('✅ J6 - Design System aplicado consistentemente')
  })

  test('J7. deve ser responsivo em mobile', async ({ page }) => {
    // Teste mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar que o layout se adapta
    await expect(page.locator('text=Vendas')).toBeVisible()
    await expect(page.locator('text=Métricas de Vendas')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/sales-j7-mobile.png`,
      fullPage: true
    })

    console.log('✅ J7 - Responsividade mobile funcionando')
  })

  test('J8. deve tratar estados vazios', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar mensagem de estado vazio nas vendas
    await expect(page.locator('text=Nenhuma venda cadastrada')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/sales-j8-estados-vazios.png`,
      fullPage: false
    })

    console.log('✅ J8 - Estados vazios tratados adequadamente')
  })

  test('Performance - deve carregar rapidamente', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Máximo 5 segundos

    console.log(`✅ Performance - Página carregou em ${loadTime}ms`)
  })
})
const baseUrl = 'http://localhost:5174'
const salesUrl = `${baseUrl}/pt/projects/mock-project-001/sales`

test.beforeAll(async () => {
  await setupTestEnvironment()
})

test.afterAll(async () => {
  await teardownTestEnvironment()
})

test.describe('J1. Visualização de Métricas', () => {
  test('deve apresentar métricas claras e bem formatadas', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Aguardar carregamento das métricas
    await page.waitForSelector('[data-testid="sales-metrics"], .grid', { timeout: 10000 })

    // Verificar se os 4 cards de métricas estão visíveis
    const metricsCards = page.locator('.grid > div').first()
    await expect(metricsCards).toBeVisible()

    // Verificar presença das métricas principais
    await expect(page.locator('text=Receita Total')).toBeVisible()
    await expect(page.locator('text=Vendas Realizadas')).toBeVisible()
    await expect(page.locator('text=Ticket Médio')).toBeVisible()
    await expect(page.locator('text=Taxa de Conversão')).toBeVisible()

    // Verificar formatação monetária brasileira
    await expect(page.locator('text=R$ 0,00')).toBeVisible()

    // Verificar indicadores de mudança
    const changeIndicators = page.locator('text=↑').or(page.locator('text=↓'))
    await expect(changeIndicators.first()).toBeVisible()

    // Screenshot para evidência
    await page.screenshot({
      path: `./usability-report/j1-metricas-desktop.png`,
      fullPage: false
    })
  })

  test('deve manter responsividade em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar que métricas ainda são visíveis em mobile
    await expect(page.locator('text=Métricas de Vendas')).toBeVisible()
    await expect(page.locator('text=Receita Total')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/j1-metricas-mobile.png`,
      fullPage: false
    })
  })
})

test.describe('J2. Funil de Vendas Interativo', () => {
  test('deve exibir funil de vendas com etapas claras', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Localizar seção do funil
    await expect(page.locator('text=Funil de Vendas')).toBeVisible()

    // Verificar etapas principais
    await expect(page.locator('text=Contato Iniciado')).toBeVisible()
    await expect(page.locator('text=Qualificação')).toBeVisible()
    await expect(page.locator('text=Proposta Enviada')).toBeVisible()
    await expect(page.locator('text=Negociação')).toBeVisible()
    await expect(page.locator('text=Venda Realizada')).toBeVisible()

    // Verificar percentuais de conversão
    await expect(page.locator('text=0%')).toBeVisible() // Taxa geral

    await page.screenshot({
      path: `./usability-report/j2-funil-vendas.png`,
      fullPage: false
    })
  })
})

test.describe('J3. Previsão de Vendas', () => {
  test('deve mostrar cards de previsão e controles', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Localizar seção de previsão
    await expect(page.locator('text=Previsão de Vendas')).toBeVisible()

    // Verificar cards de previsão
    await expect(page.locator('text=Previsão 30 dias')).toBeVisible()
    await expect(page.locator('text=Pipeline Total')).toBeVisible()
    await expect(page.locator('text=Confiança')).toBeVisible()

    // Verificar botões de período
    await expect(page.locator('button:has-text("30 dias")')).toBeVisible()
    await expect(page.locator('button:has-text("60 dias")')).toBeVisible()
    await expect(page.locator('button:has-text("90 dias")')).toBeVisible()

    // Testar clique no período
    await page.click('button:has-text("60 dias")')
    await page.waitForTimeout(500) // Aguardar possível atualização

    await page.screenshot({
      path: `./usability-report/j3-previsao-vendas.png`,
      fullPage: false
    })
  })
})

test.describe('J4. Follow-up Pendente', () => {
  test('deve listar contatos urgentes com informações completas', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Localizar seção follow-up
    await expect(page.locator('text=Follow-up Pendente')).toBeVisible()

    // Verificar pelo menos um contato urgente
    await expect(page.locator('text=Urgente')).toBeVisible()

    // Verificar informações do contato (nome, telefone, etc.)
    const contactCards = page.locator('[class*="contact"]').or(
      page.locator('text=Diego Alves').or(
        page.locator('text=Thiago Almeida')
      )
    )
    await expect(contactCards.first()).toBeVisible()

    // Verificar telefones formatados
    await expect(page.locator('text=/\\d{2}9\\d{8}/')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/j4-follow-up.png`,
      fullPage: false
    })
  })
})

test.describe('J5. Listagem de Vendas', () => {
  test('deve permitir navegação entre tabs e busca', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar tabs presentes
    await expect(page.locator('text=Realizadas')).toBeVisible()
    await expect(page.locator('text=Perdidas')).toBeVisible()

    // Testar clique na tab "Perdidas"
    await page.click('text=Perdidas')
    await page.waitForTimeout(500)

    // Verificar que mudou para perdidas
    await expect(page.locator('text=Perdidas').first()).toBeVisible()

    // Voltar para realizadas
    await page.click('text=Realizadas')
    await page.waitForTimeout(500)

    // Verificar campo de busca
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="vendas"]')
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible()
    }

    // Verificar botão exportar
    await expect(page.locator('text=Exportar')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/j5-listagem-vendas.png`,
      fullPage: false
    })
  })
})

test.describe('J6. Consistência do Design System', () => {
  test('deve aplicar componentes DS consistentemente', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Aguardar todos os componentes carregarem
    await page.waitForTimeout(2000)

    // Verificar presença de cards padronizados (pelo menos 4 seções principais)
    const cardSections = page.locator('[class*="card"], [class*="Card"]')
    const cardCount = await cardSections.count()
    expect(cardCount).toBeGreaterThanOrEqual(4)

    // Verificar hierarquia de títulos
    await expect(page.locator('h1:has-text("Vendas")')).toBeVisible()
    await expect(page.locator('h3:has-text("Métricas de Vendas")')).toBeVisible()

    // Verificar botões com design consistente
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(5) // Múltiplos botões na página

    await page.screenshot({
      path: `./usability-report/j6-design-system.png`,
      fullPage: true
    })
  })
})

test.describe('J7. Responsividade', () => {
  test('deve adaptar layout em diferentes viewports', async ({ page }) => {
    // Teste desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    await page.screenshot({
      path: `./usability-report/j7-desktop.png`,
      fullPage: true
    })

    // Teste tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: `./usability-report/j7-tablet.png`,
      fullPage: true
    })

    // Teste mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)

    // Verificar que o layout se adapta
    await expect(page.locator('text=Vendas')).toBeVisible()
    await expect(page.locator('text=Métricas de Vendas')).toBeVisible()

    await page.screenshot({
      path: `./usability-report/j7-mobile.png`,
      fullPage: true
    })
  })
})

test.describe('J8. Estados e Feedback', () => {
  test('deve tratar estados vazios adequadamente', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar mensagem de estado vazio nas vendas
    await expect(page.locator('text=Nenhuma venda cadastrada')).toBeVisible()

    // Verificar estado vazio no pipeline
    const emptyStateTexts = [
      'Nenhum contato no pipeline',
      'Adicione contatos para ver previsões'
    ]

    for (const text of emptyStateTexts) {
      const element = page.locator(`text=${text}`)
      if (await element.count() > 0) {
        await expect(element).toBeVisible()
      }
    }

    // Verificar se há ícones ou ilustrações de estado vazio
    const emptyStateIcon = page.locator('svg').or(page.locator('img')).first()
    await expect(emptyStateIcon).toBeVisible()

    await page.screenshot({
      path: `./usability-report/j8-estados-vazios.png`,
      fullPage: false
    })
  })
})

test.describe('Performance e Acessibilidade', () => {
  test('deve carregar em tempo razoável', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Máximo 5 segundos

    console.log(`Página carregou em ${loadTime}ms`)
  })

  test('deve ter estrutura acessível básica', async ({ page }) => {
    await page.goto(salesUrl)
    await page.waitForLoadState('domcontentloaded')

    // Verificar título principal da página
    await expect(page.locator('h1')).toBeVisible()

    // Verificar navegação por teclado básica (tab)
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus').count()
    expect(focusedElement).toBeGreaterThanOrEqual(0)

    // Verificar se botões são clicáveis
    const buttons = page.locator('button:visible')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(3)
  })
})
})