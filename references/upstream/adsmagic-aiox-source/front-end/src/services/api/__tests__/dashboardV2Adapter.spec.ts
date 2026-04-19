/**
 * Unit tests for dashboardV2Adapter
 *
 * Covers:
 * - mapBackendSummaryToDashboardV2Summary: maps contacts from backend to northStar.contacts
 *   (value, delta, displayValue, tooltip)
 */

import { describe, it, expect } from 'vitest'
import {
  mapBackendSummaryToDashboardV2Summary,
  mapBackendFunnelStatsToFunnelViews,
  type BackendFunnelStatsResponse,
  type BackendSummaryResponse
} from '../adapters/dashboardV2Adapter'

/** Minimal backend summary response for tests (all required metrics) */
function minimalBackendSummary(overrides: Partial<BackendSummaryResponse> = {}): BackendSummaryResponse {
  const metric = (value: number, delta: number) => ({ value, delta })
  return {
    revenue: metric(6060, 12.1),
    sales: metric(8, 4.5),
    contacts: metric(120, 14.2),
    spend: metric(784.21, 8.4),
    roi: metric(7.7, 3.2),
    cac: metric(98, -2),
    avgTicket: metric(757.5, 1.05),
    impressions: metric(6020, 18.5),
    clicks: metric(245, 22),
    ctr: metric(4.07, 0.5),
    cpc: metric(3.2, -8.71),
    salesRate: metric(6.67, 6.67),
    avgCycleDays: metric(26, -15.94),
    activeCustomers: metric(206, 12.66),
    goalPercentage: metric(75, 0),
    ...overrides
  }
}

describe('dashboardV2Adapter', () => {
  describe('mapBackendSummaryToDashboardV2Summary', () => {
    it('maps contacts from backend to northStar.contacts with value, delta, displayValue and tooltip', () => {
      const raw = minimalBackendSummary({ contacts: { value: 150, delta: 10.5 } })
      const result = mapBackendSummaryToDashboardV2Summary(raw)

      expect(result.northStar.contacts).toBeDefined()
      expect(result.northStar.contacts.value).toBe(150)
      expect(result.northStar.contacts.delta).toBe(10.5)
      expect(result.northStar.contacts.displayValue).toBe('150')
      expect(result.northStar.contacts.tooltip).toBe(
        'Contatos = Total de contatos criados no período'
      )
    })

    it('formats contacts displayValue with pt-BR locale for thousands', () => {
      const raw = minimalBackendSummary({ contacts: { value: 1234, delta: 0 } })
      const result = mapBackendSummaryToDashboardV2Summary(raw)

      expect(result.northStar.contacts.displayValue).toBe('1.234')
    })

    it('maps contacts delta 0 to null in northStar', () => {
      const raw = minimalBackendSummary({ contacts: { value: 68, delta: 0 } })
      const result = mapBackendSummaryToDashboardV2Summary(raw)

      expect(result.northStar.contacts.delta).toBeNull()
    })
  })

  describe('mapBackendFunnelStatsToFunnelViews', () => {
    it('maps current and passed views with stages and overall conversion rate', () => {
      const raw: BackendFunnelStatsResponse = {
        totalContacts: 120,
        views: {
          current: {
            overallConversionRate: 5,
            stages: [
              {
                stageId: 'stage-1',
                stageName: 'Contato iniciado',
                displayOrder: 0,
                count: 70,
                conversionRate: 58.3,
                avgDays: 1.5
              }
            ]
          },
          passed: {
            overallConversionRate: 12.5,
            stages: [
              {
                stageId: 'stage-1',
                stageName: 'Contato iniciado',
                displayOrder: 0,
                count: 120,
                conversionRate: 100,
                avgDays: 1.5
              },
              {
                stageId: 'stage-2',
                stageName: 'Qualificação',
                displayOrder: 1,
                count: 60,
                conversionRate: 50,
                avgDays: 3
              }
            ]
          }
        }
      }

      const result = mapBackendFunnelStatsToFunnelViews(raw)

      expect(result.current.overallConversionRate).toBe(5)
      expect(result.current.stages).toEqual([
        {
          stageId: 'stage-1',
          stageName: 'Contato iniciado',
          count: 70,
          conversionRate: 58.3,
          avgTimeInStage: 1.5
        }
      ])

      expect(result.passed.overallConversionRate).toBe(12.5)
      expect(result.passed.stages[1]).toEqual({
        stageId: 'stage-2',
        stageName: 'Qualificação',
        count: 60,
        conversionRate: 50,
        avgTimeInStage: 3
      })
    })

    it('falls back to empty views when backend omits one of the modes', () => {
      const raw: BackendFunnelStatsResponse = {
        totalContacts: 0,
        views: {
          current: {
            overallConversionRate: 0,
            stages: []
          },
          passed: {
            overallConversionRate: 0,
            stages: []
          }
        }
      }

      const result = mapBackendFunnelStatsToFunnelViews(raw)

      expect(result.current).toEqual({
        stages: [],
        overallConversionRate: 0
      })
      expect(result.passed).toEqual({
        stages: [],
        overallConversionRate: 0
      })
    })
  })
})
