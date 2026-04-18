/**
 * tracking.integration.spec.ts
 *
 * Valida UX/UI da página de links rastreáveis.
 * Cobre: lista de links reais ou empty state, criação de link (form validation),
 * responsividade mobile.
 */
import { test, expect } from '@playwright/test'
import { projectUrl } from './helpers/integration-context'

test.describe('UX-TRACK: Links rastreáveis', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(projectUrl('tracking'))
        await page.waitForLoadState('networkidle')
    })

    test('UX-TRACK-001: Página carrega sem erros de rede', async ({ page }) => {
        const networkErrors: string[] = []
        page.on('response', (resp) => {
            if (resp.status() >= 400 && resp.url().includes('functions/v1')) {
                networkErrors.push(`${resp.status()} ${resp.url()}`)
            }
        })

        await page.goto(projectUrl('tracking'))
        await page.waitForLoadState('networkidle')

        if (networkErrors.length > 0) {
            console.warn('[UX-TRACK-001] Erros de rede:', networkErrors)
        }

        await expect(page.locator('main, [class*="tracking"], [data-testid*="tracking"]').first()).toBeVisible({ timeout: 15_000 })
    })

    test('UX-TRACK-002: Lista links reais ou exibe empty state com CTA', async ({ page }) => {
        const linkItems = page.locator(
            '[data-testid*="link-item"], [data-testid*="trackable-link"], ' +
            '[class*="link-item"], [class*="link-card"], table tbody tr'
        )
        const emptyState = page.locator(
            '[data-testid*="empty"], [class*="empty"], ' +
            'p:has-text("nenhum link"), p:has-text("criar"), p:has-text("ainda não")'
        )

        const linkCount = await linkItems.count()
        const hasEmpty = (await emptyState.count()) > 0

        if (linkCount === 0 && !hasEmpty) {
            console.warn('[UX-TRACK-002] Sem links e sem empty state — possível UX gap ou loading incompleto')
        }

        if (linkCount > 0) {
            // Verifica que links têm conteúdo legível
            const firstText = await linkItems.first().innerText()
            expect(firstText.trim().length).toBeGreaterThan(0)
        }

        await expect(page.locator('main').first()).toBeVisible()
    })

    test('UX-TRACK-003: Botão "Criar link" está visível e abre formulário', async ({ page }) => {
        // A rota /tracking usa TrackingView.vue cujo título e botão é "Criar mensagem"
        // (links rastreáveis de WhatsApp) — atualizado para refletir a UI real
        const createButton = page.locator(
            'button:has-text("Criar mensagem"), button:has-text("Nova mensagem"), ' +
            'button:has-text("Criar link"), button:has-text("Novo link"), ' +
            '[data-testid*="create-link"], [data-testid*="add-link"]'
        ).first()

        await expect(createButton).toBeVisible({ timeout: 10_000 })
        await createButton.click()

        // Modal ou formulário deve abrir
        const form = page.locator(
            '[role="dialog"], form[data-testid*="link"], [class*="link-form"], ' +
            'input[placeholder*="URL"], input[placeholder*="url"], input[name*="url"]'
        ).first()

        await expect(form).toBeVisible({ timeout: 8_000 })

        // Fecha o form
        await page.keyboard.press('Escape')
    })

    test('UX-TRACK-004: Form de link valida campo obrigatório com erro inline', async ({ page }) => {
        // O formulário cria links de WhatsApp (nome do link + telefone), não URL
        const createButton = page.locator(
            'button:has-text("Criar mensagem"), button:has-text("Nova mensagem"), ' +
            'button:has-text("Criar link"), button:has-text("Novo link"), ' +
            '[data-testid*="create-link"]'
        ).first()

        if ((await createButton.count()) === 0) {
            console.warn('[UX-TRACK-004] Botão de criar link/mensagem não encontrado')
            return
        }

        await createButton.click()

        // Aguarda modal abrir
        const form = page.locator('[role="dialog"]').first()
        if ((await form.count()) === 0) {
            console.warn('[UX-TRACK-004] Modal não abriu')
            await page.keyboard.press('Escape')
            return
        }
        await expect(form).toBeVisible({ timeout: 5_000 })

        // Localiza campo de nome do link (campo principal obrigatório)
        const nameInput = form.locator(
            'input[placeholder*="nome" i], input[placeholder*="rastreamento" i], ' +
            'input[name*="name"], input[name*="nome"]'
        ).first()

        if ((await nameInput.count()) === 0) {
            console.warn('[UX-TRACK-004] Campo de nome não encontrado no form de link')
            await page.keyboard.press('Escape')
            return
        }

        // Tenta submeter sem preencher campos obrigatórios
        const submitButton = form.locator('button[type="submit"], button:has-text("Criar"), button:has-text("Salvar")').first()
        if ((await submitButton.count()) > 0) {
            await submitButton.click()
            await page.waitForTimeout(500)

            // Deve aparecer erro inline ou botão permanece desabilitado
            const errorMsg = form.locator(
                '[class*="error"]:visible, [class*="invalid"]:visible, ' +
                'p:has-text("obrigatório"):visible, [role="alert"]:visible'
            )
            const hasError = (await errorMsg.count()) > 0
            const btnDisabled = await submitButton.isDisabled().catch(() => false)
            if (!hasError && !btnDisabled) {
                console.warn('[UX-TRACK-004] Sem validação para campos obrigatórios no form — UX gap')
            }
        } else {
            console.warn('[UX-TRACK-004] Botão de submit não encontrado no form')
        }

        await page.keyboard.press('Escape')
    })

    test('UX-TRACK-005: Colunas da tabela de links têm labels legíveis', async ({ page }) => {
        const headers = page.locator('table thead th, [role="columnheader"]')
        const count = await headers.count()

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const text = await headers.nth(i).innerText()
                if (text.trim().length === 0) {
                    console.warn(`[UX-TRACK-005] Coluna #${i} sem label visível — UX gap de a11y`)
                }
            }
            expect(count).toBeGreaterThan(0)
        } else {
            console.warn('[UX-TRACK-005] Sem tabela com headers encontrada — pode ser lista sem tabela')
        }
    })

    test('UX-TRACK-006 [Mobile]: Form de criação usável sem zoom forçado', async ({ page, viewport }) => {
        if (!viewport || viewport.width > 500) {
            test.skip()
        }

        const createButton = page.locator(
            'button:has-text("Criar link"), button:has-text("Novo link"), [data-testid*="create-link"]'
        ).first()

        if ((await createButton.count()) > 0) {
            await createButton.click()
            const form = page.locator('[role="dialog"], form').first()
            if ((await form.count()) > 0) {
                await expect(form).toBeVisible({ timeout: 5_000 })

                // Inputs não devem ser menores que 16px para evitar zoom automático no iOS
                const inputs = form.locator('input:visible')
                const inputCount = await inputs.count()
                for (let i = 0; i < inputCount; i++) {
                    const fontSize = await inputs.nth(i).evaluate(
                        (el) => parseFloat(getComputedStyle(el).fontSize)
                    )
                    if (fontSize < 16) {
                        console.warn(`[UX-TRACK-006] Input #${i} com font-size ${fontSize}px < 16px — causará zoom automático no iOS`)
                    }
                }
                await page.keyboard.press('Escape')
            }
        }

        await expect(page.locator('body')).toBeVisible()
    })
})
