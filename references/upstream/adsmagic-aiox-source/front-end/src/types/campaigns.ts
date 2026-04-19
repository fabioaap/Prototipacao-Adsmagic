export type CampaignsTableLevel = 'campaign' | 'adset' | 'ad'
export type CampaignsPeriod = 'today' | '7d' | '30d' | '90d' | 'custom'
export type CampaignsSortDirection = 'asc' | 'desc'

export type CampaignsColumnId =
  | 'name'
  | 'spend'
  | 'impressions'
  | 'clicks'
  | 'ctr'
  | 'contacts'
  | 'sales'
  | 'cpc'
  | 'cpm'
  | 'revenue'
  | 'roas'
  | 'results'
  | 'costPerResult'

export interface CampaignsIndicatorOption {
  id: string
  label: string
}

export interface CampaignsPerformanceRow {
  id: string
  name: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  contacts: number
  sales: number
  cpc: number
  cpm: number
  revenue: number
  roas: number
  results?: number
  resultType?: string
  costPerResult?: number
  costPerResultLabel?: string
  thumbnailUrl?: string
  customMetrics?: Record<string, number>
}

export interface CampaignsHierarchySelection {
  campaignId: string | null
  campaignName: string | null
  adsetId: string | null
  adsetName: string | null
}

export interface CampaignsFilterState {
  period: CampaignsPeriod
  startDate: string | null
  endDate: string | null
  compare: boolean
}

export interface CampaignsLevelSortState {
  sortBy: CampaignsColumnId
  sortDirection: CampaignsSortDirection
}

export interface CampaignsLevelTableConfigState {
  selectedColumnIds: CampaignsColumnId[]
  columnOrder: CampaignsColumnId[]
  loaded: boolean
}
