import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getI18n } from '@/i18n'

export type Locale = 'pt' | 'en' | 'es'

export interface LanguageOption {
  code: Locale
  name: string
  nativeName: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  }
]

const STORAGE_KEY = 'adsmagic_locale'

/**
 * Detecta o idioma do navegador do usuário
 */
const detectBrowserLanguage = (): Locale => {
  const browserLang = navigator.language.toLowerCase()

  if (browserLang.startsWith('pt')) return 'pt'
  if (browserLang.startsWith('es')) return 'es'
  return 'en' // Padrão: inglês
}

/**
 * Carrega o idioma salvo do localStorage ou detecta do navegador
 */
const getInitialLocale = (): Locale => {
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null

  if (stored && ['pt', 'en', 'es'].includes(stored)) {
    return stored
  }

  return detectBrowserLanguage()
}

export const useLanguageStore = defineStore('language', () => {
  // State
  const currentLocale = ref<Locale>(getInitialLocale())

  // Getters
  const getCurrentLanguage = (): LanguageOption => {
    const found = LANGUAGES.find(lang => lang.code === currentLocale.value)
    // LANGUAGES[1] sempre existe (é English), então garantimos que sempre há um retorno
    return found || LANGUAGES[1]!
  }

  // Actions
  const setLocale = (locale: Locale) => {
    if (!['pt', 'en', 'es'].includes(locale)) {
      console.warn(`Invalid locale: ${locale}. Falling back to 'en'.`)
      locale = 'en'
    }

    currentLocale.value = locale
    localStorage.setItem(STORAGE_KEY, locale)

    // Atualiza atributo lang do HTML para acessibilidade
    document.documentElement.setAttribute('lang', locale)

    // Sincroniza com vue-i18n
    const i18n = getI18n()
    i18n.locale.value = locale
  }

  // Inicialização
  document.documentElement.setAttribute('lang', currentLocale.value)

  return {
    // State
    currentLocale,

    // Getters
    getCurrentLanguage,

    // Actions
    setLocale
  }
})
