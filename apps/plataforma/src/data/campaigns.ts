export interface Campaign {
  id: string
  name: string
  platform: 'meta' | 'google'
  status: 'active' | 'paused' | 'ended'
  spend: number
  leads: number
  cpl: number
  startDate: string
}

export const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Brand Awareness — Março', platform: 'meta', status: 'active', spend: 3200, leads: 142, cpl: 22.5, startDate: '2026-03-01' },
  { id: '2', name: 'Search Brand — Março', platform: 'google', status: 'active', spend: 2800, leads: 98, cpl: 28.6, startDate: '2026-03-01' },
  { id: '3', name: 'Retargeting 30% OFF', platform: 'meta', status: 'active', spend: 1500, leads: 67, cpl: 22.4, startDate: '2026-03-10' },
  { id: '4', name: 'Display Remarketing', platform: 'google', status: 'paused', spend: 900, leads: 34, cpl: 26.5, startDate: '2026-02-15' },
  { id: '5', name: 'Lookalike — Clientes', platform: 'meta', status: 'active', spend: 2100, leads: 89, cpl: 23.6, startDate: '2026-03-05' },
  { id: '6', name: 'Performance Max', platform: 'google', status: 'active', spend: 1800, leads: 71, cpl: 25.4, startDate: '2026-03-08' },
  { id: '7', name: 'Video Views — Brand', platform: 'meta', status: 'ended', spend: 800, leads: 23, cpl: 34.8, startDate: '2026-02-01' },
]
