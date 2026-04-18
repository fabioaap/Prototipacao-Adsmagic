import { test, expect } from '@playwright/test'

/**
 * SIMPLIFIED DEBUG SCRIPT - Dashboard Filter Buttons
 * 
 * This runs automated tests to diagnose why buttons don't work.
 * Make sure dev server is running on http://localhost:5174
 */

test.describe('Dashboard Filters - Simplified Debug', () => {
    test.beforeEach(async ({ page }) => {
        // Log console messages
        page.on('console', msg => {
            const type = msg.type()
            const text = msg.text()
            if (type === 'error' || text.includes('[Dashboard]') || text.includes('[FiltersBar]') || text.includes('[PeriodSelector]')) {
                console.log(`[BROWSER ${type.toUpperCase()}]:`, text)
            }
        })

        // Log page errors
        page.on('pageerror', error => {
            console.error(`[PAGE ERROR]:`, error.message)
        })
    })

    test('Complete Diagnosis - All Buttons', async ({ page }) => {
        console.log('\n' + '='.repeat(70))
        console.log('DASHBOARD FILTER BUTTONS - AUTOMATED DIAGNOSIS')
        console.log('='.repeat(70) + '\n')

        // Navigate to root and wait for redirect
        console.log('📍 Navigating to application...')
        await page.goto('http://localhost:5174/')

        // Wait for potential redirects
        await page.waitForTimeout(2000)

        const currentUrl = page.url()
        console.log(`   Current URL: ${currentUrl}`)

        // If on login page, skip test
        if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
            console.log('⚠️  On login page - requires manual authentication')
            console.log('   Please login first, then run this test again')
            return
        }

        // Try to find the dashboard
        console.log('\n🔍 Searching for dashboard...')

        // Wait for any dashboard content
        try {
            await page.waitForSelector('[class*="dashboard"]', { timeout: 5000 })
            console.log('✅ Dashboard container found')
        } catch {
            console.log('❌ Dashboard container not found')
            console.log('   Current page elements:')
            const bodyText = await page.locator('body').textContent()
            console.log('   ', bodyText?.substring(0, 200))
        }

        // Check for filters bar
        console.log('\n🔍 Checking for filters bar...')
        const filtersBar = page.locator('.dashboard-filters-bar').first()
        const filtersBarExists = await filtersBar.count() > 0

        if (!filtersBarExists) {
            console.log('❌ Filters bar NOT FOUND')
            console.log('   Possible reasons:')
            console.log('   1. Not on dashboard page')
            console.log('   2. Component not rendered')
            console.log('   3. Different class name')

            // Try to find any buttons
            const allButtons = page.locator('button')
            const buttonCount = await allButtons.count()
            console.log(`\n   Found ${buttonCount} total buttons on page`)

            if (buttonCount > 0) {
                console.log('   Button samples:')
                for (let i = 0; i < Math.min(5, buttonCount); i++) {
                    const text = await allButtons.nth(i).textContent()
                    console.log(`   ${i + 1}. "${text?.trim()}"`)
                }
            }

            // Take screenshot
            await page.screenshot({
                path: 'debug-screenshots/no-filters-bar.png',
                fullPage: true
            })
            console.log('\n📸 Screenshot saved: debug-screenshots/no-filters-bar.png')

            return
        }

        console.log('✅ Filters bar found!')

        // Take screenshot of filters bar
        await filtersBar.screenshot({
            path: 'debug-screenshots/filters-bar.png'
        })
        console.log('📸 Screenshot: debug-screenshots/filters-bar.png')

        // ======================================================================
        // TEST 1: Period Selector Button
        // ======================================================================
        console.log('\n' + '-'.repeat(70))
        console.log('TEST 1: PERIOD SELECTOR BUTTON')
        console.log('-'.repeat(70))

        const periodButton = page.locator('button').filter({ hasText: 'Últimos' }).first()
        const periodExists = await periodButton.count() > 0

        if (periodExists) {
            console.log('✅ Period button found')

            // Get button text
            const buttonText = await periodButton.textContent()
            console.log(`   Text: "${buttonText?.trim()}"`)

            // Check if enabled and visible
            const isVisible = await periodButton.isVisible()
            const isEnabled = await periodButton.isEnabled()
            console.log(`   Visible: ${isVisible ? '✅' : '❌'}`)
            console.log(`   Enabled: ${isEnabled ? '✅' : '❌'}`)

            if (isVisible && isEnabled) {
                // Try clicking
                console.log('\n🖱️  Clicking period button...')
                await periodButton.click()

                // Wait for dropdown
                await page.waitForTimeout(500)

                // Check if dropdown appeared
                const dropdown = page.locator('.dropdown-menu')
                const dropdownVisible = await dropdown.isVisible().catch(() => false)

                if (dropdownVisible) {
                    console.log('✅ Dropdown appeared!')

                    // Take screenshot
                    await page.screenshot({
                        path: 'debug-screenshots/dropdown-open.png',
                        fullPage: false
                    })
                    console.log('📸 Screenshot: debug-screenshots/dropdown-open.png')

                    // List dropdown options
                    const options = dropdown.locator('button')
                    const optionCount = await options.count()
                    console.log(`\n   Dropdown has ${optionCount} options:`)
                    for (let i = 0; i < optionCount; i++) {
                        const text = await options.nth(i).textContent()
                        console.log(`   ${i + 1}. "${text?.trim()}"`)
                    }

                    // Try selecting an option
                    if (optionCount > 0) {
                        console.log('\n🖱️  Clicking first option...')
                        await options.first().click()
                        await page.waitForTimeout(300)
                        console.log('   Click executed')
                    }
                } else {
                    console.log('❌ Dropdown DID NOT appear')
                    console.log('   🔴 PROBLEM IDENTIFIED: Button clicks but dropdown doesn\'t show')
                    console.log('   Possible causes:')
                    console.log('   1. Vue reactivity not working (isOpen state not updating)')
                    console.log('   2. CSS hiding dropdown (check .dropdown-menu styles)')
                    console.log('   3. Teleport failing')
                    console.log('   4. JavaScript error preventing render')

                    await page.screenshot({
                        path: 'debug-screenshots/dropdown-failed.png',
                        fullPage: true
                    })
                    console.log('📸 Screenshot: debug-screenshots/dropdown-failed.png')
                }
            }
        } else {
            console.log('❌ Period button NOT found')
        }

        // ======================================================================
        // TEST 2: Origins Filter Button
        // ======================================================================
        console.log('\n' + '-'.repeat(70))
        console.log('TEST 2: ORIGINS FILTER BUTTON')
        console.log('-'.repeat(70))

        const originsButton = page.locator('button').filter({ hasText: 'Origens' }).first()
        const originsExists = await originsButton.count() > 0

        if (originsExists) {
            console.log('✅ Origins button found')
            console.log('🖱️  Clicking origins button...')

            await originsButton.click()
            await page.waitForTimeout(300)
            console.log('   Click executed')

            await page.screenshot({
                path: 'debug-screenshots/origins-clicked.png'
            })
            console.log('📸 Screenshot: debug-screenshots/origins-clicked.png')
        } else {
            console.log('❌ Origins button NOT found')
        }

        // ======================================================================
        // TEST 3: Compare Toggle
        // ======================================================================
        console.log('\n' + '-'.repeat(70))
        console.log('TEST 3: COMPARE TOGGLE')
        console.log('-'.repeat(70))

        const compareButton = page.locator('button').filter({ hasText: 'Comparar' }).first()
        const compareExists = await compareButton.count() > 0

        if (compareExists) {
            console.log('✅ Compare toggle found')

            // Check initial state
            const hasActiveClass = await compareButton.evaluate(el =>
                el.classList.contains('is-active')
            )
            console.log(`   Initial state: ${hasActiveClass ? 'Active' : 'Inactive'}`)

            console.log('🖱️  Clicking compare toggle...')
            await compareButton.click()
            await page.waitForTimeout(300)

            // Check new state
            const newActiveClass = await compareButton.evaluate(el =>
                el.classList.contains('is-active')
            )
            console.log(`   New state: ${newActiveClass ? 'Active' : 'Inactive'}`)

            if (hasActiveClass !== newActiveClass) {
                console.log('✅ State changed successfully!')
            } else {
                console.log('❌ State did NOT change')
                console.log('   🔴 PROBLEM: Click not updating state')
            }

            await page.screenshot({
                path: 'debug-screenshots/compare-toggled.png'
            })
            console.log('📸 Screenshot: debug-screenshots/compare-toggled.png')
        } else {
            console.log('❌ Compare toggle NOT found')
        }

        // ======================================================================
        // TEST 4: Export Button
        // ======================================================================
        console.log('\n' + '-'.repeat(70))
        console.log('TEST 4: EXPORT BUTTON')
        console.log('-'.repeat(70))

        const exportButton = page.locator('button').filter({ hasText: 'Exportar' }).first()
        const exportExists = await exportButton.count() > 0

        if (exportExists) {
            console.log('✅ Export button found')
            console.log('🖱️  Clicking export button...')

            await exportButton.click()
            await page.waitForTimeout(300)
            console.log('   Click executed')

            await page.screenshot({
                path: 'debug-screenshots/export-clicked.png'
            })
            console.log('📸 Screenshot: debug-screenshots/export-clicked.png')
        } else {
            console.log('❌ Export button NOT found')
        }

        // ======================================================================
        // SUMMARY
        // ======================================================================
        console.log('\n' + '='.repeat(70))
        console.log('DIAGNOSIS SUMMARY')
        console.log('='.repeat(70))
        console.log(`
Filters Bar: ${filtersBarExists ? '✅' : '❌'}
Period Button: ${periodExists ? '✅' : '❌'}
Origins Button: ${originsExists ? '✅' : '❌'}
Compare Toggle: ${compareExists ? '✅' : '❌'}
Export Button: ${exportExists ? '✅' : '❌'}

📸 All screenshots saved to: debug-screenshots/

🔍 Check browser console logs above for [Dashboard], [FiltersBar], [PeriodSelector] messages

Next steps:
1. Review screenshots in debug-screenshots/
2. Check console output for errors
3. If dropdown didn't appear, focus on PeriodSelector.vue reactivity
4. Try hard refresh (Ctrl+Shift+R) and rerun test
`)
        console.log('='.repeat(70) + '\n')
    })
})
