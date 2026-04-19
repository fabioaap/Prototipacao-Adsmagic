/**
 * Handler para retornar dados do token de compartilhamento de QR Code
 * GET /whatsapp-share/:token
 *
 * Busca o token no banco, valida expiração e retorna JSON com os dados
 * para o frontend renderizar a página de compartilhamento.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../../messaging/utils/response.ts'

export async function handleServeSharePage(
  supabaseClient: SupabaseClient,
  token: string,
  _baseUrl: string
): Promise<Response> {
  // Buscar token no banco
  const { data: shareToken, error } = await supabaseClient
    .from('whatsapp_share_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !shareToken) {
    return errorResponse('Link inválido ou expirado', 404)
  }

  if (shareToken.status === 'revoked') {
    return errorResponse('Token revogado', 410)
  }

  // Se já conectou
  if (shareToken.status === 'connected') {
    return successResponse({
      status: 'connected',
      qrCode: shareToken.qr_code || '',
      expiresAt: shareToken.expires_at,
    })
  }

  // Se expirou mas status ainda é 'active', atualizar status
  const now = new Date()
  const expiresAt = new Date(shareToken.expires_at)
  let currentStatus = shareToken.status

  if (now > expiresAt && shareToken.status === 'active') {
    currentStatus = 'expired'
    await supabaseClient
      .from('whatsapp_share_tokens')
      .update({ status: 'expired' })
      .eq('id', shareToken.id)
  }

  return successResponse({
    status: currentStatus,
    qrCode: shareToken.qr_code || '',
    expiresAt: shareToken.expires_at,
  })
}
