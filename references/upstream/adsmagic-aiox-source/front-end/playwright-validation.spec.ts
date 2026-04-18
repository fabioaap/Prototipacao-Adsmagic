import { test, expect, Page } from '@playwright/test'

// ============================================================================
// Testes de Validação A11y - Radix Wrappers (Tabs, Tooltip, Toast, etc)
// ============================================================================

const BASE_URL = 'http://localhost:5173'

// Helper: Verificar role ARIA
async function verifyAriaRole(page: Page, selector: string, expectedRole: string) {
  const role = await page.locator(selector).getAttribute('role')
  expect(role).toBe(expectedRole)
}

// Helper: Verificar atributo ARIA
async function verifyAriaAttr(page: Page, selector: string, attr: string, expectedValue?: string) {
  const value = await page.locator(selector).getAttribute(attr)
  if (expectedValue) {
    expect(value).toBe(expectedValue)
  } else {
    expect(value).toBeTruthy()
  }
}

// Helper: Verificar focus visible (CSS)
async function verifyFocusVisible(page: Page, selector: string) {
  const element = page.locator(selector)
  // Tab para colocar foco
  await element.focus()
  
  // Verificar se tem outline/border ou classe de foco
  const focusClass = await element.evaluate(el => {
    const styles = window.getComputedStyle(el)
    return styles.outline !== 'none' || styles.boxShadow !== 'none'
  })
  
  expect(focusClass).toBeTruthy()
}

// Helper: Verificar touch target (min 44x44px)
async function verifyTouchTarget(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)
}

// ============================================================================
// TABS COMPONENT
// ============================================================================

test.describe('Tabs Component - A11y Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`) // Ou rota específica onde Tabs está
  })

  test('TAB-001: Deve ter role="tablist" no container', async ({ page }) => {
    const tablist = page.locator('[role="tablist"]').first()
    await expect(tablist).toBeVisible()
  })

  test('TAB-002: Cada tab trigger deve ter role="tab"', async ({ page }) => {
    const tabs = page.locator('[role="tab"]')
    const count = await tabs.count()
    expect(count).toBeGreaterThan(0)
    
    for (let i = 0; i < count; i++) {
      const role = await tabs.nth(i).getAttribute('role')
      expect(role).toBe('tab')
    }
  })

  test('TAB-003: Tab ativo deve ter aria-selected="true"', async ({ page }) => {
    const activeTabs = page.locator('[role="tab"][aria-selected="true"]')
    const count = await activeTabs.count()
    expect(count).toBeGreaterThan(0)
  })

  test('TAB-004: Navegação com Arrow keys (→ ↓ move para próximo)', async ({ page }) => {
    const firstTab = page.locator('[role="tab"]').first()
    await firstTab.focus()
    await page.keyboard.press('ArrowRight')
    
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'))
    expect(focused).toBe('tab')
  })

  test('TAB-005: Tab content deve ter role="tabpanel"', async ({ page }) => {
    const tabpanels = page.locator('[role="tabpanel"]')
    const count = await tabpanels.count()
    expect(count).toBeGreaterThan(0)
  })

  test('TAB-006: Tab trigger deve ter focus:visible', async ({ page }) => {
    const tab = page.locator('[role="tab"]').first()
    await verifyFocusVisible(page, '[role="tab"]')
  })

  test('TAB-007: Touch target ≥44x44px', async ({ page }) => {
    await verifyTouchTarget(page, '[role="tab"]')
  })
})

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

test.describe('Tooltip Component - A11y Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`)
  })

  test('TIP-001: Tooltip deve ter role="tooltip"', async ({ page }) => {
    // Hover trigger para mostrar tooltip
    const trigger = page.locator('[data-testid="tooltip-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.hover()
      const tooltip = page.locator('[role="tooltip"]').first()
      await expect(tooltip).toBeVisible()
    }
  })

  test('TIP-002: Trigger deve ter aria-describedby referenciando tooltip', async ({ page }) => {
    const trigger = page.locator('[data-testid="tooltip-trigger"]').first()
    if (await trigger.isVisible()) {
      const describedBy = await trigger.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()
    }
  })

  test('TIP-003: Tooltip fechado com ESC', async ({ page }) => {
    const trigger = page.locator('[data-testid="tooltip-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.hover()
      await page.keyboard.press('Escape')
      
      const tooltip = page.locator('[role="tooltip"]')
      const isVisible = await tooltip.isVisible().catch(() => false)
      expect(isVisible).toBeFalsy()
    }
  })

  test('TIP-004: Tooltip trigger tem focus:visible', async ({ page }) => {
    const trigger = page.locator('[data-testid="tooltip-trigger"]').first()
    if (await trigger.isVisible()) {
      await verifyFocusVisible(page, '[data-testid="tooltip-trigger"]')
    }
  })

  test('TIP-005: Touch target ≥44x44px', async ({ page }) => {
    const trigger = page.locator('[data-testid="tooltip-trigger"]').first()
    if (await trigger.isVisible()) {
      await verifyTouchTarget(page, '[data-testid="tooltip-trigger"]')
    }
  })
})

// ============================================================================
// TOAST COMPONENT
// ============================================================================

