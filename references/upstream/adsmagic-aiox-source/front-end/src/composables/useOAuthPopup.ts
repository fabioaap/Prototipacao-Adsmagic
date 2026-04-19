/**
 * OAuth Popup Composable
 * Gerencia popup OAuth e captura de token do hash
 */

export interface OAuthPopupOptions {
  authUrl: string
  redirectUri: string
  onSuccess: (token: string, projectId?: string | null) => Promise<void>
  onError: (error: Error) => void
  timeout?: number // default 5 minutos
}

/**
 * Abre popup OAuth e gerencia o fluxo de autenticação
 * 
 * @param options - Configurações do popup OAuth
 * @returns Promise que resolve quando o OAuth é completado ou rejeitado
 */
export function openOAuthPopup(options: OAuthPopupOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const {
      authUrl,
      redirectUri: _redirectUri,
      onSuccess,
      onError,
      timeout = 5 * 60 * 1000, // 5 minutos
    } = options

    // MODO MOCK: Simular OAuth automaticamente sem abrir popup real
    if (authUrl.includes('MOCK_CLIENT_ID') || authUrl.includes('MOCK_APP_ID')) {
      console.log('[OAuth Popup] Modo MOCK detectado - simulando OAuth automaticamente')

      // Simular delay do usuário fazendo login (2 segundos)
      setTimeout(async () => {
        try {
          const mockToken = `mock_access_token_${Date.now()}`
          const mockProjectId = 'mock_project_id'

          console.log('[OAuth Popup] Mock: Callback de sucesso simulado', {
            token: mockToken,
            projectId: mockProjectId
          })

          await onSuccess(mockToken, mockProjectId)
          resolve()
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Erro no callback mock')
          onError(err)
          reject(err)
        }
      }, 2000)

      return
    }

    // Calcular posição centralizada do popup
    const width = 600
    const height = 700
    const left = Math.max(0, (window.screen.width - width) / 2)
    const top = Math.max(0, (window.screen.height - height) / 2)

    // Abrir popup
    const popup = window.open(
      authUrl,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,menubar=no,scrollbars=yes`
    )

    if (!popup) {
      const error = new Error('Não foi possível abrir o popup. Verifique se os popups estão bloqueados.')
      onError(error)
      reject(error)
      return
    }

    // Flag para controlar se já recebemos uma mensagem (sucesso ou erro)
    let messageReceived = false

    // Timeout handler
    const timeoutId = setTimeout(() => {
      if (messageReceived) {
        // Já recebemos uma mensagem, não fazer nada
        return
      }

      cleanup()
      const error = new Error('Timeout: Autenticação não foi completada no tempo limite.')
      onError(error)
      reject(error)

      // Fechar popup se ainda estiver aberto
      if (popup && !popup.closed) {
        popup.close()
      }
    }, timeout)

    // Interval para checar se popup foi fechado manualmente (apenas se não recebemos mensagem)
    const checkClosedInterval = setInterval(() => {
      if (popup.closed && !messageReceived) {
        // Popup foi fechado sem enviar mensagem
        cleanup()
        const error = new Error('Popup foi fechado antes de completar a autenticação.')
        onError(error)
        reject(error)
      }
    }, 500)

    // Message listener para receber token do popup
    const messageHandler = async (event: MessageEvent) => {
      // Validar origem por segurança
      if (event.origin !== window.location.origin) {
        console.warn('[OAuth Popup] Mensagem de origem não confiável:', event.origin)
        return
      }

      // Validar tipo de mensagem
      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        // Evitar processar mensagem duplicada
        if (messageReceived) {
          console.warn('[OAuth Popup] Mensagem de sucesso já processada, ignorando duplicata')
          return
        }

        messageReceived = true
        const token = event.data.token
        const projectId = event.data.projectId || null // Extrair projectId do state se disponível

        if (!token) {
          cleanup()
          const error = new Error('Token não foi recebido do popup.')
          onError(error)
          reject(error)
          return
        }

        console.log('[OAuth Popup] Token recebido com sucesso', {
          hasToken: !!token,
          hasProjectId: !!projectId,
        })

        // Fechar popup
        if (popup && !popup.closed) {
          popup.close()
        }

        try {
          // Chamar callback de sucesso com token e projectId
          await onSuccess(token, projectId)
          cleanup()
          resolve()
        } catch (error) {
          cleanup()
          const err = error instanceof Error ? error : new Error('Erro ao processar callback de sucesso')
          onError(err)
          reject(err)
        }
      } else if (event.data && event.data.type === 'OAUTH_ERROR') {
        // Evitar processar mensagem duplicada
        if (messageReceived) {
          console.warn('[OAuth Popup] Mensagem de erro já processada, ignorando duplicata')
          return
        }

        messageReceived = true
        cleanup()

        const errorMessage = event.data.error || 'Erro na autenticação OAuth'
        console.error('[OAuth Popup] Erro recebido do popup:', errorMessage)

        const error = new Error(errorMessage)
        onError(error)
        reject(error)

        // Fechar popup
        if (popup && !popup.closed) {
          popup.close()
        }
      }
    }

    // Adicionar listener
    window.addEventListener('message', messageHandler)

    // Cleanup function
    function cleanup() {
      clearTimeout(timeoutId)
      clearInterval(checkClosedInterval)
      window.removeEventListener('message', messageHandler)
    }
  })
}

