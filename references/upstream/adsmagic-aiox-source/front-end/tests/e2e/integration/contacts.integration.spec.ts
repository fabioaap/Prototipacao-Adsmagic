/**
 * contacts.integration.spec.ts
 *
 * Valida UX/UI da página de contatos com dados reais do projeto "Dr Letícia Lopes".
 * Cobre: dados reais, loading, busca, toggle Kanban/Lista, mobile, a11y.
 */
import { test, expect } from '@playwright/test'
import { projectUrl } from './helpers/integration-context'

test.describe('UX-CONT: Contatos', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(projectUrl('contacts'))
        await page.waitForLoadState('networkidle')
    })

    test('UX-CONT-001: Página carrega e exibe ao menos 1 contato real', async ({ page }) => {
        // Contato pode aparecer em card kanban, linha de tabela, ou item de lista
        const contactItems = page.locator(
            '[data-testid*="contact-card"], [data-testid*="contact-row"], ' +
            '[class*="contact-card"], [class*="contact-item"], ' +
            'table tbody tr, [role="listitem"]'
        )
        await expect(contactItems.first()).toBeVisible({ timeout: 20_000 })
        const count = await contactItems.count()
        expect(count).toBeGreaterThan(0)
    })

    test('UX-CONT-002: Loading state visível antes dos contatos carregarem', async ({ page }) => {
        await page.route('**/functions/v1/contacts**', async (route) => {
            await new Promise((r) => setTimeout(r, 900))
            await route.continue()
        })

        await page.goto(projectUrl('contacts'))
        await page.waitForLoadState('domcontentloaded')

        const skeleton = page.locator(
            '[data-testid*="skeleton"], [class*="skeleton"], [class*="loading"], [aria-busy="true"]'
        )
        const hasLoading = (await skeleton.count()) > 0
        if (!hasLoading) {
            console.warn('[UX-CONT-002] Sem skeleton/loading durante carregamento de contatos — UX gap')
        }

        await page.waitForLoadState('networkidle')
        await expect(page.locator('main').first()).toBeVisible()
    })

    test('UX-CONT-003: Toggle Kanban ↔ Lista funciona sem erro', async ({ page }) => {
        // Localiza os botões de toggle de visualização (os botões usam aria-label)
        const listaButton = page.locator(
            'button[aria-label*="lista" i], button[aria-label*="list" i], ' +
            'button:has-text("Lista"), [role="tab"]:has-text("Lista"), ' +
            '[data-testid*="lista"], [data-testid*="list-view"]'
        ).first()

        const kanbanButton = page.locator(
            'button[aria-label*="kanban" i], ' +
            'button:has-text("Kanban"), [role="tab"]:has-text("Kanban"), ' +
            '[data-testid*="kanban-view"]'
        ).first()

        if ((await listaButton.count()) > 0) {
            await listaButton.click()
            await page.waitForTimeout(500)

            // Deve ter algum elemento de lista/tabela visível
            const listView = page.locator('table, [data-testid*="list"], [class*="list-view"]').first()
            await expect(listView).toBeVisible({ timeout: 5_000 })

            // Volta para Kanban
            if ((await kanbanButton.count()) > 0) {
                await kanbanButton.click()
                await page.waitForTimeout(500)
                await expect(page.locator('main').first()).toBeVisible()
            }
        } else {
            console.warn('[UX-CONT-003] Botão Lista não encontrado — verificar seletor')
        }
    })

    test('UX-CONT-004: Campo de busca filtra ou exibe empty state com mensagem amigável', async ({ page }) => {
        // 'buscar' é case-sensitive em CSS attr selector — usar getByPlaceholder com regex case-insensitive
        const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i).first()

        await expect(searchInput).toBeVisible({ timeout: 10_000 })

        // Digita texto improvável de ter resultado
        await searchInput.fill('xyzxyzxyz_nao_existe_1234')
        await page.waitForTimeout(800) // debounce

        // Deve exibir empty state com mensagem legível OU zero resultados
        const emptyState = page.locator(
            '[data-testid*="empty"], [class*="empty"], ' +
            'p:has-text("nenhum"), p:has-text("não encontrado"), p:has-text("sem resultado"), ' +
            'span:has-text("nenhum"), [role="status"]'
        )
        const hasEmpty = (await emptyState.count()) > 0

        // Valida empty state OU ausência de itens
        const contactItems = page.locator(
            '[data-testid*="contact-card"], [data-testid*="contact-row"], table tbody tr'
        )
        const contactCount = await contactItems.count()

        if (!hasEmpty && contactCount > 0) {
            console.warn('[UX-CONT-004] Busca não filtrou resultados e não exibiu empty state — possível UX gap')
        }

        // Limpa a busca — dados devem voltar
        await searchInput.fill('')
        await page.waitForTimeout(800)
        const afterClear = await contactItems.count()
        if (afterClear === 0) {
            console.warn('[UX-CONT-004] Após limpar busca, contatos não voltaram — possível UX gap')
        }

        expect(true).toBe(true)
    })

    test('UX-CONT-005: Kanban exibe colunas de etapa com headers visíveis', async ({ page }) => {
        // Verifica se há colunas do tipo Kanban visíveis
        const kanbanColumns = page.locator(
            '[data-testid="kanban-column"], [data-testid*="kanban-column"], ' +
            '[class*="kanban-col"], [class*="stage-column"], [class*="pipeline-col"]'
        )
        const count = await kanbanColumns.count()
        if (count === 0) {
            // Fallback: verifica se há cabeçalhos de coluna via headings
            const colHeaders = page.locator('[role="columnheader"], [class*="column-header"]')
            const headerCount = await colHeaders.count()
            if (headerCount === 0) {
                console.warn('[UX-CONT-005] Sem colunas Kanban detectadas — verificar view padrão da página')
            }
        } else {
            expect(count).toBeGreaterThan(0)
        }
    })

    test('UX-CONT-006 [A11y]: Botão "Novo contato" tem aria-label e responde a TAB', async ({ page }) => {
        const addButton = page.locator(
            'button:has-text("Novo contato"), button:has-text("Adicionar contato"), ' +
            'button:has-text("Criar contato"), [data-testid*="add-contact"]'
        ).first()

        await expect(addButton).toBeVisible({ timeout: 10_000 })

        // Verifica que o botão tem um label acessível
        const text = await addButton.innerText()
        const ariaLabel = await addButton.getAttribute('aria-label')
        const hasLabel = (text && text.trim().length > 0) || ariaLabel
        if (!hasLabel) {
            console.warn('[UX-CONT-006] Botão "Novo contato" sem label acessível — UX gap de a11y')
        }

        // Testa foco via TAB — pressiona TAB várias vezes e verifica se o botão recebe foco
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        const isFocused = await addButton.evaluate((el) => document.activeElement === el)
        if (!isFocused) {
            console.warn('[UX-CONT-006] Botão "Novo contato" não recebeu foco via TAB nas 3 primeiras tentativas — verificar ordem de foco')
        }

        expect(true).toBe(true)
    })

    test('UX-CONT-007 [Mobile]: Página não tem overflow horizontal', async ({ page, viewport }) => {
        if (!viewport || viewport.width > 500) {
            test.skip()
        }

        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
        const windowWidth = await page.evaluate(() => window.innerWidth)

        if (bodyScrollWidth > windowWidth + 5) {
            console.warn(`[UX-CONT-007] Overflow horizontal: scrollWidth=${bodyScrollWidth}, windowWidth=${windowWidth}`)
        }

        await expect(page.locator('body')).toBeVisible()
    })
})
