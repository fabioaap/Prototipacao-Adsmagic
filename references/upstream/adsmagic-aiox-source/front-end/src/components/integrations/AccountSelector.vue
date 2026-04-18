<template>
  <Modal :model-value="open" @update:model-value="emit('update:open', $event)">
    <template #content>
      <div class="max-w-2xl mx-auto p-6">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="section-title-md mb-2">Selecionar Contas</h2>
          <p class="text-sm text-muted-foreground">
            Escolha as contas que deseja conectar com o {{ getPlatformName(platform) }}
          </p>
        </div>

        <!-- Search -->
        <div class="mb-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Buscar contas..."
              class="pl-10"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="h-16 bg-muted rounded-lg"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAccounts.length === 0" class="text-center py-12">
          <div class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <component
              :is="getPlatformIcon(platform)"
              class="h-12 w-12 text-muted-foreground"
            />
          </div>
          <h3 class="section-title-sm mb-2">Nenhuma conta encontrada</h3>
          <p class="text-muted-foreground">
            {{ searchQuery ? 'Tente ajustar sua busca' : 'Não há contas disponíveis para conectar' }}
          </p>
        </div>

        <!-- Accounts List -->
        <div v-else class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="account in filteredAccounts"
            :key="account.id"
            class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <!-- Checkbox -->
            <input
              v-model="localSelectedIds"
              :value="account.id"
              type="checkbox"
              :disabled="loading"
              class="rounded border-border"
            />

            <!-- Account Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <component
                  :is="getAccountTypeIcon(account.type)"
                  class="h-4 w-4 text-muted-foreground"
                />
                <span class="font-medium truncate">{{ account.name }}</span>
                <Badge variant="secondary" class="text-xs">
                  {{ getAccountTypeLabel(account.type) }}
                </Badge>
              </div>
              <div class="text-sm text-muted-foreground">
                ID: {{ account.id }}
              </div>
              <div v-if="account.permissions.length > 0" class="text-xs text-muted-foreground mt-1">
                Permissões: {{ account.permissions.slice(0, 3).join(', ') }}
                <span v-if="account.permissions.length > 3">
                  +{{ account.permissions.length - 3 }} mais
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Count -->
        <div v-if="localSelectedIds.length > 0" class="mt-4 p-3 bg-muted/50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">
              {{ localSelectedIds.length }} conta(s) selecionada(s)
            </span>
            <Button
              variant="ghost"
              size="sm"
              @click="localSelectedIds = []"
            >
              Limpar seleção
            </Button>
          </div>
        </div>

        <!-- Permissions Info -->
        <div v-if="localSelectedIds.length > 0" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex items-start space-x-2">
            <Info class="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-blue-600">Permissões Necessárias</p>
              <p class="text-xs text-blue-600/80 mt-1">
                Ao conectar estas contas, você estará concedendo permissões para:
                {{ getRequiredPermissions(platform).join(', ') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between mt-6 pt-4 border-t">
          <div class="text-sm text-muted-foreground">
            {{ localSelectedIds.length }} de {{ accounts.length }} contas
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              @click="handleCancel"
              :disabled="loading"
            >
              Cancelar
            </Button>
            <Button
              @click="handleConfirm"
              :disabled="localSelectedIds.length === 0 || loading"
              :loading="loading"
            >
              Conectar {{ localSelectedIds.length }} Conta(s)
            </Button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Search, 
  Info,
  Building2,
  Target,
  Users,
  User
} from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Account } from '@/types/models'

interface Props {
  /**
   * Se true, modal está aberto
   */
  open: boolean
  /**
   * Lista de contas disponíveis
   */
  accounts: Account[]
  /**
   * IDs das contas selecionadas
   */
  selectedIds: string[]
  /**
   * Se true, indica loading state
   */
  loading?: boolean
  /**
   * Plataforma (para personalização)
   */
  platform: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:selectedIds': [ids: string[]]
  confirm: []
}>()

// ============================================================================
// STATE
// ============================================================================

const searchQuery = ref('')
const localSelectedIds = ref<string[]>([])

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Contas filtradas pela busca
 */
const filteredAccounts = computed(() => {
  let filtered = props.accounts

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(account => 
      account.name.toLowerCase().includes(query) ||
      account.id.toLowerCase().includes(query) ||
      account.type.toLowerCase().includes(query)
    )
  }

  return filtered
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Obtém o ícone da plataforma
 */
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, any> = {
    meta: Building2,
    google: Target,
    tiktok: Users,
    linkedin: User
  }
  return iconMap[platform] || Building2
}

/**
 * Obtém o nome da plataforma
 */
const getPlatformName = (platform: string) => {
  const nameMap: Record<string, string> = {
    meta: 'Meta',
    google: 'Google',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn'
  }
  return nameMap[platform] || platform
}

/**
 * Obtém o ícone do tipo de conta
 */
const getAccountTypeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    ad_account: Target,
    pixel: Building2,
    page: Users,
    profile: User
  }
  return iconMap[type] || Building2
}

/**
 * Obtém o label do tipo de conta
 */
const getAccountTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    ad_account: 'Conta de Anúncios',
    pixel: 'Pixel',
    page: 'Página',
    profile: 'Perfil'
  }
  return labelMap[type] || type
}

/**
 * Obtém as permissões necessárias por plataforma
 */
const getRequiredPermissions = (platform: string): string[] => {
  const permissions: Record<string, string[]> = {
    meta: ['Gerenciar anúncios', 'Ler páginas', 'Acessar Instagram'],
    google: ['Gerenciar campanhas', 'Ler relatórios', 'Acessar Analytics'],
    tiktok: ['Gerenciar anúncios', 'Ler dados', 'Acessar vídeos'],
    linkedin: ['Ler perfil', 'Gerenciar anúncios', 'Acessar dados']
  }
  return permissions[platform] || []
}

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sincroniza selectedIds externos com locais
 */
watch(
  () => props.selectedIds,
  (newIds) => {
    localSelectedIds.value = [...newIds]
  },
  { immediate: true }
)

/**
 * Emite mudanças nos IDs selecionados
 */
watch(
  localSelectedIds,
  (newIds) => {
    emit('update:selectedIds', [...newIds])
  },
  { deep: true }
)

// ============================================================================
// HANDLERS
// ============================================================================

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>
