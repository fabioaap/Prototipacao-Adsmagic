/**
 * Setup Checklist Types
 *
 * Tipos para o sistema de checklist de ativação do projeto.
 * Usado pelo store e componentes do checklist no dashboard.
 *
 * @module types/setupChecklist
 */

export type SetupStepId =
  | 'connect_whatsapp'
  | 'connect_ads'
  | 'configure_funnel'
  | 'receive_lead'

export type StepStatus = 'completed' | 'active' | 'pending'

export interface SetupStep {
  id: SetupStepId
  titleKey: string
  tooltipKey: string
  iconName: string
  routeName: string
  routeQuery?: Record<string, string>
  ctaKey: string
  order: number
}

export interface SetupStepWithStatus extends SetupStep {
  status: StepStatus
  completed: boolean
}
