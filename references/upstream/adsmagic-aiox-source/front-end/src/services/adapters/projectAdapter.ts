/**
 * Adapter para conversão de projetos da API para o formato do frontend
 * 
 * Mapeia campos do formato da API (snake_case) para formato do frontend:
 * - whatsapp_connected (boolean) → whatsappStatus ('connected' | 'disconnected')
 * 
 * Este adapter garante que os projetos retornados da API tenham o campo
 * whatsappStatus populado corretamente, permitindo que os computed da store
 * e componentes funcionem corretamente.
 */

import type { Project } from '@/types/project'
import type { WhatsAppStatus } from '@/types/project'

/**
 * Adapta um projeto da API para o formato esperado pelo frontend
 * 
 * Mapeia campos do formato da API (snake_case) para formato do frontend:
 * - whatsapp_connected (boolean) → whatsappStatus ('connected' | 'disconnected')
 * 
 * @param project - Projeto no formato da API
 * @returns Projeto adaptado para o formato do frontend
 * 
 * @example
 * ```ts
 * const apiProject = { 
 *   id: '1', 
 *   name: 'Meu Projeto',
 *   whatsapp_connected: false,
 *   // ... outros campos
 * }
 * const adapted = adaptProject(apiProject)
 * // adapted.whatsappStatus === 'disconnected'
 * ```
 */
export function adaptProject(project: Project): Project {
  const { wizard_progress, ...rest } = project

  const normalizedWizardProgress = wizard_progress
    ? {
      current_step: wizard_progress.current_step,
      data: wizard_progress.data ?? {}
    }
    : undefined

  // Garantir que métricas sempre estejam presentes (zeradas quando não houver dados)
  const investment = project.investment ?? 0
  const revenue = project.revenue ?? 0
  const contactsCount = project.contacts_count ?? 0
  const salesCount = project.sales_count ?? 0
  const conversionRate = project.conversion_rate ?? 0
  const averageTicket = project.average_ticket ?? 0

  // Objeto metrics esperado por ProjectsTable e projectsStore.totalMetrics
  const metrics = {
    investment,
    contacts: contactsCount,
    sales: salesCount,
    conversionRate,
    averageTicket,
    revenue
  }

  return {
    ...rest,
    investment,
    revenue,
    contacts_count: contactsCount,
    sales_count: salesCount,
    conversion_rate: conversionRate,
    average_ticket: averageTicket,
    metrics,
    wizard_progress: normalizedWizardProgress,
    whatsappStatus: (project.whatsapp_connected
      ? 'connected'
      : 'disconnected'
    ) as WhatsAppStatus
  }
}

/**
 * Adapta um array de projetos da API para o formato do frontend
 * 
 * @param projects - Array de projetos no formato da API
 * @returns Array de projetos adaptados
 * 
 * @example
 * ```ts
 * const apiProjects = [
 *   { id: '1', whatsapp_connected: true },
 *   { id: '2', whatsapp_connected: false }
 * ]
 * const adapted = adaptProjects(apiProjects)
 * // adapted[0].whatsappStatus === 'connected'
 * // adapted[1].whatsappStatus === 'disconnected'
 * ```
 */
export function adaptProjects(projects: Project[]): Project[] {
  return projects.map(adaptProject)
}

