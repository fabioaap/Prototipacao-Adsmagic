/**
 * Mock data para integrações
 * 
 * Dados simulados para desenvolvimento e testes.
 * Segue a estrutura definida em @/types/models
 */

import type { Integration, TagInstallation, Account } from '@/types/models'

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    projectId: 'project-1',
    platform: 'whatsapp',
    platformType: 'messaging',
    status: 'connected',
    platformConfig: {},
    isActive: true,
    settings: {
      phoneNumber: '+5511999999999',
      businessName: 'Minha Empresa'
    },
    connection: {
      connectedAt: '2025-10-20T10:00:00Z',
      lastSync: '2025-10-20T09:30:00Z',
    },
    lastSync: '2025-10-20T09:30:00Z',
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-10-20T10:00:00Z',
  },
  {
    id: '2',
    projectId: 'project-1',
    platform: 'meta',
    platformType: 'advertising',
    status: 'connected',
    platformConfig: {},
    isActive: true,
    settings: {
      adAccountId: 'act_123456789',
      pixelId: '123456789012345'
    },
    connection: {
      connectedAt: '2025-10-19T14:00:00Z',
      lastSync: '2025-10-20T08:00:00Z',
    },
    lastSync: '2025-10-20T08:00:00Z',
    createdAt: '2025-10-19T14:00:00Z',
    updatedAt: '2025-10-20T08:00:00Z',
  },
  {
    id: '3',
    projectId: 'project-1',
    platform: 'google',
    platformType: 'advertising',
    status: 'disconnected',
    platformConfig: {},
    isActive: false,
    settings: {},
    createdAt: '2025-10-17T12:00:00Z',
    updatedAt: '2025-10-17T12:00:00Z',
  },
  {
    id: '4',
    projectId: 'project-1',
    platform: 'tiktok',
    platformType: 'advertising',
    status: 'pending',
    platformConfig: {},
    isActive: false,
    settings: {},
    createdAt: '2025-10-16T16:00:00Z',
    updatedAt: '2025-10-16T16:00:00Z',
  },
  {
    id: '5',
    projectId: 'project-1',
    platform: 'linkedin',
    platformType: 'advertising',
    status: 'connected',
    platformConfig: {},
    isActive: true,
    settings: {
      accountId: 'li_123456789',
      campaignId: 'camp_987654321'
    },
    connection: {
      connectedAt: '2025-10-18T11:00:00Z',
      lastSync: '2025-10-20T07:30:00Z',
    },
    lastSync: '2025-10-20T07:30:00Z',
    createdAt: '2025-10-18T11:00:00Z',
    updatedAt: '2025-10-20T07:30:00Z',
  },
  {
    id: '6',
    projectId: 'project-1',
    platform: 'telegram',
    platformType: 'messaging',
    status: 'connected',
    platformConfig: {},
    isActive: true,
    settings: {
      botToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
      chatId: '-1001234567890'
    },
    connection: {
      connectedAt: '2025-10-17T15:30:00Z',
      lastSync: '2025-10-20T06:45:00Z',
    },
    lastSync: '2025-10-20T06:45:00Z',
    createdAt: '2025-10-17T15:30:00Z',
    updatedAt: '2025-10-20T06:45:00Z',
  }
]

export const MOCK_TAG_INSTALLATION: TagInstallation = {
  projectId: 'project-1',
  scriptCode: '<script src="https://adsmagic.com.br/tag/adsmagic-tag.js"></script>',
  isInstalled: true,
  status: 'active',
  lastPing: '2025-10-20T09:00:00Z',
  eventsReceived: 1250,
}

export const MOCK_ACCOUNTS: Record<string, Account[]> = {
  meta: [
    {
      id: '1',
      name: 'Conta Principal - Meta',
      accountId: 'act_123456789',
      type: 'ad_account',
      permissions: ['ads_management', 'ads_read']
    },
    {
      id: '2',
      name: 'Conta Secundária - Meta',
      accountId: 'act_987654321',
      type: 'ad_account',
      permissions: ['ads_read']
    }
  ],
  google: [
    {
      id: '3',
      name: 'Conta Principal - Google',
      accountId: '1234567890',
      type: 'ad_account',
      permissions: ['https://www.googleapis.com/auth/adwords']
    }
  ],
  tiktok: [
    {
      id: '4',
      name: 'Conta Principal - TikTok',
      accountId: '1234567890',
      type: 'ad_account',
      permissions: ['ad_account_info']
    }
  ],
  linkedin: [
    {
      id: '5',
      name: 'Conta Principal - LinkedIn',
      accountId: 'li_123456789',
      type: 'ad_account',
      permissions: ['r_liteprofile', 'r_emailaddress']
    }
  ]
}

