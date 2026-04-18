import { test, expect } from '@playwright/test'

/**
 * DEBUG SCRIPT: Dashboard V2 Filter Buttons Investigation
 * 
 * This script systematically inspects why filter buttons are not working.
 */

test.describe('Dashboard Filters Debug Investigation', () => {
    // Use root path and let it redirect
    const dashboardURL = 'http://localhost:5174/'

    test.beforeEach(async ({ page }) => {
        // Enable console logging
        page.on('console', msg => {
            console.log(`[BROWSER ${msg.type()}]:`, msg.text())
        })

        // Capture JavaScript errors
        page.on('pageerror', error => {
            console.error(`[PAGE ERROR]:`, error.message)
        })

        // Monitor failed requests
        page.on('requestfailed', request => {
            console.error(`[REQUEST FAILED]: ${request.url()}`)
        })
    })

    test('1. Navigate and Screenshot Initial State', async ({ page }) => {
        console.log('\n=== TEST 1: INITIAL STATE ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        // Take full page screenshot
        await page.screenshot({
            path: 'debug-screenshots/01-full-page.png',
            fullPage: true
        })

        // Take filter bar screenshot
        const filterBar = page.locator('.dashboard-filters-bar').first()
        await filterBar.screenshot({
            path: 'debug-screenshots/01-filter-bar.png'
        })

        console.log('✓ Screenshots saved to debug-screenshots/')
    })

    test('2. Inspect HTML Structure of All Buttons', async ({ page }) => {
        console.log('\n=== TEST 2: HTML STRUCTURE ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        // Check if filter bar exists
        const filterBar = page.locator('.dashboard-filters-bar').first()
        const filterBarExists = await filterBar.count() > 0
        console.log(`Filter bar exists: ${filterBarExists}`)

        if (filterBarExists) {
            const filterBarHTML = await filterBar.evaluate(el => el.outerHTML)
            console.log('\n--- Filter Bar HTML ---')
            console.log(filterBarHTML.substring(0, 500) + '...')
        }

        // 1. Period Selector Button
        console.log('\n--- Period Selector Button ---')
        const periodButton = page.locator('button:has-text("Últimos 30 dias")').first()
        const periodExists = await periodButton.count() > 0
        console.log(`Period button exists: ${periodExists}`)

        if (periodExists) {
            const html = await periodButton.evaluate(el => el.outerHTML)
            console.log('HTML:', html)

            const styles = await periodButton.evaluate(el => {
                const computed = window.getComputedStyle(el)
                return {
                    display: computed.display,
                    visibility: computed.visibility,
                    pointerEvents: computed.pointerEvents,
                    zIndex: computed.zIndex,
                    position: computed.position,
                    opacity: computed.opacity,
                    cursor: computed.cursor
                }
            })
            console.log('Computed styles:', JSON.stringify(styles, null, 2))
        }

        // 2. Origins Filter Button
        console.log('\n--- Origins Filter Button ---')
        const originsButton = page.locator('button:has-text("Todas Origens")').first()
        const originsExists = await originsButton.count() > 0
        console.log(`Origins button exists: ${originsExists}`)

        if (originsExists) {
            const html = await originsButton.evaluate(el => el.outerHTML)
            console.log('HTML:', html)

            const styles = await originsButton.evaluate(el => {
                const computed = window.getComputedStyle(el)
                return {
                    display: computed.display,
                    visibility: computed.visibility,
                    pointerEvents: computed.pointerEvents,
                    disabled: el.hasAttribute('disabled'),
                    cursor: computed.cursor
                }
            })
            console.log('Computed styles:', JSON.stringify(styles, null, 2))
        }

        // 3. Compare Toggle
        console.log('\n--- Compare Toggle ---')
        const compareButton = page.locator('button:has-text("Comparar")').first()
        const compareExists = await compareButton.count() > 0
        console.log(`Compare button exists: ${compareExists}`)

        if (compareExists) {
            const html = await compareButton.evaluate(el => el.outerHTML)
            console.log('HTML:', html)
        }

        // 4. Export Button
        console.log('\n--- Export Button ---')
        const exportButton = page.locator('button:has-text("Exportar")').first()
        const exportExists = await exportButton.count() > 0
        console.log(`Export button exists: ${exportExists}`)

        if (exportExists) {
            const html = await exportButton.evaluate(el => el.outerHTML)
            console.log('HTML:', html)
        }
    })

    test('3. Test Click Interactions', async ({ page }) => {
        console.log('\n=== TEST 3: CLICK INTERACTIONS ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        // Test Period Selector
        console.log('\n--- Testing Period Selector Click ---')
        const periodButton = page.locator('button:has-text("Últimos 30 dias")').first()

        if (await periodButton.count() > 0) {
            console.log('Attempting to click period button...')

            // Check if clickable
            const isEnabled = await periodButton.isEnabled()
            const isVisible = await periodButton.isVisible()
            console.log(`Enabled: ${isEnabled}, Visible: ${isVisible}`)

            await periodButton.click({ force: true })
            console.log('Click executed (forced)')

            // Wait a moment for any UI updates
            await page.waitForTimeout(500)

            // Check if dropdown appeared
            const dropdown = page.locator('[role="listbox"], [role="menu"], .period-selector-dropdown')
            const dropdownVisible = await dropdown.count() > 0
            console.log(`Dropdown appeared: ${dropdownVisible}`)

            // Take screenshot after click
            await page.screenshot({
                path: 'debug-screenshots/03-after-period-click.png',
                fullPage: true
            })
        }

        // Test Origins Filter
        console.log('\n--- Testing Origins Filter Click ---')
        const originsButton = page.locator('button:has-text("Todas Origens")').first()

        if (await originsButton.count() > 0) {
            console.log('Attempting to click origins button...')
            await originsButton.click({ force: true })
            await page.waitForTimeout(500)

            await page.screenshot({
                path: 'debug-screenshots/03-after-origins-click.png',
                fullPage: true
            })
        }

        // Test Compare Toggle
        console.log('\n--- Testing Compare Toggle Click ---')
        const compareButton = page.locator('button:has-text("Comparar")').first()

        if (await compareButton.count() > 0) {
            console.log('Attempting to click compare toggle...')
            await compareButton.click({ force: true })
            await page.waitForTimeout(500)

            // Check if state changed
            const hasActiveClass = await compareButton.evaluate(el =>
                el.classList.contains('is-active')
            )
            console.log(`Compare toggle is active: ${hasActiveClass}`)

            await page.screenshot({
                path: 'debug-screenshots/03-after-compare-click.png',
                fullPage: true
            })
        }

        // Test Export Button
        console.log('\n--- Testing Export Button Click ---')
        const exportButton = page.locator('button:has-text("Exportar")').first()

        if (await exportButton.count() > 0) {
            console.log('Attempting to click export button...')
            await exportButton.click({ force: true })
            await page.waitForTimeout(500)

            await page.screenshot({
                path: 'debug-screenshots/03-after-export-click.png',
                fullPage: true
            })
        }
    })

    test('4. Check Vue DevTools / Component State', async ({ page }) => {
        console.log('\n=== TEST 4: VUE COMPONENT STATE ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        // Check if Vue is loaded
        const vueDetected = await page.evaluate(() => {
            return typeof (window as any).__VUE__ !== 'undefined' ||
                typeof (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'
        })
        console.log(`Vue detected: ${vueDetected}`)

        // Check for PeriodSelector component in DOM
        const periodSelectorExists = await page.locator('[class*="period-selector"]').count() > 0
        console.log(`PeriodSelector component found: ${periodSelectorExists}`)

        // Check for any error messages or warnings in the component
        const errorElements = await page.locator('[class*="error"], [class*="warning"]').count()
        console.log(`Error/warning elements found: ${errorElements}`)
    })

    test('5. Monitor Event Listeners', async ({ page }) => {
        console.log('\n=== TEST 5: EVENT LISTENERS ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        // Check if buttons have click handlers
        const periodButton = page.locator('button:has-text("Últimos 30 dias")').first()

        if (await periodButton.count() > 0) {
            const hasClickHandler = await periodButton.evaluate(el => {
                // Get all event listeners (this is a simplified check)
                const onclick = el.getAttribute('onclick')
                const vueClick = el.getAttribute('@click') || el.getAttribute('v-on:click')
                return {
                    onclick: onclick !== null,
                    vueClick: vueClick !== null,
                    _listeners: (el as any).__vueParentComponent ? 'Vue component detected' : 'No Vue component'
                }
            })
            console.log('Period button event handlers:', JSON.stringify(hasClickHandler, null, 2))
        }
    })

    test('6. Check for Overlapping Elements', async ({ page }) => {
        console.log('\n=== TEST 6: OVERLAPPING ELEMENTS ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        const periodButton = page.locator('button:has-text("Últimos 30 dias")').first()

        if (await periodButton.count() > 0) {
            const overlappingInfo = await periodButton.evaluate(el => {
                const rect = el.getBoundingClientRect()
                const elementAtPoint = document.elementFromPoint(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                )

                return {
                    buttonRect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    },
                    elementAtCenter: elementAtPoint?.tagName + '.' + elementAtPoint?.className,
                    isButtonAtCenter: elementAtPoint === el || el.contains(elementAtPoint)
                }
            })

            console.log('Overlapping check:', JSON.stringify(overlappingInfo, null, 2))
        }
    })

    test('7. Check Parent Component Integration', async ({ page }) => {
        console.log('\n=== TEST 7: PARENT COMPONENT INTEGRATION ===\n')

        await page.goto(dashboardURL)
        await page.waitForLoadState('networkidle')

        // Find the parent component (likely DashboardV2View)
        const dashboardContainer = page.locator('[class*="dashboard"]').first()
        const containerExists = await dashboardContainer.count() > 0
        console.log(`Dashboard container exists: ${containerExists}`)

        if (containerExists) {
            // Check if filters bar is properly nested
            const filterBarInContainer = await dashboardContainer.locator('.dashboard-filters-bar').count() > 0
            console.log(`Filter bar inside dashboard container: ${filterBarInContainer}`)
        }

        // Log the entire component hierarchy
        const hierarchy = await page.evaluate(() => {
            const filterBar = document.querySelector('.dashboard-filters-bar')
            if (!filterBar) return 'Filter bar not found'

            let current = filterBar.parentElement
            const parents = []
            while (current && parents.length < 5) {
                parents.push({
                    tag: current.tagName,
                    classes: Array.from(current.classList),
                    id: current.id
                })
                current = current.parentElement
            }
            return parents
        })

        console.log('Component hierarchy:', JSON.stringify(hierarchy, null, 2))
    })
})
