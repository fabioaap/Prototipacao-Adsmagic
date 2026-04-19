import { apiClient } from './client'

interface FeaturebaseSsoResponse {
  url: string
}

export const featurebaseService = {
  /**
   * Solicita à Edge Function `featurebase-sso` uma URL já assinada com JWT HS256
   * para redirecionar o usuário autenticado ao portal do Featurebase (sem passar
   * pela tela de login/cadastro).
   */
  async getSuggestionsSsoUrl(): Promise<string> {
    const response = await apiClient.post<FeaturebaseSsoResponse>('/featurebase-sso')
    return response.data.url
  },
}
