import { expect, test } from '@playwright/test'

const locale = 'pt'
const resetPasswordPath = `/${locale}/reset-password`

/**
 * Smoke da tela de redefinir senha (preview)
 * - Garante renderização dos campos principais
 * - Botão fica desabilitado até as senhas baterem
 * - Nota: sem token válido, exibe erro de token inválido (comportamento esperado)
 */
test.describe('Jornada: Redefinir senha (preview)', () => {
    test('exibe erro de token inválido sem hash de recuperação', async ({ page }) => {
        await page.goto(resetPasswordPath)

        // Sem token no hash, deve exibir mensagem de erro
        const errorMessage = page.locator('.bg-red-50')
        await expect(errorMessage).toBeVisible()
    })

    test('renderiza formulário com token simulado e valida campos', async ({ page }) => {
        // Simula presença de token no hash (formulário renderiza)
        await page.goto(`${resetPasswordPath}#access_token=fake&type=recovery`)

        const newPasswordInput = page.getByLabel(/nova senha/i)
        const confirmPasswordInput = page.getByLabel(/confirmar/i)
        const submitButton = page.locator('button[type="submit"]')

        await expect(newPasswordInput).toBeVisible()
        await expect(confirmPasswordInput).toBeVisible()
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeDisabled()

        // Preenche apenas nova senha → botão permanece desabilitado
        await newPasswordInput.fill('SenhaForte1')
        await expect(submitButton).toBeDisabled()

        // Preenche senhas iguais → botão habilita
        await confirmPasswordInput.fill('SenhaForte1')
        await confirmPasswordInput.blur()
        await expect(submitButton).toBeEnabled()
    })
})
