<script setup lang="ts">
/**
 * BlankLayout - Layout mínimo sem header, sidebar ou footer
 *
 * Usado para:
 * - Páginas de autenticação (login, register, forgot-password, verify-otp)
 * - Onboarding flow
 * - Project wizard
 * - Páginas full-screen
 * - Páginas de erro (404, 500)
 * - Completion pages
 *
 * Este layout fornece apenas um container básico permitindo que
 * cada view tenha controle total sobre seu próprio layout
 */

interface Props {
  /**
   * Classe CSS customizada para o container
   */
  containerClass?: string
  /**
   * Se true, aplica padding padrão
   */
  padding?: boolean
  /**
   * Se true, centraliza o conteúdo verticalmente
   */
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  padding: false,
  centered: false,
})
</script>

<template>
  <div
    :class="[
      'min-h-screen bg-background',
      props.containerClass,
      {
        'p-4 md:p-6 lg:p-8': props.padding,
        'flex items-center justify-center': props.centered,
      }
    ]"
  >
    <slot />
  </div>
</template>
