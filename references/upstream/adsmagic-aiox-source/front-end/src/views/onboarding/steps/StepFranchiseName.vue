<!--
  Step 3: Nome da primeira franquia
  Input para o usuário inserir o nome da sua primeira franquia
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '@/stores/onboarding'
import StepHeader from '@/components/features/onboarding/StepHeader.vue'
import FranchiseNameInput from '@/components/features/onboarding/FranchiseNameInput.vue'

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
 * Nome da franquia
 */
const franchiseName = computed({
  get: () => onboardingStore.franchiseName,
  set: (value) => onboardingStore.setFranchiseName(value),
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
      :title="t('onboarding.franchiseName.title')"
      :subtitle="t('onboarding.franchiseName.subtitle')"
      spacing="lg"
    />

    <!-- Input do nome da franquia -->
    <div class="w-full">
      <FranchiseNameInput
        v-model="franchiseName"
        :disabled="isLoading"
        :placeholder="t('onboarding.franchiseName.placeholder')"
        :label="t('onboarding.franchiseName.label')"
        validate-on-type
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
