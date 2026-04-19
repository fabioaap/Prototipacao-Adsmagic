<!--
  Seletor de quantidade de franquias para Step 2 do onboarding
  Grid de pills com opções de quantidade
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { FranchiseCountOption, FranchiseCount } from '@/types/onboarding'
import { FRANCHISE_COUNTS } from '@/types/onboarding'

// ============================================================================
// PROPS E EMITS
// ============================================================================

interface Props {
  /**
   * Quantidade de franquias selecionada
   */
  modelValue: FranchiseCount | null
  /**
   * Se o componente está desabilitado
   */
  disabled?: boolean
  /**
   * Opções customizadas (padrão: usa FRANCHISE_COUNTS)
   */
  options?: FranchiseCountOption[]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  options: () => [...FRANCHISE_COUNTS],
})

interface Emits {
  /**
   * Emitido quando seleção muda
   */
  (e: 'update:modelValue', value: FranchiseCount | null): void
}

const emit = defineEmits<Emits>()

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Verifica se uma opção está selecionada
 */
const isSelected = computed(() => {
  return (option: FranchiseCountOption) => props.modelValue === option.id
})

/**
 * Classes CSS para pill de opção
 */
const getPillClasses = computed(() => {
  return (option: FranchiseCountOption) => {
    const baseClasses = [
      'px-6',
      'py-3',
      'rounded-full',
      'border-2',
      'font-medium',
      'text-sm',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary',
      'focus:ring-offset-2',
    ]

    if (props.disabled) {
      baseClasses.push('opacity-50', 'cursor-not-allowed')
    } else if (isSelected.value(option)) {
      baseClasses.push(
        'bg-primary',
        'border-primary',
        'text-primary-foreground',
        'shadow-md'
      )
    } else {
      baseClasses.push(
        'bg-background',
        'border-border',
        'text-foreground',
        'hover:border-primary/50',
        'hover:bg-muted/50'
      )
    }

    return baseClasses.join(' ')
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Grid de opções -->
    <div class="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto justify-items-center">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        :disabled="disabled"
        :class="getPillClasses(option)"
        @click="emit('update:modelValue', isSelected(option) ? null : option.id)"
        @keydown.enter="emit('update:modelValue', isSelected(option) ? null : option.id)"
        @keydown.space.prevent="emit('update:modelValue', isSelected(option) ? null : option.id)"
      >
        {{ option.label }}
      </button>
    </div>

  </div>
</template>

<style scoped>
/* Animações personalizadas */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Aplica animação aos pills selecionados */
button[class*="bg-primary"] {
  animation: pulse 0.3s ease-out;
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
    gap: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.375rem;
  }
  
  button {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
