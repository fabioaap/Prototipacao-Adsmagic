/**
 * Constantes relacionadas à conexão de instâncias WhatsApp
 * 
 * Centraliza valores de timeout e URLs padrão usados nos handlers de conexão.
 * 
 * @module constants/connection
 */

/**
 * Timeout para QR Code (2 minutos)
 * 
 * QR Code expira após 2 minutos conforme documentação UAZAPI.
 */
export const QR_CODE_TIMEOUT_MS = 2 * 60 * 1000

/**
 * Timeout para Pair Code (5 minutos)
 * 
 * Pair Code expira após 5 minutos conforme documentação UAZAPI.
 */
export const PAIR_CODE_TIMEOUT_MS = 5 * 60 * 1000

/**
 * URL padrão da API UAZAPI
 * 
 * URL base usada quando não especificada na configuração da conta.
 */
export const DEFAULT_UAZAPI_URL = 'https://free.uazapi.com'
