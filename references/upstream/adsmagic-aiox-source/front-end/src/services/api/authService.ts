/**
 * Serviço de autenticação para fluxos de registro e confirmação de email.
 * Centraliza chamadas ao Supabase Auth para que views/stores não dependam diretamente do cliente.
 */

import { supabase, supabaseEnabled } from './supabaseClient'

const VERIFICATION_SESSION_DELAY_MS = 600
const SUPPORTED_LOCALES = ['pt', 'en', 'es'] as const

type SupportedLocale = typeof SUPPORTED_LOCALES[number]

export interface GetSessionForConfirmationResult {
  session: { access_token: string; user: { id: string; email?: string } } | null
  error: Error | null
}

function normalizeLocale(locale?: string): SupportedLocale {
  if (locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    return locale as SupportedLocale
  }
  return 'pt'
}

/**
 * Constrói URL de confirmação de email com locale validado.
 */
export function buildEmailConfirmationRedirect(locale?: string): string {
  const resolvedLocale = normalizeLocale(locale)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  return `${origin}/${resolvedLocale}/email-confirmation`
}

/**
 * Reenvia o email de confirmação de cadastro para o endereço informado.
 *
 * @param email - Email para o qual reenviar o link de confirmação
 * @throws Error quando Supabase está desabilitado, email é inválido ou a requisição falha
 */
export async function resendVerificationEmail(email: string, locale?: string): Promise<void> {
  if (!email?.trim()) {
    throw new Error('Email é obrigatório')
  }

  if (!supabaseEnabled) {
    console.warn('[AuthService] Supabase desabilitado - simulando reenvio')
    return
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo: buildEmailConfirmationRedirect(locale)
    }
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Obtém a sessão atual para verificação de confirmação de email.
 * Aguarda um curto delay para permitir que o Supabase processe o hash da URL (detectSessionInUrl).
 *
 * @returns Objeto com session (se existir) e error (em caso de falha)
 */
/**
 * Verifica o token de confirmação de email via `verifyOtp`.
 * Usado quando o link do email contém `token_hash` e `type` como query params.
 *
 * @param tokenHash - Hash do token recebido por email
 * @param type - Tipo de verificação (ex: 'signup', 'email')
 */
export async function verifyEmailToken(tokenHash: string, type: string): Promise<GetSessionForConfirmationResult> {
  if (!supabaseEnabled) {
    return { session: null, error: null }
  }

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as 'signup' | 'email',
  })

  if (error) {
    return { session: null, error: new Error(error.message) }
  }

  return {
    session: data.session ?? null,
    error: null
  }
}

/**
 * @deprecated Mantido como fallback para links antigos que usam hash na URL.
 * Novos links usam query params e `verifyEmailToken()`.
 */
export async function getSessionForConfirmation(): Promise<GetSessionForConfirmationResult> {
  if (!supabaseEnabled) {
    return { session: null, error: null }
  }

  await new Promise((resolve) => setTimeout(resolve, VERIFICATION_SESSION_DELAY_MS))

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return { session: null, error: new Error(error.message) }
  }

  return {
    session: data.session ?? null,
    error: null
  }
}
