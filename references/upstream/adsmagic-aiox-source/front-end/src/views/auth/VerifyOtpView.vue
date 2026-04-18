<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useValidation } from '@/composables/useValidation'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import BrandLogo from '@/components/features/onboarding/BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const { validatePassword } = useValidation()

// Form state
const email = ref('')
const otp = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const isLoading = ref(false)
const isVerifying = ref(false)
const isVerified = ref(false)
const isResending = ref(false)

// Timer state
const timeLeft = ref(300) // 5 minutos em segundos
const timerInterval = ref<number | null>(null)

// Validation state
const otpError = ref('')
const passwordError = ref('')

// Refs para inputs OTP
const otpInputs = ref<HTMLInputElement[]>([])

/**
 * Inicializa email do query params
 */
onMounted(() => {
  const queryEmail = route.query.email
  email.value = (typeof queryEmail === 'string' ? queryEmail : '') || ''

  if (!email.value) {
    showToast(t('auth.verifyOtp.errorNoEmail'), 'error')
    const locale = route.params.locale as string || 'pt'
    setTimeout(() => router.push(`/${locale}/forgot-password`), 2000)
    return
  }

  // Inicia timer
  startTimer()

  // Foca no primeiro input
  if (otpInputs.value[0]) {
    otpInputs.value[0].focus()
  }
})

/**
 * Limpa timer ao desmontar
 */
onUnmounted(() => {
  stopTimer()
})

/**
 * Inicia timer de contagem regressiva
 */
const startTimer = () => {
  stopTimer() // Garante que não há timer duplicado
  timeLeft.value = 300 // Reseta para 5 minutos

  timerInterval.value = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stopTimer()
    }
  }, 1000)
}

/**
 * Para o timer
 */
const stopTimer = () => {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

/**
 * Formata o tempo restante em MM:SS
 */
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

/**
 * Verifica se o timer expirou
 */
const isExpired = computed(() => timeLeft.value === 0)

/**
 * Código OTP completo
 */
const otpCode = computed(() => otp.value.join(''))

/**
 * Valida senha
 */
const handleValidatePassword = (value: string): boolean => {
  const result = validatePassword(value, 8)
  passwordError.value = result.error
  return result.valid
}

/**
 * Verifica se o formulário é válido
 */
const isFormValid = computed(() => {
  return otpCode.value.length === 6 &&
         newPassword.value.length >= 8 &&
         !otpError.value &&
         !passwordError.value &&
         isVerified.value
})

/**
 * Verifica se pode verificar OTP
 */
const canVerifyOtp = computed(() => {
  return otpCode.value.length === 6 && !isExpired.value
})

/**
 * Manipula input de OTP
 */
const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Permite apenas números
  if (value && !/^\d$/.test(value)) {
    target.value = otp.value[index] || ''
    return
  }

  otp.value[index] = value

  // Move para o próximo input se preencheu
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }

  // Limpa erro quando usuário digita
  if (otpError.value) {
    otpError.value = ''
  }
}

/**
 * Manipula tecla pressionada no input OTP
 */
const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  // Backspace: volta para input anterior
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }

  // Arrow Left: move para esquerda
  if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }

  // Arrow Right: move para direita
  if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
}

/**
 * Manipula cole de código OTP
 */
const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').slice(0, 6)

  digits.split('').forEach((digit, index) => {
    if (index < 6) {
      otp.value[index] = digit
    }
  })

  // Foca no último input preenchido
  const lastFilledIndex = Math.min(digits.length, 5)
  otpInputs.value[lastFilledIndex]?.focus()
}

/**
 * Verifica o código OTP
 * NOTA: Supabase usa link de email, não OTP
 * Esta função simula a verificação para manter compatibilidade
 */
