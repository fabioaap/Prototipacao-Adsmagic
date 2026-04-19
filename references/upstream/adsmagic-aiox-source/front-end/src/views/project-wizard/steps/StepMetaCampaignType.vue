<!--
  Step 3: Tipo de Campanha Meta Ads
  Pergunta como o usuário pretende usar o Meta Ads
-->

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectWizardStore } from '@/stores/projectWizard'
import { HelpCircle, CheckCircle2 } from 'lucide-vue-next'
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

const selectedType = ref<'messages' | 'traffic' | ''>('')

// ============================================================================
// COMPUTED
// ============================================================================
// MÉTODOS
// ============================================================================

const selectType = (type: 'messages' | 'traffic') => {
  selectedType.value = type
  wizardStore.updateProjectData({
    metaCampaignType: type,
  })
}

// ============================================================================
// WATCHERS
// ============================================================================

watch(selectedType, () => {
  // Atualização automática via updateProjectData
})

// Observa mudanças na store e atualiza campo local (para quando dados chegam do backend)
watch(
  () => wizardStore.projectData.metaCampaignType,
  (newType) => {
    if (newType && newType !== selectedType.value) {
      selectedType.value = newType as 'messages' | 'traffic' | ''
    }
  },
  { immediate: true }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Carrega valor salvo
  selectedType.value = wizardStore.projectData.metaCampaignType || ''
})
</script>

<template>
  <div class="step-meta-campaign-type">
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Cabeçalho do step -->
      <div class="text-center mb-4">
        <div class="flex items-center justify-center gap-2">
          <h2 class="text-xl sm:text-2xl font-bold">
            {{ t('projectWizard.step3.title') }}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <HelpCircle class="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs text-sm">
                  Escolha o tipo de campanha para otimizarmos a atribuição de conversões. A escolha afeta como os leads são rastreados.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ t('projectWizard.step3.description') }}
        </p>
      </div>

      <!-- Indicador de seleção -->
      <div 
        v-if="selectedType"
        class="mb-4 flex justify-center"
      >
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <CheckCircle2 class="h-4 w-4 text-primary" />
          <span class="text-sm text-primary font-medium">
            {{ selectedType === 'messages' ? 'Campanhas de Mensagens' : 'Campanhas de Tráfego' }} selecionado
          </span>
        </div>
      </div>

      <!-- Grid de opções -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- Campanhas de Mensagens -->
        <div
          :class="[
            'relative p-6 sm:p-8 border-2 rounded-lg cursor-pointer transition-all duration-200',
            selectedType === 'messages'
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-border bg-card hover:border-primary/50 hover:shadow-md',
          ]"
          @click="selectType('messages')"
          role="radio"
          :aria-checked="selectedType === 'messages'"
          tabindex="0"
          @keydown.space.prevent="selectType('messages')"
          @keydown.enter.prevent="selectType('messages')"
        >
          <!-- Checkbox no canto -->
          <div class="absolute top-4 right-4">
            <div
              :class="[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                selectedType === 'messages'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground bg-background',
              ]"
            >
              <div
                v-if="selectedType === 'messages'"
                class="w-2.5 h-2.5 rounded-full bg-primary-foreground"
              />
            </div>
          </div>

          <!-- Ícone -->
          <div class="mb-4">
            <div class="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <span class="text-4xl">💬</span>
            </div>
          </div>

          <!-- Título -->
          <h3 class="text-xl font-semibold mb-2">
            {{ t('projectWizard.step3.options.messages.title') }}
          </h3>

          <!-- Subtítulo -->
          <p class="text-sm text-muted-foreground mb-4">
            {{ t('projectWizard.step3.options.messages.subtitle') }}
          </p>

          <!-- Features -->
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ t('projectWizard.step3.options.messages.feature1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ t('projectWizard.step3.options.messages.feature2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ t('projectWizard.step3.options.messages.feature3') }}</span>
            </li>
          </ul>
        </div>

        <!-- Campanhas de Tráfego -->
        <div
          :class="[
            'relative p-6 sm:p-8 border-2 rounded-lg cursor-pointer transition-all duration-200',
            selectedType === 'traffic'
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-border bg-card hover:border-primary/50 hover:shadow-md',
          ]"
          @click="selectType('traffic')"
          role="radio"
          :aria-checked="selectedType === 'traffic'"
          tabindex="0"
          @keydown.space.prevent="selectType('traffic')"
          @keydown.enter.prevent="selectType('traffic')"
        >
          <!-- Checkbox no canto -->
          <div class="absolute top-4 right-4">
            <div
              :class="[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                selectedType === 'traffic'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground bg-background',
              ]"
            >
              <div
                v-if="selectedType === 'traffic'"
                class="w-2.5 h-2.5 rounded-full bg-primary-foreground"
              />
            </div>
          </div>

          <!-- Ícone -->
          <div class="mb-4">
            <div class="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <span class="text-4xl">🌐</span>
            </div>
          </div>

          <!-- Título -->
          <h3 class="text-xl font-semibold mb-2">
            {{ t('projectWizard.step3.options.traffic.title') }}
          </h3>

          <!-- Subtítulo -->
          <p class="text-sm text-muted-foreground mb-4">
            {{ t('projectWizard.step3.options.traffic.subtitle') }}
          </p>

          <!-- Features -->
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ t('projectWizard.step3.options.traffic.feature1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ t('projectWizard.step3.options.traffic.feature2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ t('projectWizard.step3.options.traffic.feature3') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Feedback de seleção -->
      <div class="mt-4 text-center">
        <p
          v-if="selectedType"
          class="text-sm text-primary font-medium"
        >
          {{
            selectedType === 'messages'
              ? t('projectWizard.step3.selectedMessages')
              : t('projectWizard.step3.selectedTraffic')
          }}
        </p>
        <p
          v-else
          class="text-sm text-muted-foreground"
        >
          {{ t('projectWizard.step3.selectOne') }}
        </p>
      </div>

      <!-- Dica -->
      <div class="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
        <p class="text-sm text-muted-foreground text-center">
          💡 {{ t('projectWizard.step3.hint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-meta-campaign-type {
  min-height: 400px;
}

/* Estilo de foco para acessibilidade */
[role="radio"]:focus {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* Hover effect */
[role="radio"]:not([aria-checked="true"]):hover {
  transform: translateY(-2px);
}

[role="radio"]:active {
  transform: translateY(0);
}
</style>
