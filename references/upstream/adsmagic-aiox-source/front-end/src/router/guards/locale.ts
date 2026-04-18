import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import type { Locale } from '@/stores/language'

const VALID_LOCALES: Locale[] = ['pt', 'en', 'es']
const DEFAULT_LOCALE: Locale = 'en'

/**
 * Detecta o locale preferido do usuário
 * Prioridade: localStorage > navegador > padrão (en)
 */
export function detectUserLocale(): Locale {
  // 1. Tenta localStorage
  const stored = localStorage.getItem('adsmagic_locale') as Locale | null
  if (stored && VALID_LOCALES.includes(stored)) {
    return stored
  }

  // 2. Tenta detectar do navegador
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('pt')) return 'pt'
  if (browserLang.startsWith('es')) return 'es'

  // 3. Fallback para padrão
  return DEFAULT_LOCALE
}

/**
 * Valida se o locale é válido
 */
export function isValidLocale(locale: any): locale is Locale {
  return typeof locale === 'string' && VALID_LOCALES.includes(locale as Locale)
}

/**
 * Sincroniza o locale com stores e i18n
 */
async function syncLocale(locale: Locale): Promise<void> {
  try {
    const { useLanguageStore } = await import('@/stores/language')
    const { i18n } = await import('@/i18n')

    const languageStore = useLanguageStore()

    // Atualiza store se necessário
    if (languageStore.currentLocale !== locale) {
      languageStore.setLocale(locale)
    }

    // Sincroniza i18n
    const i18nLocale = i18n.global.locale
    if (typeof i18nLocale === 'object' && 'value' in i18nLocale) {
      i18nLocale.value = locale
    }

    console.log(`[Locale Guard] Locale synchronized: ${locale}`)
  } catch (error) {
    console.error('[Locale Guard] Error synchronizing locale:', error)
  }
}

/**
 * Guard de navegação para validar e sincronizar locale
 * Retorna null se pode continuar, ou um objeto de navegação se precisa redirecionar
 */
export function localeGuard(to: RouteLocationNormalized): RouteLocationRaw | null {
  const locale = to.params.locale as string | undefined

  // Se não tem locale na URL, redireciona para versão com locale
  if (!locale) {
    const userLocale = detectUserLocale()
    const pathWithLocale = `/${userLocale}${to.path}`

    console.log(`[Locale Guard] No locale in URL, redirecting to: ${pathWithLocale}`)
    return {
      path: pathWithLocale,
      query: to.query,
      hash: to.hash,
      replace: true
    }
  }

  // Se locale é inválido, redireciona para locale válido
  if (!isValidLocale(locale)) {
    const userLocale = detectUserLocale()
    const pathWithValidLocale = to.path.replace(/^\/[^/]+/, `/${userLocale}`)

    console.warn(`[Locale Guard] Invalid locale "${locale}", redirecting to: ${pathWithValidLocale}`)
    return {
      path: pathWithValidLocale,
      query: to.query,
      hash: to.hash,
      replace: true
    }
  }

  // Locale é válido, sincroniza com store e i18n
  syncLocale(locale as Locale)

  // Continua navegação
  return null
}
