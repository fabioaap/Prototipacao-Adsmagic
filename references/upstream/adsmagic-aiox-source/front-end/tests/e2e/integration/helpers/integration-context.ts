import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface IntegrationContext {
    projectId: string
    companyId: string | null
    locale: string
    projectName: string
}

const CONTEXT_FILE = path.resolve(__dirname, '../.auth/context.json')

let _ctx: IntegrationContext | null = null

/**
 * Retorna o contexto de integração (project_id, company_id, locale)
 * gerado pelo global-setup ao fazer login com a conta de teste.
 */
export function getIntegrationContext(): IntegrationContext {
    if (_ctx) return _ctx

    if (!fs.existsSync(CONTEXT_FILE)) {
        throw new Error(
            '[integration-context] .auth/context.json não encontrado. ' +
            'Certifique-se de que o global-setup rodou com sucesso antes dos specs.'
        )
    }

    _ctx = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8')) as IntegrationContext
    return _ctx
}

/**
 * Monta a URL de uma sub-rota do projeto âncora.
 * @param subPath - Ex: 'dashboard-v2', 'contacts', 'sales', 'settings/general'
 */
export function projectUrl(subPath: string): string {
    const { locale, projectId } = getIntegrationContext()
    return `/${locale}/projects/${projectId}/${subPath}`
}

/**
 * Retorna a URL raiz dos projetos.
 */
export function projectsUrl(): string {
    const { locale } = getIntegrationContext()
    return `/${locale}/projects`
}
