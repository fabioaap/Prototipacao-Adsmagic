/**
 * Constantes relacionadas aos brokers WhatsApp
 * 
 * Centraliza valores padrão e tipos de brokers usados nos handlers.
 * Elimina magic strings e números do código.
 * 
 * @module constants/brokers
 */

/**
 * Tipos de brokers disponíveis
 */
export const BROKER_TYPES = {
  UAZAPI: 'uazapi',
  GUPSHUP: 'gupshup',
  OFFICIAL_WHATSAPP: 'official_whatsapp',
} as const

/**
 * Valores padrão para configuração de brokers
 */
export const BROKER_DEFAULTS = {
  UAZAPI_BASE_URL: 'https://free.uazapi.com',
} as const

/**
 * Tipos TypeScript derivados das constantes
 */
export type BrokerType = typeof BROKER_TYPES[keyof typeof BROKER_TYPES]
