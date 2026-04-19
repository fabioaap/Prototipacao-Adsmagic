<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifyEmailToken, getSessionForConfirmation, resendVerificationEmail } from '@/services/api/authService'
import type { GetSessionForConfirmationResult } from '@/services/api/authService'
import { supabase, supabaseEnabled } from '@/services/api/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import BrandLogo from '@/components/features/onboarding/BrandLogo.vue'
import PromptDialog from '@/components/ui/PromptDialog.vue'
import AlertSimple from '@/components/ui/AlertSimple.vue'
import { usePromptDialog } from '@/composables/useAlertDialog'
import { useAlertDialog } from '@/composables/useAlertDialog'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const promptDialog = usePromptDialog()
const alertDialog = useAlertDialog()

const isVerifying = ref(true)
const verificationStatus = ref<'success' | 'error' | 'expired' | null>(null)
const errorMessage = ref('')
const isResending = ref(false)

/**
 * Após confirmação bem-sucedida, força login explícito.
 * Isso evita o uso da sessão implícita do link de confirmação.
 */
const forceExplicitLogin = async () => {
  authStore.clearAuthData()

  if (supabaseEnabled) {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('[EmailConfirmation] Falha ao encerrar sessão implícita:', error)
    }
  }

  authStore.clearAuthData()
}

/**
 * Verifica o token de confirmação (serviço aplica delay para processamento do hash da URL).
 */
onMounted(async () => {
  try {
    const tokenHash = route.query.token_hash as string | undefined
    const type = route.query.type as string | undefined

    let result: GetSessionForConfirmationResult

    if (tokenHash && type) {
      result = await verifyEmailToken(tokenHash, type)
    } else {
      // Fallback para links antigos que usam hash na URL
      result = await getSessionForConfirmation()
    }

    if (result.error) throw result.error

    if (result.session) {
      verificationStatus.value = 'success'
      await forceExplicitLogin()
    } else {
      verificationStatus.value = 'expired'
      errorMessage.value = t('auth.confirmation.linkExpired')
    }
  } catch (error) {
    console.error('Verification error:', error)
    verificationStatus.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : t('auth.confirmation.genericError')
  } finally {
    isVerifying.value = false
  }
})

/**
 * Reenviar email de confirmação
 */
const handleResendEmail = async () => {
  isResending.value = true
  
  try {
    // Pedir email ao usuário
    const email = await promptDialog.prompt({
      title: t('auth.confirmation.enterEmail'),
      description: t('auth.confirmation.enterEmailDescription'),
      placeholder: 'seu-email@exemplo.com',
      inputType: 'email',
      required: true,
      confirmText: t('auth.confirmation.send'),
      cancelText: t('auth.confirmation.cancel')
    })
    
    if (!email) {
      isResending.value = false
      return
    }

    const locale = String(route.params.locale || 'pt')
    await resendVerificationEmail(email, locale)

    await alertDialog.alert({
      title: t('auth.confirmation.emailSentTitle'),
      description: t('auth.confirmation.emailResent'),
      variant: 'info'
    })
  } catch (error) {
    console.error('Resend error:', error)
    await alertDialog.alert({
      title: t('auth.confirmation.errorAlertTitle'),
      description: error instanceof Error ? error.message : t('auth.confirmation.resendError'),
      variant: 'destructive'
    })
  } finally {
    isResending.value = false
  }
}

/**
 * Ir para login
 */
const goToLogin = () => {
  const locale = route.params.locale || 'pt'
  router.push(`/${locale}/login`)
}
</script>

<template>
  <div class="h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-4 sm:mb-8">
        <BrandLogo :height="48" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('auth.confirmation.title') }}</CardTitle>
          <CardDescription>
            {{ t('auth.confirmation.subtitle') }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Loading -->
          <div v-if="isVerifying" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p class="mt-4 text-muted-foreground">{{ t('auth.confirmation.verifying') }}</p>
          </div>

          <!-- Success -->
          <div v-else-if="verificationStatus === 'success'" class="text-center py-8">
            <div class="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              {{ t('auth.confirmation.successTitle') }}
            </h3>
            <p class="text-muted-foreground mb-6">
              {{ t('auth.confirmation.successMessage') }}
            </p>
            <Button
              @click="goToLogin"
              class="w-full"
              :aria-label="t('auth.confirmation.goToLogin')"
            >
              {{ t('auth.confirmation.goToLogin') }}
            </Button>
          </div>

          <!-- Error / Expired -->
          <div v-else-if="verificationStatus === 'expired' || verificationStatus === 'error'" class="text-center py-8">
            <div class="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              {{ verificationStatus === 'expired' ? t('auth.confirmation.expiredTitle') : t('auth.confirmation.errorTitle') }}
            </h3>
            <p
              class="text-sm text-muted-foreground mb-6"
              role="alert"
              :aria-live="'polite'"
            >
              {{ errorMessage }}
            </p>
            <div class="space-y-3">
              <Button
                @click="handleResendEmail"
                :disabled="isResending"
                class="w-full"
                :aria-label="t('auth.confirmation.resendEmail')"
              >
                <span v-if="!isResending">{{ t('auth.confirmation.resendEmail') }}</span>
                <span v-else>{{ t('auth.confirmation.resending') }}</span>
              </Button>
              <Button
                @click="goToLogin"
                variant="outline"
                class="w-full"
                :aria-label="t('auth.confirmation.backToLogin')"
              >
                {{ t('auth.confirmation.backToLogin') }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Dialogs -->
  <PromptDialog
    v-model="promptDialog.isOpen.value"
    :title="promptDialog.title.value"
    :description="promptDialog.description.value"
    :placeholder="promptDialog.placeholder.value"
    :confirm-text="promptDialog.confirmText.value"
    :cancel-text="promptDialog.cancelText.value"
    :input-type="promptDialog.inputType.value"
    :required="promptDialog.required.value"
    @confirm="promptDialog.handleConfirm"
    @cancel="promptDialog.handleCancel"
  />

  <AlertSimple
    v-model="alertDialog.isOpen.value"
    :title="alertDialog.title.value"
    :description="alertDialog.description.value"
    :confirm-text="alertDialog.confirmText.value"
    :variant="alertDialog.variant.value"
    @confirm="alertDialog.handleConfirm"
  />
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
