import { test, expect } from '@playwright/test'

test.describe('Usabilidade - Página de Vendas', () => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5174'
    const salesUrl = `${baseUrl}/pt/projects/mock-project-001/sales`

    test('J1. Métricas de Vendas - deve exibir cards com dados formatados', async ({ page }) => {
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')

        // Verificar título da página
        await expect(page.locator('h1:has-text("Vendas")')).toBeVisible()

        // Verificar cards de métricas
        await expect(page.locator('text=Receita Total')).toBeVisible()
        await expect(page.locator('text=Vendas Realizadas')).toBeVisible()
        await expect(page.locator('text=Ticket Médio')).toBeVisible()
        await expect(page.locator('text=Taxa de Conversão')).toBeVisible()

        // Verificar formatação brasileira
        await expect(page.locator('text=R$ 0,00')).toBeVisible()

        console.log('✅ J1 - Métricas apresentadas corretamente')
    })

    test('J2. Funil de Vendas - deve mostrar etapas e conversões', async ({ page }) => {
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')

        await expect(page.locator('text=Funil de Vendas')).toBeVisible()
        await expect(page.locator('text=Contato Iniciado')).toBeVisible()
        await expect(page.locator('text=Qualificação')).toBeVisible()

        console.log('✅ J2 - Funil exibido corretamente')
    })

    test('J3. Follow-up Pendente - deve listar contatos urgentes', async ({ page }) => {
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')

        await expect(page.locator('text=Follow-up Pendente')).toBeVisible()
        await expect(page.locator('text=Urgente')).toBeVisible()

        console.log('✅ J3 - Follow-ups listados')
    })

    test('J4. Tabs de Vendas - deve permitir navegação', async ({ page }) => {
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')

        await expect(page.locator('text=Realizadas')).toBeVisible()
        await expect(page.locator('text=Perdidas')).toBeVisible()

        // Testar navegação
        await page.click('text=Perdidas')
        await page.waitForTimeout(500)
        await page.click('text=Realizadas')

        console.log('✅ J4 - Navegação entre tabs funcionando')
    })

    test('J5. Design System - deve aplicar componentes consistentemente', async ({ page }) => {
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(1000)

        // Verificar hierarquia
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('h3')).toBeVisible()

        // Verificar múltiplos botões
        const buttons = page.locator('button')
        const count = await buttons.count()
        expect(count).toBeGreaterThan(3)

        console.log('✅ J5 - Design System aplicado')
    })

    test('J6. Responsividade - deve adaptar em mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')

        await expect(page.locator('text=Vendas')).toBeVisible()
        await expect(page.locator('text=Métricas de Vendas')).toBeVisible()

        console.log('✅ J6 - Mobile responsivo')
    })

    test('J7. Estados Vazios - deve tratar adequadamente', async ({ page }) => {
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')

        await expect(page.locator('text=Nenhuma venda cadastrada')).toBeVisible()

        console.log('✅ J7 - Estados vazios tratados')
    })

    test('Performance - deve carregar rapidamente', async ({ page }) => {
        const start = Date.now()
        await page.goto(salesUrl)
        await page.waitForLoadState('domcontentloaded')
        const loadTime = Date.now() - start

        expect(loadTime).toBeLessThan(5000)
        console.log(`✅ Performance - ${loadTime}ms`)
    })
})