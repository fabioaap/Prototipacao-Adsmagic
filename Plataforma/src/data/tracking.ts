export interface TrackableLink {
  id: string
  name: string
  originalUrl: string
  shortUrl: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  clicks: number
  conversions: number
  createdAt: string
  active: boolean
}

export const mockLinks: TrackableLink[] = [
  {
    id: '1',
    name: 'LP Principal - Meta',
    originalUrl: 'https://adsmagic.com.br/landing',
    shortUrl: 'https://go.adsmagic.com/lp-meta',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'brand_awareness_mar26',
    clicks: 1234,
    conversions: 87,
    createdAt: '2026-03-01',
    active: true
  },
  {
    id: '2',
    name: 'LP Principal - Google',
    originalUrl: 'https://adsmagic.com.br/landing',
    shortUrl: 'https://go.adsmagic.com/lp-google',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'search_brand_mar26',
    clicks: 892,
    conversions: 63,
    createdAt: '2026-03-01',
    active: true
  },
  {
    id: '3',
    name: 'Oferta 30% OFF - Meta',
    originalUrl: 'https://adsmagic.com.br/oferta',
    shortUrl: 'https://go.adsmagic.com/oferta-meta',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'retargeting_30off',
    clicks: 567,
    conversions: 42,
    createdAt: '2026-03-10',
    active: true
  },
  {
    id: '4',
    name: 'Trial Gratuito - Email',
    originalUrl: 'https://adsmagic.com.br/trial',
    shortUrl: 'https://go.adsmagic.com/trial-email',
    utmSource: 'email',
    utmMedium: 'newsletter',
    utmCampaign: 'newsletter_mar26',
    clicks: 234,
    conversions: 28,
    createdAt: '2026-03-05',
    active: true
  },
  {
    id: '5',
    name: 'Webinar - WhatsApp',
    originalUrl: 'https://adsmagic.com.br/webinar',
    shortUrl: 'https://go.adsmagic.com/webinar-wa',
    utmSource: 'whatsapp',
    utmMedium: 'social',
    utmCampaign: 'webinar_atribuicao_mar26',
    clicks: 189,
    conversions: 31,
    createdAt: '2026-03-15',
    active: true
  },
  {
    id: '6',
    name: 'Demo Agendamento - TikTok',
    originalUrl: 'https://adsmagic.com.br/demo',
    shortUrl: 'https://go.adsmagic.com/demo-tiktok',
    utmSource: 'tiktok',
    utmMedium: 'cpc',
    utmCampaign: 'demo_tiktok_mar26',
    clicks: 156,
    conversions: 12,
    createdAt: '2026-03-18',
    active: false
  },
]
