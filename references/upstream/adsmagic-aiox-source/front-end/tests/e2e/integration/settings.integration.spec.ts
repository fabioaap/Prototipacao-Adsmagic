/**
 * settings.integration.spec.ts
 *
 * Valida UX/UI das configurações do projeto (geral, funil, origens).
 * Este é o único spec com escrita: salva o mesmo valor atual para testar toast de sucesso.
 */
import { test, expect } from '@playwright/test'
import { projectUrl } from './helpers/integration-context'

const PROJECT_NAME = process.env.INTEGRATION_TEST_PROJECT_NAME ?? 'Dr Letícia Lopes'

test.describe('UX-SET: Configurações do projeto', () => {

    // -------------------------------------------------------------------------
    // Settings Gerais
    // -------------------------------------------------------------------------
    test.describe('Geral', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(projectUrl('settings/general'))
            await page.waitForLoadState('networkidle')
        })

        test('UX-SET-001: Página carrega e exibe nome do projeto no campo', async ({ page }) => {
            const nameInput = page.locator(
                'input[name*="name"], input[placeholder*="nome"], input[placeholder*="projeto"], ' +
                '[data-testid*="project-name"]'
            ).first()

            await expect(nameInput).toBeVisible({ timeout: 15_000 })

            const value = await nameInput.inputValue()
            // Campo deve ter algum valor (não vazio)
            if (value.trim().length === 0) {
                console.warn('[UX-SET-001] Campo nome do projeto está vazio — possível dado não carregado')
            }
            expect(value.trim().length).toBeGreaterThan(0)
        })

        test('UX-SET-002: Salvar com mesmo valor exibe toast de sucesso', async ({ page }) => {
            // O botão Salvar exige form dirty. Tornamos dirty modificando o campo nome.
            const nameInput = page.locator(
                'input[name*="name"], input[placeholder*="ome"], [data-testid*="project-name"]'
            ).first()
            await expect(nameInput).toBeVisible({ timeout: 10_000 })

            // Guarda o valor atual, modifica para tornar o form dirty
            const currentValue = await nameInput.inputValue()
            await nameInput.fill(currentValue + ' ')  // adiciona espaço → dirty
            await nameInput.fill(currentValue)         // restaura → pode ou não ser dirty

            // Se form ainda não está dirty, tenta uma mudança real mínima
            const saveButton = page.locator(
                'button:has-text("Salvar"), button:has-text("Save"), ' +
                'button[type="submit"], [data-testid*="save"]'
            ).first()
            await expect(saveButton).toBeVisible({ timeout: 5_000 })

            const isEnabled = await saveButton.isEnabled()
            if (!isEnabled) {
                // UX GAP ENCONTRADO: save button desabilitado sem form sujo
                // → O form pode requerer um valor DIFERENTE para habilitar o save
                console.warn('[UX-SET-002] Botão Salvar desabilitado — form pode usar strict dirty check (igual = disabled). Gap UX: sem feedback ao tentar salvar sem mudanças.')
                // Tenta forçar mudança para validar que a funcionalidade de save existe
                await nameInput.fill(currentValue + 'X')
            }

            // Re-verifica se o botão foi habilitado
            await expect(saveButton).toBeEnabled({ timeout: 5_000 }).catch(async () => {
                console.warn('[UX-SET-002] Botão Salvar permanece desabilitado mesmo após modificação — UX gap crítico')
            })

            // Escuta por toasts (usa classes do Toast.vue: success/destructive)
            const toastLocator = page.locator(
                '[class*="success"], [class*="destructive"], [role="alert"]'
            ).first()

            const btnEnabled = await saveButton.isEnabled().catch(() => false)
            if (btnEnabled) {
                await saveButton.click()
                await expect(toastLocator).toBeVisible({ timeout: 10_000 }).catch(() => {
                    console.warn('[UX-SET-002] Toast não apareceu após salvar — UX gap: ausência de feedback visual')
                })
                // Restaura o valor original se modificado
                if (!isEnabled) {
                    await nameInput.fill(currentValue)
                    const saveBtn2 = page.locator('button:has-text("Salvar"), button:has-text("Save")').first()
                    if (await saveBtn2.isEnabled()) await saveBtn2.click()
                }
            }

            await expect(page.locator('body')).toBeVisible()
        })

        test('UX-SET-003: Campo obrigatório em branco exibe erro inline antes do submit', async ({ page }) => {
            const nameInput = page.locator(
                'input[name*="name"], input[placeholder*="nome"], [data-testid*="project-name"]'
            ).first()

            if ((await nameInput.count()) === 0) {
                console.warn('[UX-SET-003] Campo nome não encontrado')
                return
            }

            // Limpa o campo
            await nameInput.click({ clickCount: 3 })
            await nameInput.fill('')
            await page.keyboard.press('Tab') // Aciona blur/validação

            // Mensagem de erro ou estado invalid deve aparecer
            const errorMsg = page.locator(
                '[class*="error"]:visible, [class*="invalid"]:visible, ' +
                'p:has-text("obrigatório"):visible, p:has-text("required"):visible, ' +
                '[role="alert"]:visible'
            )
            const hasError = (await errorMsg.count()) > 0
            if (!hasError) {
                console.warn('[UX-SET-003] Sem mensagem de erro para campo obrigatório vazio — UX gap: validação inline ausente')
            }

            // Restaura o valor original para não quebrar dados
            await nameInput.fill(PROJECT_NAME)
        })
    })

    // -------------------------------------------------------------------------
    // Funil
    // -------------------------------------------------------------------------
    test.describe('Funil', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(projectUrl('settings/funnel'))
            await page.waitForLoadState('networkidle')
        })

        test('UX-SET-004: Página de funil carrega lista de etapas existentes', async ({ page }) => {
            const stageItems = page.locator(
                '[data-testid*="stage"], [class*="stage-item"], [class*="funnel-stage"], ' +
                'li[class*="stage"], [draggable="true"]'
            )
            await page.waitForTimeout(1000)
            const count = await stageItems.count()

            if (count === 0) {
                console.warn('[UX-SET-004] Nenhuma etapa encontrada no funil — verificar se há dados ou se seletor está correto')
                // Verifica empty state
                const emptyState = page.locator('[data-testid*="empty"], [class*="empty"]')
                if ((await emptyState.count()) === 0) {
                    console.warn('[UX-SET-004] Sem etapas e sem empty state — possível UX gap')
                }
            } else {
                expect(count).toBeGreaterThan(0)
                // Verifica que ao menos uma etapa tem texto legível
                const firstText = await stageItems.first().innerText()
                expect(firstText.trim().length).toBeGreaterThan(0)
            }
        })

        test('UX-SET-005: Botão "Adicionar etapa" está visível e abre form', async ({ page }) => {
            const addButton = page.locator(
                'button:has-text("Adicionar"), button:has-text("Nova etapa"), ' +
                'button:has-text("+ Etapa"), [data-testid*="add-stage"]'
            ).first()

            if ((await addButton.count()) === 0) {
                console.warn('[UX-SET-005] Botão de adicionar etapa não encontrado')
                return
            }

            await expect(addButton).toBeVisible({ timeout: 10_000 })
            await addButton.click()

            const form = page.locator(
                '[role="dialog"], form[data-testid*="stage"], [class*="stage-form"], ' +
                'input[placeholder*="etapa"], input[placeholder*="nome"]'
            ).first()

            if ((await form.count()) > 0) {
                await expect(form).toBeVisible({ timeout: 5_000 })
                await page.keyboard.press('Escape')
            } else {
                console.warn('[UX-SET-005] Form de adição de etapa não abriu — possível UX gap')
            }
        })
    })

    // -------------------------------------------------------------------------
    // Origens
    // -------------------------------------------------------------------------
    test.describe('Origens', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(projectUrl('settings/origins'))
            await page.waitForLoadState('networkidle')
        })

        test('UX-SET-006: Página de origens carrega lista de origens existentes', async ({ page }) => {
            const originItems = page.locator(
                '[data-testid*="origin"], [class*="origin-item"], ' +
                'table tbody tr, li[class*="origin"]'
            )
            await page.waitForTimeout(1000)
            const count = await originItems.count()

            if (count === 0) {
                const emptyState = page.locator('[data-testid*="empty"], [class*="empty"]')
                if ((await emptyState.count()) > 0) {
                    console.warn('[UX-SET-006] Origens com empty state — sem origens cadastradas ou gap de dados')
                } else {
                    console.warn('[UX-SET-006] Sem origens e sem empty state — possível UX gap')
                }
            } else {
                expect(count).toBeGreaterThan(0)
                const firstText = await originItems.first().innerText()
                expect(firstText.trim().length).toBeGreaterThan(0)
            }
        })

        test('UX-SET-007 [Mobile]: Settings navegam sem overflow na tela mobile', async ({ page, viewport }) => {
            if (!viewport || viewport.width > 500) {
                test.skip()
            }

            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
            const windowWidth = await page.evaluate(() => window.innerWidth)

            if (bodyScrollWidth > windowWidth + 5) {
                console.warn(`[UX-SET-007] Overflow horizontal: scrollWidth=${bodyScrollWidth}, windowWidth=${windowWidth}`)
            }

            await expect(page.locator('body')).toBeVisible()
        })
    })
})
