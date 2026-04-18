import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para CI/CD usando Vite Preview
 * 
 * Esta configuração usa o build de produção servido via `vite preview`
 * para evitar problemas de conectividade do dev server no Windows.
 * 
 * Uso:
 *   pnpm test:visual:ci
 * 
 * Vantagens:
 *   - ✅ Sem problemas de rede (servidor HTTP simples)
 *   - ✅ Testa código real de produção
 *   - ✅ Funciona em qualquer OS (Windows/Linux/macOS)
 * 
 * Desvantagens:
 *   - ❌ Sem HMR (precisa rebuild a cada mudança)
 *   - ❌ Build mais lento (~30s)
 */
export default defineConfig({
    testDir: './tests/e2e',
    // No CI (P1), rodamos o canário + smoke login no Vite Preview.
    // Outros testes E2E atuais dependem do dev server (5173) e/ou serviços locais.
    testMatch: [
        '**/spike-canary.spec.ts',
        '**/smoke-login.spec.ts',
        '**/journeys/auth.spec.ts',
        '**/journeys/register.spec.ts',
        '**/journeys/forgot-password.spec.ts',
        '**/journeys/reset-password.spec.ts',
        '**/journeys/contacts.spec.ts',
        '**/journeys/contacts-real.spec.ts',
        '**/journeys/post-merge-smoke.spec.ts',
    ],

    // Timeout por teste (aumentado para builds lentos)
    timeout: 60 * 1000,

    // Execução paralela
    fullyParallel: true,

    // Retry em caso de falha (flaky tests)
    retries: process.env.CI ? 2 : 0,

    // Workers em paralelo
    workers: process.env.CI ? 1 : undefined,

    // Reporter para CI
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results.json' }],
        ...(process.env.CI ? [['github' as const]] : []),
    ],

    use: {
        // Base URL usando Vite Preview (porta 4173)
        baseURL: 'http://127.0.0.1:4173',

        // Trace apenas em falhas (economiza espaço)
        trace: 'on-first-retry',

        // Screenshot apenas em falhas
        screenshot: 'only-on-failure',

        // Vídeo apenas em falhas
        video: 'retain-on-failure',
    },

    // Iniciar webServer automaticamente no CI (mais robusto e cross-plataforma)
    webServer: {
        command: 'pnpm preview -- --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Descomente para testar em outros navegadores:
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        // Mobile (opcional):
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
    ],
});
