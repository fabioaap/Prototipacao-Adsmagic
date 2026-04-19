import { expect, test } from '@playwright/test'

const locale = 'pt'
const loginPath = `/${locale}/login`

test.describe('Jornada: Autenticacao (preview)', () => {
    test('mantem o submit desabilitado ate o formulario ser valido', async ({ page }) => {
        await page.goto(loginPath)

        const emailInput = page.getByLabel(/email/i)
        const passwordInput = page.getByLabel(/senha/i)
        const submitButton = page.locator('button[type="submit"]')

        await expect(emailInput).toBeVisible()
        await expect(passwordInput).toBeVisible()
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeDisabled()

        await emailInput.fill('invalid')
        await passwordInput.fill('123')
        await expect(submitButton).toBeDisabled()

        await emailInput.fill('tester@example.com')
        await passwordInput.fill('123456')

        await expect(submitButton).toBeEnabled()
    })
})


