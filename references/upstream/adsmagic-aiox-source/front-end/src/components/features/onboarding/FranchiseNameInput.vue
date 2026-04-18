<!--
  Input customizado para nome da franquia no Step 3 do onboarding
  Inclui validação e feedback visual
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { franchiseNameSchema } from '@/types/onboarding'

// ============================================================================
// PROPS E EMITS
// ============================================================================

interface Props {
  /**
   * Valor do input
   */
  modelValue: string
  /**
   * Placeholder do input
   */
  placeholder?: string
  /**
   * Label do input
   */
  label?: string
  /**
   * Se o input está desabilitado
   */
  disabled?: boolean
  /**
   * Se deve mostrar validação em tempo real
   */
  validateOnType?: boolean
  /**
   * Tamanho máximo do input
   */
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Primeira franquia',
  label: 'Nome da franquia',
  disabled: false,
  validateOnType: true,
  maxLength: 50,
})

interface Emits {
  /**
   * Emitido quando valor muda
   */
  (e: 'update:modelValue', value: string): void
  /**
   * Emitido quando validação muda
   */
  (e: 'validation', isValid: boolean, errors: string[]): void
}

const emit = defineEmits<Emits>()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

/**
 * Erro de validação atual
 */
const validationError = ref<string>('')

/**
 * Se o input já foi tocado (para mostrar erro apenas após interação)
 */
const touched = ref(false)

/**
 * Se está validando
 */
const isValidating = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Se deve mostrar erro
 */
const shouldShowError = computed(() => {
  return touched.value && validationError.value && props.validateOnType
})

/**
 * Se o input é válido
 */
const isValid = computed(() => {
  return !validationError.value && props.modelValue.trim().length >= 2
})

/**
 * Mensagem de ajuda
 */
const helpText = computed(() => {
  const length = props.modelValue.length
  if (length === 0) {
    return 'Digite o nome da sua primeira franquia'
  }
  if (length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres'
  }
  if (length > props.maxLength) {
    return `Nome deve ter no máximo ${props.maxLength} caracteres`
  }
  return `${length}/${props.maxLength} caracteres`
})

/**
 * Classes CSS para o container
 */
const containerClasses = computed(() => {
  return [
    'w-full',
    'max-w-md',
    'mx-auto',
  ]
})

/**
 * Classes CSS para mensagem de erro
 */
const errorClasses = computed(() => {
  return [
    'text-sm',
    'mt-1',
    'transition-colors',
    'duration-200',
    shouldShowError.value ? 'text-destructive' : 'text-muted-foreground',
  ]
})

// ============================================================================
// MÉTODOS
// ============================================================================

/**
 * Valida o valor atual usando schema Zod
 */
const validateValue = async (value: string): Promise<void> => {
  isValidating.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simula delay de validação
    
    if (value.trim().length === 0) {
      validationError.value = ''
      emit('validation', false, [])
      return
    }

    franchiseNameSchema.parse(value.trim())
    validationError.value = ''
    emit('validation', true, [])
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const zodError = error as any
      const errors = zodError.issues.map((issue: any) => issue.message)
      validationError.value = errors[0] || 'Nome inválido'
      emit('validation', false, errors)
    } else {
      validationError.value = 'Erro de validação'
      emit('validation', false, ['Erro de validação'])
    }
  } finally {
    isValidating.value = false
  }
}

/**
 * Manipula mudança no input
 */
const handleInputChange = (value: string): void => {
  emit('update:modelValue', value)
  
  if (props.validateOnType && touched.value) {
    validateValue(value)
  }
}

/**
 * Manipula blur do input
 */
const handleBlur = (): void => {
  touched.value = true
  
  if (props.modelValue.trim().length > 0) {
    validateValue(props.modelValue)
  }
}

/**
 * Manipula focus do input
 */
const handleFocus = (): void => {
  // Não faz nada por enquanto
  // Pode ser usado para analytics ou outras funcionalidades
}

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Watch para validar quando props.validateOnType muda
 */
watch(
  () => props.validateOnType,
  (newValue) => {
    if (newValue && touched.value && props.modelValue.trim().length > 0) {
      validateValue(props.modelValue)
    }
  }
)
</script>

<template>
  <div :class="containerClasses">
    <!-- Label -->
    <Label 
      for="franchise-name" 
      :class="{ 'text-destructive': shouldShowError }"
      class="block text-center mb-4"
    >
      {{ label }}
    </Label>

    <!-- Input -->
    <Input
      id="franchise-name"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      class="text-center text-lg"
      @update:model-value="handleInputChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- Mensagem de ajuda/erro -->
    <p :class="errorClasses">
      {{ shouldShowError ? validationError : helpText }}
    </p>

    <!-- Indicador de validação -->
    <div 
      v-if="touched && !isValidating && modelValue.length > 0"
      class="flex justify-center mt-2"
    >
      <div
        :class="[
          'w-4 h-4 rounded-full flex items-center justify-center',
          isValid ? 'bg-green-500' : 'bg-destructive'
        ]"
      >
        <svg
          v-if="isValid"
          class="w-2.5 h-2.5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="w-2.5 h-2.5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transições suaves */
p {
  transition: all 0.2s ease-in-out;
}

/* Animação para indicador de validação */
.w-4.h-4 {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Focus melhorado para o input */
input:focus {
  transform: scale(1.02);
  transition: transform 0.2s ease-out;
}

/* Responsividade */
@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
  }
}
</style>