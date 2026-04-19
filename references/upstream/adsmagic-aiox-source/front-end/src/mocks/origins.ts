/**
 * Mock data for traffic origins
 *
 * Includes both system origins (non-deletable) and custom origins.
 *
 * @module mocks/origins
 */

import type { Origin } from '@/types'

/**
 * System origins (predefined, cannot be deleted)
 */
export const SYSTEM_ORIGINS: Origin[] = [
  {
    id: 'origin-google-ads',
    name: 'Google Ads',
    type: 'system',
    color: '#4285F4', // Google Blue
    icon: '🔵',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-meta-ads',
    name: 'Meta Ads',
    type: 'system',
    color: '#E4405F', // Instagram/Meta Pink
    icon: 'Ⓜ️',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-instagram',
    name: 'Instagram',
    type: 'system',
    color: '#C13584', // Instagram Purple
    icon: '📷',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-tiktok-ads',
    name: 'TikTok Ads',
    type: 'system',
    color: '#FE2C55', // TikTok Red
    icon: '🎵',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-whatsapp',
    name: 'WhatsApp',
    type: 'system',
    color: '#25D366', // WhatsApp Green
    icon: '📱',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-referral',
    name: 'Indicação',
    type: 'system',
    color: '#10B981', // Green
    icon: '🤝',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-organic',
    name: 'Organic',
    type: 'system',
    color: '#8B5CF6', // Purple
    icon: '🌱',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-direct',
    name: 'Direct',
    type: 'system',
    color: '#1F2937', // Dark Gray
    icon: '🔗',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'origin-outros',
    name: 'Outros',
    type: 'system',
    color: '#6B7280', // Gray
    icon: '📦',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

/**
 * Custom origins (user-created, max 20 per project)
 */
export const CUSTOM_ORIGINS: Origin[] = [
  {
    id: 'origin-custom-1',
    name: 'LinkedIn Ads',
    type: 'custom',
    color: '#0A66C2', // LinkedIn Blue
    icon: '💼',
    isActive: true,
    projectId: '2',
    createdAt: '2024-09-15T10:30:00.000Z'
  },
  {
    id: 'origin-custom-2',
    name: 'Evento Presencial',
    type: 'custom',
    color: '#F59E0B', // Amber
    icon: '🎪',
    isActive: true,
    projectId: '2',
    createdAt: '2024-09-20T14:20:00.000Z'
  },
  {
    id: 'origin-custom-3',
    name: 'Parceria Estratégica',
    type: 'custom',
    color: '#EC4899', // Pink
    icon: '🤝',
    isActive: true,
    projectId: '2',
    createdAt: '2024-10-01T09:00:00.000Z'
  },
  {
    id: 'origin-custom-4',
    name: 'YouTube Ads',
    type: 'custom',
    color: '#FF0000', // YouTube Red
    icon: '▶️',
    isActive: false, // Inactive example
    projectId: '2',
    createdAt: '2024-08-10T16:45:00.000Z'
  }
]

/**
 * All origins combined
 */
export const MOCK_ORIGINS: Origin[] = [...SYSTEM_ORIGINS, ...CUSTOM_ORIGINS]

/**
 * Helper to get origin by ID
 */
export function getOriginById(id: string): Origin | undefined {
  return MOCK_ORIGINS.find((origin) => origin.id === id)
}

/**
 * Helper to get active origins only
 */
export function getActiveOrigins(): Origin[] {
  return MOCK_ORIGINS.filter((origin) => origin.isActive)
}
