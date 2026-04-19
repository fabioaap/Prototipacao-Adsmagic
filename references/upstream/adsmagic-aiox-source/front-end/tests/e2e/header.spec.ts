/**
 * Testes E2E do Header
 * 
 * Este arquivo testa a funcionalidade completa do header da aplicação,
 * incluindo todos os 4 componentes principais:
 * - ProjectName (nome do projeto com label hierárquico)
 * - WhatsAppStatus (botão com ícone, texto e pill de status)
 * - LanguageSelector (seletor de idioma com dropdown)
 * - NotificationCenter (central de notificações com badge interno)
 */

import { test, expect } from '@playwright/test'

// URL base da aplicação (pode ser configurada via env var)
const BASE_URL = process.env.E2E_HEADER_URL || 'http://localhost:5173'

/**
 * Configuração comum para todos os testes
 * - Autentica usuário antes de cada teste
 * - Navega para dashboard com projeto ativo
 */
test.beforeEach(async ({ page }) => {
    // Navega para a página de login
    await page.goto(`${BASE_URL}/pt/login`)

    // Realiza login (ajustar credenciais conforme ambiente)
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Aguarda navegação para dashboard (URL pode variar)
    await page.waitForURL(/\/pt\/projects\/.*\/dashboard/)
})

/**
 * Teste 1: Exibição do nome do projeto como título hierárquico
 * 
 * Valida:
 * - Label "Nome do projeto" está visível
 * - Nome do projeto está visível
 * - Componente não é clicável (não deve ser button)
 */
test('deve exibir o nome do projeto como título hierárquico (não clicável)', async ({ page }) => {
    // Localiza o componente pelo data-testid
    const projectName = page.getByTestId('project-name')
    await expect(projectName).toBeVisible()

    // Valida presença da label
    const label = page.getByTestId('project-name-label')
    await expect(label).toBeVisible()
    await expect(label).toHaveText('Nome do projeto')

    // Valida presença do título com nome do projeto
    const title = page.getByTestId('project-name-title')
    await expect(title).toBeVisible()

    // Garante que não é um botão (não deve ter role="button")
    await expect(projectName).not.toHaveAttribute('role', 'button')

    // Valida que o texto do título não está vazio
    const projectText = await title.textContent()
    expect(projectText?.trim()).not.toBe('')
})

/**
 * Teste 2: Botão do WhatsApp com ícone, texto e pill de status
 * 
 * Valida:
 * - Botão é visível e clicável
 * - Texto "WhatsApp" está presente
 * - Pill de status é visível (Conectado ou Desconectado)
 * - Dropdown abre ao clicar
 */
test('deve exibir botão WhatsApp com texto e pill de status visível', async ({ page }) => {
    // Localiza botão pelo data-testid
    const whatsappButton = page.getByTestId('whatsapp-trigger')
    await expect(whatsappButton).toBeVisible()

    // Valida que o texto "WhatsApp" está presente no botão
    await expect(whatsappButton).toContainText('WhatsApp')

    // Valida presença do pill de status
    const statusPill = page.getByTestId('whatsapp-status-pill')
    await expect(statusPill).toBeVisible()

    // Valida que o pill tem texto (Conectado ou Desconectado)
    const statusText = await statusPill.textContent()
    expect(['Conectado', 'Desconectado']).toContain(statusText?.trim())

    // Valida que o botão é clicável (abre dropdown)
    await whatsappButton.click()

    // Aguarda dropdown abrir (ajustar seletor conforme implementação)
    const dropdown = page.locator('[role="menu"]').first()
    await expect(dropdown).toBeVisible({ timeout: 2000 })
})

/**
 * Teste 3: Seletor de idioma abre dropdown ao clicar
 * 
 * Valida:
 * - Botão de idioma é visível
 * - Ao clicar, dropdown de idiomas é exibido
 * - Lista de idiomas contém opções esperadas
 */
test('deve abrir dropdown de idiomas ao clicar no seletor de idioma', async ({ page }) => {
    // Localiza trigger do seletor de idioma
    const languageTrigger = page.getByTestId('language-trigger')
    await expect(languageTrigger).toBeVisible()

    // Clica no trigger
    await languageTrigger.click()

    // Valida que o menu de idiomas é exibido
    const languageMenu = page.getByTestId('language-menu')
    await expect(languageMenu).toBeVisible({ timeout: 2000 })

    // Valida que há pelo menos 2 idiomas disponíveis (PT e EN)
    const menuItems = languageMenu.locator('[role="menuitem"]')
    const count = await menuItems.count()
    expect(count).toBeGreaterThanOrEqual(2)
})

