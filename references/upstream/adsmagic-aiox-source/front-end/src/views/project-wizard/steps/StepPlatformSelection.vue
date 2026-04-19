<!--
  Step 2: Seleção de plataformas de anúncios
  Usuário escolhe quais plataformas deseja integrar
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectWizardStore } from '@/stores/projectWizard'
import CheckboxCard from '@/components/ui/CheckboxCard.vue'
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

// ============================================================================
// STORE
// ============================================================================

const wizardStore = useProjectWizardStore()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

const metaAdsSelected = ref(false)
const googleAdsSelected = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const selectedCount = computed(() => {
  let count = 0
  if (metaAdsSelected.value) count++
  if (googleAdsSelected.value) count++
  return count
})

// ============================================================================
// WATCHERS
// ============================================================================

// Atualiza a store quando as seleções mudam
watch([metaAdsSelected, googleAdsSelected], () => {
  wizardStore.updateProjectData({
    platforms: {
      metaAds: metaAdsSelected.value,
      googleAds: googleAdsSelected.value,
    },
  })
})

// Observa mudanças na store e atualiza campos locais (para quando dados chegam do backend)
watch(
  () => wizardStore.projectData.platforms,
  (newPlatforms) => {
    if (newPlatforms) {
      if (metaAdsSelected.value !== newPlatforms.metaAds) {
        metaAdsSelected.value = newPlatforms.metaAds || false
      }
      if (googleAdsSelected.value !== newPlatforms.googleAds) {
        googleAdsSelected.value = newPlatforms.googleAds || false
      }
    }
  },
  { immediate: true, deep: true }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Carrega valores da store
  metaAdsSelected.value = wizardStore.projectData.platforms.metaAds
  googleAdsSelected.value = wizardStore.projectData.platforms.googleAds
})
</script>

<template>
  <div class="step-platform-selection">
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Cabeçalho do step -->
      <div class="text-center mb-4">
        <div class="flex items-center justify-center gap-2">
          <h2 class="text-xl sm:text-2xl font-bold">
            {{ t('projectWizard.step2.title') }}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <HelpCircle class="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs text-sm">
                  Selecione as plataformas onde você anuncia. Você poderá adicionar mais plataformas depois nas configurações do projeto.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ t('projectWizard.step2.description') }}
        </p>
      </div>

      <!-- Grid de plataformas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- Meta Ads -->
        <CheckboxCard
          v-model="metaAdsSelected"
          :title="t('projectWizard.step2.platforms.meta.title')"
          :description="t('projectWizard.step2.platforms.meta.description')"
          icon="📱"
        >
          <div class="mt-2">
            <ul class="text-xs text-muted-foreground space-y-1">
              <li>• {{ t('projectWizard.step2.platforms.meta.feature1') }}</li>
              <li>• {{ t('projectWizard.step2.platforms.meta.feature2') }}</li>
              <li>• {{ t('projectWizard.step2.platforms.meta.feature3') }}</li>
            </ul>
          </div>
        </CheckboxCard>

        <!-- Google Ads -->
        <CheckboxCard
          v-model="googleAdsSelected"
          :title="t('projectWizard.step2.platforms.google.title')"
          :description="t('projectWizard.step2.platforms.google.description')"
          icon="🔍"
        >
          <div class="mt-2">
            <ul class="text-xs text-muted-foreground space-y-1">
              <li>• {{ t('projectWizard.step2.platforms.google.feature1') }}</li>
              <li>• {{ t('projectWizard.step2.platforms.google.feature2') }}</li>
              <li>• {{ t('projectWizard.step2.platforms.google.feature3') }}</li>
            </ul>
          </div>
        </CheckboxCard>
      </div>

      <!-- Feedback de seleção com visual feedback -->
      <div class="mt-8 text-center">
        <div 
          v-if="selectedCount > 0"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
        >
          <CheckCircle2 class="h-4 w-4 text-primary" />
          <p class="text-sm text-primary font-medium">
            {{ t('projectWizard.step2.selectedCount', { count: selectedCount }) }}
          </p>
        </div>
        <div 
          v-else
          class="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full"
        >
          <AlertCircle class="h-4 w-4 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">
            {{ t('projectWizard.step2.selectAtLeastOne') }}
          </p>
        </div>
      </div>

      <!-- Dica -->
      <div class="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p class="text-sm text-muted-foreground text-center">
          💡 {{ t('projectWizard.step2.hint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-platform-selection {
  min-height: 400px;
}
</style>
