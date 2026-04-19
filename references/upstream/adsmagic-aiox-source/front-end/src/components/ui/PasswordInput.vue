<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { inputVariants } from '@/components/ui/input.variants'

interface PasswordInputProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  showStrength?: boolean
}

const props = withDefaults(defineProps<PasswordInputProps>(), {
  disabled: false,
  required: false,
  showStrength: true,
  placeholder: '••••••••'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Estado local
const showPassword = ref(false)

// Computed
const passwordType = computed(() => showPassword.value ? 'text' : 'password')
const eyeIcon = computed(() => showPassword.value ? '👁️' : '🙈')

const strength = computed(() => {
  const password = props.modelValue || ''
  if (!password) return { level: 0, label: '', color: '' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  score = Object.values(checks).filter(Boolean).length
  
  if (score <= 2) {
    return { level: 1, label: 'Fraca', color: 'text-destructive' }
  } else if (score <= 3) {
    return { level: 2, label: 'Média', color: 'text-warning' }
  } else if (score <= 4) {
    return { level: 3, label: 'Boa', color: 'text-info' }
  } else {
    return { level: 4, label: 'Excelente', color: 'text-success' }
  }
})

const hasLowerCase = computed(() => {
  const password = props.modelValue || ''
  return /[a-z]/.test(password)
})

const hasUpperCase = computed(() => {
  const password = props.modelValue || ''
  return /[A-Z]/.test(password)
})

const hasNumber = computed(() => {
  const password = props.modelValue || ''
  return /\d/.test(password)
})

const hasSpecialChar = computed(() => {
  const password = props.modelValue || ''
  return /[!@#$%^&*(),.?":{}|<>]/.test(password)
})

// Métodos
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// Classes CSS
const inputClass = cn(
  inputVariants({ size: 'md' }),
  'pr-10 text-sm'
)

const buttonClass = cn(
  'absolute right-3 top-1/2 -translate-y-1/2 p-1',
  'hover:bg-accent hover:text-accent-foreground rounded-control',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50'
)
</script>

<template>
  <div class="space-y-2">
    <!-- Input Container -->
    <div class="relative">
      <input
        :value="props.modelValue"
        :type="passwordType"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :required="props.required"
        :class="inputClass"
        @input="handleInput"
      />
      
      <!-- Toggle Button -->
      <button
        type="button"
        :class="buttonClass"
        :disabled="props.disabled"
        @click="togglePasswordVisibility"
        :aria-label="showPassword ? 'Esconder senha' : 'Mostrar senha'"
      >
        <span class="text-lg">{{ eyeIcon }}</span>
      </button>
    </div>

    <!-- Password Strength Indicator -->
    <div v-if="props.showStrength && props.modelValue" class="space-y-1">
      <!-- Strength Label -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Força da senha:</span>
        <span :class="cn('font-medium', strength.color)">
          {{ strength.label }}
        </span>
      </div>
    </div>

    <!-- Password Requirements -->
    <div v-if="props.showStrength" class="text-xs text-muted-foreground space-y-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
        <div :class="cn('flex items-center gap-1', (props.modelValue || '').length >= 8 ? 'text-success' : 'text-muted-foreground')">
          <span>{{ (props.modelValue || '').length >= 8 ? '✓' : '○' }}</span>
          Mínimo 8 caracteres
        </div>
        <div :class="cn('flex items-center gap-1', hasLowerCase ? 'text-success' : 'text-muted-foreground')">
          <span>{{ hasLowerCase ? '✓' : '○' }}</span>
          Letra minúscula
        </div>
        <div :class="cn('flex items-center gap-1', hasUpperCase ? 'text-success' : 'text-muted-foreground')">
          <span>{{ hasUpperCase ? '✓' : '○' }}</span>
          Letra maiúscula
        </div>
        <div :class="cn('flex items-center gap-1', hasNumber ? 'text-success' : 'text-muted-foreground')">
          <span>{{ hasNumber ? '✓' : '○' }}</span>
          Número
        </div>
        <div :class="cn('flex items-center gap-1', hasSpecialChar ? 'text-success' : 'text-muted-foreground')">
          <span>{{ hasSpecialChar ? '✓' : '○' }}</span>
          Caractere especial
        </div>
      </div>
    </div>
  </div>
</template>