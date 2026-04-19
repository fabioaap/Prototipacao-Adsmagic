/**
 * Validadores Zod genéricos para integração WhatsApp Multi-Broker
 * 
 * Schemas de validação reutilizáveis para todos os brokers.
 * Seguem princípios SOLID: aberto para extensão, fechado para modificação.
 * 
 * @module validators/whatsappSchemas
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

/**
 * Schema para listar brokers disponíveis
 * 
 * Não requer dados no body, apenas autenticação.
 */
export const listBrokersSchema = z.object({
  // Body vazio - autenticação via JWT é suficiente
}).optional()

/**
 * Schema para criar instância (genérico - corrige violação OCP)
 * 
 * REMOVIDO: adminToken do body (deve vir do banco)
 * ADICIONADO: brokerId (obrigatório) para identificar o broker
 */
export const createInstanceSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  brokerId: z.string().uuid('Invalid broker ID format'), // Obrigatório - não opcional
  instanceName: z.string().min(1, 'Instance name is required').optional(),
  apiBaseUrl: z.string().url('Invalid API base URL').optional(),
  systemName: z.string().optional(),
  phone: z.string().optional(),
  accountName: z.string().optional(),
  adminField01: z.string().optional(),
  adminField02: z.string().optional(),
})

/**
 * Schema para conectar instância (genérico)
 * 
 * Se phone presente: gera Pair Code
 * Se phone ausente: gera QR Code
 */
export const connectInstanceSchema = z.object({
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
      { message: 'Formato de telefone inválido. Use formato internacional (ex: +5511999999999)' }
    ), // Opcional - se não passar, gera QR Code; se passar, gera Pair Code
})

/**
 * Schema para configurar broker com credenciais (Gupshup, API Oficial)
 * 
 * Credenciais são dinâmicas baseadas em required_fields do broker.
 */
export const configureBrokerSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  brokerId: z.string().uuid('Invalid broker ID format'),
  credentials: z.record(z.string()).refine(
    (val) => Object.keys(val).length > 0,
    { message: 'Credentials object cannot be empty' }
  ),
})

/**
 * Schema para salvar conta conectada (genérico)
 *
 * Valida dados específicos do broker dinamicamente.
 * Suporta fluxo QR Code (phoneNumber obrigatório) e
 * fluxo Webhook (phoneNumberId obrigatório, phoneNumber opcional).
 */
export const saveConnectedAccountSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  brokerType: z.string().min(1, 'Broker type is required'),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido. Use formato internacional (ex: +5511999999999)')
    .optional(),
  phoneNumberId: z.string().min(1, 'Phone Number ID is required').optional(),
  accessToken: z.string().optional(),
  accountName: z.string().optional(),
  profileName: z.string().optional(),
  brokerSpecificData: z.record(z.unknown()).optional(),
}).refine(
  (data) => data.phoneNumber || data.phoneNumberId,
  { message: 'Either phoneNumber or phoneNumberId must be provided' }
)

/**
 * Função helper para extrair erros de validação
 */
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
}
