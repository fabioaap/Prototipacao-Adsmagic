import { chromium, FullConfig } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Setup global para testes de usabilidade
 * Prepara ambiente e coleta dados baseline
 */
export default async function globalSetup(config: FullConfig) {
    console.log('🎭 Iniciando setup para testes de usabilidade...')

    // Criar diretórios para resultados se não existirem
    const outputDirs = [
        'usability-test-results',
        'usability-report',
        'usability-screenshots'
    ]

    outputDirs.forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
        }
    })

    // Criar arquivo de configuração de teste
    const testConfig = {
        startTime: new Date().toISOString(),
        baseURL: config.projects[0].use.baseURL,
        testEnvironment: process.env.NODE_ENV || 'development',
        userAgent: 'PlaywrightUsabilityTest/1.0',
        locale: 'pt-BR'
    }

    writeFileSync(
        join('usability-test-results', 'config.json'),
        JSON.stringify(testConfig, null, 2)
    )

    // Verificar se servidor está rodando
    try {
        const browser = await chromium.launch()
        const context = await browser.newContext()
        const page = await context.newPage()

        await page.goto(config.projects[0].use.baseURL + '/pt/projects/mock-project-001/contacts')
        await page.waitForLoadState('networkidle')

        console.log('✅ Servidor de teste verificado e funcionando')

        await browser.close()
    } catch (error) {
        console.error('❌ Erro ao verificar servidor:', error)
        throw error
    }

    console.log('🎭 Setup de usabilidade concluído!')
}