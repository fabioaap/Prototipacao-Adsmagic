import { expect, test } from '@playwright/test'

const locale = 'pt'
const forgotPasswordPath = `/${locale}/forgot-password`

/**
 * Smoke da tela de esqueci a senha (preview)
 * - Garante renderização dos campos principais
 * - Botão fica desabilitado até email válido
 */
test.describe('Jornada: Esqueci a senha (preview)', () => {
    test('mantém o submit desabilitado até email válido', async ({ page }) => {
        await page.goto(forgotPasswordPath)

        const emailInput = page.getByLabel(/email/i)
        const submitButton = page.locator('button[type="submit"]')

        await expect(emailInput).toBeVisible()
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeDisabled()

        await emailInput.fill('invalido')
        await emailInput.blur()
        await expect(submitButton).toBeDisabled()

        await emailInput.fill('tester@example.com')
        await emailInput.blur()
        await expect(submitButton).toBeEnabled()
    })
})
