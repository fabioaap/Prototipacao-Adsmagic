import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './journeys',
    timeout: 60_000,
    fullyParallel: true,
    reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium-pt', use: { ...devices['Desktop Chrome'], locale: 'pt-BR' } },
        { name: 'chromium-en', use: { ...devices['Desktop Chrome'], locale: 'en-US' } },
        { name: 'chromium-es', use: { ...devices['Desktop Chrome'], locale: 'es-ES' } },
    ],
})
