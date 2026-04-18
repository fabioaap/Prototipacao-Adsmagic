<template>
  <Modal
    :model-value="open"
    @update:model-value="emit('update:open', $event)"
    size="lg"
  >
    <template #default>
      <div class="max-w-xl mx-auto p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title-md">
            Conectar Google Ads
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
        <div v-if="!hasGoogleIntegrationId" class="space-y-4">
          <p class="text-sm text-muted-foreground">
            Conecte sua conta do Google Ads para rastrear campanhas e métricas.
          </p>
          <Button
            :disabled="googleIntegration.isConnecting.value"
            :loading="googleIntegration.isConnecting.value"
            class="w-full"
            @click="handleConnect"
          >
            {{ googleIntegration.isConnecting.value ? 'Conectando...' : 'Conectar com Google Ads' }}
          </Button>
          <p
            v-if="googleIntegration.error.value"
            class="text-sm text-destructive"
            role="alert"
          >
            {{ googleIntegration.error.value }}
          </p>
        </div>

        <!-- Estado: Selecionar conta -->
        <div v-else-if="hasGoogleIntegrationId && hasSelectableAccounts" class="space-y-4">
          <div class="flex items-center space-x-2 text-sm text-blue-600">
            <Check class="h-5 w-5" />
            <span>Autenticação concluída. Selecione a conta:</span>
          </div>

          <!-- Select conta -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">
              Conta
            </label>
            <!-- Com MCC: usar select agrupado -->
            <Select
              v-if="hasMccGroups"
              v-model="googleAdsAccount"
              :groups="googleAccountGroups"
              placeholder="Selecione uma conta"
              class="w-full"
            />
            <!-- Sem MCC: usar select flat -->
            <Select
              v-else
              v-model="googleAdsAccount"
              :options="googleAccountOptions"
              placeholder="Selecione uma conta"
              class="w-full"
            />
            <p class="text-xs text-muted-foreground">
              Selecione a conta de anúncios do Google Ads
            </p>
          </div>

          <!-- Botão Salvar -->
          <Button
            class="w-full"
            :disabled="!googleAdsAccount || googleIntegration.isSelectingAccounts.value"
            :loading="googleIntegration.isSelectingAccounts.value"
            @click="handleSaveSelection"
          >
            {{ googleIntegration.isSelectingAccounts.value ? 'Salvando...' : 'Salvar seleção' }}
          </Button>

          <p
            v-if="googleIntegration.error.value"
            class="text-sm text-destructive"
            role="alert"
          >
            {{ googleIntegration.error.value }}
          </p>
        </div>

        <!-- Estado vazio: sem contas -->
        <div v-else-if="hasGoogleIntegrationId && !hasSelectableAccounts" class="space-y-4">
          <p class="text-sm text-muted-foreground">
            Nenhuma conta de anúncios encontrada. Tente novamente ou conecte outra conta do Google.
          </p>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Check } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import { useGoogleIntegration } from '@/composables/useGoogleIntegration'

interface Props {
  open: boolean
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const googleIntegration = useGoogleIntegration()

const googleAdsAccount = ref('')

const hasGoogleIntegrationId = computed(() => {
  const id = googleIntegration.integrationId.value
  return id !== null && id !== undefined && id !== ''
})

// Selectable = non-manager accounts only
const selectableAccounts = computed(() =>
  googleIntegration.availableAccounts.value.filter(acc => !acc.isManager)
)

const hasSelectableAccounts = computed(() => selectableAccounts.value.length > 0)

// Standalone accounts (not MCC, no parent)
const standaloneAccounts = computed(() =>
  googleIntegration.availableAccounts.value.filter(
    acc => !acc.isManager && !acc.parentMccId
  )
)

// MCC groups: each MCC becomes an optgroup with its children
const mccGroups = computed(() => {
  const accounts = googleIntegration.availableAccounts.value
  const managers = accounts.filter(acc => acc.isManager)

  return managers.map(mcc => ({
    label: mcc.name || `MCC (${mcc.accountId})`,
    options: accounts
      .filter(acc => acc.parentMccId === mcc.accountId)
      .map(acc => ({
        value: acc.accountId,
        label: `${acc.name} (${acc.accountId})`,
      })),
  })).filter(group => group.options.length > 0)
})

const hasMccGroups = computed(() => mccGroups.value.length > 0)

// Grouped options for Select with groups prop
const googleAccountGroups = computed(() => {
  const groups: Array<{ label: string; options: Array<{ value: string; label: string }> }> = []

  if (standaloneAccounts.value.length > 0) {
    groups.push({
      label: 'Contas individuais',
      options: standaloneAccounts.value.map(acc => ({
        value: acc.accountId,
        label: `${acc.name} (${acc.accountId})`,
      })),
    })
  }

  for (const group of mccGroups.value) {
    groups.push(group)
  }

  return groups
})

// Flat options fallback (no MCC)
const googleAccountOptions = computed(() =>
  selectableAccounts.value.map(acc => ({
    value: acc.accountId,
    label: `${acc.name} (${acc.accountId})`,
  }))
)

function ensureProjectIdInStorage() {
  if (props.projectId) {
    localStorage.setItem('current_project_id', props.projectId)
  }
}

async function handleConnect() {
  ensureProjectIdInStorage()
  try {
    await googleIntegration.startOAuth()
  } catch {
    // Erro já exibido via googleIntegration.error
  }
}

async function handleSaveSelection() {
  if (!googleAdsAccount.value) return
  try {
    await googleIntegration.finalizeSelection([googleAdsAccount.value])
    emit('success')
    emit('update:open', false)
  } catch {
    // Erro já exibido via googleIntegration.error
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      ensureProjectIdInStorage()
      googleIntegration.reset()
      googleAdsAccount.value = ''
    }
  }
)
</script>
