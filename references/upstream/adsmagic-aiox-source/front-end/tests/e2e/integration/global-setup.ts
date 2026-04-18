import { chromium, type FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname

// Carrega .env.integration (Node 20+ nativo)
try {
    process.loadEnvFile(path.resolve(__dirname, '../../../.env.integration'))
} catch {
    // Variáveis devem estar no ambiente via CI ou shell
}

const AUTH_DIR = path.resolve(__dirname, '.auth')
const STATE_FILE = path.join(AUTH_DIR, 'state.json')
const CONTEXT_FILE = path.join(AUTH_DIR, 'context.json')

const EMAIL = process.env.INTEGRATION_TEST_EMAIL!
const PASSWORD = process.env.INTEGRATION_TEST_PASSWORD!
const PROJECT_NAME = process.env.INTEGRATION_TEST_PROJECT_NAME ?? 'Dr Letícia Lopes'
const BASE_URL = 'http://localhost:5173'

async function globalSetup(_config: FullConfig) {
    if (!EMAIL || !PASSWORD) {
        throw new Error(
            '[global-setup] INTEGRATION_TEST_EMAIL e INTEGRATION_TEST_PASSWORD devem estar definidos em .env.integration'
        )
    }

    // Garante que a pasta .auth existe
    fs.mkdirSync(AUTH_DIR, { recursive: true })

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        console.log('[global-setup] Navigating to login page...')
        await page.goto(`${BASE_URL}/pt/login`, { waitUntil: 'networkidle' })

        // Preenche credenciais
        const emailInput = page.getByLabel(/email/i)
        const passwordInput = page.getByLabel(/senha/i)
        const submitButton = page.locator('button[type="submit"]')

        await emailInput.fill(EMAIL)
        await passwordInput.fill(PASSWORD)
        await expect_enabled(submitButton)
        await submitButton.click()

        // Aguarda redirecionamento para /pt/projects
        await page.waitForURL(/\/pt\/projects/, { timeout: 30_000 })
        // Aguarda a página carregar completamente (projetos listados)
        await page.waitForLoadState('networkidle')

        // Aguarda o nome do projeto aparecer na tela (dados assíncronos do Pinia)
        // Tenta por até 20 segundos — pode demorar em cold start da Edge Function
        console.log(`[global-setup] Waiting for project "${PROJECT_NAME}" to appear in DOM...`)
        try {
            await page.waitForSelector(`text=${PROJECT_NAME}`, { timeout: 20_000 })
            console.log('[global-setup] Project name found in DOM.')
        } catch {
            console.warn(`[global-setup] "${PROJECT_NAME}" not found after 20s, trying fallback strategies...`)
        }

        console.log('[global-setup] Login successful. URL:', page.url())

        // Localiza o projeto âncora — estratégia em camadas
        let projectId: string | null = null
        let companyId: string | null = null

        // --- Estratégia 1: extrai todos os hrefs com padrão /projects/UUID/ da página ---
        const projectLinks: Array<{ href: string; text: string }> = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a[href]'))
            return anchors
                .map((a) => ({ href: (a as HTMLAnchorElement).href, text: a.textContent?.trim() ?? '' }))
                .filter(({ href }) => /\/projects\/[^/]+\//.test(href))
        })

        console.log('[global-setup] Project links found on page:', projectLinks.length)

        // Tenta encontrar o link do projeto âncora pelo nome
        const anchorForProject = projectLinks.find(({ text, href }) =>
            text.toLowerCase().includes(PROJECT_NAME.toLowerCase()) ||
            href.toLowerCase().includes(PROJECT_NAME.toLowerCase().replace(/\s/g, '-'))
        )

        if (anchorForProject) {
            const match = anchorForProject.href.match(/\/projects\/([^/]+)\//)
            if (match) projectId = match[1]
            console.log('[global-setup] Found via link text match:', anchorForProject.href)
        }

        // --- Estratégia 2: a tabela usa click handlers (sem <a>); clicar no texto do projeto
        //     via botão de Ações → Ver detalhes para capturar a URL com project_id ---
        if (!projectId) {
            // Localiza a linha da tabela que contém o nome do projeto
            const projectRow = page.locator('tr, [role="row"]').filter({ hasText: PROJECT_NAME }).first()
            const rowCount = await projectRow.count()

            if (rowCount > 0) {
                console.log('[global-setup] Found project row via table, opening Ações menu...')
                // Localiza e clica o botão de Ações na linha
                const actionsButton = projectRow.locator(
                    'button:has-text("Ações"), button[aria-label*="ações"], button[aria-label*="menu"], ' +
                    'button:has-text("..."), [data-testid*="actions"]'
                ).first()

                if ((await actionsButton.count()) > 0) {
                    await actionsButton.click()
                    await page.waitForTimeout(500)
                    // Clica em "Ver detalhes"
                    const verDetalhes = page.locator(
                        'button:has-text("Ver detalhes"), a:has-text("Ver detalhes"), ' +
                        '[role="menuitem"]:has-text("Ver"), [role="option"]:has-text("Ver")'
                    ).first()
                    if ((await verDetalhes.count()) > 0) {
                        await verDetalhes.click()
                        await page.waitForURL(/\/projects\/[^/]+\//, { timeout: 20_000 })
                        const match = new URL(page.url()).pathname.match(/\/projects\/([^/]+)\//)
                        if (match) {
                            projectId = match[1]
                            console.log('[global-setup] project_id extracted via Ações menu:', projectId)
                        }
                    }
                } else {
                    // Tenta clicar diretamente na célula do nome do projeto
                    const nameCell = projectRow.locator(`text=${PROJECT_NAME}`).first()
                    if ((await nameCell.count()) > 0) {
                        await nameCell.click()
                        await page.waitForTimeout(1500)
                        const urlAfterClick = new URL(page.url()).pathname.match(/\/projects\/([^/]+)\//)
                        if (urlAfterClick) {
                            projectId = urlAfterClick[1]
                            console.log('[global-setup] project_id extracted via row click:', projectId)
                        }
                    }
                }
            }
        }

        // --- Estratégia 3: busca qualquer elemento com texto do projeto e clica ---
        if (!projectId) {
            const projectEl = page.locator(`text=${PROJECT_NAME}`).first()
            const elCount = await projectEl.count()
            if (elCount > 0) {
                console.log('[global-setup] Found project name via text locator, clicking...')
                await projectEl.click()
                await page.waitForTimeout(2000)
                const urlMatch = new URL(page.url()).pathname.match(/\/projects\/([^/]+)\//)
                if (urlMatch) projectId = urlMatch[1]
            }
        }

        // --- Estratégia 4: clica no primeiro projeto disponível como fallback ---
        if (!projectId && projectLinks.length > 0) {
            console.log('[global-setup] Using first available project link as fallback')
            const match = projectLinks[0].href.match(/\/projects\/([^/]+)\//)
            if (match) projectId = match[1]
        }

        // --- Estratégia 5: localStorage ---
        if (!projectId) {
            console.log('[global-setup] Trying localStorage for project_id...')
            projectId = await page.evaluate(() => localStorage.getItem('current_project_id'))
            if (projectId) console.log('[global-setup] Got project_id from localStorage:', projectId)
        }

        // --- Debug: loga o HTML da página para diagnóstico ---
        if (!projectId) {
            const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000))
            console.log('[global-setup] Page body text (first 1000 chars):', bodyText)
            await page.screenshot({ path: path.join(AUTH_DIR, 'debug-projects-page.png') })
            console.log('[global-setup] Screenshot saved to .auth/debug-projects-page.png')
            throw new Error(
                `[global-setup] Não foi possível localizar o projeto "${PROJECT_NAME}" na conta. ` +
                'Verifique .auth/debug-projects-page.png para diagnóstico.'
            )
        }

        // Tenta extrair company_id do localStorage
        companyId = await page.evaluate(() => localStorage.getItem('current_company_id'))

        console.log(`[global-setup] Project ID: ${projectId}`)
        console.log(`[global-setup] Company ID: ${companyId ?? '(não encontrado no localStorage)'}`)

        // Salva storageState (inclui cookies + localStorage com tokens Supabase)
        await context.storageState({ path: STATE_FILE })
        console.log('[global-setup] storageState salvo em', STATE_FILE)

        // Salva contexto do projeto para os specs
        fs.writeFileSync(
            CONTEXT_FILE,
            JSON.stringify({ projectId, companyId, locale: 'pt', projectName: PROJECT_NAME }, null, 2)
        )
        console.log('[global-setup] context.json salvo em', CONTEXT_FILE)
    } finally {
        await browser.close()
    }
}

import type { Locator } from '@playwright/test'

// Mini-helper para aguardar botão habilitado sem importar todo o expect do @playwright/test
async function expect_enabled(locator: Locator) {
    const maxWait = 10_000
    const interval = 200
    let elapsed = 0
    while (elapsed < maxWait) {
        const disabled = await locator.isDisabled()
        if (!disabled) return
        await new Promise((r) => setTimeout(r, interval))
        elapsed += interval
    }
    throw new Error('[global-setup] Submit button never became enabled')
}

export default globalSetup
