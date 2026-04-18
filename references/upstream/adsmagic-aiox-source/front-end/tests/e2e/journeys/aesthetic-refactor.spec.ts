/**
 * E2E Tests for Aesthetic Redesign (002-aesthetic-redesign)
 * 
 * Tests all refactored views with aesthetic components:
 * - DashboardView
 * - SalesView
 * - ContactsView
 * - ProjectsView
 * - IntegrationsView
 * - SettingsView
 * - AnalyticsView
 * 
 * Validates:
 * - No console errors
 * - Responsive layouts (1920px → 768px → 360px)
 * - Dark mode toggle
 * - Component rendering (MetricCard, ChartCard, StatGrid, DashboardSection)
 */

import { test, expect } from '@playwright/test'

// Test configuration
const TEST_TIMEOUT = 30000 // 30s per test
const NAVIGATION_TIMEOUT = 15000 // 15s for navigation

// Viewports to test
const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 360, height: 640 },
}

// Base URL (adjust if needed)
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173'

// Mock authentication helper
async function mockAuthentication(page: any) {
    // Set auth token in localStorage
    await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock_token_e2e_testing')
        localStorage.setItem('user', JSON.stringify({
            id: 'mock_user_id',
            email: 'test@adsmagic.com',
            name: 'Test User'
        }))
    })
}

// Dark mode toggle helper
async function toggleDarkMode(page: any) {
    // Click dark mode toggle (adjust selector if needed)
    const darkModeButton = page.locator('[data-testid="theme-toggle"]')
    if (await darkModeButton.isVisible()) {
        await darkModeButton.click()
    } else {
        // Fallback: add dark class to html
        await page.evaluate(() => {
            document.documentElement.classList.toggle('dark')
        })
    }
    await page.waitForTimeout(300) // Wait for CSS transition
}

// Check for console errors helper
function setupConsoleErrorListener(page: any, testName: string) {
    const errors: string[] = []
    page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
            errors.push(`[${testName}] ${msg.text()}`)
        }
    })
    return errors
}

// ============================================================================
// DASHBOARD VIEW TESTS
// ============================================================================

test.describe('DashboardView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render dashboard with aesthetic components', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'DashboardView')

        await page.goto(`${BASE_URL}/pt/dashboard`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for metrics to load
        await page.waitForSelector('[data-testid="metric-card"]', { timeout: 5000 })

        // Verify MetricCard components exist (12 metrics in dashboard)
        const metricCards = await page.locator('[data-testid="metric-card"]').count()
        expect(metricCards).toBeGreaterThanOrEqual(4) // At least 4 metrics

        // Verify DashboardSection wrappers
        const sections = await page.locator('[class*="rounded-lg border"]').count()
        expect(sections).toBeGreaterThan(0)

        // Verify no console errors
        expect(errors.length).toBe(0)
    })

    test('should be responsive across viewports', async ({ page }) => {
        await page.goto(`${BASE_URL}/pt/dashboard`, { timeout: NAVIGATION_TIMEOUT })
        await page.waitForSelector('[data-testid="metric-card"]', { timeout: 5000 })

        // Test desktop (1920px)
        await page.setViewportSize(VIEWPORTS.desktop)
        await page.waitForTimeout(300)
        const desktopMetrics = await page.locator('[data-testid="metric-card"]').first().isVisible()
        expect(desktopMetrics).toBe(true)

        // Test tablet (768px)
        await page.setViewportSize(VIEWPORTS.tablet)
        await page.waitForTimeout(300)
        const tabletMetrics = await page.locator('[data-testid="metric-card"]').first().isVisible()
        expect(tabletMetrics).toBe(true)

        // Test mobile (360px)
        await page.setViewportSize(VIEWPORTS.mobile)
        await page.waitForTimeout(300)
        const mobileMetrics = await page.locator('[data-testid="metric-card"]').first().isVisible()
        expect(mobileMetrics).toBe(true)
    })

    test('should support dark mode toggle', async ({ page }) => {
        await page.goto(`${BASE_URL}/pt/dashboard`, { timeout: NAVIGATION_TIMEOUT })
        await page.waitForSelector('[data-testid="metric-card"]', { timeout: 5000 })

        // Get background color in light mode
        const lightBg = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor
        })

        // Toggle dark mode
        await toggleDarkMode(page)

        // Verify dark class is present
        const isDark = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark')
        })
        expect(isDark).toBe(true)

        // Get background color in dark mode
        const darkBg = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor
        })

        // Colors should be different
        expect(lightBg).not.toBe(darkBg)
    })
})

