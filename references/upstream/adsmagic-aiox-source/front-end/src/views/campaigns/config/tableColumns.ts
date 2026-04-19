import type { AdsTableColumn } from '@/components/campaigns/AdsMetricsTable.vue'
import type {
  CampaignsColumnId,
  CampaignsIndicatorOption,
  CampaignsTableLevel,
} from '@/types/campaigns'

export const DEFAULT_COLUMNS_BY_LEVEL: Record<CampaignsTableLevel, CampaignsColumnId[]> = {
  campaign: ['name', 'spend', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
  adset: ['name', 'spend', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
  ad: ['name', 'spend', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
}

export const BASE_INDICATOR_OPTIONS: CampaignsIndicatorOption[] = [
  { id: 'name', label: 'Nome' },
  { id: 'spend', label: 'Investimento' },
  { id: 'impressions', label: 'Impressões' },
  { id: 'clicks', label: 'Cliques' },
  { id: 'ctr', label: 'Taxa de cliques (CTR)' },
  { id: 'contacts', label: 'Contatos' },
  { id: 'sales', label: 'Vendas' },
]

export const CUSTOM_INDICATOR_OPTIONS: CampaignsIndicatorOption[] = [
  { id: 'results', label: 'Resultados' },
  { id: 'costPerResult', label: 'Custo por resultado' },
  { id: 'cpc', label: 'CPC' },
  { id: 'cpm', label: 'CPM' },
  { id: 'revenue', label: 'Receita' },
  { id: 'roas', label: 'ROAS' },
]

export const COLUMN_DEFINITIONS: Record<CampaignsColumnId, AdsTableColumn> = {
  name: { id: 'name', label: 'Nome', format: 'text', align: 'left' },
  spend: { id: 'spend', label: 'Investimento', format: 'currency', align: 'right' },
  impressions: { id: 'impressions', label: 'Impressões', format: 'number', align: 'right' },
  clicks: { id: 'clicks', label: 'Cliques', format: 'number', align: 'right' },
  ctr: { id: 'ctr', label: 'CTR', format: 'percent', align: 'right' },
  contacts: { id: 'contacts', label: 'Contatos', format: 'number', align: 'right' },
  sales: { id: 'sales', label: 'Vendas', format: 'number', align: 'right' },
  results: { id: 'results', label: 'Resultados', format: 'number', align: 'right', subtitleKey: 'resultType' },
  costPerResult: { id: 'costPerResult', label: 'Custo por resultado', format: 'currency', align: 'right', subtitleKey: 'costPerResultLabel' },
  cpc: { id: 'cpc', label: 'CPC', format: 'currency', align: 'right' },
  cpm: { id: 'cpm', label: 'CPM', format: 'currency', align: 'right' },
  revenue: { id: 'revenue', label: 'Receita', format: 'currency', align: 'right' },
  roas: { id: 'roas', label: 'ROAS', format: 'multiplier', align: 'right' },
}

export const META_DEFAULT_COLUMNS_BY_LEVEL: Record<CampaignsTableLevel, CampaignsColumnId[]> = {
  campaign: ['name', 'spend', 'results', 'costPerResult', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
  adset: ['name', 'spend', 'results', 'costPerResult', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
  ad: ['name', 'spend', 'results', 'costPerResult', 'impressions', 'clicks', 'ctr', 'contacts', 'sales'],
}

export function getDefaultColumns(level: CampaignsTableLevel): CampaignsColumnId[] {
  return [...DEFAULT_COLUMNS_BY_LEVEL[level]]
}

export function getMetaDefaultColumns(level: CampaignsTableLevel): CampaignsColumnId[] {
  return [...META_DEFAULT_COLUMNS_BY_LEVEL[level]]
}
