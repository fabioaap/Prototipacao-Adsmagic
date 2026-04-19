import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const __dirname = import.meta.dirname

// Carrega variáveis de ambiente do arquivo .env.integration (Node 20+ nativo)
try {
    process.loadEnvFile(path.resolve(__dirname, '.env.integration'))
} catch {
    // Arquivo pode não existir em CI — variáveis devem estar no ambiente
}

/**
 * Configuração Playwright para testes de integração Front + Back
 *
 * Foco: validar UX/UI gaps (loading states, toasts, validação inline,
 * empty states, redirecionamentos, dados reais na tela, responsividade, a11y)
 * contra o Supabase remoto real, usando o projeto "Dr Letícia Lopes".
 *
 * Uso:
 *   pnpm exec playwright test --config=playwright.integration.config.ts
 *
 * Pré-requisito:
 *   pnpm dev deve estar rodando na porta 5173
 */
export default defineConfig({
    testDir: './tests/e2e/integration',

    globalSetup: './tests/e2e/integration/global-setup.ts',

    // Arquivos auth (JWT real) — nunca commitar
    // Gerado pelo global-setup
    // use.storageState é definido por projeto abaixo

    timeout: 60 * 1000,
    expect: { timeout: 10 * 1000 },

    fullyParallel: false,
    retries: 1,
    workers: 1,

    reporter: [
        ['html', { outputFolder: 'playwright-integration-report', open: 'never' }],
        ['list'],
    ],

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        // Headless por padrão; trocar para false para debug local
        headless: true,
        // Carrega o estado de autenticação gerado pelo global-setup
        storageState: './tests/e2e/integration/.auth/state.json',
    },

    projects: [
        // Projeto especial: testes de auth que NÃO devem usar storageState
        // Usa estado explicitamente vazio para evitar herdar o storageState global
        {
            name: 'auth-tests',
            testMatch: '**/auth.integration.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                storageState: { cookies: [], origins: [] },
            },
        },
        // Desktop Chrome — todos os outros specs
        {
            name: 'desktop-chrome',
            testIgnore: '**/auth.integration.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
                storageState: './tests/e2e/integration/.auth/state.json',
            },
        },
        // Mobile iPhone 13 — mesmos specs para validar responsividade
        {
            name: 'mobile-iphone',
            testIgnore: '**/auth.integration.spec.ts',
            use: {
                ...devices['iPhone 13'],
                storageState: './tests/e2e/integration/.auth/state.json',
            },
        },
    ],

    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 60 * 1000,
        env: {
            VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
            VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
            VITE_USE_MOCK: 'false',
            VITE_USE_SUPABASE: 'true',
            VITE_API_BASE_URL: process.env.VITE_API_BASE_URL!,
        },
    },
})
