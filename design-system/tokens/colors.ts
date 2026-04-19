/**
 * Shared color tokens — single source of truth for all apps.
 *
 * Both Plataforma/tailwind.config.js and landing-pages/tailwind.config.js
 * import from here so the palette stays in sync.
 */

export const primary = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
} as const

export const semantic = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const

export const brandCampaign = {
  navy: '#010543',
  green: '#3BB56D',
  campaignBg: '#000E50',
} as const
