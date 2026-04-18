<!--
  Layout wrapper para o onboarding
  Centraliza conteúdo verticalmente e define estrutura base
-->

<script setup lang="ts">
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'
import BrandLogo from './BrandLogo.vue'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  /**
   * Título da página (opcional)
   */
  title?: string
  /**
   * Subtítulo da página (opcional)
   */
  subtitle?: string
  /**
   * Largura máxima do container (padrão: 800px)
   */
  maxWidth?: string
  /**
   * Padding horizontal (padrão: 32px)
   */
  padding?: string
  /**
   * Exibir barra de progresso no topo
   */
  showProgress?: boolean
  /**
   * Valor do progresso (0-100)
   */
  progress?: number
  /**
   * Ativa layout split com painel à direita
   */
  split?: boolean
  /**
   * Centraliza verticalmente o conteúdo (padrão: false)
   */
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  maxWidth: '800px',
  padding: '32px',
  showProgress: false,
  progress: 0,
  split: false,
  centered: false,
})

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Estilo dinâmico do container
 * Removido max-width para que o body use a largura total igual ao header
 */
const containerStyle = computed(() => ({}))

/**
 * Classes dinâmicas do container baseadas em props
 */
const containerClasses = computed(() => [
  'flex-1 flex flex-col items-center w-full',
  props.centered ? 'justify-start py-8' : 'py-4'
])

/**
 * Classes dinâmicas do footer baseadas em props
 */
const footerClasses = computed(() => [
  'w-full',
  props.centered ? 'mt-10 sm:mt-12' : 'mt-2 sm:mt-4'
])
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col overflow-y-auto">
    <!-- Barra de progresso -->
    <ProgressBar v-if="showProgress" :percent="progress" />

    <!-- Slot para stepper (se fornecido) -->
    <slot name="stepper" />

    <!-- Logo centralizado no topo -->
    <div class="flex justify-center pt-6 pb-3">
      <BrandLogo />
    </div>

    <!-- Container principal centralizado -->
    <div
      :class="containerClasses"
      :style="containerStyle"
    >
      <!-- Header (se título/subtítulo fornecidos) -->
      <div v-if="title || subtitle" class="w-full mb-8">
        <div class="text-center">
          <h1 v-if="title" class="text-4xl font-bold tracking-tight text-foreground">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-muted-foreground mt-2 text-lg">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <main class="w-full flex flex-col">
        <!-- Layout split (quando ativo) -->
        <div v-if="split" class="grid md:grid-cols-[1fr_520px] gap-10 items-start max-w-6xl mx-auto w-full px-4 sm:px-6">
          <slot />
          <slot name="right" />
        </div>

        <!-- Layout centralizado (quando split=false) -->
        <div v-else class="w-full max-w-[800px] mx-auto px-4 sm:px-6">
            <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer :class="footerClasses">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos do layout de onboarding */

/* Garante que o layout funcione bem em telas pequenas */
@media (max-width: 640px) {
  .min-h-screen {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Melhora espaçamento em mobile */
  main {
    padding-bottom: 0.5rem;
  }

  footer {
    margin-top: 0.5rem !important;
  }
}

/* Transições suaves para mudanças de conteúdo */
main {
  transition: all 0.3s ease-in-out;
}

/* Estilo para o container principal */
.min-h-screen > div {
  transition: all 0.3s ease-in-out;
}
</style>
