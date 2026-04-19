import { createI18n } from 'vue-i18n'
import pt from './locales/pt.json'
import en from './locales/en.json'
import es from './locales/es.json'

export type MessageSchema = typeof pt

/**
 * Cria instância do i18n
 */
export const i18n = createI18n({
  legacy: false, // Usa Composition API
  locale: 'pt', // Idioma padrão (será sobrescrito pelo store)
  fallbackLocale: 'en', // Fallback para inglês
  messages: {
    pt,
    en,
    es
  },
  // Configurações adicionais
  globalInjection: true, // Injeta $t globalmente
  missingWarn: false, // Desabilita avisos de chaves faltando em produção
  fallbackWarn: false // Desabilita avisos de fallback em produção
})

/**
 * Helper para obter a instância global do i18n
 */
export function getI18n() {
  return i18n.global
}
