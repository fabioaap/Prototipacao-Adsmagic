<!--
  Step 2: Seleção da quantidade de franquias
  Exibe grid de pills para o usuário escolher quantas franquias gerencia
-->

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '@/stores/onboarding'
import StepHeader from '@/components/features/onboarding/StepHeader.vue'
import FranchiseCountSelector from '@/components/features/onboarding/FranchiseCountSelector.vue'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

// ============================================================================
// STORE
// ============================================================================

const onboardingStore = useOnboardingStore()

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Quantidade de franquias selecionada
 */
const selectedFranchiseCount = computed({
  get: () => onboardingStore.franchiseCount,
  set: async (value) => {
    if (!value) return
    onboardingStore.setFranchiseCount(value)
    await nextTick()
    setTimeout(() => onboardingStore.nextStep(), 200)
  },
})

/**
 * Se está carregando
 */
const isLoading = computed(() => {
  return onboardingStore.isLoading
})
</script>

<template>
  <div class="w-full space-y-8">
    <!-- Header do step -->
    <StepHeader
      :title="t('onboarding.franchiseCount.title')"
      :subtitle="t('onboarding.franchiseCount.subtitle')"
      spacing="lg"
    />

    <!-- Seletor de quantidade de franquias -->
    <div class="w-full">
      <FranchiseCountSelector
        v-model="selectedFranchiseCount"
        :disabled="isLoading"
      />
    </div>

    <!-- Espaçamento para botões -->
    <div class="h-16" />
  </div>
</template>


<style scoped>
/* Animações de entrada */
.space-y-8 > * {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Delay escalonado para elementos */
.space-y-8 > *:nth-child(1) {
  animation-delay: 0.1s;
}

.space-y-8 > *:nth-child(2) {
  animation-delay: 0.2s;
}

/* Responsividade melhorada */
@media (max-width: 640px) {
  .space-y-8 {
    gap: 1.5rem;
  }
}
</style>
