<!--
  Step 1: Seleção do tipo de empresa
  Exibe grid de opções para o usuário escolher o tipo de empresa
-->

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '@/stores/onboarding'
import StepHeader from '@/components/features/onboarding/StepHeader.vue'
import CompanyTypeSelector from '@/components/features/onboarding/CompanyTypeSelector.vue'

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
 * Tipo de empresa selecionado
 */
const selectedCompanyType = computed({
  get: () => onboardingStore.companyType,
  set: async (value) => {
    if (!value) return
    onboardingStore.setCompanyType(value)
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
      :title="t('onboarding.companyType.title')"
      :subtitle="t('onboarding.companyType.subtitle')"
      spacing="lg"
    />

    <!-- Seletor de tipo de empresa -->
    <div class="w-full">
      <CompanyTypeSelector
        v-model="selectedCompanyType"
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