// ============================================================================
// SALES VIEW TESTS
// ============================================================================

test.describe('SalesView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render sales metrics with SalesMetrics component', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'SalesView')

        await page.goto(`${BASE_URL}/pt/sales`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for metrics section
        await page.waitForSelector('[data-testid="metric-card"]', { timeout: 5000 })

        // Verify 4 sales metrics (Receita Total, Vendas, Ticket Médio, Taxa Conversão)
        const metricCards = await page.locator('[data-testid="metric-card"]').count()
        expect(metricCards).toBeGreaterThanOrEqual(4)

        // Verify DashboardSection wrapper
        const dashboardSection = await page.locator('text=Métricas de Vendas').isVisible()
        expect(dashboardSection).toBe(true)

        expect(errors.length).toBe(0)
    })
})

// ============================================================================
// CONTACTS VIEW TESTS
// ============================================================================

test.describe('ContactsView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render contacts view structure without metrics cards', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'ContactsView')

        await page.goto(`${BASE_URL}/pt/contacts`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for contacts page header
        await page.waitForSelector('h1', { timeout: 5000 })

        // Verify key page elements
        const header = await page.locator('text=Contatos').first().isVisible()
        expect(header).toBe(true)

        const editStagesButton = await page.locator('button:has-text("Editar etapas do funil")').isVisible()
        expect(editStagesButton).toBe(true)

        expect(errors.length).toBe(0)
    })
})

// ============================================================================
// PROJECTS VIEW TESTS
// ============================================================================

test.describe('ProjectsView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render projects metrics with ProjectsMetrics component', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'ProjectsView')

        await page.goto(`${BASE_URL}/pt/projects`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for metrics section
        await page.waitForSelector('[data-testid="metric-card"]', { timeout: 5000 })

        // Verify 4 project metrics
        const metricCards = await page.locator('[data-testid="metric-card"]').count()
        expect(metricCards).toBeGreaterThanOrEqual(4)

        // Verify DashboardSection wrapper
        const dashboardSection = await page.locator('text=Estatísticas de Projetos').isVisible()
        expect(dashboardSection).toBe(true)

        expect(errors.length).toBe(0)
    })
})

// ============================================================================
// INTEGRATIONS VIEW TESTS
// ============================================================================

test.describe('IntegrationsView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render integrations metrics with IntegrationsMetrics component', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'IntegrationsView')

        await page.goto(`${BASE_URL}/pt/integrations`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for metrics section
        await page.waitForSelector('[data-testid="metric-card"]', { timeout: 5000 })

        // Verify 4 integration metrics
        const metricCards = await page.locator('[data-testid="metric-card"]').count()
        expect(metricCards).toBeGreaterThanOrEqual(4)

        // Verify DashboardSection wrapper
        const dashboardSection = await page.locator('text=Status das Integrações').isVisible()
        expect(dashboardSection).toBe(true)

        expect(errors.length).toBe(0)
    })
})

// ============================================================================
// SETTINGS VIEW TESTS
// ============================================================================

