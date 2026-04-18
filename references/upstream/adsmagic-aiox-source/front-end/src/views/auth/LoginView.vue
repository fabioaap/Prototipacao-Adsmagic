<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useValidation } from '@/composables/useValidation'
import { useLocalizedRoute } from '@/composables/useLocalizedRoute'
import { useToast } from '@/components/ui/toast/use-toast'
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

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { validateEmail, validatePassword } = useValidation()
const { getLocalizedRoute } = useLocalizedRoute()
const { success: showSuccessToast, error: showErrorToast } = useToast()

// Form state
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const rememberMe = ref(false)
const LOGIN_SUBMIT_TIMEOUT_MS = 15000
let submitWatchdog: ReturnType<typeof setTimeout> | null = null

// Validation state
const emailError = ref('')
const passwordError = ref('')

/**
 * Valida email
 */
const handleValidateEmail = (value: string): boolean => {
  const result = validateEmail(value)
  emailError.value = result.error
  return result.valid
}

/**
 * Valida senha
 */
const handleValidatePassword = (value: string): boolean => {
  const result = validatePassword(value, 6)
  passwordError.value = result.error
  return result.valid
}

/**
 * Verifica se o formulário é válido
 */
const isFormValid = computed(() => {
  return email.value &&
         password.value &&
         !emailError.value &&
         !passwordError.value
})

/**
 * Manipula submissão do formulário
 */
