<template>
  <Modal
    :model-value="open"
    @update:model-value="emit('update:open', $event)"
    size="lg"
    :show-close="false"
    :disable-portal="disablePortal"
  >
    <template #default>
      <div class="max-w-xl mx-auto p-6">
        <div class="flex items-center justify-between mb-6">
          <h2
            id="meta-modal-title"
            class="text-xl font-semibold"
          >
            Conectar Meta Ads
          </h2>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Fechar"
            @click="emit('update:open', false)"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Estado: Conectar (OAuth) -->
        <div v-if="!hasMetaIntegrationId" class="space-y-4">
          <p class="text-sm text-muted-foreground" id="meta-connect-description">
            Conecte sua conta do Meta Ads para rastrear campanhas e métricas.
          </p>
          <Button
            id="meta-connect-btn"
            :disabled="metaIntegration.isConnecting.value"
            :loading="metaIntegration.isConnecting.value"
            class="w-full"
            @click="handleConnect"
          >
            {{ metaIntegration.isConnecting.value ? 'Conectando...' : 'Conectar com Meta Ads' }}
          </Button>
          <p
            v-if="metaIntegration.error.value"
            class="text-sm text-destructive"
            role="alert"
          >
            {{ metaIntegration.error.value }}
          </p>
        </div>

        <!-- Estado: Selecionar conta e pixel -->
        <div v-else-if="hasMetaIntegrationId && hasMetaAccounts" class="space-y-4">
          <div class="flex items-center space-x-2 text-sm text-blue-600">
            <Check class="h-5 w-5" />
            <span>Autenticação concluída. Selecione a conta e o pixel:</span>
          </div>

          <!-- Select conta -->
          <div class="space-y-2">
            <label for="meta-account-select" class="block text-sm font-medium">
              Conta
            </label>
            <Select
              v-model="metaAdsAccount"
              :options="metaAccountOptions"
              class="w-full"
              aria-describedby="meta-account-hint"
            />
            <p id="meta-account-hint" class="text-xs text-muted-foreground">
              Selecione a conta de anúncios do Meta
            </p>
          </div>

          <!-- Select pixel -->
          <div class="space-y-2">
            <label for="meta-pixel-select" class="block text-sm font-medium">
              Pixel
            </label>
            <div v-if="metaAdsAccount" class="space-y-2">
              <!-- Loading pixels -->
              <div
                v-if="isLoadingPixels"
                class="flex items-center space-x-2 text-sm text-muted-foreground py-4"
                role="status"
                aria-live="polite"
              >
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>Carregando pixels...</span>
              </div>
              <Select
                v-else-if="metaIntegration.availablePixels.value.length > 0"
                v-model="metaAdsPixel"
                :options="metaPixelOptions"
                class="w-full"
                aria-describedby="meta-pixel-hint"
              />
              <p
                v-else
                id="meta-pixel-empty"
                class="text-sm text-muted-foreground"
              >
                Nenhum pixel encontrado nesta conta.
              </p>
            </div>
            <p v-else class="text-sm text-muted-foreground">
              Selecione uma conta para carregar os pixels.
            </p>
            <p id="meta-pixel-hint" class="text-xs text-muted-foreground">
              O pixel é usado para rastrear conversões no seu site.
            </p>
          </div>

          <!-- Botão Salvar -->
          <Button
            id="meta-save-btn"
            class="w-full"
            :disabled="!metaAdsAccount || !metaAdsPixel || metaIntegration.isSelectingAccounts.value"
            :loading="metaIntegration.isSelectingAccounts.value"
            @click="handleSaveSelection"
          >
            {{ metaIntegration.isSelectingAccounts.value ? 'Salvando...' : 'Salvar seleção' }}
          </Button>
        </div>

        <!-- Estado vazio: contas carregando ou sem contas -->
        <div v-else-if="hasMetaIntegrationId && !hasMetaAccounts" class="space-y-4">
          <p class="text-sm text-muted-foreground">
            Nenhuma conta de anúncios encontrada. Tente novamente ou conecte outra conta do Meta.
          </p>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Check, Loader2 } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import { useMetaIntegration } from '@/composables/useMetaIntegration'

interface Props {
  open: boolean
  projectId: string
  /** Evita Teleport para facilitar testes; use apenas em ambiente de teste */
  disablePortal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disablePortal: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const metaIntegration = useMetaIntegration()

const metaAdsAccount = ref('')
const metaAdsPixel = ref('')
const isLoadingPixels = ref(false)

const hasMetaIntegrationId = computed(() => {
  const id = metaIntegration.integrationId.value
  return id !== null && id !== undefined && id !== ''
})

const hasMetaAccounts = computed(() => metaIntegration.availableAccounts.value.length > 0)

const metaAccountOptions = computed(() => {
  const options = [{ value: '', label: t('projectWizard.step4.meta.selectAccount') }]
  metaIntegration.availableAccounts.value.forEach(account => {
    options.push({
      value: account.accountId,
      label: `${account.name} (${account.accountId})`,
    })
  })
  return options
})

const metaPixelOptions = computed(() => {
  const options = [{ value: '', label: t('projectWizard.step4.meta.selectPixel') }]
  metaIntegration.availablePixels.value.forEach(pixel => {
    options.push({ value: pixel.id, label: pixel.name })
  })
  return options
})

function ensureProjectIdInStorage() {
  if (props.projectId) {
    localStorage.setItem('current_project_id', props.projectId)
  }
}

async function handleConnect() {
  ensureProjectIdInStorage()
  try {
    await metaIntegration.startOAuth()
  } catch {
    // Erro já exibido via metaIntegration.error
  }
}

async function handleSaveSelection() {
  if (!metaAdsAccount.value || !metaAdsPixel.value) return
  try {
    await metaIntegration.finalizeSelection([metaAdsAccount.value], metaAdsPixel.value)
    emit('success')
    emit('update:open', false)
  } catch {
    // Erro já exibido via metaIntegration.error
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      ensureProjectIdInStorage()
      metaIntegration.reset()
      metaAdsAccount.value = ''
      metaAdsPixel.value = ''
    }
  }
)

watch(metaAdsAccount, async (newAccountId) => {
  metaAdsPixel.value = ''
  metaIntegration.availablePixels.value = []
  if (!newAccountId || !metaIntegration.integrationId.value) return
  isLoadingPixels.value = true
  try {
    await metaIntegration.loadPixels(newAccountId)
  } catch {
    // Erro tratado no composable
  } finally {
    isLoadingPixels.value = false
  }
})
</script>
