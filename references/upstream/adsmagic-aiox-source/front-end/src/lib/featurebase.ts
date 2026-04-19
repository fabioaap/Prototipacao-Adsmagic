/**
 * Helpers para interagir com o Featurebase a partir da UI.
 *
 * O boot do Messenger é responsabilidade de
 * `components/layout/FeaturebaseMessenger.vue`. Este módulo apenas expõe
 * ações para abrir o Messenger e redirecionar o usuário já autenticado
 * para o portal público (JWT SSO) quando ele clica em um item do menu.
 */

import { featurebaseService } from '@/services/api/featurebaseService'

export const FEATUREBASE_APP_ID = '69da5e66750b00fc471266c6'

type FeaturebaseAnyFn = (...args: unknown[]) => void
export type FeaturebaseMessengerScreen = 'home' | 'help'

interface FeaturebaseWindow extends Window {
  Featurebase?: FeaturebaseAnyFn
}

const getFeaturebaseFn = (): FeaturebaseAnyFn | null => {
  const featurebaseWindow = window as FeaturebaseWindow
  return typeof featurebaseWindow.Featurebase === 'function'
    ? featurebaseWindow.Featurebase
    : null
}

/**
 * Abre o Messenger do Featurebase em uma aba específica.
 */
export const openFeaturebaseMessenger = (screen: FeaturebaseMessengerScreen = 'home') => {
  const featurebase = getFeaturebaseFn()
  if (!featurebase) {
    if (import.meta.env.DEV) {
      console.warn('[Featurebase] Messenger ainda não foi inicializado.')
    }
    return
  }

  featurebase('show', screen)
}

/**
 * Abre o portal de sugestões do Featurebase já autenticado via JWT SSO.
 *
 * O segredo vive apenas no backend (Edge Function `featurebase-sso`), que
 * retorna a URL final assinada. Abrimos uma aba em branco sincronamente
 * para evitar o popup blocker e só então redirecionamos após o `await`.
 */
export const openFeaturebaseSuggestions = async () => {
  const tab = window.open('about:blank', '_blank')

  try {
    const url = await featurebaseService.getSuggestionsSsoUrl()

    if (tab) {
      tab.opener = null
      tab.location.href = url
    } else {
      // Popup bloqueado: fallback navegando na mesma aba.
      window.location.href = url
    }
  } catch (err) {
    tab?.close()
    if (import.meta.env.DEV) {
      console.error('[Featurebase] Falha ao iniciar SSO', err)
    }
  }
}