/**
 * Teste 4: Sino de notificações não exibe badge no trigger
 * 
 * Valida:
 * - Sino de notificações é visível
 * - NÃO há badge/counter no sino (fora do dropdown)
 * - Ao clicar, painel de notificações abre
 * - Counter de não lidas aparece DENTRO do painel
 */
test('deve exibir sino de notificações sem badge no trigger, mas com contador interno no painel', async ({ page }) => {
    // Localiza trigger de notificações pelo aria-label
    const notificationTrigger = page.getByRole('button', { name: /notificações/i })
    await expect(notificationTrigger).toBeVisible()

    // Valida que NÃO há badge/counter visível no trigger (sino limpo)
    // Badge interno de notificações só deve aparecer dentro do dropdown
    const badgeInTrigger = notificationTrigger.locator('[data-testid="unread-count"]')
    await expect(badgeInTrigger).not.toBeVisible()

    // Clica no sino para abrir painel
    await notificationTrigger.click()

    // Aguarda painel abrir
    const notificationPanel = page.getByTestId('notification-panel')
    await expect(notificationPanel).toBeVisible({ timeout: 2000 })

    // Valida que o contador de não lidas pode estar presente DENTRO do painel
    // (se houver notificações não lidas)
    const unreadCount = page.getByTestId('unread-count')
    // Se houver notificações não lidas, o counter estará visível
    if (await unreadCount.isVisible()) {
        const countText = await unreadCount.textContent()
        expect(parseInt(countText?.trim() || '0')).toBeGreaterThan(0)
    }
})

/**
 * Teste 5: "Marcar todas como lidas" remove contador
 * 
 * Valida:
 * - Painel de notificações abre
 * - Se há notificações não lidas, botão "Marcar todas como lidas" é visível
 * - Ao clicar, contador desaparece
 */
test('deve permitir marcar todas notificações como lidas e remover contador', async ({ page }) => {
    // Abre painel de notificações
    const notificationTrigger = page.getByRole('button', { name: /notificações/i })
    await notificationTrigger.click()

    const notificationPanel = page.getByTestId('notification-panel')
    await expect(notificationPanel).toBeVisible({ timeout: 2000 })

    // Verifica se há contador de não lidas
    const unreadCount = page.getByTestId('unread-count')

    // Se houver notificações não lidas
    if (await unreadCount.isVisible()) {
        // Valida que botão "Marcar todas como lidas" está presente
        const markAllButton = page.getByTestId('notification-mark-all')
        await expect(markAllButton).toBeVisible()

        // Clica no botão
        await markAllButton.click()

        // Aguarda contador desaparecer (pode ser imediato ou com transição)
        await expect(unreadCount).not.toBeVisible({ timeout: 2000 })
    } else {
        // Se não há notificações não lidas, botão não deve estar visível
        const markAllButton = page.getByTestId('notification-mark-all')
        await expect(markAllButton).not.toBeVisible()
    }
})

/**
 * Teste 6: Lista de notificações renderiza itens
 * 
 * Valida:
 * - Painel de notificações abre
 * - Lista de notificações contém pelo menos 1 item
 * - Cada item tem título e mensagem
 */
test('deve renderizar lista de notificações com itens', async ({ page }) => {
    // Abre painel de notificações
    const notificationTrigger = page.getByRole('button', { name: /notificações/i })
    await notificationTrigger.click()

    const notificationPanel = page.getByTestId('notification-panel')
    await expect(notificationPanel).toBeVisible({ timeout: 2000 })

    // Localiza todos os itens de notificação
    const notificationItems = page.getByTestId('notification-item')
    const count = await notificationItems.count()

    // Valida que há pelo menos 1 notificação (pode ajustar conforme mock)
    expect(count).toBeGreaterThanOrEqual(1)

    // Valida que o primeiro item tem conteúdo
    const firstItem = notificationItems.first()
    const itemText = await firstItem.textContent()
    expect(itemText?.trim()).not.toBe('')
})
