<!--
  Tela de conclusão do assistente de projeto
  Mostra resumo das configurações e status das integrações
-->

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectWizardStore } from '@/stores/projectWizard'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

// ============================================================================
// ROUTER E STORE
// ============================================================================

const router = useRouter()
const { locale } = useI18n()
const wizardStore = useProjectWizardStore()

// ============================================================================
// COMPUTED
// ============================================================================

const projectData = computed(() => wizardStore.projectData)

const integrationStatus = computed(() => {
  type StatusType = 'completed' | 'pending' | 'skipped'
  
  const status: Record<string, { name: string; status: StatusType }> = {
    project: { name: t('projectWizard.completion.project'), status: 'completed' },
    platforms: { name: t('projectWizard.completion.platforms'), status: 'completed' },
    metaAds: { name: t('projectWizard.completion.metaAds'), status: 'skipped' },
    googleAds: { name: t('projectWizard.completion.googleAds'), status: 'skipped' },
    whatsapp: { name: t('projectWizard.completion.whatsapp'), status: 'skipped' },
  }

  // Meta Ads
  if (projectData.value.platforms.metaAds && status.metaAds) {
    status.metaAds.status = projectData.value.metaAds?.connected ? 'completed' : 'pending'
  }

  // Google Ads
  if (projectData.value.platforms.googleAds && status.googleAds) {
    status.googleAds.status = projectData.value.googleAds?.connected ? 'completed' : 'pending'
  }

  // WhatsApp
  if (status.whatsapp) {
    status.whatsapp.status = projectData.value.whatsapp?.connected ? 'completed' : 'pending'
  }

  return status
})

const hasPendingIntegrations = computed(() => {
  return Object.values(integrationStatus.value).some(item => item.status === 'pending')
})

const completedCount = computed(() => {
  return Object.values(integrationStatus.value).filter(item => item.status === 'completed').length
})

const totalCount = computed(() => {
  return Object.values(integrationStatus.value).filter(item => item.status !== 'skipped').length
})

// ============================================================================
// MÉTODOS
// ============================================================================

const goToProject = async () => {
  const projectId = wizardStore.currentProjectId
  if (projectId) {
    await router.push(`/${locale.value}/projects/${projectId}/dashboard`)
  } else {
    await router.push(`/${locale.value}/projects`)
  }
  wizardStore.reset()
}

const completePendingIntegrations = () => {
  // Volta para a etapa de configuração
  wizardStore.goToStep(3)
  router.push(`/${locale.value}/project/new`)
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Verifica se chegou aqui sem completar o wizard
  if (!projectData.value.name) {
    router.push(`/${locale.value}/project/new`)
  }
})
</script>

<template>
  <div class="completion-view min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Confete de celebração -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 class="text-3xl sm:text-4xl font-bold mb-2">
          {{ t('projectWizard.completion.title') }}
        </h1>
        <p class="text-lg text-muted-foreground">
          {{ t('projectWizard.completion.subtitle', { name: projectData.name }) }}
        </p>
      </div>

      <!-- Card com status das integrações -->
      <div class="border border-border rounded-lg p-6 sm:p-8 mb-6 bg-card">
        <h2 class="text-xl font-semibold mb-4">
          {{ t('projectWizard.completion.statusTitle') }}
        </h2>

        <!-- Progresso -->
        <div class="mb-6">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-muted-foreground">{{ t('projectWizard.completion.progress') }}</span>
            <span class="font-medium">{{ completedCount }}/{{ totalCount }}</span>
          </div>
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-500"
              :style="{ width: `${(completedCount / totalCount) * 100}%` }"
            />
          </div>
        </div>

        <!-- Lista de status -->
        <div class="space-y-3">
          <div
            v-for="(item, key) in integrationStatus"
            :key="key"
            class="flex items-center justify-between p-3 rounded-lg"
            :class="{
              'bg-green-50 border border-green-200': item.status === 'completed',
              'bg-yellow-50 border border-yellow-200': item.status === 'pending',
              'bg-muted/50': item.status === 'skipped',
            }"
          >
            <div class="flex items-center space-x-3">
              <!-- Ícone de status -->
              <div
                v-if="item.status === 'completed'"
                class="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div
                v-else-if="item.status === 'pending'"
                class="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div
                v-else
                class="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </div>

              <span class="font-medium">{{ item.name }}</span>
            </div>

            <!-- Badge de status -->
            <Badge
              :variant="
                item.status === 'completed' ? 'success' :
                item.status === 'pending' ? 'warning' :
                'secondary'
              "
            >
              {{
                item.status === 'completed' ? t('projectWizard.completion.statusCompleted') :
                item.status === 'pending' ? t('projectWizard.completion.statusPending') :
                t('projectWizard.completion.statusSkipped')
              }}
            </Badge>
          </div>
        </div>

        <!-- Aviso de integrações pendentes -->
        <div
          v-if="hasPendingIntegrations"
          class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <p class="text-sm text-yellow-800">
            ⚠️ {{ t('projectWizard.completion.pendingWarning') }}
          </p>
        </div>
      </div>

      <!-- Resumo do projeto -->
      <div class="border border-border rounded-lg p-6 sm:p-8 mb-6 bg-card">
        <h2 class="text-xl font-semibold mb-4">
          {{ t('projectWizard.completion.projectSummary') }}
        </h2>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">{{ t('projectWizard.completion.projectName') }}</span>
            <span class="font-medium">{{ projectData.name }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-muted-foreground">{{ t('projectWizard.completion.segment') }}</span>
            <span class="font-medium">{{ projectData.segment }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-muted-foreground">{{ t('projectWizard.completion.platforms') }}</span>
            <div class="flex space-x-2">
              <Badge v-if="projectData.platforms.metaAds" variant="outline">Meta Ads</Badge>
              <Badge v-if="projectData.platforms.googleAds" variant="outline">Google Ads</Badge>
            </div>
          </div>

          <div v-if="projectData.whatsapp?.connected" class="flex justify-between">
            <span class="text-muted-foreground">{{ t('projectWizard.completion.whatsappNumber') }}</span>
            <span class="font-medium">{{ projectData.whatsapp.phoneNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Botões de ação -->
      <div class="flex flex-col sm:flex-row gap-3">
        <Button
          class="flex-1"
          @click="goToProject"
        >
          {{ t('projectWizard.completion.goToProject') }}
        </Button>

        <Button
          v-if="hasPendingIntegrations"
          variant="outline"
          class="flex-1"
          @click="completePendingIntegrations"
        >
          {{ t('projectWizard.completion.completePending') }}
        </Button>
      </div>

      <!-- Próximos passos -->
      <div class="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
        <h3 class="font-semibold mb-3">
          {{ t('projectWizard.completion.nextSteps') }}
        </h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li>• {{ t('projectWizard.completion.nextStep1') }}</li>
          <li>• {{ t('projectWizard.completion.nextStep2') }}</li>
          <li>• {{ t('projectWizard.completion.nextStep3') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animação de entrada */
.completion-view > div {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
