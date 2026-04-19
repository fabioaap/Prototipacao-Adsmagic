/**
 * Testes unitários para os mappers de performance de campanhas.
 * Cobre mapCampaignRows, mapAdsetRows e mapAdRows vindos do merge master→v3.
 */
import { describe, it, expect } from 'vitest'
import { mapCampaignRows, mapAdsetRows, mapAdRows } from '../performanceRows'
import type { CampaignMetrics, AdsetMetrics, AdMetrics } from '@/services/api/adInsights'

const baseCampaign: CampaignMetrics = {
  campaignId: 'camp-1',
  campaignName: 'Campanha Teste',
  status: 'ACTIVE',
  spend: 1000,
  impressions: 50000,
  reach: 40000,
  clicks: 800,
  ctr: 1.6,
  cpc: 1.25,
  cpm: 20,
  contacts: 100,
  sales: 20,
  revenue: 5000,
  roas: 5,
  results: 30,
  resultType: 'purchase',
  costPerResult: 33.33,
  costPerResultLabel: 'Custo por Compra',
}

const baseAdset: AdsetMetrics = {
  ...baseCampaign,
  adsetId: 'adset-1',
  adsetName: 'Público Lookalike',
}

const baseAd: AdMetrics = {
  ...baseAdset,
  adId: 'ad-1',
  adName: 'Criativo Vídeo A',
  thumbnailUrl: 'https://example.com/thumb.jpg',
}

describe('mapCampaignRows', () => {
  it('mapeia campos básicos de campanha corretamente', () => {
    const rows = mapCampaignRows([baseCampaign])
    const row = rows[0]!

    expect(row.id).toBe('camp-1')
    expect(row.name).toBe('Campanha Teste')
    expect(row.spend).toBe(1000)
    expect(row.impressions).toBe(50000)
    expect(row.clicks).toBe(800)
    expect(row.ctr).toBe(1.6)
    expect(row.contacts).toBe(100)
    expect(row.sales).toBe(20)
    expect(row.revenue).toBe(5000)
    expect(row.roas).toBe(5)
  })

  it('mapeia results e costPerResult opcionais', () => {
    const rows = mapCampaignRows([baseCampaign])
    const row = rows[0]!

    expect(row.results).toBe(30)
    expect(row.resultType).toBe('purchase')
    expect(row.costPerResult).toBe(33.33)
    expect(row.costPerResultLabel).toBe('Custo por Compra')
  })

  it('extrai métricas customizadas com prefixo "custom:"', () => {
    const campaignWithCustom = {
      ...baseCampaign,
      'custom:leads': 15,
      'custom:cpl': 66.67,
    } as unknown as CampaignMetrics

    const rows = mapCampaignRows([campaignWithCustom])
    const row = rows[0]!

    expect(row.customMetrics).toEqual({ 'custom:leads': 15, 'custom:cpl': 66.67 })
  })

  it('retorna customMetrics undefined quando não há campos custom:', () => {
    const rows = mapCampaignRows([baseCampaign])
    const row = rows[0]!

    expect(row.customMetrics).toBeUndefined()
  })

  it('retorna array vazio se entrada for vazia', () => {
    expect(mapCampaignRows([])).toEqual([])
  })

  it('mapeia múltiplas campanhas preservando ordem', () => {
    const second = { ...baseCampaign, campaignId: 'camp-2', campaignName: 'Segunda' }
    const rows = mapCampaignRows([baseCampaign, second])

    expect(rows).toHaveLength(2)
    expect(rows[0]!.id).toBe('camp-1')
    expect(rows[1]!.id).toBe('camp-2')
  })
})

describe('mapAdsetRows', () => {
  it('mapeia adsetId e adsetName como id e name', () => {
    const rows = mapAdsetRows([baseAdset])
    const row = rows[0]!

    expect(row.id).toBe('adset-1')
    expect(row.name).toBe('Público Lookalike')
  })

  it('mapeia métricas de performance do adset', () => {
    const rows = mapAdsetRows([baseAdset])
    const row = rows[0]!

    expect(row.spend).toBe(1000)
    expect(row.roas).toBe(5)
    expect(row.sales).toBe(20)
  })
})

describe('mapAdRows', () => {
  it('mapeia adId e adName como id e name', () => {
    const rows = mapAdRows([baseAd])
    const row = rows[0]!

    expect(row.id).toBe('ad-1')
    expect(row.name).toBe('Criativo Vídeo A')
  })

  it('inclui thumbnailUrl no row do anúncio', () => {
    const rows = mapAdRows([baseAd])
    const row = rows[0]!

    expect(row.thumbnailUrl).toBe('https://example.com/thumb.jpg')
  })

  it('thumbnailUrl undefined quando não fornecido', () => {
    const adWithoutThumb: AdMetrics = { ...baseAd, thumbnailUrl: undefined }
    const rows = mapAdRows([adWithoutThumb])
    const row = rows[0]!

    expect(row.thumbnailUrl).toBeUndefined()
  })

  it('extrai métricas customizadas de ads', () => {
    const adWithCustom = {
      ...baseAd,
      'custom:view_rate': 0.75,
    } as unknown as AdMetrics

    const rows = mapAdRows([adWithCustom])
    const row = rows[0]!

    expect(row.customMetrics).toEqual({ 'custom:view_rate': 0.75 })
  })
})
