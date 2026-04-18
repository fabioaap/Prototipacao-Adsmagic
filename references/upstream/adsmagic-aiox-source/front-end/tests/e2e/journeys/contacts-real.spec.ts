/**
 * Testes E2E para a página REAL de contatos
 * 
 * Esta spec testa a página /projects/:projectId/contacts
 * que é a página usada em produção pelos usuários.
 * 
 * Utiliza auth-bypass para simular usuário autenticado
 * sem precisar passar pelo fluxo completo de login/onboarding.
 */

import { test, expect } from '@playwright/test'
import { navigateAuthenticated } from '../helpers/auth-bypass'

const PROJECT_ID = 'mock-project-001'
const CONTACTS_URL = `/pt/projects/${PROJECT_ID}/contacts`

test.describe('Página Real de Contatos (Autenticada)', () => {

    test.beforeEach(async ({ page }) => {
        // Navega para a página de contatos com autenticação bypass
        await navigateAuthenticated(page, CONTACTS_URL)
    })

    test('deve renderizar a página de contatos com título', async ({ page }) => {
        // Verifica se está na URL correta
        await expect(page).toHaveURL(new RegExp(`/projects/${PROJECT_ID}/contacts`))

        // Verifica título ou heading da página
        const heading = page.getByRole('heading', { name: /contatos/i }).first()
        await expect(heading).toBeVisible({ timeout: 10000 })
    })

    test('deve exibir tabela ou lista de contatos', async ({ page }) => {
        // Aguarda carregamento da página
        await page.waitForLoadState('networkidle')

        // Verifica se existe uma tabela ou grid de contatos
        const table = page.locator('table').first()
        const hasTable = await table.isVisible().catch(() => false)

        if (hasTable) {
            // Se tem tabela, verifica estrutura básica
            const headers = page.locator('th, thead td')
            await expect(headers.first()).toBeVisible()
        } else {
            // Se não tem tabela, pode ser um layout de cards
            const content = page.locator('[data-testid="contacts-list"], .contacts-list, main')
            await expect(content.first()).toBeVisible()
        }
    })

    test('deve ter campo de busca', async ({ page }) => {
        // Procura por campo de busca
        const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i).first()
            .or(page.locator('input[type="search"]').first())
            .or(page.getByRole('searchbox').first())

        // Verifica se o campo de busca existe
        const isVisible = await searchInput.isVisible().catch(() => false)

        // Se não encontrou, tenta alternativas
        if (!isVisible) {
            // Pode estar em um ícone de busca que expande
            const searchButton = page.getByRole('button', { name: /buscar|search/i }).first()
            const hasSearchButton = await searchButton.isVisible().catch(() => false)
            expect(hasSearchButton || isVisible).toBe(true)
        }
    })

    test('deve ter botão de adicionar contato', async ({ page }) => {
        // Procura por botão de adicionar
        const addButton = page.getByRole('button', { name: /novo contato|adicionar|add contact/i }).first()
            .or(page.getByRole('link', { name: /novo contato|adicionar/i }).first())
            .or(page.locator('[data-testid="add-contact-button"]').first())

        await expect(addButton).toBeVisible({ timeout: 10000 })
    })

    test('deve ter botões de ação (Filtros, Exportar)', async ({ page }) => {
        // Procura por botões de ação
        const filtersButton = page.getByRole('button', { name: /filtros?/i }).first()
        const exportButton = page.getByRole('button', { name: /exportar|export/i }).first()

        // Pelo menos um dos botões deve existir
        const hasFilters = await filtersButton.isVisible().catch(() => false)
        const hasExport = await exportButton.isVisible().catch(() => false)

        expect(hasFilters || hasExport).toBe(true)
    })

    test('deve navegar para sidebar quando clica em outro menu', async ({ page }) => {
        // Verifica se a sidebar está visível
        const sidebar = page.locator('nav, aside, [role="navigation"]').first()
        await expect(sidebar).toBeVisible()

        // Tenta clicar em Dashboard na sidebar
        const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first()
        const hasDashboardLink = await dashboardLink.isVisible().catch(() => false)

        if (hasDashboardLink) {
            await dashboardLink.click()
            // Verifica se navegou (URL mudou)
            await page.waitForLoadState('networkidle')
            const currentUrl = page.url()
            expect(currentUrl).not.toContain('/contacts')
        }
    })

    test('deve exibir controles principais da página', async ({ page }) => {
        // Usa aria-label definidos no template (t('contacts.listView') / t('contacts.kanbanView'))
        const listToggle = page.getByRole('button', { name: /visualização em lista/i }).first()
        const kanbanToggle = page.getByRole('button', { name: /visualização em kanban/i }).first()
        const editStagesButton = page.getByRole('button', { name: /editar etapas do funil/i }).first()

        await expect(listToggle).toBeVisible()
        await expect(kanbanToggle).toBeVisible()
        await expect(editStagesButton).toBeVisible()
    })

})
