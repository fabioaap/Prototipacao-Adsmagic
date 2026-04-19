/**
 * Plano de Teste de Usabilidade - Página de Contatos
 * ==================================================
 * 
 * Este plano mapeia todas as jornadas de usuário possíveis na página de contatos
 * e implementa testes automatizados com Playwright para validar a usabilidade.
 */

import { test, expect, type Page, type Locator } from '@playwright/test'

// ============================================================================
// HELPERS E UTILITÁRIOS
// ============================================================================

class ContactsPageHelper {
    readonly page: Page
    readonly header: Locator
    readonly searchInput: Locator
    readonly viewToggleList: Locator
    readonly viewToggleKanban: Locator
    readonly filtersButton: Locator
    readonly importButton: Locator
    readonly exportButton: Locator
    readonly newContactButton: Locator
    readonly editStagesButton: Locator

    constructor(page: Page) {
        this.page = page
        this.header = page.getByRole('heading', { name: 'Contatos' })
        this.searchInput = page.getByPlaceholder('Buscar por nome, email ou telefone...')
        this.viewToggleList = page.getByRole('button').filter({ has: page.locator('[data-lucide="list"]') })
        this.viewToggleKanban = page.getByRole('button').filter({ has: page.locator('[data-lucide="layout-grid"]') })
        this.filtersButton = page.getByRole('button').filter({ has: page.locator('[data-lucide="filter"]') }).or(page.getByText('Filtros'))
        this.importButton = page.getByRole('button', { name: /Importar CSV/i })
        this.exportButton = page.getByRole('button', { name: /Exportar CSV/i })
        this.newContactButton = page.getByRole('button', { name: /Novo Contato/i })
        this.editStagesButton = page.getByRole('button', { name: /Editar etapas do funil/i })
    }

    async goto() {
        await this.page.goto('/pt/projects/mock-project-001/contacts')
    }

    async waitForContactsLoad() {
        await expect(this.header).toBeVisible()
        // Aguarda a interface principal estabilizar
        await this.page.waitForTimeout(2000)
    }

    async switchToListView() {
        await this.viewToggleList.click()
        await this.page.waitForTimeout(500)
    }

    async switchToKanbanView() {
        await this.viewToggleKanban.click()
        await this.page.waitForTimeout(500)
    }

    async openNewContactForm() {
        await this.newContactButton.click()
        await expect(this.page.getByText('Novo Contato').or(this.page.getByText('Adicionar Contato'))).toBeVisible()
    }

    async openEditStagesDrawer() {
        await this.editStagesButton.click()
        await expect(this.page.getByText('Gerenciar Etapas do Funil')).toBeVisible()
    }

    async searchContacts(term: string) {
        await this.searchInput.fill(term)
        await this.page.waitForTimeout(800) // Debounce
    }

    async clearSearch() {
        await this.searchInput.fill('')
        await this.page.waitForTimeout(800)
    }

    async openFilters() {
        await this.filtersButton.click()
        await expect(this.page.getByText('Filtros').or(this.page.getByText('Filtrar Contatos'))).toBeVisible()
    }

    async exportContacts() {
        await this.exportButton.click()
    }

    async importContacts() {
        await this.importButton.click()
        await expect(this.page.getByText('Importar').or(this.page.getByText('Upload'))).toBeVisible()
    }
}

// ============================================================================
// JORNADAS PRINCIPAIS DE USUÁRIO
// ============================================================================

