import { expect, test } from '@playwright/test'

const locale = 'pt'
const registerPath = `/${locale}/register`

/**
 * Smoke da tela de cadastro (preview)
 * - Garante que campos essenciais renderizam
 * - Botão inicia desabilitado e habilita com dados válidos
 */
test.describe('Jornada: Cadastro (preview)', () => {
    test('renderiza campos e habilita submit com dados válidos', async ({ page }) => {
        await page.goto(registerPath)

        const nameInput = page.getByLabel(/nome/i)
        const emailInput = page.getByLabel(/email/i)
        const phoneInput = page.getByLabel(/telefone/i)
        const passwordInput = page.locator('input[type="password"]').first()
        const submitButton = page.locator('button[type="submit"]')

        await expect(nameInput).toBeVisible()
        await expect(emailInput).toBeVisible()
        await expect(phoneInput).toBeVisible()
        await expect(passwordInput).toBeVisible()
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeDisabled()

        await nameInput.fill('Teste Nome')
        await emailInput.fill('tester@example.com')
        await phoneInput.fill('11999999999')
        await passwordInput.fill('SenhaForte1')

        await expect(submitButton).toBeEnabled()
    })
})
