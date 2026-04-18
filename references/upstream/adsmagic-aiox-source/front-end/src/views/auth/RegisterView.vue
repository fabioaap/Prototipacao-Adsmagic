<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import { useLocalizedRoute } from '@/composables/useLocalizedRoute'
import { supabase, supabaseEnabled } from '@/services/api/supabaseClient'
import { resendVerificationEmail, buildEmailConfirmationRedirect } from '@/services/api/authService'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CountrySelect from '@/components/ui/CountrySelect.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import BrandLogo from '@/components/features/onboarding/BrandLogo.vue'
import type { Country } from '@/types/country'
import { DEFAULT_COUNTRY, COUNTRIES } from '@/types/country'
import { detectUserCountry } from '@/services/geolocation'

const { t } = useI18n()
const authStore = useAuthStore()
const { getLocalizedRoute, getCurrentLocale } = useLocalizedRoute()

/**
 * Schema de validação usando Zod com mensagens traduzidas
 */
const createRegisterSchema = () => z.object({
  name: z.string()
    .min(2, t('auth.validation.nameMinLength', { min: 2 }))
    .max(100, t('auth.validation.nameMaxLength', { max: 100 }))
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, t('auth.validation.nameInvalid')),

  email: z.string()
    .email(t('auth.validation.emailInvalid'))
    .min(1, t('auth.validation.emailRequired')),

  phone: z.string()
    .min(8, t('auth.validation.phoneMinLength', { min: 8 }))
    .max(15, t('auth.validation.phoneMaxLength', { max: 15 }))
    .regex(/^\d+$/, t('auth.validation.phoneInvalid')),

  password: z.string()
    .min(8, t('auth.validation.passwordMinLength', { min: 8 }))
    .max(128, t('auth.validation.passwordMinLength', { min: 128 }))
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('auth.validation.passwordStrength')),

  country: z.object({
    code: z.string(),
    name: z.string(),
    namePt: z.string(),
    ddi: z.string(),
    flag: z.string(),
    maxDigits: z.number()
  }).refine((country) => country.code && country.ddi, {
    message: t('auth.validation.countryRequired')
  })
})

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>

// Estado do formulário
const formData = ref<RegisterFormData>({
  name: '',
  email: '',
  phone: '',
  password: '',
  country: (DEFAULT_COUNTRY || COUNTRIES[0])!
})

// Estado de validação
const errors = ref<Partial<Record<keyof RegisterFormData, string>>>({})
const isLoading = ref(false)
const registrationSuccess = ref(false)
const isResendingEmail = ref(false)

/**
 * Validação individual de campos
 */
const validateField = (field: keyof RegisterFormData): boolean => {
  try {
    const registerSchema = createRegisterSchema()
    const fieldSchema = registerSchema.shape[field]
    fieldSchema.parse(formData.value[field])

    // Remove erro do campo se válido
    if (errors.value[field]) {
      delete errors.value[field]
    }

    return true
  } catch (error) {
    if (error instanceof z.ZodError && error.issues[0]) {
      errors.value[field] = error.issues[0].message
    }
    return false
  }
}

/**
 * Validação completa do formulário
 */
const validateForm = (): boolean => {
  try {
    const registerSchema = createRegisterSchema()
    registerSchema.parse(formData.value)
    errors.value = {}
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {}
      error.issues.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData
        errors.value[field] = err.message
      })
    }
    return false
  }
}

/**
 * Computed para verificar se formulário é válido
 */
const isFormValid = computed(() => {
  return formData.value.name &&
         formData.value.email &&
         formData.value.phone &&
         formData.value.password &&
         formData.value.country &&
         Object.keys(errors.value).length === 0
})

/**
 * Manipula mudança nos campos do formulário
 */
const handleFieldChange = (field: keyof RegisterFormData, value: any) => {
  formData.value[field] = value

  // Validação em tempo real após o usuário começar a digitar
  validateField(field)
}

/**
 * Manipula blur dos campos
 */
const handleFieldBlur = (field: keyof RegisterFormData) => {
  validateField(field)
}

