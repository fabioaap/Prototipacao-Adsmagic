/**
 * Helper para bypass de autenticação em testes E2E
 * 
 * Injeta estado mock no localStorage para simular usuário autenticado
 * permitindo testar páginas que requerem auth sem passar pelo fluxo de login
 */

import { Page } from '@playwright/test'

/**
 * Dados mock para autenticação bypass
 */
const MOCK_AUTH_DATA = {
    token: 'mock-jwt-token',
    user: {
        id: 'mock-user-id',
        email: 'test@adsmagic.com',
        name: 'Usuário de Teste',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    onboardingStatus: {
        isCompleted: true,
        completedAt: new Date().toISOString()
    },
    companyId: 'mock-company-001',
    projectId: 'mock-project-001'
}

/**
 * Injeta autenticação mock no localStorage
 * 
 * @param page - Instância do Playwright Page
 * @param options - Opções customizadas (opcional)
 */
export async function injectMockAuth(
    page: Page,
    options: {
        onboardingCompleted?: boolean
        projectId?: string
        companyId?: string
    } = {}
) {
    const {
        onboardingCompleted = true,
        projectId = MOCK_AUTH_DATA.projectId,
        companyId = MOCK_AUTH_DATA.companyId
    } = options

    // Primeiro navega para uma página do domínio para poder acessar localStorage
    await page.goto('/pt/login')

    // Injeta dados de autenticação no localStorage
    await page.evaluate(({ token, user, onboardingStatus, companyId, projectId, onboardingCompleted }) => {
        // Auth data
        localStorage.setItem('adsmagic_auth_token', token)
        localStorage.setItem('adsmagic_user_data', JSON.stringify(user))
        localStorage.setItem('adsmagic_onboarding_status', JSON.stringify({
            isCompleted: onboardingCompleted,
            completedAt: onboardingCompleted ? new Date().toISOString() : null
        }))

        // Company e Project
        localStorage.setItem('current_company_id', companyId)
        localStorage.setItem('current_project_id', projectId)
    }, {
        token: MOCK_AUTH_DATA.token,
        user: MOCK_AUTH_DATA.user,
        onboardingStatus: MOCK_AUTH_DATA.onboardingStatus,
        companyId,
        projectId,
        onboardingCompleted
    })
}

/**
 * Navega para uma página autenticada
 * Combina injeção de auth + navegação
 * 
 * @param page - Instância do Playwright Page
 * @param path - Caminho da página (ex: '/pt/projects/mock-project-001/contacts')
 */
export async function navigateAuthenticated(
    page: Page,
    path: string,
    options: {
        onboardingCompleted?: boolean
        projectId?: string
        companyId?: string
    } = {}
) {
    // Injeta autenticação
    await injectMockAuth(page, options)

    // Navega para a página desejada
    await page.goto(path)

    // Aguarda a página carregar
    await page.waitForLoadState('networkidle')
}

/**
 * Limpa dados de autenticação do localStorage
 * Útil para testar estados de logout
 * 
 * @param page - Instância do Playwright Page
 */
export async function clearMockAuth(page: Page) {
    await page.evaluate(() => {
        localStorage.removeItem('adsmagic_auth_token')
        localStorage.removeItem('adsmagic_user_data')
        localStorage.removeItem('adsmagic_onboarding_status')
        localStorage.removeItem('current_company_id')
        localStorage.removeItem('current_project_id')
    })
}