// Função para gerar integrações aleatórias
export function generateMockIntegrations(count: number): Integration[] {
  const platforms: Array<'whatsapp' | 'meta' | 'google' | 'tiktok' | 'linkedin' | 'telegram'> = ['whatsapp', 'meta', 'google', 'tiktok', 'linkedin', 'telegram']
  const statuses: Array<'connected' | 'disconnected' | 'pending' | 'error' | 'syncing'> = ['connected', 'disconnected', 'pending', 'error']
  
  return Array.from({ length: count }, (_, index) => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)] as 'whatsapp' | 'meta' | 'google' | 'tiktok' | 'linkedin' | 'telegram'
    const status = statuses[Math.floor(Math.random() * statuses.length)] as 'connected' | 'disconnected' | 'pending' | 'error' | 'syncing'
    const platformType = platform === 'whatsapp' || platform === 'telegram' ? 'messaging' : 'advertising'
    const isActive = status === 'connected'
    const connectedAt = isActive ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    const lastSync = isActive ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined
    const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    
    const integration: Integration = {
      id: `mock_integration_${Date.now()}_${index}`,
      projectId: 'project-1',
      platform,
      platformType,
      status,
      platformConfig: {},
      isActive,
      settings: {},
      createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    if (isActive && connectedAt) {
      integration.connection = {
        connectedAt,
        lastSync,
      }
      integration.lastSync = lastSync
    }
    
    // Adiciona configurações específicas baseadas na plataforma
    if (platform === 'whatsapp') {
      integration.settings = {
        phoneNumber: `+551199999999${index}`,
        businessName: `Empresa ${index + 1}`
      }
    } else if (platform === 'meta') {
      integration.settings = {
        adAccountId: `act_${Math.floor(Math.random() * 1000000000)}`,
        pixelId: `${Math.floor(Math.random() * 1000000000000000)}`
      }
    } else if (platform === 'google') {
      integration.settings = {
        accountId: `${Math.floor(Math.random() * 1000000000)}`,
        conversionId: `${Math.floor(Math.random() * 1000000000)}`
      }
    } else if (platform === 'tiktok') {
      integration.settings = {
        advertiserId: `${Math.floor(Math.random() * 1000000000)}`,
        appId: `${Math.floor(Math.random() * 1000000000)}`
      }
    } else if (platform === 'linkedin') {
      integration.settings = {
        accountId: `li_${Math.floor(Math.random() * 1000000000)}`,
        campaignId: `camp_${Math.floor(Math.random() * 1000000000)}`
      }
    } else if (platform === 'telegram') {
      integration.settings = {
        botToken: `${Math.floor(Math.random() * 1000000000)}:ABCdefGHIjklMNOpqrsTUVwxyz`,
        chatId: `-100${Math.floor(Math.random() * 1000000000)}`
      }
    }
    
    return integration
  })
}

// Função para gerar status da tag
export function generateMockTagStatus(): TagInstallation {
  const isInstalled = Math.random() > 0.3 // 70% de chance de estar instalada
  const status = isInstalled ? 'active' : 'not_found'
  
  return {
    projectId: 'project-1',
    scriptCode: '<script src="https://adsmagic.com.br/tag/adsmagic-tag.js"></script>',
    isInstalled,
    status: status === 'active' ? 'active' : 'inactive',
    lastPing: isInstalled ? new Date().toISOString() : undefined,
    eventsReceived: isInstalled ? Math.floor(Math.random() * 1000) : 0,
  }
}

// Função para gerar contas por plataforma
export function generateMockAccounts(platform: string, count: number = 2): Account[] {
  const accountNames = [
    'Conta Principal', 'Conta Secundária', 'Conta de Teste', 'Conta Corporativa',
    'Conta Pessoal', 'Conta Comercial', 'Conta Premium', 'Conta Básica'
  ]
  
  return Array.from({ length: count }, (_, index) => ({
    id: `mock_account_${Date.now()}_${index}`,
    name: `${accountNames[Math.floor(Math.random() * accountNames.length)]} - ${platform}`,
    accountId: `${platform}_${Math.floor(Math.random() * 1000000000)}`,
    type: 'ad_account' as const,
    permissions: ['ads_management', 'ads_read']
  }))
}

// Métricas calculadas dos mocks
export const MOCK_INTEGRATIONS_METRICS = {
  total: MOCK_INTEGRATIONS.length,
  connected: MOCK_INTEGRATIONS.filter(i => i.status === 'connected').length,
  disconnected: MOCK_INTEGRATIONS.filter(i => i.status === 'disconnected').length,
  pending: MOCK_INTEGRATIONS.filter(i => i.status === 'pending').length,
  active: MOCK_INTEGRATIONS.filter(i => i.isActive).length,
  tagInstalled: MOCK_TAG_INSTALLATION.isInstalled,
  tagStatus: MOCK_TAG_INSTALLATION.status
}
