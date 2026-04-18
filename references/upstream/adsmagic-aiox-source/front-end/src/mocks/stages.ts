/**
 * Mock data for funnel stages
 *
 * Stages define the customer journey steps. Must have:
 * - At least 1 default stage (cannot be deleted)
 * - Maximum 1 sale stage
 * - Maximum 1 lost stage
 * - Multiple normal stages allowed
 *
 * @module mocks/stages
 */

import type { Stage } from '@/types'

/**
 * Mock funnel stages
 */
export const MOCK_STAGES: Stage[] = [
  {
    id: 'stage-contact-initiated',
    name: 'Contato Iniciado',
    order: 0,
    trackingPhrase: 'oi',
    type: 'normal',
    isActive: true,
    projectId: '2',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'stage-qualification',
    name: 'Qualificação',
    order: 1,
    trackingPhrase: 'quero saber mais',
    type: 'normal',
    isActive: true,
    eventConfig: {
      meta: {
        eventType: 'Lead',
        active: true
      },
      google: {
        eventType: 'generate_lead',
        active: true
      },
      tiktok: {
        eventType: 'CompleteRegistration',
        active: false
      }
    },
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'stage-proposal-sent',
    name: 'Proposta Enviada',
    order: 2,
    trackingPhrase: 'enviei a proposta',
    type: 'normal',
    isActive: true,
    eventConfig: {
      meta: {
        eventType: 'InitiateCheckout',
        active: true
      },
      google: {
        eventType: 'begin_checkout',
        active: true
      },
      tiktok: {
        eventType: 'InitiateCheckout',
        active: false
      }
    },
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'stage-negotiation',
    name: 'Negociação',
    order: 3,
    trackingPhrase: 'negociando',
    type: 'normal',
    isActive: true,
    projectId: '2',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'stage-sale',
    name: 'Venda Realizada',
    order: 4,
    trackingPhrase: 'fechou',
    type: 'sale',
    isActive: true,
    eventConfig: {
      meta: {
        eventType: 'Purchase',
        active: true
      },
      google: {
        eventType: 'purchase',
        active: true
      },
      tiktok: {
        eventType: 'CompletePayment',
        active: true
      },
      defaultValue: 0, // Will use actual sale value
      defaultCurrency: 'BRL'
    },
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'stage-lost',
    name: 'Venda Perdida',
    order: 5,
    type: 'lost',
    isActive: true,
    projectId: '2',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

/**
 * Helper to get stage by ID
 */
export function getStageById(id: string): Stage | undefined {
  return MOCK_STAGES.find((stage) => stage.id === id)
}

/**
 * Helper to get active stages only
 */
export function getActiveStages(): Stage[] {
  return MOCK_STAGES.filter((stage) => stage.isActive)
}

/**
 * Helper to get stages for Kanban (excludes lost stage)
 */
export function getKanbanStages(): Stage[] {
  return MOCK_STAGES.filter((stage) => stage.type !== 'lost' && stage.isActive).sort(
    (a, b) => a.order - b.order
  )
}

/**
 * Helper to get the sale stage
 */
export function getSaleStage(): Stage | undefined {
  return MOCK_STAGES.find((stage) => stage.type === 'sale')
}

/**
 * Helper to get the lost stage
 */
export function getLostStage(): Stage | undefined {
  return MOCK_STAGES.find((stage) => stage.type === 'lost')
}

/**
 * Helper to get the default stage (first normal stage)
 */
export function getDefaultStage(): Stage {
  const defaultStage = MOCK_STAGES.find((stage) => stage.type === 'normal')
  if (!defaultStage) {
    throw new Error('No default stage found')
  }
  return defaultStage
}
