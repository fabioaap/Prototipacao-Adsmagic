<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const { validatePassword } = useValidation()

// Form state
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const tokenError = ref('')

// Validation state
const passwordError = ref('')
const confirmPasswordError = ref('')

onMounted(async () => {
  // Verificar se há um token de recuperação no hash
  const hash = window.location.hash
  if (!hash.includes('access_token')) {
    tokenError.value = t('auth.resetPassword.invalidToken')
    return
  }

  // O Supabase automaticamente detecta o token de recuperação
  // e estabelece a sessão quando a página carrega
})

const handleValidatePassword = (value: string): boolean => {
  const result = validatePassword(value)
  passwordError.value = result.error
  return result.valid
}

const handleValidateConfirmPassword = (): boolean => {
  if (confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = t('auth.resetPassword.passwordMismatch')
    return false
  }
  confirmPasswordError.value = ''
  return true
}

const isFormValid = computed(() => {
  return (
    newPassword.value &&
    confirmPassword.value &&
    !passwordError.value &&
    !confirmPasswordError.value &&
    !tokenError.value
  )
})

const handleSubmit = async () => {
  const isPasswordValid = handleValidatePassword(newPassword.value)
  const isConfirmValid = handleValidateConfirmPassword()

  if (!isPasswordValid || !isConfirmValid) {
    return
  }

  isLoading.value = true

  try {
    await authStore.resetPassword(newPassword.value)
    isSuccess.value = true
    
    setTimeout(() => {
      router.push({
        name: 'login',
        params: { locale: route.params.locale || 'pt' }
      })
    }, 2000)
  } catch (error) {
    console.error('Reset password error:', error)
    const errorMessage = error instanceof Error ? error.message : t('auth.resetPassword.errorMessage')
    tokenError.value = errorMessage
  } finally {
    isLoading.value = false
  }
}

const handlePasswordChange = (value: string) => {
  newPassword.value = value
  if (passwordError.value) {
    handleValidatePassword(value)
  }
  if (confirmPassword.value) {
    handleValidateConfirmPassword()
  }
}

const handleConfirmPasswordChange = (value: string) => {
  confirmPassword.value = value
  if (confirmPasswordError.value) {
    handleValidateConfirmPassword()
  }
}
</script>

<template>
  <div class="h-screen flex overflow-hidden">
    <div class="language-selector-wrapper">
      <LanguageSelector />
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
      <div class="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8">
        <div class="text-center">
          <BrandLogo :height="48" />
          <p class="text-muted-foreground mt-2 sm:mt-4">
            {{ t('auth.resetPassword.subtitle') }}
          </p>
        </div>

        <Card class="w-full">
          <CardHeader>
            <CardTitle>{{ t('auth.resetPassword.title') }}</CardTitle>
            <CardDescription>
              {{ t('auth.resetPassword.description') }}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div v-if="tokenError" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p class="text-sm text-red-800">{{ tokenError }}</p>
            </div>

            <form v-else @submit.prevent="handleSubmit" class="space-y-4">
              <div class="space-y-2">
                <Label for="newPassword" required>
                  {{ t('auth.resetPassword.newPassword') }}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  :placeholder="t('auth.resetPassword.newPasswordPlaceholder')"
                  :model-value="newPassword"
                  @update:model-value="handlePasswordChange"
                  :disabled="isLoading || isSuccess"
                  required
                />
                <p v-if="passwordError" class="text-sm text-destructive">
                  {{ passwordError }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="confirmPassword" required>
                  {{ t('auth.resetPassword.confirmPassword') }}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  :placeholder="t('auth.resetPassword.confirmPasswordPlaceholder')"
                  :model-value="confirmPassword"
                  @update:model-value="handleConfirmPasswordChange"
                  :disabled="isLoading || isSuccess"
                  required
                />
                <p v-if="confirmPasswordError" class="text-sm text-destructive">
                  {{ confirmPasswordError }}
                </p>
              </div>

              <div v-if="isSuccess" class="p-3 rounded-lg bg-green-50 border border-green-200">
                <p class="text-sm text-green-800">
                  {{ t('auth.resetPassword.successMessage') }}
                </p>
              </div>

              <Button
                type="submit"
                class="w-full"
                :disabled="!isFormValid || isLoading || isSuccess"
              >
                <span v-if="!isLoading && !isSuccess">{{ t('auth.resetPassword.submit') }}</span>
                <span v-else-if="isLoading" class="flex items-center gap-2">
                  <span class="animate-spin">⏳</span>
                  {{ t('auth.resetPassword.submitting') }}
                </span>
                <span v-else class="flex items-center gap-2">
                  <span>✓</span>
                  {{ t('auth.resetPassword.submitted') }}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-8 xl:p-12">
      <div class="max-w-md text-primary-foreground space-y-4 xl:space-y-6">
        <h2 class="text-3xl xl:text-5xl font-bold leading-tight">
          {{ t('auth.resetPassword.hero.title') }}
        </h2>
        <p class="text-lg xl:text-xl text-primary-foreground/90">
          {{ t('auth.resetPassword.hero.description') }}
        </p>
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

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
