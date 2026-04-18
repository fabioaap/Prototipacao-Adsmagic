import { FullConfig } from '@playwright/test'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Teardown global para testes de usabilidade
 * Consolida resultados e gera relatório final
 */
export default async function globalTeardown(config: FullConfig) {
    console.log('🎭 Iniciando teardown para testes de usabilidade...')

    try {
        // Ler configuração inicial
        const configPath = join('usability-test-results', 'config.json')
        const testConfig = existsSync(configPath)
            ? JSON.parse(readFileSync(configPath, 'utf-8'))
            : {}

        // Ler resultados se existirem
        const resultsPath = 'usability-results.json'
        const results = existsSync(resultsPath)
            ? JSON.parse(readFileSync(resultsPath, 'utf-8'))
            : null

        // Criar relatório de resumo
        const summary = {
            executionSummary: {
                startTime: testConfig.startTime,
                endTime: new Date().toISOString(),
                environment: testConfig.testEnvironment,
                baseURL: testConfig.baseURL
            },
            testResults: results ? {
                totalTests: results.suites?.reduce((acc: number, suite: any) =>
                    acc + suite.specs.length, 0) || 0,
                passedTests: results.suites?.reduce((acc: number, suite: any) =>
                    acc + suite.specs.filter((spec: any) => spec.ok).length, 0) || 0,
                failedTests: results.suites?.reduce((acc: number, suite: any) =>
                    acc + suite.specs.filter((spec: any) => !spec.ok).length, 0) || 0
            } : null,
            recommendations: generateRecommendations(results)
        }

        // Salvar relatório final
        writeFileSync(
            join('usability-test-results', 'summary.json'),
            JSON.stringify(summary, null, 2)
        )

        // Log do resumo
        console.log('📊 Resumo dos Testes de Usabilidade:')
        if (summary.testResults) {
            console.log(`  ✅ Testes passou: ${summary.testResults.passedTests}`)
            console.log(`  ❌ Testes falhou: ${summary.testResults.failedTests}`)
            console.log(`  📝 Total de testes: ${summary.testResults.totalTests}`)
        }

        console.log('🎭 Teardown de usabilidade concluído!')
        console.log(`📁 Relatórios salvos em: usability-test-results/`)

    } catch (error) {
        console.error('❌ Erro durante teardown:', error)
    }
}

/**
 * Gera recomendações baseadas nos resultados dos testes
 */
function generateRecommendations(results: any): string[] {
    const recommendations: string[] = []

    if (!results) {
        recommendations.push('Executar testes para obter dados de usabilidade')
        return recommendations
    }

    // Analisar falhas e gerar recomendações
    const failedSpecs = results.suites?.flatMap((suite: any) =>
        suite.specs.filter((spec: any) => !spec.ok)
    ) || []

    if (failedSpecs.length > 0) {
        recommendations.push('Investigar falhas de usabilidade identificadas')

        // Analisar tipos de falha
        const timeoutFailures = failedSpecs.filter((spec: any) =>
            spec.tests?.[0]?.results?.[0]?.error?.message?.includes('timeout')
        )

        if (timeoutFailures.length > 0) {
            recommendations.push('Otimizar performance - muitos timeouts detectados')
        }

        const selectorFailures = failedSpecs.filter((spec: any) =>
            spec.tests?.[0]?.results?.[0]?.error?.message?.includes('locator')
        )

        if (selectorFailures.length > 0) {
            recommendations.push('Revisar seletores - elementos não encontrados')
        }
    } else {
        recommendations.push('Excelente! Todos os fluxos de usabilidade passaram')
    }

    return recommendations
}