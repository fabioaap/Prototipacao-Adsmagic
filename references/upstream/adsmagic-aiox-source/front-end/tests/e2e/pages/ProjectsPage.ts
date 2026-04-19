/**
 * Page Object for Projects List page
 */

import type { Page, Locator } from '@playwright/test'

export class ProjectsPage {
    readonly page: Page
    readonly createProjectButton: Locator
    readonly searchInput: Locator
    readonly filtersButton: Locator
    readonly sortSelect: Locator
    readonly projectsTable: Locator

    constructor(page: Page) {
        this.page = page
        this.createProjectButton = page.getByRole('button', { name: /criar novo projeto/i })
        this.searchInput = page.getByPlaceholder(/pesquisar projeto/i)
        this.filtersButton = page.getByRole('button', { name: /filtros/i })
        this.sortSelect = page.locator('select, [role="combobox"]').first()
        this.projectsTable = page.getByRole('table')
    }

    async clickCreateProject(): Promise<void> {
        await this.createProjectButton.click()
    }

    async searchProject(name: string): Promise<void> {
        await this.searchInput.fill(name)
    }

    async openDropdown(projectName: string): Promise<void> {
        // Find the row containing the project name
        const row = this.page.getByRole('row').filter({ hasText: projectName })
        // Click the actions button (MoreHorizontal icon button)
        const actionsButton = row.getByRole('button').filter({ hasText: /^$/ })
        await actionsButton.click()

        // Wait for dropdown to be fully rendered and stable
        await this.page.waitForTimeout(500)
    }

    async clickDropdownAction(
        action: 'Ver detalhes' | 'Editar' | 'Duplicar' | 'Arquivar' | 'Excluir'
    ): Promise<void> {
        // Playwright will automatically wait for button to be actionable
        await this.page.getByRole('button', { name: action }).click()
    }

    async getProjectCount(): Promise<number> {
        const rows = this.projectsTable.getByRole('row')
        const count = await rows.count()
        // Subtract 1 for header row
        return Math.max(0, count - 1)
    }

    async waitForEmptyState(): Promise<void> {
        await this.page.getByText(/nenhum projeto encontrado/i).waitFor({ state: 'visible' })
    }

    async waitForProjectToAppear(projectName: string): Promise<void> {
        await this.page.getByText(projectName).first().waitFor({ state: 'visible', timeout: 10000 })
    }

    async getStatValue(statName: 'Total de Projetos' | 'Projetos Ativos' | 'Em Rascunho' | 'Taxa de Conclusão'): Promise<string> {
        // Find the stat card by its label
        const statLabel = this.page.getByText(statName, { exact: true })

        // Get the parent card container
        const statCard = statLabel.locator('xpath=ancestor::div[contains(@class,"rounded") or contains(@class,"card")][1]')

        // Find the numeric value (usually the first large text element before the label)
        const valueElement = statCard.locator('p, div, span').filter({ hasText: /^\d+$|^\d+%$/ }).first()

        const value = await valueElement.textContent()
        return value?.trim() || '0'
    }
}
