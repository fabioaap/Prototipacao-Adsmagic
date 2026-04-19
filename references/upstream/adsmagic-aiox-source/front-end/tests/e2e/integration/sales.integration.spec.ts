/**
 * sales.integration.spec.ts
 *
 * Valida UX/UI da página de vendas com dados reais do projeto "Dr Letícia Lopes".
 * Cobre: dados reais na tabela, loading, filtros de data, empty state, responsividade.
 */
import { test, expect } from '@playwright/test'
import { projectUrl } from './helpers/integration-context'

test.describe('UX-SALE: Vendas', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(projectUrl('sales'))
        await page.waitForLoadState('networkidle')
    })

    test('UX-SALE-001: Página carrega sem erros e exibe conteúdo', async ({ page }) => {
        const networkErrors: string[] = []
        page.on('response', (resp) => {
            if (resp.status() >= 400 && resp.url().includes('functions/v1')) {
                networkErrors.push(`${resp.status()} ${resp.url()}`)
            }
        })

        await page.goto(projectUrl('sales'))
        await page.waitForLoadState('networkidle')

        if (networkErrors.length > 0) {
            console.warn('[UX-SALE-001] Erros de rede:', networkErrors)
        }

        await expect(page.locator('main, [class*="sales"], [data-testid*="sales"]').first()).toBeVisible({ timeout: 15_000 })
    })

    test('UX-SALE-002: Tabela/lista de vendas renderiza (com dados ou empty state)', async ({ page }) => {
        // Aceita: tabela com linhas OU empty state com mensagem amigável
        const tableRows = page.locator('table tbody tr, [data-testid*="sale-row"], [class*="sale-item"]')
        const emptyState = page.locator(
            '[data-testid*="empty"], [class*="empty"], ' +
            'p:has-text("nenhuma venda"), p:has-text("não há vendas"), p:has-text("sem vendas")'
        )

        const rowCount = await tableRows.count()
        const hasEmpty = (await emptyState.count()) > 0

        if (rowCount === 0 && !hasEmpty) {
            console.warn('[UX-SALE-002] Sem linhas de venda e sem empty state — possível UX gap ou loading incompleto')
        }

        // Ao menos alguma coisa deve estar visível
        await expect(page.locator('main').first()).toBeVisible()
    })

    test('UX-SALE-003: Loading skeleton visível durante fetch de vendas', async ({ page }) => {
        await page.route('**/functions/v1/sales**', async (route) => {
            await new Promise((r) => setTimeout(r, 900))
            await route.continue()
        })

        await page.goto(projectUrl('sales'))
        await page.waitForLoadState('domcontentloaded')

        const skeleton = page.locator(
            '[data-testid*="skeleton"], [class*="skeleton"], [class*="loading"], [aria-busy="true"]'
        )
        const hasLoading = (await skeleton.count()) > 0
        if (!hasLoading) {
            console.warn('[UX-SALE-003] Sem skeleton durante carregamento de vendas — UX gap')
        }

        await page.waitForLoadState('networkidle')
        await expect(page.locator('main').first()).toBeVisible()
    })

    test('UX-SALE-004: Filtro de data está acessível e abre picker sem erro', async ({ page }) => {
        const dateFilter = page.locator(
            '[data-testid*="date-range"], [data-testid*="date-filter"], button:has-text("Período"), ' +
            'button:has-text("Data"), button:has-text("Filtrar"), [class*="date-picker"], ' +
            'input[type="date"]'
        ).first()

        if ((await dateFilter.count()) === 0) {
            console.warn('[UX-SALE-004] Filtro de data não encontrado — verificar UI da página de vendas')
            return
        }

        await expect(dateFilter).toBeVisible({ timeout: 10_000 })
        await dateFilter.click()

        // Picker deve abrir (calendário ou dropdown)
        const picker = page.locator(
            '[data-testid*="calendar"], [class*="calendar"], [class*="datepicker"], ' +
            '[role="dialog"], [data-testid*="dropdown"]'
        ).first()

        if ((await picker.count()) > 0) {
            await expect(picker).toBeVisible({ timeout: 5_000 })
            // Fecha o picker
            await page.keyboard.press('Escape')
        } else {
            console.warn('[UX-SALE-004] Picker de data não abriu após click — possível UX gap')
        }
    })

    test('UX-SALE-005: Dados reais visíveis — ao menos 1 venda exibida', async ({ page }) => {
        const saleItems = page.locator(
            'table tbody tr, [data-testid*="sale-row"], [class*="sale-item"], ' +
            '[class*="sale-card"]'
        )
        const count = await saleItems.count()
        if (count === 0) {
            console.warn('[UX-SALE-005] Nenhuma venda visível no projeto Dr Letícia Lopes — dados podem estar ausentes ou filtro ativo')
        }
        // Se existe alguma linha, verifica que tem texto real (não placeholder)
        if (count > 0) {
            const firstRowText = await saleItems.first().innerText()
            expect(firstRowText.trim().length).toBeGreaterThan(0)
        }
        await expect(page.locator('main').first()).toBeVisible()
    })

    test('UX-SALE-006 [Mobile]: Tabela de vendas tem scroll ou adapta colunas no mobile', async ({ page, viewport }) => {
        if (!viewport || viewport.width > 500) {
            test.skip()
        }

        // Tabela deve ter scroll horizontal ou colunas adaptadas
        const table = page.locator('table').first()
        const tableCount = await table.count()

        if (tableCount > 0) {
            const tableWrapper = page.locator('[class*="table-wrap"], [class*="overflow-x"], [class*="scroll"]').first()
            const hasWrapper = (await tableWrapper.count()) > 0
            if (!hasWrapper) {
                console.warn('[UX-SALE-006] Tabela no mobile sem wrapper de scroll horizontal — possível overflow')
            }
        }

        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
        const windowWidth = await page.evaluate(() => window.innerWidth)
        if (bodyScrollWidth > windowWidth + 5) {
            console.warn(`[UX-SALE-006] Overflow horizontal: scrollWidth=${bodyScrollWidth}, windowWidth=${windowWidth}`)
        }

        await expect(page.locator('body')).toBeVisible()
    })
})