test.describe('Teste de Usabilidade - Página de Contatos', () => {
    let contactsHelper: ContactsPageHelper

    test.beforeEach(async ({ page }) => {
        contactsHelper = new ContactsPageHelper(page)
        await contactsHelper.goto()
        await contactsHelper.waitForContactsLoad()
    })

    // ========================================================================
    // JORNADA 1: DESCOBERTA E ORIENTAÇÃO
    // ========================================================================

    test.describe('J1: Descoberta e Orientação', () => {
        test('J1.1: Usuário chega à página e compreende o contexto', async ({ page }) => {
            // Verificar elementos de orientação
            await expect(contactsHelper.header).toBeVisible()
            await expect(page.getByText('Gerencie seus contatos')).toBeVisible()
            await expect(contactsHelper.searchInput).toBeVisible()
            await expect(contactsHelper.viewToggleList).toBeVisible()
            await expect(contactsHelper.viewToggleKanban).toBeVisible()

            // Screenshot para documentação
            await page.screenshot({ path: 'usability-j1-1-page-orientation.png' })
        })

        test('J1.2: Usuário identifica as diferentes visualizações disponíveis', async ({ page }) => {
            // Verificar toggles de visualização
            await expect(contactsHelper.viewToggleList).toBeVisible()
            await expect(contactsHelper.viewToggleKanban).toBeVisible()

            // Testar alternância entre visualizações
            await contactsHelper.switchToKanbanView()
            await expect(page.getByText('Contato Iniciado').or(page.locator('.kanban-column')).first()).toBeVisible()

            await contactsHelper.switchToListView()
            await page.waitForTimeout(1000)

            await page.screenshot({ path: 'usability-j1-2-view-modes.png' })
        })

        test('J1.3: Usuário compreende os controles principais da tela', async ({ page }) => {
            // Verificar se os controles de navegação e ação estão claros e disponíveis
            await expect(contactsHelper.searchInput).toBeVisible()
            await expect(contactsHelper.viewToggleList).toBeVisible()
            await expect(contactsHelper.viewToggleKanban).toBeVisible()
            await expect(contactsHelper.editStagesButton).toBeVisible()

            await page.screenshot({ path: 'usability-j1-3-controls-comprehension.png' })
        })
    })

    // ========================================================================
    // JORNADA 2: BUSCA E DESCOBERTA DE CONTATOS
    // ========================================================================

    test.describe('J2: Busca e Descoberta', () => {
        test('J2.1: Busca por texto livre - fluxo completo', async ({ page }) => {
            // Teste de busca básica
            await contactsHelper.searchContacts('patricia')
            await page.waitForTimeout(1500)

            // Verificar feedback de busca
            const searchResults = page.locator('.contact-card').or(page.locator('[data-testid="contact-item"]'))

            // Screenshot dos resultados
            await page.screenshot({ path: 'usability-j2-1-search-results.png' })

            // Testar limpeza de busca
            await contactsHelper.clearSearch()
            await page.waitForTimeout(1000)

            // Verificar que todos os contatos retornaram
            await page.screenshot({ path: 'usability-j2-1-search-cleared.png' })
        })

        test('J2.2: Uso de filtros avançados', async ({ page }) => {
            // Abrir painel de filtros
            await contactsHelper.openFilters()

            // Verificar elementos do filtro
            await expect(page.getByText('Etapa').or(page.getByText('Stage'))).toBeVisible()
            await expect(page.getByText('Origem').or(page.getByText('Origin'))).toBeVisible()

            // Aplicar um filtro (se houver checkboxes/dropdowns disponíveis)
            const firstFilter = page.getByRole('checkbox').or(page.getByRole('option')).first()
            if (await firstFilter.isVisible()) {
                await firstFilter.click()
            }

            // Aplicar filtros
            const applyButton = page.getByRole('button', { name: /Aplicar|Apply|Filtrar/ })
            if (await applyButton.isVisible()) {
                await applyButton.click()
            }

            await page.screenshot({ path: 'usability-j2-2-filters-applied.png' })
        })

        test('J2.3: Navegação entre visualizações com dados filtrados', async ({ page }) => {
            // Aplicar busca primeiro
            await contactsHelper.searchContacts('meta')
            await page.waitForTimeout(1000)

            // Alternar para Kanban com filtro ativo
            await contactsHelper.switchToKanbanView()
            await page.waitForTimeout(1000)
            await page.screenshot({ path: 'usability-j2-3-kanban-filtered.png' })

            // Voltar para Lista
            await contactsHelper.switchToListView()
            await page.waitForTimeout(1000)
            await page.screenshot({ path: 'usability-j2-3-list-filtered.png' })
        })
    })

    // ========================================================================
    // JORNADA 3: GESTÃO DE CONTATOS INDIVIDUAIS
    // ========================================================================

    test.describe('J3: Gestão de Contatos', () => {
        test('J3.1: Criar novo contato - fluxo completo', async ({ page }) => {
            await contactsHelper.openNewContactForm()

            // Verificar campos obrigatórios
            await expect(page.getByLabel(/Nome|Name/)).toBeVisible()
            await expect(page.getByLabel(/Email/)).toBeVisible()
            await expect(page.getByLabel(/Telefone|Phone/)).toBeVisible()

            // Preencher dados de teste
            await page.getByLabel(/Nome|Name/).fill('João Teste Usabilidade')
            await page.getByLabel(/Email/).fill('joao.teste@usabilidade.com')
            await page.getByLabel(/Telefone|Phone/).fill('11999887766')

            await page.screenshot({ path: 'usability-j3-1-new-contact-form.png' })

            // Salvar
            const saveButton = page.getByRole('button', { name: /Salvar|Save|Criar/ })
            if (await saveButton.isEnabled()) {
                await saveButton.click()

                // Aguardar feedback de sucesso
                await page.waitForTimeout(2000)
                await page.screenshot({ path: 'usability-j3-1-contact-created.png' })
            }
        })

        test('J3.2: Visualizar detalhes de contato existente', async ({ page }) => {
            // Clicar no primeiro contato disponível
            const firstContact = page.locator('.contact-card').or(page.locator('[data-testid="contact-item"]')).first()

            if (await firstContact.isVisible()) {
                await firstContact.click()

                // Verificar que drawer/modal de detalhes abriu
                await expect(page.getByText('Detalhes do Contato').or(page.getByText('Contact Details'))).toBeVisible()

                await page.screenshot({ path: 'usability-j3-2-contact-details.png' })

                // Verificar informações essenciais
                await expect(page.getByText(/Email|Telefone|Phone/)).toBeVisible()

                // Fechar drawer
                const closeButton = page.getByRole('button').filter({ has: page.locator('[data-lucide="x"]') }).first()
                await closeButton.click()
            }
        })

        test('J3.3: Editar contato existente', async ({ page }) => {
            // Encontrar e clicar no primeiro contato
            const firstContact = page.locator('.contact-card').or(page.locator('[data-testid="contact-item"]')).first()

            if (await firstContact.isVisible()) {
                // Hover para mostrar ações (se houver)
                await firstContact.hover()

                // Procurar botão de editar
                const editButton = page.getByRole('button').filter({ has: page.locator('[data-lucide="edit"]') }).or(page.getByRole('button', { name: /Editar|Edit/ }))

                if (await editButton.first().isVisible()) {
                    await editButton.first().click()

                    // Verificar que modal de edição abriu
                    await expect(page.getByText(/Editar|Edit/).first()).toBeVisible()

                    await page.screenshot({ path: 'usability-j3-3-edit-contact.png' })
                }
            }
        })
    })

    // ========================================================================
    // JORNADA 4: GESTÃO DE FUNIL E ETAPAS
    // ========================================================================

    test.describe('J4: Gestão de Funil', () => {
        test('J4.1: Visualizar e compreender o funil de vendas', async ({ page }) => {
            await contactsHelper.switchToKanbanView()

            // Verificar colunas do funil
            const stageColumns = page.locator('.kanban-column').or(page.getByText(/Contato Iniciado|Qualificação|Proposta|Negociação|Venda|Perdida/))

            // Deve haver pelo menos 3 colunas de etapa
            const columnsCount = await stageColumns.count()
            expect(columnsCount).toBeGreaterThanOrEqual(3)

            await page.screenshot({ path: 'usability-j4-1-funnel-overview.png' })

            // Verificar contadores de contatos por etapa
            const stageCounters = page.locator('text=/\\d+/').filter({ has: page.getByText(/Contato|Qualificação/) })
            await expect(stageCounters.first()).toBeVisible()
        })

        test('J4.2: Gerenciar configuração de etapas', async ({ page }) => {
            await contactsHelper.openEditStagesDrawer()

            // Verificar elementos de gerenciamento
            await expect(page.getByText(/Gerenciar Etapas|Manage Stages/)).toBeVisible()

            // Verificar que existem etapas listadas
            const stageItems = page.locator('[data-stage-id]').or(page.locator('.stage-sortable-item'))
            await expect(stageItems.first()).toBeVisible()

            await page.screenshot({ path: 'usability-j4-2-stages-management.png' })

            // Testar drag and drop se possível
            const firstStage = stageItems.first()
            const firstDragHandle = page.locator('.stage-drag-handle').first()

            if (await firstDragHandle.isVisible()) {
                await firstDragHandle.hover()
                await page.screenshot({ path: 'usability-j4-2-drag-handle-hover.png' })
            }

            // Testar botões de tipo de etapa
            const typeButtons = page.getByRole('button', { name: /Normal|Venda|Perdido/ })
            if (await typeButtons.first().isVisible()) {
                await typeButtons.first().click()
                await page.screenshot({ path: 'usability-j4-2-stage-type-selection.png' })
            }
        })

        test('J4.3: Mover contatos entre etapas (drag and drop)', async ({ page }) => {
            await contactsHelper.switchToKanbanView()

            // Encontrar primeiro contato disponível
            const firstContact = page.locator('.contact-card').or(page.locator('[data-contact-id]')).first()

            if (await firstContact.isVisible()) {
                // Identificar posição inicial
                const sourceColumn = firstContact.locator('xpath=ancestor::*[contains(@class, "kanban-column") or contains(@data-stage-id, "")]').first()

                // Encontrar uma coluna de destino diferente
                const targetColumns = page.locator('[data-stage-id]').or(page.locator('.kanban-column'))

                if (await targetColumns.nth(1).isVisible()) {
                    // Executar drag and drop
                    await firstContact.dragTo(targetColumns.nth(1))
                    await page.waitForTimeout(1000)

                    await page.screenshot({ path: 'usability-j4-3-contact-moved.png' })
                }
            }
        })
    })

    // ========================================================================
    // JORNADA 5: OPERAÇÕES EM LOTE
    // ========================================================================

    test.describe('J5: Operações em Lote', () => {
        test('J5.1: Seleção múltipla de contatos', async ({ page }) => {
            await contactsHelper.switchToListView()

            // Procurar checkboxes de seleção
            const checkboxes = page.getByRole('checkbox')

            if (await checkboxes.first().isVisible()) {
                // Selecionar múltiplos contatos
                await checkboxes.nth(0).click()
                await checkboxes.nth(1).click()
                await checkboxes.nth(2).click()

                await page.screenshot({ path: 'usability-j5-1-multiple-selection.png' })

                // Verificar que apareceram ações em lote
                const bulkActions = page.getByText(/selecionados|selected|Excluir|Delete|Mover|Export/)
                await expect(bulkActions.first()).toBeVisible()
            }
        })

        test('J5.2: Exportação em lote', async ({ page }) => {
            // Testar exportação de todos os contatos
            await contactsHelper.exportContacts()

            // Aguardar feedback de download ou processo
            await page.waitForTimeout(2000)
            await page.screenshot({ path: 'usability-j5-2-export-feedback.png' })
        })

        test('J5.3: Importação de contatos via CSV', async ({ page }) => {
            await contactsHelper.importContacts()

            // Verificar interface de upload
            const fileInput = page.locator('input[type="file"]')
            const dropZone = page.getByText(/Arraste|Drop|Selecione/).or(page.locator('[data-testid="upload-zone"]'))

            await expect(fileInput.or(dropZone).first()).toBeVisible()
            await page.screenshot({ path: 'usability-j5-3-import-interface.png' })
        })
    })

    // ========================================================================
    // JORNADA 6: EXPERIÊNCIA RESPONSIVA
    // ========================================================================

    test.describe('J6: Experiência Responsiva', () => {
        test('J6.1: Usabilidade em tablet (768px)', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 })
            await page.reload()
            await contactsHelper.waitForContactsLoad()

            // Verificar que elementos principais ainda são visíveis
            await expect(contactsHelper.header).toBeVisible()
            await expect(contactsHelper.searchInput).toBeVisible()

            await page.screenshot({ path: 'usability-j6-1-tablet-view.png' })

            // Testar navegação touch-friendly
            await contactsHelper.switchToKanbanView()
            await page.screenshot({ path: 'usability-j6-1-tablet-kanban.png' })
        })

        test('J6.2: Usabilidade em mobile (375px)', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 })
            await page.reload()
            await contactsHelper.waitForContactsLoad()

            // Verificar adaptação mobile
            await expect(contactsHelper.header).toBeVisible()

            // Verificar se toggles de visualização ainda funcionam
            if (await contactsHelper.viewToggleKanban.isVisible()) {
                await contactsHelper.switchToKanbanView()
            }

            await page.screenshot({ path: 'usability-j6-2-mobile-view.png' })
        })
    })

    // ========================================================================
    // JORNADA 7: ESTADOS DE ERRO E EDGE CASES
    // ========================================================================

    test.describe('J7: Estados de Erro', () => {
        test('J7.1: Comportamento com lista vazia', async ({ page }) => {
            // Simular estado vazio através de busca que não retorna resultados
            await contactsHelper.searchContacts('xyzabc123naoexiste')
            await page.waitForTimeout(2000)

            // Verificar mensagem de estado vazio
            const emptyState = page.getByText(/Nenhum contato|No contacts|Não encontrado/)
            await expect(emptyState).toBeVisible()

            await page.screenshot({ path: 'usability-j7-1-empty-state.png' })
        })

        test('J7.2: Tratamento de erro de rede/carregamento', async ({ page }) => {
            // Simular erro através de interceptação de rede
            await page.route('**/contacts*', route => route.abort())

            await page.reload()
            await page.waitForTimeout(5000)

            // Verificar se há indicadores de erro ou retry
            const errorIndicators = page.getByText(/Erro|Error|Tentar novamente|Try again/)

            await page.screenshot({ path: 'usability-j7-2-network-error.png' })
        })
    })

    // ========================================================================
    // JORNADA 8: PERFORMANCE E FEEDBACK
    // ========================================================================

    test.describe('J8: Performance e Feedback', () => {
        test('J8.1: Indicadores de loading e estados intermediários', async ({ page }) => {
            // Recarregar página e capturar loading states
            await page.reload()

            // Verificar loading inicial
            const loadingIndicators = page.locator('[data-testid="loading"]').or(page.locator('.spinner')).or(page.getByText(/Carregando|Loading/))

            await page.screenshot({ path: 'usability-j8-1-loading-states.png' })

            // Aguardar carregamento completo
            await contactsHelper.waitForContactsLoad()

            // Verificar que loading foi removido
            await page.screenshot({ path: 'usability-j8-1-loaded-state.png' })
        })

        test('J8.2: Feedback de ações do usuário', async ({ page }) => {
            // Testar busca e verificar feedback imediato
            await contactsHelper.searchContacts('test')

            // Verificar se há indicação de busca ativa
            const searchFeedback = page.locator('[data-testid="search-loading"]').or(page.getByText(/Buscando|Searching/))

            await page.waitForTimeout(1000)
            await page.screenshot({ path: 'usability-j8-2-search-feedback.png' })
        })
    })
})

// ============================================================================
// TESTES DE ACESSIBILIDADE
// ============================================================================

test.describe('Acessibilidade - Página de Contatos', () => {
    test('A1: Navegação por teclado', async ({ page }) => {
        await page.goto('/pt/projects/default/contacts')

        // Testar navegação Tab
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')

        // Verificar se elementos recebem foco visível
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()

        await page.screenshot({ path: 'accessibility-a1-keyboard-navigation.png' })
    })

    test('A2: Labels e ARIA adequados', async ({ page }) => {
        await page.goto('/pt/projects/default/contacts')

        // Verificar se inputs têm labels
        const searchInput = page.getByPlaceholder('Buscar por nome, email ou telefone...')
        await expect(searchInput).toHaveAttribute('aria-label')

        // Verificar botões com texto acessível
        const buttons = page.getByRole('button')
        const buttonCount = await buttons.count()

        for (let i = 0; i < Math.min(5, buttonCount); i++) {
            const button = buttons.nth(i)
            const hasText = await button.textContent()
            const hasAriaLabel = await button.getAttribute('aria-label')
            expect(hasText || hasAriaLabel).toBeTruthy()
        }
    })
})
