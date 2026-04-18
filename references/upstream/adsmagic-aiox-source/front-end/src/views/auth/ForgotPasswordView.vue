<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useValidation } from '@/composables/useValidation'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import BrandLogo from '@/components/features/onboarding/BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const { validateEmail } = useValidation()

// Form state
const email = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)

// Validation state
const emailError = ref('')

/**
 * Valida email
 */
const handleValidateEmail = (value: string): boolean => {
  const result = validateEmail(value)
  emailError.value = result.error
  return result.valid
}

/**
 * Verifica se o formulário é válido
 */
const isFormValid = computed(() => {
  return email.value && !emailError.value
})

/**
 * Manipula submissão do formulário
 */
const handleSubmit = async () => {
  // Valida email
  const isEmailValid = handleValidateEmail(email.value)

  if (!isEmailValid) {
    return
  }

  isLoading.value = true

  try {
    // Usa store de autenticação para enviar link de reset
    await authStore.sendPasswordResetOtp(email.value)

    isSuccess.value = true
    showToast(t('auth.forgotPassword.successMessage'), 'success')

    // Não redireciona, apenas mostra mensagem de sucesso
    // O usuário receberá um email com o link de reset
  } catch (error) {
    console.error('Forgot password error:', error)
    const errorMessage = error instanceof Error ? error.message : t('auth.forgotPassword.errorMessage')
    showToast(errorMessage, 'error')
  } finally {
    isLoading.value = false
  }
}

/**
 * Manipula mudança no campo de email
 */
const handleEmailChange = (value: string) => {
  email.value = value
  if (emailError.value) {
    handleValidateEmail(value)
  }
}

/**
 * Manipula blur do campo de email
 */
const handleEmailBlur = () => {
  if (email.value) {
    handleValidateEmail(email.value)
  }
}

/**
 * Volta para página de login
 */
const goBackToLogin = () => {
  const locale = route.params.locale as string || 'pt'
  router.push(`/${locale}/login`)
}

/**
 * Mock de toast notification
 * TODO: Implementar com biblioteca de toast real (vue-toastification ou similar)
 */
const showToast = (message: string, type: 'success' | 'error') => {
  console.log(`[TOAST ${type.toUpperCase()}]:`, message)
  // TODO: Implementar toast visual
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Language Selector - Fixed Position -->
    <div class="language-selector-wrapper">
      <LanguageSelector />
    </div>

    <!-- Left Side - Forgot Password Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo/Brand -->
        <div class="text-center">
          <BrandLogo :height="48" />
          <p class="text-muted-foreground mt-4">
            {{ t('auth.forgotPassword.recoveryTitle') }}
          </p>
        </div>

        <!-- Forgot Password Card -->
        <Card class="w-full">
          <CardHeader>
            <CardTitle>{{ t('auth.forgotPassword.title') }}</CardTitle>
            <CardDescription>
              {{ t('auth.forgotPassword.subtitle') }}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Email Field -->
              <div class="space-y-2">
                <Label for="email" required>
                  {{ t('auth.forgotPassword.email') }}
                </Label>
                <Input
                  id="email"
                  type="email"
                  :placeholder="t('auth.forgotPassword.emailPlaceholder')"
                  :model-value="email"
                  @update:model-value="handleEmailChange"
                  @blur="handleEmailBlur"
                  :disabled="isLoading || isSuccess"
                  required
                />
                <p
                  v-if="emailError"
                  class="text-sm text-destructive"
                >
                  {{ emailError }}
                </p>
              </div>

              <!-- Success Message -->
              <div
                v-if="isSuccess"
                class="p-3 rounded-lg bg-green-50 border border-green-200"
              >
                <p class="text-sm text-green-800">
                  {{ t('auth.forgotPassword.checkEmail') }}
                </p>
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                class="w-full"
                :disabled="!isFormValid || isLoading || isSuccess"
              >
                <span v-if="!isLoading && !isSuccess">{{ t('auth.forgotPassword.submit') }}</span>
                <span v-else-if="isLoading" class="flex items-center gap-2">
                  <span class="animate-spin">⏳</span>
                  {{ t('auth.forgotPassword.submitting') }}
                </span>
                <span v-else class="flex items-center gap-2">
                  <span>✓</span>
                  {{ t('auth.forgotPassword.submitted') }}
                </span>
              </Button>

              <!-- Back to Login Link -->
              <div class="text-center">
                <button
                  type="button"
                  @click="goBackToLogin"
                  class="text-sm text-muted-foreground hover:text-primary"
                  :disabled="isLoading"
                >
                  {{ t('auth.forgotPassword.backToLogin') }}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Additional Help -->
        <div class="text-center text-sm text-muted-foreground">
          <p>
            {{ t('auth.forgotPassword.noCode') }}
            <a href="#" class="text-primary hover:underline">{{ t('auth.forgotPassword.contactSupport') }}</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Visual/Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
      <div class="max-w-md text-primary-foreground space-y-6">
        <h2 class="text-5xl font-bold leading-tight">
          {{ t('auth.forgotPassword.hero.title') }}
        </h2>
        <p class="text-xl text-primary-foreground/90">
          {{ t('auth.forgotPassword.hero.description') }}
        </p>
        <div class="space-y-4 pt-8">
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('auth.forgotPassword.hero.feature1Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.forgotPassword.hero.feature1Description') }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('auth.forgotPassword.hero.feature2Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.forgotPassword.hero.feature2Description') }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('auth.forgotPassword.hero.feature3Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.forgotPassword.hero.feature3Description') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.language-selector-wrapper {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 100;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 640px) {
  .language-selector-wrapper {
    top: 1rem;
    right: 1rem;
  }
}
</style>
