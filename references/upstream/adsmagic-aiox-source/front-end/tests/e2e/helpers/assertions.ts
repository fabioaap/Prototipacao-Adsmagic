/**
 * Assertion helpers for E2E tests
 */

import type { Page } from '@playwright/test'

/**
 * Check console for errors (excluding known external errors)
 */
export async function assertNoConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = []

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const text = msg.text()

            // Ignore known external errors
            const ignoredPatterns = [
                'sentence-player', // Browser extension
                'Firebase',
                'chrome-extension://',
            ]

            const shouldIgnore = ignoredPatterns.some(pattern => text.includes(pattern))

            if (!shouldIgnore) {
                errors.push(text)
            }
        }
    })

    return errors
}

/**
 * Take screenshot with naming convention
 */
export async function takeScreenshot(
    page: Page,
    name: string,
    options?: { fullPage?: boolean }
): Promise<Buffer> {
    return await page.screenshot({
        path: `tests/e2e/screenshots/${name}.png`,
        fullPage: options?.fullPage ?? false
    })
}
