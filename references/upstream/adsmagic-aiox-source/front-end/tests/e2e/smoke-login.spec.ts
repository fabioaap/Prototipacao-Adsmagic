import { test, expect } from '@playwright/test'

test.describe('Smoke: Login page no preview (build)', () => {
    test('deve renderizar formulário de login no preview', async ({ page }) => {
        await page.goto('/pt/login', { waitUntil: 'domcontentloaded' })

        const email = page.locator('input[type="email"]')
        const password = page.locator('input[type="password"]')
        const submit = page.locator('button[type="submit"]')

        await expect(email).toBeVisible()
        await expect(password).toBeVisible()
        await expect(submit).toBeVisible()

        await page.screenshot({ path: 'test-results/smoke-login.png', fullPage: true })
    })
})