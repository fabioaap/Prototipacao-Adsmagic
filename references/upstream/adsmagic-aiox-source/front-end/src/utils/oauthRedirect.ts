/**
 * Retorna a URL de callback OAuth para o locale informado.
 * Usada por Meta, Google, TikTok OAuth.
 *
 * @param locale - Código do locale (pt, en, es). Default: 'pt'
 * @returns URL completa de callback no formato {origin}/{locale}/auth/oauth/callback
 */
export function getOAuthRedirectUri(locale: string = 'pt'): string {
  const normalizedLocale = locale?.trim() || 'pt'
  return `${window.location.origin}/${normalizedLocale}/auth/oauth/callback`
}
