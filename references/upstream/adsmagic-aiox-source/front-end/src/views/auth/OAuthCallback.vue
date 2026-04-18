<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center space-y-4">
      <div v-if="isProcessing" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-lg">Processando autenticação...</p>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="text-destructive">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-lg text-destructive">{{ error }}</p>
        <p class="text-sm text-muted-foreground">Esta janela pode ser fechada.</p>
      </div>

      <div v-else-if="success" class="space-y-4">
        <div class="text-green-500">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-lg">Autenticação concluída!</p>
        <p class="text-sm text-muted-foreground">Esta janela será fechada automaticamente...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isProcessing = ref(true)
const error = ref<string | null>(null)
const success = ref(false)

/**
 * Processa o callback OAuth quando o componente é montado
 * Extrai o access_token do hash da URL e envia para a janela pai via postMessage
 */
onMounted(() => {
  try {
    console.log('[OAuth Callback] Processing callback')

    // Extrair projectId do state parameter
    // Meta preserva o state parameter e retorna na URL de callback
    // O state pode estar na query string OU no hash (dependendo do response_type)
    let projectId: string | null = null
    
    // Tentar extrair do hash primeiro (response_type=token usa hash)
    const hash = window.location.hash.substring(1) // Remove o #
    const hashParams = new URLSearchParams(hash)
    let stateParam = hashParams.get('state')
    
    // Se não encontrou no hash, tentar na query string (response_type=code usa query)
    if (!stateParam) {
      const urlParams = new URLSearchParams(window.location.search)
      stateParam = urlParams.get('state')
    }
    
    if (stateParam) {
      try {
        const state = JSON.parse(decodeURIComponent(stateParam))
        projectId = state.projectId || null
        console.log('[OAuth Callback] ProjectId extracted from state:', projectId)
      } catch (error) {
        console.warn('[OAuth Callback] Failed to parse state parameter:', error)
      }
    } else {
      console.warn('[OAuth Callback] No state parameter found in callback URL (checked both hash and query)')
    }

    // Google OAuth: authorization code arrives in query string, not hash
    const urlSearchParams = new URLSearchParams(window.location.search)
    const authCode = urlSearchParams.get('code')
    const queryError = urlSearchParams.get('error')

    if (queryError) {
      throw new Error(urlSearchParams.get('error_description') || queryError)
    }

    if (authCode && window.opener) {
      console.log('[OAuth Callback] Authorization code received (Google flow)', {
        hasCode: true,
        hasProjectId: !!projectId,
      })

      window.opener.postMessage(
        {
          type: 'OAUTH_SUCCESS',
          token: authCode,
          projectId: projectId,
        },
        window.location.origin
      )

      success.value = true
      isProcessing.value = false

      setTimeout(() => {
        window.close()
      }, 1500)
      return
    }

    // Meta OAuth: access_token arrives in URL hash fragment
    // URL format: #access_token=...&expires_in=...&token_type=...
    if (!hash) {
      throw new Error('Nenhum dado de autenticação recebido')
    }

    // Parse hash parameters
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const expiresIn = params.get('expires_in')
    const errorParam = params.get('error')
    const errorDescription = params.get('error_description')

    // Check for errors from OAuth provider
    if (errorParam) {
      throw new Error(errorDescription || errorParam)
    }

    if (!accessToken) {
      throw new Error('Token de acesso não encontrado na resposta')
    }

    console.log('[OAuth Callback] Access token received', {
      hasToken: !!accessToken,
      expiresIn,
      hasProjectId: !!projectId,
    })

    // Enviar token e projectId para a janela pai via postMessage
    if (window.opener) {
      console.log('[OAuth Callback] Sending token and projectId to parent window')
      
      window.opener.postMessage(
        {
          type: 'OAUTH_SUCCESS',
          token: accessToken,
          expiresIn: expiresIn ? parseInt(expiresIn, 10) : null,
          projectId: projectId, // Incluir projectId extraído do state
        },
        window.location.origin
      )

      success.value = true
      isProcessing.value = false

      // Fechar janela após pequeno delay para mostrar mensagem de sucesso
      setTimeout(() => {
        window.close()
      }, 1500)
    } else {
      throw new Error('Janela pai não encontrada. Esta página deve ser aberta em um popup.')
    }
  } catch (err) {
    console.error('[OAuth Callback] Error:', err)
    
    const errorMessage = err instanceof Error ? err.message : 'Erro ao processar autenticação'
    error.value = errorMessage
    isProcessing.value = false

    // Enviar erro para a janela pai se possível
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'OAUTH_ERROR',
          error: errorMessage,
        },
        window.location.origin
      )
    }

    // Fechar janela após delay mesmo em caso de erro
    setTimeout(() => {
      window.close()
    }, 3000)
  }
})
</script>