const handleVerifyOtp = async () => {
  if (!canVerifyOtp.value) {
    return
  }

  isVerifying.value = true
  otpError.value = ''

  try {
    // Simula verificação (Supabase usa link de email)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Validação básica do mock
    if (otpCode.value.length !== 6) {
      throw new Error('Código deve ter 6 dígitos')
    }

    isVerified.value = true
    showToast(t('auth.verifyOtp.successVerified'), 'success')
  } catch (error) {
    console.error('OTP verification error:', error)
    otpError.value = error instanceof Error ? error.message : t('auth.verifyOtp.errorInvalidCode')
    showToast(otpError.value, 'error')
  } finally {
    isVerifying.value = false
  }
}

/**
 * Reenvia código OTP
 */
const handleResendOtp = async () => {
  isResending.value = true

  try {
    await authStore.sendPasswordResetOtp(email.value)

    // Reseta estado
    otp.value = ['', '', '', '', '', '']
    isVerified.value = false
    otpError.value = ''

    // Reinicia timer
    startTimer()

    showToast(t('auth.verifyOtp.successResent'), 'success')

    // Foca no primeiro input
    if (otpInputs.value[0]) {
      otpInputs.value[0].focus()
    }
  } catch (error) {
    console.error('Resend OTP error:', error)
    showToast(t('auth.verifyOtp.errorResend'), 'error')
  } finally {
    isResending.value = false
  }
}

/**
 * Manipula submissão do formulário (reset de senha)
 */
const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }

  isLoading.value = true

  try {
    // Reseta a senha usando Supabase Auth
    await authStore.resetPassword(newPassword.value)

    showToast(t('auth.verifyOtp.successReset'), 'success')

    // Aguarda 2 segundos e redireciona para login
    setTimeout(() => {
      const locale = route.params.locale as string || 'pt'
      router.push(`/${locale}/login`)
    }, 2000)
  } catch (error) {
    console.error('Reset password error:', error)
    const errorMessage = error instanceof Error ? error.message : t('auth.verifyOtp.errorReset')
    showToast(errorMessage, 'error')
  } finally {
    isLoading.value = false
  }
}

/**
 * Manipula mudança na senha
 */
const handlePasswordChange = (value: string) => {
  newPassword.value = value
  if (passwordError.value) {
    handleValidatePassword(value)
  }
}

/**
 * Manipula blur do campo de senha
 */
const handlePasswordBlur = () => {
  if (newPassword.value) {
    handleValidatePassword(newPassword.value)
  }
}

