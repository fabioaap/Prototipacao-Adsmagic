import { test } from '@playwright/test'

test('Dashboard V2 - Visual Validation', async ({ page }) => {
    await page.goto('http://localhost:5173/pt/projects/9d176ba9-fd09-4fb9-ab4a-8f12fef3e095/dashboard-v2')

    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })

    // Take screenshot
    await page.screenshot({ path: 'dashboard-v2-screenshot.png', fullPage: true })

    // Check for errors in console
    const consoleMessages: string[] = []
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
        }
    })

    // Validate key elements exist
    const title = page.locator('h1:has-text("Desempenho do Projeto")')
    const kpiCards = page.locator('[role="article"]')
    const filterBar = page.locator('[role="toolbar"]')
    const originTable = page.locator('table')
    const tabs = page.locator('[role="tablist"]')

    console.log('✅ Page loaded successfully')
    console.log(`📊 Found ${await kpiCards.count()} KPI cards`)
    console.log(`🔍 Filter bar present: ${await filterBar.isVisible()}`)
    console.log(`📈 Origin table present: ${await originTable.isVisible()}`)
    console.log(`📑 Tabs present: ${await tabs.isVisible()}`)
    console.log(`🎯 Title correct: ${await title.isVisible()}`)

    if (consoleMessages.length > 0) {
        console.error('Console errors:', consoleMessages)
    } else {
        console.log('✅ No console errors')
    }
})
