/**
 * E2E Tests: Projects List - Dropdown Actions
 * Tests T046-T054
 */

import { test, expect } from '@playwright/test'
import { navigateTo, waitForText, assertRoute } from '../helpers/navigation'
import { assertNoConsoleErrors } from '../helpers/assertions'
import { ProjectsPage } from '../pages/ProjectsPage'
import { injectMockAuth } from '../helpers/auth-bypass'

test.describe('Fase 4: Testes de Dropdown de Ações', () => {
    let projectsPage: ProjectsPage

    test.beforeEach(async ({ page }) => {
        // Inject mock auth to bypass login/onboarding
        await injectMockAuth(page, {
            onboardingCompleted: true,
            projectId: 'mock-project-001',
            companyId: 'mock-company-001'
        })

        // Setup: Navigate to projects page
        await navigateTo(page, 'pt', 'projects')
        projectsPage = new ProjectsPage(page)

        // Wait for "Projeto Demo" to load
        await waitForText(page, 'Projeto Demo')
    })

    test('T046 [US3]: Clicar botão "..." abre dropdown com 5 ações', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Verify all 5 actions are visible
        await expect(page.getByRole('button', { name: 'Ver detalhes' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Editar' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Duplicar' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Arquivar' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Excluir' })).toBeVisible()
    })

    test('T047 [US3]: "Ver detalhes" navega para dashboard', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Ver detalhes"
        await projectsPage.clickDropdownAction('Ver detalhes')

        // Verify navigation to dashboard
        await page.waitForURL(/\/pt\/projects\/mock-project-001\/dashboard-v2/, { timeout: 10000 })

        // Verify dashboard loaded
        await waitForText(page, 'Projeto Demo')
    })

    test('T048 [US3]: "Editar" navega para wizard com projectId', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Editar"
        await projectsPage.clickDropdownAction('Editar')

        // Verify navigation to wizard with projectId
        await page.waitForURL(/\/pt\/project\/new\?projectId=mock-project-001/, { timeout: 10000 })

        // Verify wizard loaded
        await waitForText(page, 'Informações do Projeto')
    })

    test('T049 [US3]: "Duplicar" cria novo projeto com nome "(cópia)"', async ({ page }) => {
        // Track console for success message
        const consoleMessages: string[] = []
        page.on('console', (msg) => {
            consoleMessages.push(msg.text())
        })

        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Duplicar"
        await projectsPage.clickDropdownAction('Duplicar')

        // Verify navigation to wizard for new project
        await page.waitForURL(/\/pt\/project\/new\?projectId=mock-project-\d+/, { timeout: 10000 })

        // Verify console shows success
        expect(consoleMessages.some(msg => msg.includes('Projeto duplicado com sucesso'))).toBe(true)
    })

    test('T050 [US3]: "Arquivar" atualiza status do projeto', async ({ page }) => {
        // Track console for API call
        const consoleMessages: string[] = []
        page.on('console', (msg) => {
            consoleMessages.push(msg.text())
        })

        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Arquivar"
        await projectsPage.clickDropdownAction('Arquivar')

        // Wait for page to reload/update
        await page.waitForTimeout(1000)

        // Verify console shows API PATCH call
        expect(consoleMessages.some(msg => msg.includes('Mock Mode') && msg.includes('patch'))).toBe(true)
    })

    test('T051 [US3]: "Excluir" exibe modal de confirmação', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Excluir"
        await projectsPage.clickDropdownAction('Excluir')

        // Verify modal appears
        const modal = page.getByRole('dialog', { name: /excluir projeto/i })
        await expect(modal).toBeVisible()

        // Verify modal content
        await expect(page.getByText(/tem certeza que deseja excluir/i)).toBeVisible()
        await expect(page.getByRole('button', { name: /sim, excluir projeto/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible()
    })

    test('T052 [US3]: Confirmar exclusão remove projeto da lista', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Excluir"
        await projectsPage.clickDropdownAction('Excluir')

        // Wait for modal
        const modal = page.getByRole('dialog', { name: /excluir projeto/i })
        await expect(modal).toBeVisible()

        // Click "Sim, excluir projeto"
        await page.getByRole('button', { name: /sim, excluir projeto/i }).click()

        // Wait for modal to close
        await expect(modal).not.toBeVisible()

        // Verify empty state appears
        await projectsPage.waitForEmptyState()

        // Verify statistics reset
        const totalProjects = await projectsPage.getStatValue('Total de Projetos')
        expect(totalProjects).toBe('0')
    })

    test('T053 [US3]: Cancelar exclusão fecha modal sem alterar projeto', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Click "Excluir"
        await projectsPage.clickDropdownAction('Excluir')

        // Wait for modal
        const modal = page.getByRole('dialog', { name: /excluir projeto/i })
        await expect(modal).toBeVisible()

        // Click "Cancelar"
        await page.getByRole('button', { name: /cancelar/i }).click()

        // Verify modal closed
        await expect(modal).not.toBeVisible()

        // Verify project still in list
        await expect(page.getByText('Projeto Demo')).toBeVisible()
    })

    test('T054 [US3]: Dropdown fecha após selecionar ação', async ({ page }) => {
        // Open dropdown
        await projectsPage.openDropdown('Projeto Demo')

        // Verify dropdown is open (check for first dropdown item)
        await expect(page.getByRole('button', { name: 'Ver detalhes' })).toBeVisible()

        // Click any action (Ver detalhes)
        await projectsPage.clickDropdownAction('Ver detalhes')

        // Dropdown should close (navigation happens)
        await page.waitForURL(/\/dashboard-v2/, { timeout: 5000 })
    })

    test('T123 [US9]: Ações de dropdown não exibem erros no console', async ({ page }) => {
        const errors = await assertNoConsoleErrors(page)

        // Open dropdown and test action
        await projectsPage.openDropdown('Projeto Demo')

        // Wait for dropdown to be stable
        await expect(page.getByRole('button', { name: 'Ver detalhes' })).toBeVisible()

        await projectsPage.clickDropdownAction('Ver detalhes')

        // Wait for dashboard to load
        await page.waitForTimeout(2000)

        // Check for errors
        expect(errors).toHaveLength(0)
    })
})
