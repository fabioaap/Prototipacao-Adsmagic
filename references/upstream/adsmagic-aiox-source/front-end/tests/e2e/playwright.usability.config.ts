import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração específica para testes de usabilidade da página de contatos
 * Otimizada para capturar comportamento real do usuário
 */
export default defineConfig({
    testDir: './',
    testMatch: '**/contacts-usability-test-plan.spec.ts',

    // Configurações de timeout mais generosas para capturar UX real
    timeout: 120_000, // 2 minutos por teste
    expect: {
        timeout: 30_000, // 30s para assertions
    },

    // Execução sequencial para evitar interferências
    fullyParallel: false,
    workers: 1,

    // Máximo de tentativas para testes flaky
    retries: process.env.CI ? 2 : 1,

    // Reporters otimizados para análise de UX
    reporter: [
        ['list'],
        ['html', {
            outputFolder: 'usability-report',
            open: 'never'
        }],
        ['json', {
            outputFile: 'usability-results.json'
        }]
    ],

    use: {
        // URL base do ambiente de teste
        baseURL: process.env.BASE_URL || 'http://localhost:5173',

        // Configurações para capturar melhor a experiência do usuário
        trace: 'on', // Sempre capturar trace para análise
        screenshot: 'on', // Screenshots de todas as interações
        video: 'on', // Vídeos para análise visual

        // Timeout mais realista para ações de usuário
        actionTimeout: 15_000,
        navigationTimeout: 30_000,

        // Simular velocidade de conexão real
        launchOptions: {
            slowMo: 100, // 100ms entre ações para simular usuário real
        },

        // Headers para identificar testes
        extraHTTPHeaders: {
            'X-Test-Type': 'usability',
            'X-Test-Suite': 'contacts-page'
        }
    },

    // Projetos para diferentes cenários de teste
    projects: [
        // Desktop - Chrome (principal)
        {
            name: 'desktop-chrome',
            use: {
                ...devices['Desktop Chrome'],
                locale: 'pt-BR',
                viewport: { width: 1440, height: 900 }
            },
        },

        // Desktop - Firefox (cross-browser)
        {
            name: 'desktop-firefox',
            use: {
                ...devices['Desktop Firefox'],
                locale: 'pt-BR',
                viewport: { width: 1440, height: 900 }
            },
        },

        // Tablet - iPad
        {
            name: 'tablet-ipad',
            use: {
                ...devices['iPad Pro'],
                locale: 'pt-BR'
            },
        },

        // Mobile - iPhone
        {
            name: 'mobile-iphone',
            use: {
                ...devices['iPhone 13'],
                locale: 'pt-BR'
            },
        },

        // Desktop - Usuário com deficiência visual (simulado)
        {
            name: 'accessibility-test',
            use: {
                ...devices['Desktop Chrome'],
                locale: 'pt-BR',
                viewport: { width: 1440, height: 900 },
                // Simular alto contraste e zoom
                colorScheme: 'dark',
                reducedMotion: 'reduce'
            },
        },

        // Conexão lenta (simulação)
        {
            name: 'slow-connection',
            use: {
                ...devices['Desktop Chrome'],
                locale: 'pt-BR',
                viewport: { width: 1440, height: 900 },
                launchOptions: {
                    slowMo: 500, // Ações mais lentas
                }
            },
        }
    ],

    // Setup global para testes de usabilidade
    globalSetup: './usability-global-setup.ts',
    globalTeardown: './usability-global-teardown.ts',

    // Diretórios de saída otimizados
    outputDir: 'usability-test-results',

    // Configurações de web server para desenvolvimento
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    }
})