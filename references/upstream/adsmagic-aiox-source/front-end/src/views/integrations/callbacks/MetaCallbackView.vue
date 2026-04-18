<template>
  <div class="min-h-screen bg-background flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center">
        <div class="w-16 h-16 mx-auto mb-4">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
        <h2 class="section-title-md mb-2">
          {{ $t('integrations.meta.callback.processing') }}
        </h2>
        <p class="section-description">
          {{ $t('integrations.meta.callback.connecting') }}
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 class="section-title-md mb-2">
          {{ $t('integrations.meta.callback.success') }}
        </h2>
        <p class="section-description mb-6">
          {{ $t('integrations.meta.callback.connected') }}
        </p>
        <Button @click="goToIntegrations" class="w-full">
          {{ $t('integrations.meta.callback.continue') }}
        </Button>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <XCircle class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 class="section-title-md mb-2">
          {{ $t('integrations.meta.callback.error') }}
        </h2>
        <p class="section-description mb-6">
          {{ error }}
        </p>
        <div class="flex space-x-3">
          <Button variant="outline" @click="retry" class="flex-1">
            {{ $t('integrations.meta.callback.retry') }}
          </Button>
          <Button @click="goToIntegrations" class="flex-1">
            {{ $t('integrations.meta.callback.back') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CheckCircle, XCircle } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { useIntegrationsStore } from '@/stores/integrations'
import { useToast } from '@/components/ui/toast/use-toast'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const integrationsStore = useIntegrationsStore()
const { success, error: showError } = useToast()

// Estado
const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)

/**
 * Processar callback OAuth
 */
const processCallback = async () => {
  try {
    const code = route.query.code as string
    const errorParam = route.query.error as string

    // Verificar se há erro na URL
    if (errorParam) {
      throw new Error(`OAuth error: ${errorParam}`)
    }

    // Verificar se há código de autorização
    if (!code) {
      throw new Error('Authorization code not found')
    }

    // Processar callback no store
    await integrationsStore.handleOAuthCallback('meta', code)

    // Se chegou até aqui, o callback foi bem-sucedido
    isSuccess.value = true
    success('Meta Ads conectado!', 'Sua conta do Meta Ads foi conectada com sucesso.')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro desconhecido'
    showError('Erro na conexão', error.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Tentar novamente
 */
const retry = () => {
  isLoading.value = true
  error.value = null
  processCallback()
}

/**
 * Ir para página de integrações
 */
const goToIntegrations = () => {
    router.push(`/${locale.value}/projects/${route.params.projectId}/integrations`)
}

// Lifecycle
onMounted(() => {
  processCallback()
})
</script>
