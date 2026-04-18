import { test, expect } from '@playwright/test'

/**
 * Smoke test de usabilidade para a página de contatos
 * Usa a rota /pt/test-contacts (não requer auth)
 * Verifica elementos principais da UI e interações básicas
 */

test.describe('Contacts Page - Usability Smoke', () => {
    test.beforeEach(async ({ page }) => {
        // Injeta project ID para que o stagesStore carregue os mock stages (sem auth)
        await page.addInitScript(() => {
            localStorage.setItem('current_project_id', '2')
        })
        // Navega para a página de teste de contatos
        await page.goto('/pt/test-contacts')
        // Aguarda a página carregar completamente
        await page.waitForLoadState('networkidle')
    })

    test('deve renderizar o header e título da página', async ({ page }) => {
        // Verifica título principal (é "Contacts System Test" em inglês)
        await expect(page.getByRole('heading', { name: /contacts system test/i })).toBeVisible()

        // Verifica descrição
        await expect(page.getByText(/sistema completo de gerenciamento de contatos/i)).toBeVisible()
    })

    test('deve exibir os botões de toggle de view (Kanban/Lista)', async ({ page }) => {
        // Botões de toggle no header
        const kanbanButton = page.getByRole('button', { name: /kanban/i }).first()
        const listaButton = page.getByRole('button', { name: /lista/i }).first()

        await expect(kanbanButton).toBeVisible()
        await expect(listaButton).toBeVisible()
    })

    test('deve exibir os cards informativos', async ({ page }) => {
        // Cards de info
        await expect(page.getByText('📋 Componentes Criados')).toBeVisible()
        await expect(page.getByText('✨ Funcionalidades')).toBeVisible()
        await expect(page.getByText('🎨 Padrões Usados')).toBeVisible()
    })

    test('deve alternar entre views Kanban e Lista via tabs', async ({ page }) => {
        // Tab Kanban Board
        const tabKanban = page.getByRole('tab', { name: /kanban board/i })
        const tabLista = page.getByRole('tab', { name: /lista/i })

        await expect(tabKanban).toBeVisible()
        await expect(tabLista).toBeVisible()

        // Clica na tab Lista
        await tabLista.click()

        // Verifica que a view lista está ativa
        await expect(page.getByRole('heading', { name: /visualização lista/i })).toBeVisible()

        // Volta para Kanban
        await tabKanban.click()

        // Verifica que a view kanban está ativa
        await expect(page.getByRole('heading', { name: /visualização kanban/i })).toBeVisible()
    })

    test('deve exibir o botão de adicionar contato', async ({ page }) => {
        // Botão de adicionar contato (na view kanban)
        const addButton = page.getByRole('button', { name: /adicionar contato/i }).first()
        await expect(addButton).toBeVisible()
    })

    test('deve exibir o kanban com colunas de estágio', async ({ page }) => {
        // Verifica as colunas do Kanban (pelo menos algumas etapas)
        await expect(page.getByRole('heading', { name: /contato iniciado/i })).toBeVisible()
        await expect(page.getByRole('heading', { name: /qualificação/i })).toBeVisible()
        await expect(page.getByRole('heading', { name: /proposta enviada/i })).toBeVisible()
        await expect(page.getByRole('heading', { name: /negociação/i })).toBeVisible()
        await expect(page.getByRole('heading', { name: /venda realizada/i })).toBeVisible()
    })

    test('deve exibir a seção Como Funciona', async ({ page }) => {
        // Seção explicativa
        await expect(page.getByRole('heading', { name: /como funciona/i })).toBeVisible()

        // Subseções
        await expect(page.getByText(/arraste os cards entre as colunas/i)).toBeVisible()
        await expect(page.getByText(/use a busca para filtrar contatos/i)).toBeVisible()
        await expect(page.getByText(/o formulário usa validação zod/i)).toBeVisible()
    })
})
