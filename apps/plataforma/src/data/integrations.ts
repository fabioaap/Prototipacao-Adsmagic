export interface Integration {
  id: string
  name: string
  platform: 'meta' | 'google' | 'whatsapp' | 'tiktok'
  status: 'connected' | 'disconnected' | 'error'
  accountName?: string
  lastSync?: string
}

export const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Meta Ads',
    platform: 'meta',
    status: 'connected',
    accountName: 'Empresa ABC',
    lastSync: '2026-03-21T10:30:00'
  },
  {
    id: '2',
    name: 'Google Ads',
    platform: 'google',
    status: 'connected',
    accountName: 'empresa-abc@gmail.com',
    lastSync: '2026-03-21T09:15:00'
  },
  {
    id: '3',
    name: 'WhatsApp Business',
    platform: 'whatsapp',
    status: 'disconnected',
  },
  {
    id: '4',
    name: 'TikTok Ads',
    platform: 'tiktok',
    status: 'disconnected',
  },
]
