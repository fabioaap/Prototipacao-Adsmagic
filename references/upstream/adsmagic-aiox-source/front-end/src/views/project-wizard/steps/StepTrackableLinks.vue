<!--
  Step 5: Links Rastreáveis
  Criação de links para rastrear conversões
  Aparece se: Google Ads OU (Meta Ads E campanha de tráfego)
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectWizardStore } from '@/stores/projectWizard'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import { HelpCircle, Link } from '@/composables/useIcons'
import { useToast } from '@/components/ui/toast/use-toast'
import { createTrackableLink } from '@/services/api/trackableLinks'
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
const { success: showSuccessToast, error: showErrorToast } = useToast()

// ============================================================================
// STORE
// ============================================================================

const wizardStore = useProjectWizardStore()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

const trackableLinks = ref<Array<{
  id: string
  name: string
  url: string
  message: string
}>>([])

const newLinkName = ref('')
const newLinkMessage = ref('')
const isCreatingLink = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const canCreateLink = computed(() => {
  return newLinkName.value.trim() !== '' && newLinkMessage.value.trim() !== ''
})

const showGoogleInfo = computed(() => wizardStore.projectData.platforms.googleAds)
const showMetaInfo = computed(() => {
  return wizardStore.projectData.platforms.metaAds &&
         wizardStore.projectData.metaCampaignType === 'traffic'
})

// ============================================================================
// MÉTODOS
// ============================================================================

const createLink = async () => {
  if (!canCreateLink.value) return

  isCreatingLink.value = true

  try {
    const projectId = wizardStore.currentProjectId || localStorage.getItem('current_project_id') || ''
    const whatsappNumber = wizardStore.projectData.whatsapp?.phoneNumber || ''
    const result = await createTrackableLink(projectId, {
      name: newLinkName.value,
      initialMessage: newLinkMessage.value,
      whatsappNumber,
    })

    if (!result.ok) {
      showErrorToast(result.error.message)
      return
    }

    const newLink = {
      id: result.value.id,
      name: result.value.name,
      url: result.value.url || result.value.shortUrl || `https://track.adsmagic.app/${result.value.id}`,
      message: newLinkMessage.value,
    }

    trackableLinks.value.push(newLink)

    // Atualiza store
    wizardStore.updateProjectData({
      trackableLinks: trackableLinks.value,
    })

    // Limpa form
    newLinkName.value = ''
    newLinkMessage.value = ''
  } catch (error) {
    console.error('Erro ao criar link:', error)
  } finally {
    isCreatingLink.value = false
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  showSuccessToast('Link copiado!', 'O link foi copiado para a área de transferência.')
}

const deleteLink = (linkId: string) => {
  trackableLinks.value = trackableLinks.value.filter(link => link.id !== linkId)
  wizardStore.updateProjectData({
    trackableLinks: trackableLinks.value,
  })
}

// ============================================================================
// WATCHERS
// ============================================================================

// Observa mudanças na store e atualiza campo local (para quando dados chegam do backend)
watch(
  () => wizardStore.projectData.trackableLinks,
  (newLinks) => {
    if (newLinks && JSON.stringify(trackableLinks.value) !== JSON.stringify(newLinks)) {
      trackableLinks.value = newLinks || []
    }
  },
  { immediate: true, deep: true }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Carrega links salvos (fallback caso watch não tenha executado ainda)
  trackableLinks.value = wizardStore.projectData.trackableLinks || []
})
</script>

<template>
  <div class="step-trackable-links">
    <div class="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-4">
      <!-- Cabeçalho do step -->
      <div class="text-center mb-4">
        <div class="flex items-center justify-center gap-2">
          <h2 class="text-xl sm:text-2xl font-bold">
            {{ t('projectWizard.step5.title') }}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <HelpCircle class="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs text-sm">
                  Links rastreáveis permitem atribuir conversões aos anúncios corretos. Cada link captura parâmetros UTM automaticamente.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ t('projectWizard.step5.description') }}
        </p>
        <!-- Contador de links criados -->
        <div 
          v-if="trackableLinks.length > 0"
          class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
        >
          <Link class="h-3 w-3" />
          {{ trackableLinks.length }} {{ trackableLinks.length === 1 ? 'link criado' : 'links criados' }}
        </div>
      </div>

      <!-- Informação sobre para quê servem os links -->
      <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <div class="flex items-start space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              {{ t('projectWizard.step5.infoTitle') }}
            </p>
            <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li v-if="showGoogleInfo">• {{ t('projectWizard.step5.infoGoogle') }}</li>
              <li v-if="showMetaInfo">• {{ t('projectWizard.step5.infoMeta') }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Formulário de criação -->
      <div class="border border-border rounded-lg p-4 mb-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ t('projectWizard.step5.createTitle') }}
        </h3>

        <div class="space-y-4">
          <!-- Nome do link -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">
              {{ t('projectWizard.step5.linkName') }}
              <span class="text-destructive">*</span>
            </label>
            <Input
              v-model="newLinkName"
              :placeholder="t('projectWizard.step5.linkNamePlaceholder')"
            />
            <p class="text-xs text-muted-foreground">
              {{ t('projectWizard.step5.linkNameHint') }}
            </p>
          </div>

          <!-- Mensagem WhatsApp -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">
              {{ t('projectWizard.step5.linkMessage') }}
              <span class="text-destructive">*</span>
            </label>
            <Textarea
              v-model="newLinkMessage"
              :placeholder="t('projectWizard.step5.linkMessagePlaceholder')"
              :rows="3"
            />
            <p class="text-xs text-muted-foreground">
              {{ t('projectWizard.step5.linkMessageHint') }}
            </p>
          </div>

          <!-- Botão criar -->
          <Button
            @click="createLink"
            :disabled="!canCreateLink || isCreatingLink"
          >
            {{ isCreatingLink ? t('projectWizard.step5.creating') : t('projectWizard.step5.createButton') }}
          </Button>
        </div>
      </div>

      <!-- Lista de links criados -->
      <div v-if="trackableLinks.length > 0">
        <h3 class="text-lg font-semibold mb-4">
          {{ t('projectWizard.step5.createdLinks') }} ({{ trackableLinks.length }})
        </h3>

        <div class="space-y-3">
          <div
            v-for="link in trackableLinks"
            :key="link.id"
            class="border border-border rounded-lg p-4 bg-card"
          >
            <!-- Nome do link -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <p class="font-medium">{{ link.name }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ t('projectWizard.step5.message') }}: {{ link.message }}
                </p>
              </div>

              <!-- Botão deletar -->
              <Button
                variant="ghost"
                size="sm"
                @click="deleteLink(link.id)"
                class="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </Button>
            </div>

            <!-- URL copiável -->
            <div class="flex items-center space-x-2">
              <Input
                :model-value="link.url"
                readonly
                class="flex-1 text-xs font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                @click="copyToClipboard(link.url)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                {{ t('projectWizard.step5.copy') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="border-2 border-dashed border-border rounded-lg p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <p class="text-muted-foreground text-sm">
          {{ t('projectWizard.step5.noLinks') }}
        </p>
      </div>

      <!-- Dica final -->
      <div class="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p class="text-sm text-muted-foreground text-center">
          💡 {{ t('projectWizard.step5.hint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-trackable-links {
  min-height: 400px;
}
</style>
