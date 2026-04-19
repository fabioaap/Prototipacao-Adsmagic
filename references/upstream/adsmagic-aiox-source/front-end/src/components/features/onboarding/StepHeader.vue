<!--
  Cabeçalho padrão para steps do onboarding
  Exibe título e subtítulo com tipografia consistente
-->

<script setup lang="ts">
import { computed } from 'vue'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  /**
   * Título principal do step
   */
  title: string
  /**
   * Subtítulo/descrição do step
   */
  subtitle?: string
  /**
   * Tamanho do título (padrão: 2xl)
   */
  titleSize?: 'xl' | '2xl' | '3xl' | '4xl'
  /**
   * Alinhamento do texto (padrão: center)
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Espaçamento inferior (padrão: 8)
   */
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  titleSize: '3xl',
  align: 'center',
  spacing: 'lg',
})

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Classes CSS dinâmicas para o tamanho do título
 */
const titleClasses = computed(() => {
  const sizeMap = {
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  }
  return `font-bold tracking-tight text-foreground ${sizeMap[props.titleSize]}`
})

/**
 * Classes CSS dinâmicas para alinhamento
 */
const alignmentClasses = computed(() => {
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return alignMap[props.align]
})

/**
 * Classes CSS dinâmicas para espaçamento
 */
const spacingClasses = computed(() => {
  const spacingMap = {
    sm: 'mb-4',
    md: 'mb-8',
    lg: 'mb-12',
    xl: 'mb-16',
  }
  return spacingMap[props.spacing]
})
</script>

<template>
  <div class="w-full" :class="[alignmentClasses, spacingClasses]">
    <!-- Título principal -->
    <h2 :class="titleClasses">
      {{ title }}
    </h2>

    <!-- Subtítulo (se fornecido) -->
    <p 
      v-if="subtitle" 
      class="text-muted-foreground mt-2 text-base leading-relaxed"
    >
      {{ subtitle }}
    </p>
  </div>
</template>

<style scoped>
/* Transições suaves para mudanças de conteúdo */
h2, p {
  transition: all 0.3s ease-in-out;
}

/* Melhora legibilidade em telas pequenas */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }
  
  p {
    font-size: 0.95rem;
  }
}
</style>
