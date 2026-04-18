/**
 * Navigation helpers for E2E tests
 * Provides locale-aware navigation and common navigation patterns
 */

import type { Page } from '@playwright/test'

/**
 * Navigate to a path with locale prefix
 */
export async function navigateTo(
    page: Page,
    locale: 'pt' | 'en' | 'es',
    path: string
): Promise<void> {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const url = `/${locale}/${cleanPath}`
    await page.goto(url)
}

/**
 * Wait for projects list to load
 */
export async function waitForProjectsList(page: Page): Promise<void> {
    // Wait for either "Nenhum projeto encontrado" or a project row
    await page.waitForSelector('table', { timeout: 10000 })
}

/**
 * Wait for dashboard to load
 */
export async function waitForDashboard(page: Page): Promise<void> {
    // Wait for dashboard cards to be visible
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 })
}

/**
 * Wait for specific text to appear
 */
export async function waitForText(page: Page, text: string): Promise<void> {
    await page.getByText(text).first().waitFor({ state: 'visible', timeout: 10000 })
}

/**
 * Check current route matches expected pattern
 */
export async function assertRoute(page: Page, expectedPattern: string | RegExp): Promise<void> {
    const currentUrl = page.url()
    if (typeof expectedPattern === 'string') {
        if (!currentUrl.includes(expectedPattern)) {
            throw new Error(`Expected URL to contain "${expectedPattern}", got "${currentUrl}"`)
        }
    } else {
        if (!expectedPattern.test(currentUrl)) {
            throw new Error(`Expected URL to match pattern ${expectedPattern}, got "${currentUrl}"`)
        }
    }
}
