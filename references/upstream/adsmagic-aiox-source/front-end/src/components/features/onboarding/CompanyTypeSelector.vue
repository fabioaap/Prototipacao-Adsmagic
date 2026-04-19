<!--
  Seletor de tipo de empresa para Step 1 do onboarding
  Grid 2x4 de cards com ícones e labels
-->

<script setup lang="ts">
import { computed } from 'vue'
// import { useI18n } from 'vue-i18n' // Temporariamente não utilizado
import type { CompanyTypeOption, CompanyType } from '@/types/onboarding'
import { COMPANY_TYPES } from '@/types/onboarding'

// ============================================================================
// PROPS E EMITS
// ============================================================================

interface Props {
  /**
   * Tipo de empresa selecionado
   */
  modelValue: CompanyType | null
  /**
   * Se o componente está desabilitado
   */
  disabled?: boolean
  /**
   * Opções customizadas (padrão: usa COMPANY_TYPES)
   */
  options?: CompanyTypeOption[]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  options: () => [...COMPANY_TYPES],
})

interface Emits {
  /**
   * Emitido quando seleção muda
   */
  (e: 'update:modelValue', value: CompanyType | null): void
}

const emit = defineEmits<Emits>()

// ============================================================================
// I18N
// ============================================================================

// const { t } = useI18n() // Temporariamente não utilizado

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Verifica se uma opção está selecionada
 */
const isSelected = computed(() => {
  return (option: CompanyTypeOption) => props.modelValue === option.id
})

/**
 * Classes CSS para card de opção
 */
const getCardClasses = computed(() => {
  return (option: CompanyTypeOption) => {
    const baseClasses = [
      'relative',
      'p-4',
      'rounded-lg',
      'border-2',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      'hover:shadow-md',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary',
      'focus:ring-offset-2',
      'flex',
      'flex-col',
      'items-center',
      'text-center',
      'min-h-[120px]',
      'justify-center',
    ]

    if (props.disabled) {
      baseClasses.push('opacity-50', 'cursor-not-allowed')
    } else if (isSelected.value(option)) {
      baseClasses.push(
        'border-primary',
        'bg-primary/5',
        'shadow-md'
      )
    } else {
      baseClasses.push(
        'border-border',
        'bg-card',
        'hover:border-primary/50'
      )
    }

    return baseClasses.join(' ')
  }
})

/**
 * Classes CSS para ícone
 */
const getIconClasses = computed(() => {
  return (option: CompanyTypeOption) => {
    const baseClasses = [
      'text-3xl',
      'mb-2',
      'transition-transform',
      'duration-200',
    ]

    if (!props.disabled && isSelected.value(option)) {
      baseClasses.push('scale-110')
    }

    return baseClasses.join(' ')
  }
})

/**
 * Classes CSS para label
 */
const getLabelClasses = computed(() => {
  return (option: CompanyTypeOption) => {
    const baseClasses = [
      'text-sm',
      'font-medium',
      'transition-colors',
      'duration-200',
    ]

    if (isSelected.value(option)) {
      baseClasses.push('text-primary')
    } else {
      baseClasses.push('text-foreground')
    }

    return baseClasses.join(' ')
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Grid de opções -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        :disabled="disabled"
        :class="getCardClasses(option)"
        @click="emit('update:modelValue', isSelected(option) ? null : option.id)"
        @keydown.enter="emit('update:modelValue', isSelected(option) ? null : option.id)"
        @keydown.space.prevent="emit('update:modelValue', isSelected(option) ? null : option.id)"
      >
        <!-- Ícone -->
        <div :class="getIconClasses(option)">
          {{ option.icon }}
        </div>

        <!-- Label -->
        <span :class="getLabelClasses(option)">
          {{ option.label }}
        </span>

        <!-- Indicador de seleção -->
        <div
          v-if="isSelected(option)"
          class="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
        >
          <svg
            class="w-2.5 h-2.5 text-primary-foreground"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </button>
    </div>

  </div>
</template>

<style scoped>
/* Animações personalizadas */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Aplica animação aos cards */
button {
  animation: scaleIn 0.2s ease-out;
}

/* Hover effects melhorados */
button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Responsividade melhorada */
@media (max-width: 640px) {
  .grid {
    gap: 0.75rem;
  }
  
  button {
    min-height: 100px;
    padding: 0.75rem;
  }
  
  .text-3xl {
    font-size: 1.875rem;
  }
}
</style>