/**
 * Manipula submissão do formulário
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  authStore.clearError()

  try {
    // Se Supabase estiver desabilitado, simula sucesso para navegação local
    if (!supabaseEnabled) {
      console.warn('[Register] Supabase desabilitado - simulando cadastro')
      registrationSuccess.value = true
      showToast(t('auth.register.emailConfirmationSent'), 'success')
      return
    }

    const locale = getCurrentLocale()

    // Registro real com Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        emailRedirectTo: buildEmailConfirmationRedirect(locale),
        data: {
          first_name: formData.value.name.split(' ')[0],
          last_name: formData.value.name.split(' ').slice(1).join(' ') || '',
          phone: `${formData.value.country.ddi}${formData.value.phone}`,
          country: formData.value.country.code,
          preferred_language: 'pt', // Default para português
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    })

    if (authError) throw authError

    if (authData.user) {
      // Marcar como sucesso e mostrar mensagem de confirmação
      registrationSuccess.value = true
      showToast(t('auth.register.emailConfirmationSent'), 'success')
    }
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : t('auth.register.errorMessage')
    showToast(errorMessage, 'error')
  } finally {
    isLoading.value = false
  }
}

/**
 * Manipula seleção de país
 */
const handleCountryChange = (country: Country) => {
  formData.value.country = country
  // Limpa o telefone quando o país muda para evitar inconsistências
  formData.value.phone = ''
  if (errors.value.phone) {
    delete errors.value.phone
  }
}

/**
 * Formata número de telefone conforme o país selecionado
 */
const formatPhoneNumber = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '')

  // Limita ao máximo de dígitos do país
  const maxDigits = formData.value.country.maxDigits
  return numbers.slice(0, maxDigits)
}

/**
 * Manipula mudança no campo de telefone
 */
const handlePhoneChange = (value: string) => {
  const formatted = formatPhoneNumber(value)
  handleFieldChange('phone', formatted)
}

/**
 * Mock de toast notification
 * TODO: Implementar com biblioteca de toast real
 */
const showToast = (message: string, type: 'success' | 'error') => {
  console.log(`[TOAST ${type.toUpperCase()}]:`, message)
  // TODO: Implementar toast visual
}

/**
 * Reenvia o email de confirmação para o email do formulário (após cadastro com sucesso).
 */
const handleResendConfirmationEmail = async () => {
  if (!formData.value.email?.trim() || isResendingEmail.value) return

  isResendingEmail.value = true
  try {
    const locale = getCurrentLocale()
    await resendVerificationEmail(formData.value.email, locale)
    showToast(t('auth.register.resendEmailSent'), 'success')
  } catch (error) {
    console.error('Resend confirmation error:', error)
    const message = error instanceof Error ? error.message : t('auth.register.resendEmailError')
    showToast(message, 'error')
  } finally {
    isResendingEmail.value = false
  }
}

/**
 * Detecta país por IP usando serviço de geolocalização
 */
const detectCountryByIP = async () => {
  try {
    console.log('Detecting country by IP...')
    const detectedCountry = await detectUserCountry()

    // Atualiza o país apenas se a detecção foi bem-sucedida
    const defaultCountry = DEFAULT_COUNTRY || COUNTRIES[0]
    if (detectedCountry && defaultCountry && detectedCountry.code !== defaultCountry.code) {
      formData.value.country = detectedCountry
      console.log(`Country detected: ${detectedCountry.namePt} (${detectedCountry.ddi})`)
    } else {
      console.log('Using default country:', defaultCountry?.namePt || 'Brasil')
    }
  } catch (error) {
    console.warn('Could not detect country by IP:', error)
    // Mantém o país padrão em caso de erro
  }
}

