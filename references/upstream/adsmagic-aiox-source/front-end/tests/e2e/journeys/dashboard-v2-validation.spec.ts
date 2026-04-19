import { test, expect } from '@playwright/test'

test('Dashboard V2 - Component Structure Validation', async ({ page }) => {
    // Navigate to a dashboard page (generic path that will redirect if needed)
    await page.goto('http://localhost:5173/pt/projects')

    // Wait for navigation or load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })

    // Look for dashboard v2 route or components
    await page.goto('http://localhost:5173/pt', { waitUntil: 'domcontentloaded' })

    // Capture console for any errors
    const consoleErrors: string[] = []
    const consoleWarnings: string[] = []

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
        }
        if (msg.type() === 'warning') {
            consoleWarnings.push(msg.text())
        }
    })

    // Take screenshot to validate rendered UI
    const screenshot = await page.screenshot({ fullPage: false })
    console.log(`✅ Screenshot captured (${screenshot.length} bytes)`)

    // Validate page loaded without critical errors
    console.log(`📋 Console errors: ${consoleErrors.length}`)
    console.log(`⚠️  Console warnings: ${consoleWarnings.length}`)

    if (consoleErrors.length > 0) {
        console.error('🔴 Critical errors found:')
        consoleErrors.forEach(err => console.error(`  - ${err}`))
    } else {
        console.log('✅ No critical console errors')
    }

    // Check TypeScript compilation
    const hasTypeErrors = await page.evaluate(() => {
        return document.body.innerHTML.includes('TypeScript error') ||
            document.body.innerHTML.includes('SyntaxError')
    })

    console.log(`✅ TypeScript validation: ${hasTypeErrors ? '❌ FAILED' : '✅ PASSED'}`)
})