/**
 * Mock de toast notification
 * TODO: Implementar com biblioteca de toast real
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

    <!-- Left Side - OTP Verification Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo/Brand -->
        <div class="text-center">
          <BrandLogo :height="48" />
          <p class="text-muted-foreground mt-4">
            {{ t('auth.verifyOtp.verificationTitle') }}
          </p>
        </div>

        <!-- OTP Verification Card -->
        <Card class="w-full">
          <CardHeader>
            <CardTitle>{{ t('auth.verifyOtp.title') }}</CardTitle>
            <CardDescription>
              {{ t('auth.verifyOtp.subtitle', { email }) }}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Timer -->
              <div class="text-center">
                <p class="text-sm text-muted-foreground">
                  {{ t('auth.verifyOtp.expiresIn') }}
                  <span
                    :class="[
                      'font-mono font-bold',
                      timeLeft < 60 ? 'text-destructive' : 'text-primary'
                    ]"
                  >
                    {{ formattedTime }}
                  </span>
                </p>
              </div>

              <!-- OTP Input -->
              <div class="space-y-2">
                <Label>{{ t('auth.verifyOtp.codeLabel') }}</Label>
                <div class="flex gap-2 justify-center">
                  <input
                    v-for="(digit, index) in otp"
                    :key="index"
                    :ref="el => { if (el) otpInputs[index] = el as HTMLInputElement }"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    :value="digit"
                    @input="(e) => handleOtpInput(index, e)"
                    @keydown="(e) => handleOtpKeydown(index, e)"
                    @paste="handleOtpPaste"
                    :disabled="isVerifying || isVerified || isExpired"
                    :class="[
                      'w-12 h-14 text-center text-2xl font-bold rounded-control border',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      isVerified ? 'border-green-500 bg-green-50' : 'border-input',
                      otpError ? 'border-destructive' : '',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    ]"
                  />
                </div>
                <p v-if="otpError" class="text-sm text-destructive text-center">
                  {{ otpError }}
                </p>
              </div>

              <!-- Verify OTP Button -->
              <div v-if="!isVerified">
                <Button
                  type="button"
                  @click="handleVerifyOtp"
                  class="w-full"
                  :disabled="!canVerifyOtp || isVerifying || isExpired"
                >
                  <span v-if="!isVerifying">{{ t('auth.verifyOtp.verifyButton') }}</span>
                  <span v-else class="flex items-center gap-2">
                    <span class="animate-spin">⏳</span>
                    {{ t('auth.verifyOtp.verifying') }}
                  </span>
                </Button>
              </div>

              <!-- Success Message -->
              <div
                v-if="isVerified"
                class="p-3 rounded-lg bg-green-50 border border-green-200"
              >
                <p class="text-sm text-green-800 text-center">
                  {{ t('auth.verifyOtp.verified') }}
                </p>
              </div>

              <!-- New Password Field (only shown after verification) -->
              <div v-if="isVerified" class="space-y-2">
                <Label for="newPassword" required>
                  {{ t('auth.verifyOtp.newPassword') }}
                </Label>
                <PasswordInput
                  id="newPassword"
                  :model-value="newPassword"
                  @update:model-value="handlePasswordChange"
                  @blur="handlePasswordBlur"
                  :disabled="isLoading"
                  :show-strength="true"
                  :placeholder="t('auth.verifyOtp.newPasswordPlaceholder')"
                  required
                />
                <p
                  v-if="passwordError"
                  class="text-sm text-destructive"
                >
                  {{ passwordError }}
                </p>
              </div>

              <!-- Reset Password Button (only shown after verification) -->
              <div v-if="isVerified">
                <Button
                  type="submit"
                  class="w-full"
                  :disabled="!isFormValid || isLoading"
                >
                  <span v-if="!isLoading">{{ t('auth.verifyOtp.resetPassword') }}</span>
                  <span v-else class="flex items-center gap-2">
                    <span class="animate-spin">⏳</span>
                    {{ t('auth.verifyOtp.resetting') }}
                  </span>
                </Button>
              </div>

              <!-- Resend Code Link -->
              <div class="text-center space-y-2">
                <button
                  type="button"
                  @click="handleResendOtp"
                  :disabled="isResending || (!isExpired && timeLeft > 240)"
                  class="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="!isResending">
                    {{ isExpired ? t('auth.verifyOtp.resendCode') : t('auth.verifyOtp.noCode') }}
                  </span>
                  <span v-else class="flex items-center gap-2 justify-center">
                    <span class="animate-spin">⏳</span>
                    {{ t('auth.verifyOtp.resending') }}
                  </span>
                </button>

                <div>
                  <router-link
                    to="/login"
                    class="text-sm text-muted-foreground hover:text-primary"
                  >
                    {{ t('auth.verifyOtp.backToLogin') }}
                  </router-link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Right Side - Visual/Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
      <div class="max-w-md text-primary-foreground space-y-6">
        <h2 class="text-5xl font-bold leading-tight">
          {{ t('auth.verifyOtp.hero.title') }}
        </h2>
        <p class="text-xl text-primary-foreground/90">
          {{ t('auth.verifyOtp.hero.description') }}
        </p>
        <div class="space-y-4 pt-8">
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('auth.verifyOtp.hero.feature1Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.verifyOtp.hero.feature1Description') }}
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
              <h3 class="font-semibold">{{ t('auth.verifyOtp.hero.feature2Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.verifyOtp.hero.feature2Description') }}
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
              <h3 class="font-semibold">{{ t('auth.verifyOtp.hero.feature3Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.verifyOtp.hero.feature3Description') }}
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