// Lifecycle
onMounted(() => {
  detectCountryByIP()
})
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Language Selector - Fixed Position -->
    <div class="language-selector-wrapper">
      <LanguageSelector />
    </div>

    <!-- Left Side - Register Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo/Brand -->
        <div class="text-center">
          <BrandLogo :height="48" />
          <p class="text-muted-foreground mt-4">
            {{ t('auth.register.createAccount') }}
          </p>
        </div>

        <!-- Register Card -->
        <Card class="w-full">
          <CardHeader>
            <CardTitle>{{ t('auth.register.title') }}</CardTitle>
            <CardDescription>
              {{ t('auth.register.subtitle') }}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Name Field -->
              <div class="space-y-2">
                <Label for="name" required>
                  {{ t('auth.register.fullName') }}
                </Label>
                <Input
                  id="name"
                  type="text"
                  :placeholder="t('auth.register.fullNamePlaceholder')"
                  :model-value="formData.name"
                  @update:model-value="(value) => handleFieldChange('name', value)"
                  @blur="() => handleFieldBlur('name')"
                  :disabled="isLoading"
                  required
                />
                <p
                  v-if="errors.name"
                  class="text-sm text-destructive"
                >
                  {{ errors.name }}
                </p>
              </div>

              <!-- Email Field -->
              <div class="space-y-2">
                <Label for="email" required>
                  {{ t('auth.register.email') }}
                </Label>
                <Input
                  id="email"
                  type="email"
                  :placeholder="t('auth.register.emailPlaceholder')"
                  :model-value="formData.email"
                  @update:model-value="(value) => handleFieldChange('email', value)"
                  @blur="() => handleFieldBlur('email')"
                  :disabled="isLoading"
                  required
                />
                <p
                  v-if="errors.email"
                  class="text-sm text-destructive"
                >
                  {{ errors.email }}
                </p>
              </div>

              <!-- Phone Field -->
              <div class="space-y-2">
                <Label for="phone" required>
                  {{ t('auth.register.phone') }}
                </Label>
                <div class="flex gap-2">
                  <!-- Country Select -->
                  <div class="w-32">
                    <CountrySelect
                      :model-value="formData.country"
                      @update:model-value="handleCountryChange"
                      :disabled="isLoading"
                    />
                  </div>

                  <!-- Phone Input -->
                  <div class="flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      :placeholder="t('auth.register.phonePlaceholder', { maxDigits: formData.country.maxDigits })"
                      :model-value="formData.phone"
                      @update:model-value="handlePhoneChange"
                      @blur="() => handleFieldBlur('phone')"
                      :disabled="isLoading"
                      required
                    />
                  </div>
                </div>
                <p
                  v-if="errors.phone"
                  class="text-sm text-destructive"
                >
                  {{ errors.phone }}
                </p>
              </div>

              <!-- Password Field -->
              <div class="space-y-2">
                <Label for="password" required>
                  {{ t('auth.register.password') }}
                </Label>
                <PasswordInput
                  :model-value="formData.password"
                  @update:model-value="(value) => handleFieldChange('password', value)"
                  @blur="() => handleFieldBlur('password')"
                  :disabled="isLoading"
                  :show-strength="true"
                  required
                />
                <p
                  v-if="errors.password"
                  class="text-sm text-destructive"
                >
                  {{ errors.password }}
                </p>
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                class="w-full"
                :disabled="!isFormValid || isLoading"
              >
                <span v-if="!isLoading">{{ t('auth.register.submit') }}</span>
                <span v-else class="flex items-center gap-2">
                  <span class="animate-spin">⏳</span>
                  {{ t('auth.register.submitting') }}
                </span>
              </Button>

              <!-- Login Link -->
              <div class="text-center text-sm text-muted-foreground">
                {{ t('auth.register.hasAccount') }}
                <router-link
                  :to="getLocalizedRoute('login')"
                  class="text-primary hover:underline font-medium"
                >
                  {{ t('auth.register.signIn') }}
                </router-link>
              </div>
            </form>

            <!-- Mensagem de Confirmação de Email -->
            <div v-if="registrationSuccess" class="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-4">
              <div class="flex items-start gap-3">
                <div class="mt-1">
                  <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-primary">{{ t('auth.register.checkYourEmail') }}</h3>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ t('auth.register.emailConfirmationMessage') }}
                  </p>
                  <p class="text-sm text-muted-foreground mt-2">
                    <strong>{{ formData.email }}</strong>
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="w-full"
                :disabled="isResendingEmail"
                :aria-label="t('auth.register.resendEmail')"
                @click="handleResendConfirmationEmail"
              >
                <span v-if="!isResendingEmail">{{ t('auth.register.resendEmail') }}</span>
                <span v-else>{{ t('auth.register.resendingEmail') }}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Right Side - Visual/Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
      <div class="max-w-md text-primary-foreground space-y-6">
        <h2 class="text-5xl font-bold leading-tight">
          {{ t('auth.register.hero.title') }}
        </h2>
        <p class="text-xl text-primary-foreground/90">
          {{ t('auth.register.hero.description') }}
        </p>
        <div class="space-y-4 pt-8">
          <div class="flex items-start gap-3">
            <div class="mt-1">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">{{ t('auth.register.hero.feature1Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.register.hero.feature1Description') }}
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
              <h3 class="font-semibold">{{ t('auth.register.hero.feature2Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.register.hero.feature2Description') }}
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
              <h3 class="font-semibold">{{ t('auth.register.hero.feature3Title') }}</h3>
              <p class="text-sm text-primary-foreground/80">
                {{ t('auth.register.hero.feature3Description') }}
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
