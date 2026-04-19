/**
 * Validadores Zod para Edge Function de Mensageria
 * 
 * Schemas de validação para todos os endpoints
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Schema para envio de mensagem
export const sendMessageSchema = z.object({
  accountId: z.string().uuid('Invalid account ID format'),
  to: z.string().min(1, 'Destination phone number is required'),
  text: z.string().optional(),
  mediaUrl: z.string().url('Invalid media URL').optional(),
  mediaType: z.enum(['image', 'video', 'audio', 'document']).optional(),
  caption: z.string().optional(),
  templateName: z.string().optional(),
  templateLanguage: z.string().length(2, 'Language code must be 2 characters').optional(),
  templateParameters: z.array(z.string()).optional(),
}).refine(
  (data) => data.text || data.mediaUrl || data.templateName,
  {
    message: 'At least one of text, mediaUrl, or templateName is required',
  }
)

// Schema para webhook
export const webhookSchema = z.object({
  accountId: z.string().uuid('Invalid account ID format').optional(),
  brokerType: z.string().optional(),
  data: z.any(),
  signature: z.string().optional(),
})

// Função helper para extrair erros de validação
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
}
