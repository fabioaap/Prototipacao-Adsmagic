import { test, expect } from '@playwright/test'

test.describe('Dashboard Filters Debug', () => {
    const dashboardUrl = 'http://localhost:5174/pt/projects/9d176ba9-fd09-4fb9-ab4a-8f12fef3e095/dashboard-v2'

    test('Diagnosticar botões de filtro', async ({ page }) => {
        console.log('🔍 Iniciando diagnóstico dos filtros do dashboard...')

        // Monitorar console do navegador
        const consoleLogs: string[] = []
        page.on('console', msg => {
            const text = msg.text()
            consoleLogs.push(text)
            console.log(`📝 Console: ${text}`)
        })

        // Monitorar erros
        page.on('pageerror', error => {
            console.log(`❌ Page Error: ${error.message}`)
        })

        // Navegar para dashboard
        console.log(`🌐 Navegando para: ${dashboardUrl}`)
        await page.goto(dashboardUrl, { waitUntil: 'networkidle' })
        await page.waitForTimeout(2000)

        // Screenshot inicial
        await page.screenshot({ path: 'tests/screenshots/01-initial-state.png', fullPage: true })
        console.log('📸 Screenshot: 01-initial-state.png')

        // Procurar botões de filtro
        console.log('\n🔎 Procurando botões de filtro...')

        // Seletor de período
        const periodSelect = page.locator('[data-testid="period-select"] select')
        const periodExists = await periodSelect.count() > 0
        console.log(`📅 Seletor de período: ${periodExists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`)

        if (periodExists) {
            const html = await periodSelect.evaluate(el => el.outerHTML)
            console.log(`   HTML: ${html.substring(0, 200)}...`)

            const isVisible = await periodSelect.isVisible()
            const isEnabled = await periodSelect.isEnabled()
            console.log(`   Visível: ${isVisible ? '✅' : '❌'} | Habilitado: ${isEnabled ? '✅' : '❌'}`)
        }

        // Seletor de origens
        const originsSelect = page.locator('[data-testid="origins-select"] select')
        const originsExists = await originsSelect.count() > 0
        console.log(`🎯 Seletor "Todas Origens": ${originsExists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`)

        // Toggle comparar
        const compareButton = page.locator('button:has-text("Comparar")')
        const compareExists = await compareButton.count() > 0
        console.log(`🔄 Toggle "Comparar": ${compareExists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`)

        // Botão exportar
        const exportButton = page.locator('button:has-text("Exportar")')
        const exportExists = await exportButton.count() > 0
        console.log(`💾 Botão "Exportar": ${exportExists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`)

        // Teste 1: Alterar período para 7d
        console.log('\n🎬 TESTE 1: Selecionando "Últimos 7 dias"...')
        const logsBeforeClick = consoleLogs.length

        if (periodExists) {
            await periodSelect.selectOption('7d')
            await page.waitForTimeout(500)

            const logsAfterClick = consoleLogs.length
            const newLogs = consoleLogs.slice(logsBeforeClick)

            console.log(`📊 Logs gerados: ${newLogs.length}`)
            newLogs.forEach(log => console.log(`   → ${log}`))

            await page.screenshot({ path: 'tests/screenshots/02-after-period-select.png', fullPage: true })
            console.log('📸 Screenshot: 02-after-period-select.png')
        }

        // Teste 2: Clicar no toggle comparar
        console.log('\n🎬 TESTE 2: Clicando em "Comparar"...')
        if (compareExists) {
            const logsBefore = consoleLogs.length
            await compareButton.click()
            await page.waitForTimeout(500)

            const logsAfter = consoleLogs.slice(logsBefore)
            console.log(`📊 Logs gerados: ${logsAfter.length}`)
            logsAfter.forEach(log => console.log(`   → ${log}`))

            await page.screenshot({ path: 'tests/screenshots/03-after-compare-click.png' })
            console.log('📸 Screenshot: 03-after-compare-click.png')
        }

        // Teste 3: Clicar em exportar
        console.log('\n🎬 TESTE 3: Clicando em "Exportar"...')
        if (exportExists) {
            const logsBefore = consoleLogs.length
            await exportButton.click()
            await page.waitForTimeout(500)

            const logsAfter = consoleLogs.slice(logsBefore)
            console.log(`📊 Logs gerados: ${logsAfter.length}`)
            logsAfter.forEach(log => console.log(`   → ${log}`))

            await page.screenshot({ path: 'tests/screenshots/04-after-export-click.png' })
            console.log('📸 Screenshot: 04-after-export-click.png')
        }

        // Resumo final
        console.log('\n📋 RESUMO DO DIAGNÓSTICO')
        console.log('='.repeat(60))
        console.log(`Total de logs capturados: ${consoleLogs.length}`)
        console.log(`Controles encontrados: ${[periodExists, originsExists, compareExists, exportExists].filter(Boolean).length}/4`)
        console.log(`Screenshots salvos em: tests/screenshots/`)

        // Verificar se houve algum log esperado
        const hasFiltersBarLog = consoleLogs.some(log => log.includes('[FiltersBar]'))
        const hasDashboardLog = consoleLogs.some(log => log.includes('[Dashboard]'))
        const hasPeriodSelectorLog = consoleLogs.some(log => log.includes('[PeriodSelector]'))

        console.log('\n🔍 Verificação de Logs Esperados:')
        console.log(`   [FiltersBar]: ${hasFiltersBarLog ? '✅' : '❌'}`)
        console.log(`   [Dashboard]: ${hasDashboardLog ? '✅' : '❌'}`)
        console.log(`   [PeriodSelector]: ${hasPeriodSelectorLog ? '✅' : '❌'}`)

        if (!hasFiltersBarLog && !hasDashboardLog && !hasPeriodSelectorLog) {
            console.log('\n⚠️  PROBLEMA DETECTADO: Nenhum log de evento foi capturado!')
            console.log('   Possíveis causas:')
            console.log('   1. HMR não atualizou - tente hard refresh (Ctrl+Shift+R)')
            console.log('   2. Componentes não estão renderizando')
            console.log('   3. Event listeners não estão conectados')
        }
    })
})
