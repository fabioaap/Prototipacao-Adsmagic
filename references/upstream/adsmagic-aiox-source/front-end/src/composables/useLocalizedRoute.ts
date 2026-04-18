import { useRouter, useRoute } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import type { RouteLocationRaw } from 'vue-router'

/**
 * Composable para navegação com locale
 * Facilita navegação preservando o locale atual
 */
export function useLocalizedRoute() {
  const router = useRouter()
  const route = useRoute()
  const languageStore = useLanguageStore()

  /**
   * Obtém o locale atual da URL ou do store
   */
  const getCurrentLocale = () => {
    return (route.params.locale as string) || languageStore.currentLocale
  }

  /**
   * Navega para uma rota preservando o locale atual
   * @param routeName - Nome da rota ou caminho
   * @param params - Parâmetros adicionais da rota
   * @param query - Query params
   */
  const navigateTo = (routeName: string, params?: Record<string, any>, query?: Record<string, any>) => {
    const locale = getCurrentLocale()
    const path = `/${locale}/${routeName}`

    router.push({
      path,
      query,
      ...params
    })
  }

  /**
   * Navega para uma rota e substitui a entrada no histórico
   */
  const replaceTo = (routeName: string, params?: Record<string, any>, query?: Record<string, any>) => {
    const locale = getCurrentLocale()
    const path = `/${locale}/${routeName}`

    router.replace({
      path,
      query,
      ...params
    })
  }

  /**
   * Constrói uma URL localizada sem navegar
   * @param routeName - Nome da rota ou caminho
   * @param locale - Locale específico (opcional, usa atual se não fornecido)
   */
  const getLocalizedPath = (routeName: string, locale?: string) => {
    const targetLocale = locale || getCurrentLocale()
    return `/${targetLocale}/${routeName}`
  }

  /**
   * Troca o idioma mantendo a rota atual
   * @param newLocale - Novo locale (pt, en, es)
   */
  const switchLocale = (newLocale: string) => {
    // Atualiza o locale no store (que sincroniza com i18n)
    languageStore.setLocale(newLocale as any)

    // Remove o locale atual do path
    const currentPath = route.path.replace(/^\/(pt|en|es)/, '')

    // Navega para a mesma rota com novo locale
    router.push({
      path: `/${newLocale}${currentPath}`,
      query: route.query,
      hash: route.hash
    })
  }

  /**
   * Verifica se uma rota está ativa (útil para navegação)
   */
  const isRouteActive = (routeName: string) => {
    const locale = getCurrentLocale()
    const expectedPath = `/${locale}/${routeName}`
    return route.path === expectedPath || route.path.startsWith(expectedPath + '/')
  }

  /**
   * Obtém a rota localizada como objeto RouteLocationRaw
   * Útil para uso com router-link
   */
  const getLocalizedRoute = (routeName: string, params?: Record<string, any>): RouteLocationRaw => {
    const locale = getCurrentLocale()

    return {
      path: `/${locale}/${routeName}`,
      ...(params && { params })
    }
  }

  return {
    navigateTo,
    replaceTo,
    getLocalizedPath,
    switchLocale,
    isRouteActive,
    getLocalizedRoute,
    getCurrentLocale
  }
}
