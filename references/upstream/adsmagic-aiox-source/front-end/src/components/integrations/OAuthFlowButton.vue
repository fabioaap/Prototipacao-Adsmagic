<template>
  <Button
    :variant="variant"
    :size="size"
    :disabled="disabled || loading"
    :loading="loading"
    @click="handleClick"
    class="relative"
  >
    <component
      v-if="!loading"
      :is="getPlatformIcon(platform)"
      class="h-4 w-4 mr-2"
    />
    <span>{{ label }}</span>
  </Button>
</template>

<script setup lang="ts">
import { 
  Facebook, 
  Chrome, 
  Music, 
  Linkedin 
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import type { OAuthResult } from '@/types/models'

interface Props {
  /**
   * Plataforma para OAuth
   */
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin'
  /**
   * Label do botão
   */
  label: string
  /**
   * Se true, botão está desabilitado
   */
  disabled?: boolean
  /**
   * Se true, indica loading state
   */
  loading?: boolean
  /**
   * Variant do botão
   */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  /**
   * Tamanho do botão
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
  variant: 'default',
  size: 'default'
})

const emit = defineEmits<{
  click: []
  success: [data: OAuthResult]
  error: [error: Error]
}>()

// ============================================================================
// METHODS
// ============================================================================

/**
 * Obtém o ícone da plataforma
 */
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, any> = {
    meta: Facebook,
    google: Chrome,
    tiktok: Music,
    linkedin: Linkedin
  }
  return iconMap[platform] || Chrome
}

/**
 * Inicia o fluxo OAuth
 */
const initiateOAuth = async () => {
  try {
    // Gerar state parameter para CSRF protection
    const state = generateState()
    
    // Construir URL de autorização
    const authUrl = buildAuthUrl(props.platform, state)
    
    // Abrir popup window
    const popup = openPopup(authUrl, 'oauth', 600, 700)
    
    if (!popup) {
      throw new Error('Não foi possível abrir a janela de autorização')
    }
    
    // Aguardar callback
    const result = await waitForCallback(popup, state)
    
    emit('success', result)
  } catch (error) {
    console.error('Erro no OAuth:', error)
    emit('error', error instanceof Error ? error : new Error('Erro desconhecido'))
  }
}

/**
 * Gera um state parameter com dados necessários (G9.1: incluir projectId)
 */
const generateState = (): string => {
  const projectId = localStorage.getItem('current_project_id')
  const stateData = {
    nonce: Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15),
    projectId: projectId || undefined,
    timestamp: Date.now()
  }
  return encodeURIComponent(JSON.stringify(stateData))
}

/**
 * Constrói a URL de autorização
 */
const buildAuthUrl = (platform: string, state: string): string => {
  const baseUrls: Record<string, string> = {
    meta: 'https://www.facebook.com/v18.0/dialog/oauth',
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    tiktok: 'https://www.tiktok.com/auth/authorize',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization'
  }
  
  const baseUrl = baseUrls[platform]
  if (!baseUrl) {
    throw new Error(`Plataforma não suportada: ${platform}`)
  }
  
  const params = new URLSearchParams({
    client_id: getClientId(platform),
    redirect_uri: getRedirectUri(platform),
    response_type: 'code',
    scope: getScopes(platform).join(' '),
    state: state
  })
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Obtém o client ID da plataforma
 */
const getClientId = (platform: string): string => {
  const clientIds: Record<string, string> = {
    meta: import.meta.env.VITE_META_CLIENT_ID || 'mock_meta_client_id',
    google: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_google_client_id',
    tiktok: import.meta.env.VITE_TIKTOK_CLIENT_ID || 'mock_tiktok_client_id',
    linkedin: import.meta.env.VITE_LINKEDIN_CLIENT_ID || 'mock_linkedin_client_id'
  }
  
  return clientIds[platform] || 'mock_client_id'
}

/**
 * Obtém a redirect URI
 */
const getRedirectUri = (platform: string): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/oauth/callback/${platform}`
}

/**
 * Obtém os scopes necessários
 */
const getScopes = (platform: string): string[] => {
  const scopes: Record<string, string[]> = {
    meta: ['ads_management', 'ads_read', 'pages_read_engagement', 'instagram_basic'],
    google: ['https://www.googleapis.com/auth/adwords', 'https://www.googleapis.com/auth/analytics.readonly'],
    tiktok: ['user.info.basic', 'video.list', 'ad.account.info'],
    linkedin: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
  }
  
  return scopes[platform] || []
}

/**
 * Abre popup window
 */
const openPopup = (url: string, name: string, width: number, height: number): Window | null => {
  const left = (screen.width - width) / 2
  const top = (screen.height - height) / 2
  
  return window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  )
}

/**
 * Aguarda o callback do OAuth
 */
const waitForCallback = (popup: Window, _state: string): Promise<OAuthResult> => {
  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        reject(new Error('Usuário cancelou a autorização'))
      }
    }, 1000)
    
    // Listener para mensagens do popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      // Suporta ambos os formatos: 'oauth_success' e 'OAUTH_SUCCESS'
      const type = event.data.type?.toLowerCase()
      
      if (type === 'oauth_success') {
        clearInterval(checkClosed)
        popup.close()
        window.removeEventListener('message', messageListener)
        
        // Extrair dados do resultado (suporta ambos os formatos)
        const result: OAuthResult = event.data.result || {
          success: true,
          token: event.data.token,
          expiresIn: event.data.expiresIn,
          projectId: event.data.projectId
        }
        resolve(result)
      } else if (type === 'oauth_error') {
        clearInterval(checkClosed)
        popup.close()
        window.removeEventListener('message', messageListener)
        reject(new Error(event.data.error))
      }
    }
    
    window.addEventListener('message', messageListener)
    
    // Timeout após 5 minutos
    setTimeout(() => {
      clearInterval(checkClosed)
      popup.close()
      window.removeEventListener('message', messageListener)
      reject(new Error('Timeout na autorização'))
    }, 5 * 60 * 1000)
  })
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleClick = () => {
  emit('click')
  initiateOAuth()
}
</script>