const handleSubmit = async () => {
  // Valida campos
  const isEmailValid = handleValidateEmail(email.value)
  const isPasswordValid = handleValidatePassword(password.value)

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  isLoading.value = true
  authStore.clearError()
  submitWatchdog = setTimeout(() => {
    if (!isLoading.value) return
    isLoading.value = false
    showErrorToast(
      t('auth.login.errorMessage'),
      'A autenticação demorou mais que o esperado. Tente novamente.'
    )
  }, LOGIN_SUBMIT_TIMEOUT_MS)

  try {
    // Usa store de autenticação real com Supabase
    const credentials = {
      email: email.value,
      password: password.value,
    }

    await authStore.login(credentials)
    let destination: 'onboarding' | 'projects'
    try {
      destination = await authStore.bootstrapAfterLogin()
    } catch (bootstrapError) {
      console.warn('[Login] Bootstrap failed on first attempt, retrying once...', bootstrapError)
      destination = await authStore.bootstrapAfterLogin()
    }

    showSuccessToast(t('auth.login.successMessage'))

    // Navega para destino resolvido no bootstrap.
    const locale = router.currentRoute.value.params.locale || 'pt'
    await router.push(`/${locale}/${destination}`)

  } catch (error) {
    console.error('Login error:', error)
    
    // Mensagens específicas por tipo de erro do Supabase
    let errorTitle = t('auth.login.errorMessage')
    let errorDescription: string | undefined
    
    if (error instanceof Error) {
      // Tratamento de erros específicos do Supabase
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes('invalid login credentials') || 
          errorMessage.includes('invalid_credentials')) {
        errorTitle = t('auth.login.invalidCredentials') || 'Email ou senha inválidos'
        errorDescription = 'Verifique suas credenciais e tente novamente'
      } else if (errorMessage.includes('email not confirmed') || 
                 errorMessage.includes('email_not_confirmed')) {
        errorTitle = t('auth.login.emailNotConfirmed') || 'Por favor, confirme seu email'
        errorDescription = 'Verifique sua caixa de entrada e clique no link de confirmação'
      } else if (errorMessage.includes('too many requests')) {
        errorTitle = 'Muitas tentativas'
        errorDescription = 'Aguarde alguns minutos antes de tentar novamente'
      } else {
        // Para outros erros, usar mensagem genérica amigável
        errorTitle = t('auth.login.errorMessage')
        errorDescription = 'Tente novamente em alguns instantes'
        // Detalhes técnicos apenas no console
        console.error('Detalhes técnicos do erro:', error)
      }
    }
    
    showErrorToast(errorTitle, errorDescription)
  } finally {
    if (submitWatchdog) {
      clearTimeout(submitWatchdog)
      submitWatchdog = null
    }
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
 * Manipula mudança no campo de senha
 */
const handlePasswordChange = (value: string) => {
  password.value = value
  if (passwordError.value) {
    handleValidatePassword(value)
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
 * Manipula blur do campo de senha
 */
const handlePasswordBlur = () => {
  if (password.value) {
    handleValidatePassword(password.value)
  }
}

</script>

<template>
  <div class="min-h-screen flex">
    <!-- Language Selector - Fixed Position -->
    <div class="language-selector-wrapper">
      <LanguageSelector />
    </div>

    <!-- Left Side - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo/Brand -->
        <div class="text-center">
          <BrandLogo :height="48" />
          <p class="text-muted-foreground mt-4">
            {{ t('auth.login.welcome') }}
          </p>
        </div>

        <!-- Login Card -->
        <Card class="w-full">
          <CardHeader>
            <CardTitle>{{ t('auth.login.title') }}</CardTitle>
            <CardDescription>
              {{ t('auth.login.subtitle') }}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Email Field -->
              <div class="space-y-2">
                <Label for="email" required>
                  {{ t('auth.login.email') }}
                </Label>
                <Input
                  id="email"
                  type="email"
                  :placeholder="t('auth.login.emailPlaceholder')"
                  :model-value="email"
                  @update:model-value="handleEmailChange"
                  @blur="handleEmailBlur"
                  :disabled="isLoading"
                  required
                />
                <p
                  v-if="emailError"
                  class="text-sm text-destructive"
                >
                  {{ emailError }}
                </p>
              </div>

              <!-- Password Field -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="password" required>
                    {{ t('auth.login.password') }}
                  </Label>
                  <router-link
                    :to="getLocalizedRoute('forgot-password')"
                    class="text-sm text-primary hover:underline"
                  >
                    {{ t('auth.login.forgotPassword') }}
                  </router-link>
                </div>
                <Input
                  id="password"
                  type="password"
                  :placeholder="t('auth.login.passwordPlaceholder')"
                  :model-value="password"
                  @update:model-value="handlePasswordChange"
                  @blur="handlePasswordBlur"
                  :disabled="isLoading"
                  required
                />
                <p
                  v-if="passwordError"
                  class="text-sm text-destructive"
                >
                  {{ passwordError }}
                </p>
              </div>

              <!-- Remember Me Checkbox -->
              <div class="flex items-center space-x-2">
                <input
                  id="remember"
                  v-model="rememberMe"
                  type="checkbox"
                  class="w-4 h-4 rounded border-input"
                  :disabled="isLoading"
                />
                <Label for="remember" class="cursor-pointer">
                  {{ t('auth.login.rememberMe') }}
                </Label>
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                class="w-full"
                :disabled="!isFormValid || isLoading"
              >
                <span v-if="!isLoading">{{ t('auth.login.submit') }}</span>
                <span v-else class="flex items-center gap-2">
                  <span class="animate-spin">⏳</span>
                  {{ t('auth.login.submitting') }}
                </span>
              </Button>

              <!-- Sign Up Link -->
              <div class="text-center text-sm text-muted-foreground">
                {{ t('auth.login.noAccount') }}
                <router-link
                  :to="getLocalizedRoute('register')"
                  class="text-primary hover:underline font-medium"
                >
                  {{ t('auth.login.signUp') }}
                </router-link>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Footer -->
        <div class="text-center text-sm text-muted-foreground">
          <p>
            {{ t('auth.footer.agreement') }}
            <a href="#" class="text-primary hover:underline">{{ t('auth.footer.terms') }}</a>
            {{ t('auth.footer.and') }}
            <a href="#" class="text-primary hover:underline">{{ t('auth.footer.privacy') }}</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Visual/Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
      <div class="max-w-md text-primary-foreground space-y-6">
        <h2 class="text-5xl font-bold leading-tight">
          {{ t('auth.login.hero.title') }}
        </h2>
        <p class="text-xl text-primary-foreground/90">
          {{ t('auth.login.hero.description') }}
        </p>
        <div class="space-y-4 pt-8">
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('auth.login.hero.feature1Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.login.hero.feature1Description') }}
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
              <h3 class="font-semibold">{{ t('auth.login.hero.feature2Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.login.hero.feature2Description') }}
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
              <h3 class="font-semibold">{{ t('auth.login.hero.feature3Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.login.hero.feature3Description') }}
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