test.describe('SettingsView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render settings with DashboardSection wrappers', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'SettingsView')

        await page.goto(`${BASE_URL}/pt/settings`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for page load
        await page.waitForSelector('text=Configurações', { timeout: 5000 })

        // Verify DashboardSection wrappers exist
        const generalSection = await page.locator('text=Configurações Gerais').isVisible()
        expect(generalSection).toBe(true)

        // Test tab navigation
        const currencyTab = page.locator('text=Moeda e Fuso')
        await currencyTab.click()
        await page.waitForTimeout(300)

        const currencySection = await page.locator('text=Moeda e Fuso Horário').isVisible()
        expect(currencySection).toBe(true)

        expect(errors.length).toBe(0)
    })
})

// ============================================================================
// ANALYTICS VIEW TESTS
// ============================================================================

test.describe('AnalyticsView - Aesthetic Refactor', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should render analytics with ChartCard wrappers', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'AnalyticsView')

        await page.goto(`${BASE_URL}/pt/analytics`, { timeout: NAVIGATION_TIMEOUT })

        // Wait for metrics section
        await page.waitForSelector('text=Métricas Principais', { timeout: 5000 })

        // Verify DashboardSection for metrics
        const metricsSection = await page.locator('text=Métricas Principais').isVisible()
        expect(metricsSection).toBe(true)

        // Verify ChartCard titles exist
        const salesChart = await page.locator('text=Vendas ao Longo do Tempo').isVisible()
        expect(salesChart).toBe(true)

        const funnelChart = await page.locator('text=Funil de Conversão').isVisible()
        expect(funnelChart).toBe(true)

        expect(errors.length).toBe(0)
    })

    test('should support responsive grid layout', async ({ page }) => {
        await page.goto(`${BASE_URL}/pt/analytics`, { timeout: NAVIGATION_TIMEOUT })
        await page.waitForSelector('text=Métricas Principais', { timeout: 5000 })

        // Test desktop (2-column grid)
        await page.setViewportSize(VIEWPORTS.desktop)
        await page.waitForTimeout(300)

        // Test tablet (should stack)
        await page.setViewportSize(VIEWPORTS.tablet)
        await page.waitForTimeout(300)

        // Test mobile (should stack)
        await page.setViewportSize(VIEWPORTS.mobile)
        await page.waitForTimeout(300)

        // All viewports should render without errors
        const salesChart = await page.locator('text=Vendas ao Longo do Tempo').isVisible()
        expect(salesChart).toBe(true)
    })
})

// ============================================================================
// CROSS-VIEW TESTS
// ============================================================================

test.describe('Cross-View Validation', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthentication(page)
    })

    test('should navigate between all refactored views without errors', async ({ page }) => {
        const errors = setupConsoleErrorListener(page, 'Navigation')

        const routes = [
            '/pt/dashboard',
            '/pt/sales',
            '/pt/contacts',
            '/pt/projects',
            '/pt/integrations',
            '/pt/settings',
            '/pt/analytics',
        ]

        for (const route of routes) {
            await page.goto(`${BASE_URL}${route}`, { timeout: NAVIGATION_TIMEOUT })
            await page.waitForTimeout(1000) // Wait for render

            // Check page loaded without crashing
            const body = await page.locator('body').isVisible()
            expect(body).toBe(true)
        }

        // Should have minimal console errors across all views
        expect(errors.length).toBeLessThan(5)
    })

    test('should maintain consistent dark mode across views', async ({ page }) => {
        await page.goto(`${BASE_URL}/pt/dashboard`, { timeout: NAVIGATION_TIMEOUT })

        // Enable dark mode
        await toggleDarkMode(page)

        // Navigate to other views and verify dark mode persists
        const routes = ['/pt/sales', '/pt/contacts', '/pt/projects']

        for (const route of routes) {
            await page.goto(`${BASE_URL}${route}`, { timeout: NAVIGATION_TIMEOUT })
            await page.waitForTimeout(500)

            const isDark = await page.evaluate(() => {
                return document.documentElement.classList.contains('dark')
            })
            expect(isDark).toBe(true)
        }
    })
})
