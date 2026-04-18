import { expect, test } from '@playwright/test'

const locale = 'pt'
const dashboardPath = `/${locale}/projects/mock-project-001/dashboard-v2`

test.describe.skip('DateRangePicker (preview)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(dashboardPath)
    })

    test('permite abrir, selecionar duas datas e aplicar', async ({ page }) => {
        const trigger = page.getByRole('button', { name: /período/i }).first()
        await trigger.click()

        // Seleciona duas datas distintas (primeira ocorrência de dia 10 e dia 15)
        await page.locator('button:has-text("10")').first().click()
        await page.locator('button:has-text("15")').nth(1).click()

        // Confirma que há ao menos duas células selecionadas
        await expect(page.locator('[data-selected]')).toHaveCount(2, { timeout: 2000 })

        const beforeText = await trigger.innerText()
        await page.getByRole('button', { name: /aplicar/i }).click()

        // Texto do botão deve mudar após aplicar
        const afterText = await trigger.innerText()
        expect(afterText.trim()).not.toBe(beforeText.trim())
    })

    test('cancelar mantém o valor anterior', async ({ page }) => {
        const trigger = page.getByRole('button', { name: /período/i }).first()
        await trigger.click()
        await page.getByRole('button', { name: /últimos 7 dias/i }).click()
        const presetText = await trigger.innerText()

        // Seleciona novo range e cancela
        await trigger.click()
        await page.locator('button:has-text("01")').first().click()
        await page.locator('button:has-text("05")').first().click()
        await page.getByRole('button', { name: /cancelar/i }).click()

        const afterCancel = await trigger.innerText()
        expect(afterCancel.trim()).toBe(presetText.trim())
    })
})
