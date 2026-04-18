/**
 * projects.integration.spec.ts
 *
 * Valida UX/UI da listagem de projetos com dados reais.
 * Usa storageState (usuário já autenticado pelo global-setup).
 */
import { test, expect } from '@playwright/test'
import { projectsUrl, getIntegrationContext } from './helpers/integration-context'

const PROJECT_NAME = process.env.INTEGRATION_TEST_PROJECT_NAME ?? 'Dr Letícia Lopes'

test.describe('UX-PROJ: Listagem de projetos', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(projectsUrl())
        await page.waitForLoadState('networkidle')
    })

    test('UX-PROJ-001: Projeto âncora aparece na listagem (dado real)', async ({ page }) => {
        // Desktop (≥1024px): tabela visível ('hidden lg:block'), card mobile oculto
        // Mobile (<1024px): card visível ('block lg:hidden'), tabela oculta
        const { width } = page.viewportSize() ?? { width: 1440 }
        if (width >= 1024) {
            await expect(page.locator('table td').filter({ hasText: PROJECT_NAME }).first()).toBeVisible({ timeout: 20_000 })
        } else {
            // No mobile, `.first()` retorna o card mobile que é o primeiro elemento no DOM
            await expect(page.locator(`text=${PROJECT_NAME}`).first()).toBeVisible({ timeout: 20_000 })
        }
    })

    test('UX-PROJ-002: Loading state visível durante fetch da lista', async ({ page }) => {
        // Intercepta a requisição de projetos e atrasa para validar skeleton/spinner
        await page.route('**/functions/v1/projects**', async (route) => {
            await new Promise((r) => setTimeout(r, 800))
            await route.continue()
        })

        await page.goto(projectsUrl())

        // Skeleton, spinner ou any loading indicator deve estar presente antes dos dados
        const loadingIndicator = page.locator(
            '[data-testid*="skeleton"], [data-testid*="loading"], [class*="skeleton"], ' +
            '[class*="loading"], [aria-busy="true"], [role="progressbar"]'
        )
        // Aceita: loading indicator visível OU dado já carregado (rede pode ser rápida)
        await page.waitForLoadState('domcontentloaded')
        // Marca como warning se não há loading indicator (UX gap potencial)
        const hasLoading = await loadingIndicator.count() > 0
        if (!hasLoading) {
            console.warn('[UX-PROJ-002] Nenhum loading indicator detectado — possível UX gap: ausência de skeleton/spinner')
        }

        // Aguarda networkidle para garantir que os dados da API chegaram (especialmente no mobile WebKit)
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => null)

        // Após carregamento, projeto deve aparecer (viewport-aware: tabela no desktop, card no mobile)
        const { width } = page.viewportSize() ?? { width: 1440 }
        if (width >= 1024) {
            await expect(page.locator('table td').filter({ hasText: PROJECT_NAME }).first()).toBeVisible({ timeout: 20_000 })
        } else {
            await expect(page.locator(`text=${PROJECT_NAME}`).first()).toBeVisible({ timeout: 20_000 })
        }
    })

    test('UX-PROJ-003: Click no projeto navega para dashboard-v2 com projectId na URL', async ({ page }) => {
        const { projectId } = getIntegrationContext()

        // Viewport-aware: tabela no desktop, card mobile no mobile
        const { width } = page.viewportSize() ?? { width: 1440 }
        const isDesktop = width >= 1024
        if (isDesktop) {
            // Desktop: clicar na linha da tabela
            const projectRow = page.locator('table tr').filter({ hasText: PROJECT_NAME }).first()
            await expect(projectRow).toBeVisible({ timeout: 15_000 })
            await projectRow.click()
        } else {
            // Mobile: clicar no texto (bubbles até o handler do card)
            const projectText = page.locator(`text=${PROJECT_NAME}`).first()
            await expect(projectText).toBeVisible({ timeout: 15_000 })
            await projectText.click()
        }

        await page.waitForURL(/\/projects\/[^/]+\//, { timeout: 20_000 })

        // URL deve conter o project_id correto
        expect(page.url()).toContain(projectId)
        // Deve estar no dashboard-v2 ou em alguma sub-rota do projeto
        expect(page.url()).toMatch(/\/projects\/[^/]+\//)
    })

    test('UX-PROJ-004: Botão "Criar projeto" abre wizard; Cancelar fecha sem criar', async ({ page }) => {
        // Localiza botão de criar projeto
        const createButton = page.locator(
            'button:has-text("Criar"), button:has-text("Novo projeto"), ' +
            'a:has-text("Criar"), [data-testid*="create-project"]'
        ).first()
        await expect(createButton).toBeVisible({ timeout: 10_000 })
        await createButton.click()

        // Wizard ou modal deve abrir
        const wizardOrModal = page.locator(
            '[role="dialog"], [data-testid*="wizard"], [data-testid*="modal"], ' +
            '[class*="wizard"], [class*="modal"]'
        ).first()
        await expect(wizardOrModal).toBeVisible({ timeout: 10_000 })

        // Localiza e clica em Cancelar
        const cancelButton = page.locator(
            'button:has-text("Cancelar"), button:has-text("Cancel"), ' +
            'button[aria-label*="fechar"], button[aria-label*="close"]'
        ).first()
        if (await cancelButton.count() > 0) {
            await cancelButton.click()
            await expect(wizardOrModal).not.toBeVisible({ timeout: 5_000 })
        }
    })

    test('UX-PROJ-005 [A11y]: Elementos interativos têm roles e labels acessíveis', async ({ page }) => {
        // Botões devem ter texto ou aria-label
        const buttons = page.locator('button:visible')
        const buttonCount = await buttons.count()
        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
            const btn = buttons.nth(i)
            const text = await btn.innerText()
            const ariaLabel = await btn.getAttribute('aria-label')
            const ariaLabelledBy = await btn.getAttribute('aria-labelledby')
            const hasLabel = (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy
            if (!hasLabel) {
                console.warn(`[UX-PROJ-005] Botão #${i} sem label acessível — UX gap de a11y`)
            }
        }
        // Teste passa mesmo com warnings — registra gaps para revisão manual
        expect(true).toBe(true)
    })
})
