/**
 * Testes E2E visuais do botão WhatsApp no Header
 * 
 * Valida que o botão WhatsApp no header:
 * - Não tem borda visível (variant="ghost")
 * - Tem aparência consistente com outros controles do header
 * - Pill de status é visualmente adequado
 */

import { test, expect } from '@playwright/test'

// URL base da aplicação (pode ser configurada via env var)
const BASE_URL = process.env.E2E_HEADER_URL || 'http://localhost:5173'

/**
 * Configuração comum para todos os testes
 */
test.beforeEach(async ({ page }) => {
    // Navega para a página de login
    await page.goto(`${BASE_URL}/pt/login`)

    // Realiza login (ajustar credenciais conforme ambiente)
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Aguarda navegação para dashboard
    await page.waitForURL(/\/pt\/projects\/.*\/dashboard/)
})

/**
 * Teste visual: WhatsApp no header não deve ter borda/outline visível
 * 
 * Valida:
 * - borderWidth deve ser 0px (padrão ghost shadcn)
 * - borderColor não deve ser cinza visível (gray-200)
 * - backgroundColor deve ser transparent ou rgba(0,0,0,0)
 */
test('WhatsApp no header não deve ter borda/outline visível', async ({ page }) => {
    // Localiza botão WhatsApp pelo data-testid
    const whatsappButton = page.getByTestId('whatsapp-trigger')
    await expect(whatsappButton).toBeVisible()

    // Valida borderWidth = 0px (sem borda)
    const borderWidth = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).borderWidth
    )
    expect(borderWidth).toBe('0px')

    // Valida que não há borda cinza visível (gray-200: rgb(229, 231, 235))
    const borderColor = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).borderColor
    )
    expect(borderColor).not.toMatch(/rgb\(229,\s*231,\s*235\)/)

    // Valida que backgroundColor é transparent (rgba(0, 0, 0, 0))
    const bgColor = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).backgroundColor
    )
    expect(bgColor).toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)/)
})

/**
 * Teste visual: Pill de status deve ter tamanho adequado
 * 
 * Valida:
 * - fontSize menor que o texto principal (11px vs 14px)
 * - padding adequado (px-2 py-0.5)
 * - borderRadius = rounded-full
 */
test('Pill de status deve ser visualmente adequado (pequeno e badge-like)', async ({ page }) => {
    const pill = page.getByTestId('whatsapp-status-pill')
    await expect(pill).toBeVisible()

    // Valida fontSize = 11px (text-[11px])
    const fontSize = await pill.evaluate((el) =>
        getComputedStyle(el).fontSize
    )
    expect(fontSize).toBe('11px')

    // Valida borderRadius = 9999px (rounded-full)
    const borderRadius = await pill.evaluate((el) =>
        getComputedStyle(el).borderRadius
    )
    expect(borderRadius).toMatch(/9999px|50%/)

    // Valida que o pill tem cor de fundo (não transparent)
    const bgColor = await pill.evaluate((el) =>
        getComputedStyle(el).backgroundColor
    )
    expect(bgColor).not.toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)/)
})

/**
 * Teste visual: Botão WhatsApp deve ter altura consistente (h-9)
 * 
 * Valida:
 * - height = 36px (h-9 = 2.25rem = 36px)
 * - Consistente com LanguageSelector e outros controles
 */
test('Botão WhatsApp deve ter altura h-9 (36px)', async ({ page }) => {
    const whatsappButton = page.getByTestId('whatsapp-trigger')
    await expect(whatsappButton).toBeVisible()

    // Valida height = 36px (h-9)
    const height = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).height
    )
    expect(height).toBe('36px')
})

/**
 * Teste visual: Hover deve mudar backgroundColor (não adicionar borda)
 * 
 * Valida:
 * - Ao fazer hover, backgroundColor muda
 * - borderWidth permanece 0px
 */
test('Hover deve mudar backgroundColor, mas não adicionar borda', async ({ page }) => {
    const whatsappButton = page.getByTestId('whatsapp-trigger')
    await expect(whatsappButton).toBeVisible()

    // Background antes do hover (transparent)
    const bgBefore = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).backgroundColor
    )

    // Faz hover
    await whatsappButton.hover()
    await page.waitForTimeout(300) // Aguarda transição CSS

    // Background depois do hover (deve mudar para accent)
    const bgAfter = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).backgroundColor
    )

    // Valida que background mudou
    expect(bgAfter).not.toBe(bgBefore)

    // Valida que borderWidth continua 0px (não adicionou borda)
    const borderWidth = await whatsappButton.evaluate((el) =>
        getComputedStyle(el).borderWidth
    )
    expect(borderWidth).toBe('0px')
})
