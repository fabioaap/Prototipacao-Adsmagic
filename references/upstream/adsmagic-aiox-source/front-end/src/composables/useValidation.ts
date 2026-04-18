import { useI18n } from 'vue-i18n'

/**
 * Composable para validações traduzidas
 * Fornece funções de validação com mensagens i18n
 */
export function useValidation() {
  const { t } = useI18n()

  /**
   * Valida formato de email
   */
  const validateEmail = (value: string): { valid: boolean; error: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!value) {
      return {
        valid: false,
        error: t('auth.validation.emailRequired')
      }
    }

    if (!emailRegex.test(value)) {
      return {
        valid: false,
        error: t('auth.validation.emailInvalid')
      }
    }

    return { valid: true, error: '' }
  }

  /**
   * Valida senha
   */
  const validatePassword = (value: string, minLength = 6): { valid: boolean; error: string } => {
    if (!value) {
      return {
        valid: false,
        error: t('auth.validation.passwordRequired')
      }
    }

    if (value.length < minLength) {
      return {
        valid: false,
        error: t('auth.validation.passwordMinLength', { min: minLength })
      }
    }

    return { valid: true, error: '' }
  }

  /**
   * Valida senha forte (com requisitos de complexidade)
   */
  const validateStrongPassword = (value: string, minLength = 8): { valid: boolean; error: string } => {
    if (!value) {
      return {
        valid: false,
        error: t('auth.validation.passwordRequired')
      }
    }

    if (value.length < minLength) {
      return {
        valid: false,
        error: t('auth.validation.passwordMinLength', { min: minLength })
      }
    }

    // Verifica se contém pelo menos uma minúscula, uma maiúscula e um número
    const hasLowercase = /[a-z]/.test(value)
    const hasUppercase = /[A-Z]/.test(value)
    const hasNumber = /\d/.test(value)

    if (!hasLowercase || !hasUppercase || !hasNumber) {
      return {
        valid: false,
        error: t('auth.validation.passwordStrength')
      }
    }

    return { valid: true, error: '' }
  }

  /**
   * Valida nome
   */
  const validateName = (value: string): { valid: boolean; error: string } => {
    if (!value) {
      return {
        valid: false,
        error: t('auth.validation.nameRequired')
      }
    }

    if (value.length < 2) {
      return {
        valid: false,
        error: t('auth.validation.nameMinLength', { min: 2 })
      }
    }

    if (value.length > 100) {
      return {
        valid: false,
        error: t('auth.validation.nameMaxLength', { max: 100 })
      }
    }

    // Verifica se contém apenas letras e espaços
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    if (!nameRegex.test(value)) {
      return {
        valid: false,
        error: t('auth.validation.nameInvalid')
      }
    }

    return { valid: true, error: '' }
  }

  /**
   * Valida telefone
   */
  const validatePhone = (value: string, minDigits = 8, maxDigits = 15): { valid: boolean; error: string } => {
    if (!value) {
      return {
        valid: false,
        error: t('auth.validation.phoneRequired')
      }
    }

    if (value.length < minDigits) {
      return {
        valid: false,
        error: t('auth.validation.phoneMinLength', { min: minDigits })
      }
    }

    if (value.length > maxDigits) {
      return {
        valid: false,
        error: t('auth.validation.phoneMaxLength', { max: maxDigits })
      }
    }

    // Verifica se contém apenas números
    const phoneRegex = /^\d+$/
    if (!phoneRegex.test(value)) {
      return {
        valid: false,
        error: t('auth.validation.phoneInvalid')
      }
    }

    return { valid: true, error: '' }
  }

  return {
    validateEmail,
    validatePassword,
    validateStrongPassword,
    validateName,
    validatePhone
  }
}