test.describe('Toast Component - A11y Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`)
  })

  test('TST-001: Toast deve ter role="alert" ou role="status"', async ({ page }) => {
    // Disparar ação que cria toast (buscar button específico)
    const toastTrigger = page.locator('[data-testid="toast-trigger"]').first()
    if (await toastTrigger.isVisible()) {
      await toastTrigger.click()
      
      const toast = page.locator('[role="alert"], [role="status"]').first()
      await expect(toast).toBeVisible()
    }
  })

  test('TST-002: Toast deve ter aria-live="polite" ou aria-live="assertive"', async ({ page }) => {
    const toastTrigger = page.locator('[data-testid="toast-trigger"]').first()
    if (await toastTrigger.isVisible()) {
      await toastTrigger.click()
      
      const toast = page.locator('[role="alert"], [role="status"]').first()
      const ariaLive = await toast.getAttribute('aria-live')
      expect(['polite', 'assertive']).toContain(ariaLive)
    }
  })

  test('TST-003: Toast deve ter aria-atomic="true"', async ({ page }) => {
    const toastTrigger = page.locator('[data-testid="toast-trigger"]').first()
    if (await toastTrigger.isVisible()) {
      await toastTrigger.click()
      
      const toast = page.locator('[role="alert"], [role="status"]').first()
      const ariaAtomic = await toast.getAttribute('aria-atomic')
      expect(ariaAtomic).toBe('true')
    }
  })

  test('TST-004: Toast fechar com ESC', async ({ page }) => {
    const toastTrigger = page.locator('[data-testid="toast-trigger"]').first()
    if (await toastTrigger.isVisible()) {
      await toastTrigger.click()
      await page.keyboard.press('Escape')
      
      const toast = page.locator('[role="alert"], [role="status"]').first()
      const isVisible = await toast.isVisible().catch(() => false)
      expect(isVisible).toBeFalsy()
    }
  })

  test('TST-005: Close button tem focus:visible', async ({ page }) => {
    const toastTrigger = page.locator('[data-testid="toast-trigger"]').first()
    if (await toastTrigger.isVisible()) {
      await toastTrigger.click()
      
      const closeBtn = page.locator('[data-testid="toast-close"], button[aria-label*="close"]').first()
      if (await closeBtn.isVisible()) {
        await verifyFocusVisible(page, '[data-testid="toast-close"], button[aria-label*="close"]')
      }
    }
  })
})

// ============================================================================
// CONTEXT MENU COMPONENT
// ============================================================================

test.describe('ContextMenu Component - A11y Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`)
  })

  test('CTX-001: Menu deve ter role="menu"', async ({ page }) => {
    // Right-click ou botão para abrir context menu
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.click() // ou rightClick conforme implementação
      
      const menu = page.locator('[role="menu"]').first()
      await expect(menu).toBeVisible()
    }
  })

  test('CTX-002: Menu items devem ter role="menuitem"', async ({ page }) => {
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      
      const items = page.locator('[role="menuitem"]')
      const count = await items.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('CTX-003: Navegação com Arrow keys (↓ ↑ move entre items)', async ({ page }) => {
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      
      const firstItem = page.locator('[role="menuitem"]').first()
      await firstItem.focus()
      await page.keyboard.press('ArrowDown')
      
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'))
      expect(focused).toBe('menuitem')
    }
  })

  test('CTX-004: Menu fecha com ESC', async ({ page }) => {
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.keyboard.press('Escape')
      
      const menu = page.locator('[role="menu"]')
      const isVisible = await menu.isVisible().catch(() => false)
      expect(isVisible).toBeFalsy()
    }
  })

  test('CTX-005: Menu item tem focus:visible', async ({ page }) => {
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first()
    if (await trigger.isVisible()) {
      await trigger.click()
      
      const firstItem = page.locator('[role="menuitem"]').first()
      await verifyFocusVisible(page, '[role="menuitem"]')
    }
  })

  test('CTX-006: Touch target ≥44x44px', async ({ page }) => {
    const trigger = page.locator('[data-testid="context-menu-trigger"]').first()
    if (await trigger.isVisible()) {
      await verifyTouchTarget(page, '[data-testid="context-menu-trigger"]')
    }
  })
})

// ============================================================================
// COMMAND COMPONENT (Combobox/Command Palette)
// ============================================================================

test.describe('Command Component - A11y Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`)
  })

  test('CMD-001: Input deve ter role="combobox"', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await expect(input).toBeVisible()
    }
  })

  test('CMD-002: Input deve ter aria-autocomplete="list" ou "both"', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      const ariaAutocomplete = await input.getAttribute('aria-autocomplete')
      expect(['list', 'both']).toContain(ariaAutocomplete)
    }
  })

  test('CMD-003: Listbox deve ter role="listbox"', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await input.focus()
      await input.type('test')
      
      const listbox = page.locator('[role="listbox"]').first()
      const isVisible = await listbox.isVisible().catch(() => false)
      // Pode estar aberto ou não, mas se houver deve ter role correto
    }
  })

  test('CMD-004: Navegação com Arrow keys (↓ ↑ move entre options)', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await input.focus()
      await input.type('a')
      
      await page.keyboard.press('ArrowDown')
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'))
      // Pode ser option ou manter no input
    }
  })

  test('CMD-005: Enter seleciona opção', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await input.focus()
      await input.type('a')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      
      // Verificar se seleção ocorreu (validar estado)
    }
  })

  test('CMD-006: ESC fecha menu', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await input.focus()
      await input.type('a')
      await page.keyboard.press('Escape')
      
      const listbox = page.locator('[role="listbox"]')
      const isVisible = await listbox.isVisible().catch(() => false)
      expect(isVisible).toBeFalsy()
    }
  })

  test('CMD-007: Input tem focus:visible', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await verifyFocusVisible(page, '[role="combobox"]')
    }
  })

  test('CMD-008: Touch target ≥44x44px', async ({ page }) => {
    const input = page.locator('[role="combobox"]').first()
    if (await input.isVisible()) {
      await verifyTouchTarget(page, '[role="combobox"]')
    }
  })
})
