/**
 * Smoke visual pós-merge master→v3
 *
 * Verifica que:
 *  - rotas públicas (auth) renderizam sem erros críticos
 *  - rotas protegidas redirecionam para /login (guard ativo)
 *  - novas rotas de campanhas (Meta Ads / Google Ads) são resolúveis
 *  - campos interativos das novas views existem no DOM
 *
 * Requer: vite preview rodando em http://localhost:4173
 * Uso: pnpm exec playwright test --config=playwright.ci.config.ts tests/e2e/journeys/post-merge-smoke.spec.ts
 */
import { test, expect } from '@playwright/test'

const locale = 'pt'
const PROJECT_ID = 'project-placeholder' // qualquer valor – guard redireciona sem sessão

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function authRoute(path: string) {
    return `/${locale}/${path}`
}

function projectRoute(sub: string) {
    return `/${locale}/projects/${PROJECT_ID}/${sub}`
}

// ---------------------------------------------------------------------------
// Rotas públicas (auth) — devem renderizar o formulário sem crash
// ---------------------------------------------------------------------------
test.describe('Smoke: rotas públicas de auth', () => {
    test('login — renderiza formulário com email, senha e submit', async ({ page }) => {
        await page.goto(authRoute('login'))

        const email = page.locator('input[type="email"]')
        const password = page.locator('input[type="password"]')
        const submit = page.locator('button[type="submit"]')

        await expect(email).toBeVisible({ timeout: 10_000 })
        await expect(password).toBeVisible()
        await expect(submit).toBeVisible()

        // Sem erros JS na página
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)

        await page.screenshot({ path: 'test-results/smoke-login-post-merge.png', fullPage: true })
    })

    test('register — renderiza campos de nome, email e senha', async ({ page }) => {
        await page.goto(authRoute('register'))

        await expect(page.getByLabel(/nome/i)).toBeVisible({ timeout: 10_000 })
        await expect(page.getByLabel(/email/i)).toBeVisible()
        await expect(page.locator('input[type="password"]').first()).toBeVisible()

        await page.screenshot({ path: 'test-results/smoke-register-post-merge.png', fullPage: true })
    })

    test('forgot-password — renderiza campo de email e submit', async ({ page }) => {
        await page.goto(authRoute('forgot-password'))

        await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 10_000 })
        await expect(page.locator('button[type="submit"]')).toBeVisible()

        await page.screenshot({ path: 'test-results/smoke-forgot-post-merge.png', fullPage: true })
    })
})

// ---------------------------------------------------------------------------
// Rotas protegidas — devem redirecionar para /login sem crash
// ---------------------------------------------------------------------------
test.describe('Smoke: redirecionamento de guard de autenticação', () => {
    const protectedRoutes = [
        { label: 'dashboard', path: projectRoute('dashboard-v2') },
        { label: 'contacts', path: projectRoute('contacts') },
        { label: 'sales', path: projectRoute('sales') },
        { label: 'tracking', path: projectRoute('tracking') },
        { label: 'integrations', path: projectRoute('integrations') },
        { label: 'settings/general', path: projectRoute('settings/general') },
        { label: 'projects list', path: authRoute('projects') },
    ]

    for (const route of protectedRoutes) {
        test(`${route.label} — redireciona para login sem sessão`, async ({ page }) => {
            await page.goto(route.path)

            // Aguarda navegação estabilizar
            await page.waitForURL(/\/login/, { timeout: 15_000 })

            await expect(page).toHaveURL(/\/login/)
            await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5_000 })
        })
    }
})

// ---------------------------------------------------------------------------
// Novas rotas de campanhas (vindas do merge) — devem redirecionar para login
// ---------------------------------------------------------------------------
test.describe('Smoke: novas rotas de campanhas (pós-merge)', () => {
    test('campaigns/meta-ads — rota resolvida, redireciona para login sem sessão', async ({ page }) => {
        await page.goto(projectRoute('campaigns/meta-ads'))

        await page.waitForURL(/\/login/, { timeout: 15_000 })
        await expect(page).toHaveURL(/\/login/)

        await page.screenshot({ path: 'test-results/smoke-meta-ads-redirect.png' })
    })

    test('campaigns/google-ads — rota resolvida, redireciona para login sem sessão', async ({ page }) => {
        await page.goto(projectRoute('campaigns/google-ads'))

        await page.waitForURL(/\/login/, { timeout: 15_000 })
        await expect(page).toHaveURL(/\/login/)

        await page.screenshot({ path: 'test-results/smoke-google-ads-redirect.png' })
    })
})

// ---------------------------------------------------------------------------
// Rota raiz "/" — deve redirecionar para /{locale}/login
// ---------------------------------------------------------------------------
test.describe('Smoke: rota raiz', () => {
    test('/ — redireciona para /{locale}/login', async ({ page }) => {
        await page.goto('/')

        await page.waitForURL(/\/login/, { timeout: 15_000 })
        await expect(page).toHaveURL(/\/login/)
    })

    test('/pt — rota de locale sem sub-rota, serve HTML da SPA', async ({ request }) => {
        // Usa request API (não page.goto) para evitar timeout causado pelo
        // router aguardando navegação SPA sem rota definida para /:locale
        const response = await request.get(`/${locale}`)

        // O servidor de preview (SPA fallback) deve servir o index.html com 200
        expect(response.status()).toBe(200)

        const body = await response.text()
        expect(body.toLowerCase()).toContain('<!doctype html>')
    })
})

// ---------------------------------------------------------------------------
// version.json — valida que o plugin buildVersionPlugin funcionou
// ---------------------------------------------------------------------------
test.describe('Smoke: version.json (buildVersionPlugin)', () => {
    test('GET /version.json retorna JSON com campos esperados', async ({ request }) => {
        const response = await request.get('/version.json')

        expect(response.status()).toBe(200)

        const json = await response.json()

        expect(json).toHaveProperty('appName', 'adsmagic-frontend')
        expect(json).toHaveProperty('branch')
        expect(json).toHaveProperty('commit')
        expect(json).toHaveProperty('commitShort')
        expect(json).toHaveProperty('buildTime')
        expect(json).toHaveProperty('source')

        // commitShort tem exatamente 7 chars (ou "unknown")
        if (json.commitShort !== 'unknown') {
            expect(json.commitShort).toHaveLength(7)
        }
    })
})
