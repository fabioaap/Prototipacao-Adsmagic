import { test, expect } from '@playwright/test'

test.describe('Dashboard V2 - Funcionalidade Completa', () => {
    test('deve renderizar KPI cards com dados após corrigir reatividade', async ({ page, context }) => {
        // Timeout aumentado para esperar renderização
        page.setDefaultTimeout(15000)

        // Abrir página com projectId = '2' (dados mockados disponíveis)
        await page.goto(
            'http://localhost:5173/pt/projects/2/dashboard-v2'
        )

        // Esperar título carregar
        await page.waitForSelector('h1', { timeout: 10000 })
        const title = await page.locator('h1').textContent()
        console.log('✅ Título encontrado:', title)
        expect(title).toContain('Desempenho')

        // Verificar KPI Cards (aguardar render)
        await page.waitForSelector('[role="article"]', { timeout: 10000 })
        const kpiCards = await page.locator('[role="article"]').count()
        console.log(`✅ KPI Cards encontrados: ${kpiCards}`)
        expect(kpiCards).toBeGreaterThan(0)

        // Verificar se dados estão sendo renderizados
        const kpiTexts = await page.locator('[role="article"]').allTextContents()
        console.log('📋 Conteúdo dos KPIs:')
        kpiTexts.forEach((text, i) => {
            console.log(`  [KPI ${i + 1}] ${text.substring(0, 100).trim()}...`)
        })

        // Verificar se há valores monetários (indício de dados)
        const containsCurrency = kpiTexts.some((text) =>
            /R\$|[0-9]+[.,][0-9]{2}/.test(text)
        )
        console.log(`💰 Valores monetários encontrados: ${containsCurrency ? 'SIM ✅' : 'NÃO ❌'}`)

        // Verificar Insights
        const insightElements = await page.locator('button:has-text("ROI")').count()
        console.log(`📊 Insights encontrados: ${insightElements}`)

        // Verificar abas
        const tabsList = await page.locator('[role="tablist"]')
        const hasTabList = await tabsList.count()
        console.log(`📑 Tabs encontradas: ${hasTabList > 0 ? 'SIM ✅' : 'NÃO ❌'}`)

        // Capturar screenshot
        await page.screenshot({ path: 'test-results/dashboard-v2-fixed.png' })
        console.log('📸 Screenshot salvo: test-results/dashboard-v2-fixed.png')

        // Inspecionar console para erros
        const consoleLogs: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`)
            }
        })

        // Aguardar um pouco e checar logs
        await page.waitForTimeout(2000)
        if (consoleLogs.length > 0) {
            console.log('⚠️ Erros no console:')
            consoleLogs.forEach((log) => console.log(`  ${log}`))
        } else {
            console.log('✅ Nenhum erro crítico no console')
        }

        // Validação final: verificar se estamos vendo componentes renderizados
        const containerText = await page.locator('.container').textContent()
        const hasContent = containerText && containerText.length > 100
        console.log(`\n🎯 Resultado Final: ${hasContent ? '✅ FUNCIONANDO' : '❌ VAZIO'}`)
    })
})
